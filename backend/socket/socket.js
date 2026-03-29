import { Server } from "socket.io";
import http from "http";
import express from "express";
import Message from "../models/message.model.js";
import Chat from "../models/chat.model.js";
import User from "../models/user.model.js";
import Call from "../models/call.model.js";
import socketAuth from "../middleware/socketAuth.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:5173"],
    methods: ["GET", "POST"],
    credentials: true,
  },
  // Ping every 25s, disconnect if no pong within 60s — keeps connections clean
  pingInterval: 25000,
  pingTimeout: 60000,
});

// ─── JWT Auth Middleware (runs before every connection) ───────────────────────
// userId is now sourced from the verified JWT, NOT client query params
io.use(socketAuth);

// ─── User → Set<socketId>  (supports multiple tabs per user) ─────────────────
const userSocketMap = new Map();

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** All userIds with ≥1 live socket */
export const getOnlineUsers = () =>
  [...userSocketMap.keys()];

/**
 * For WebRTC p2p signaling — returns the FIRST socketId of the target user.
 * For broadcast to all tabs, emit directly to the userId room instead.
 */
export const getReceiverSocketId = (userId) => {
  const sockets = userSocketMap.get(String(userId));
  return sockets?.size > 0 ? [...sockets][0] : null;
};

// ─── Broadcast helpers ────────────────────────────────────────────────────────

let onlineUsersDebounceTimer = null;

/** Debounced broadcast — prevents spam on rapid connect/disconnect cycles */
const broadcastOnlineUsers = () => {
  clearTimeout(onlineUsersDebounceTimer);
  onlineUsersDebounceTimer = setTimeout(() => {
    io.emit("getOnlineUsers", getOnlineUsers());
  }, 150);
};

// ─── Connection Handler ───────────────────────────────────────────────────────
io.on("connection", async (socket) => {
  // userId is always sourced from the verified JWT (via socketAuth middleware)
  const user = socket.data.user;
  const userId = user._id.toString();

  // ── Register socket ───────────────────────────────────────────────────────
  if (!userSocketMap.has(userId)) {
    userSocketMap.set(userId, new Set());
  }
  userSocketMap.get(userId).add(socket.id);

  const socketCount = userSocketMap.get(userId).size;
  console.log(`✅ Connected: user=${user.username}(${userId}) socket=${socket.id} [tab ${socketCount}]`);

  // ── Join this user to a personal room (for broadcasting to all their tabs) ──
  // Every socket of a user joins room "user:<userId>"
  // This lets us do io.to("user:abc123").emit(...) to hit ALL their tabs at once
  socket.join(`user:${userId}`);

  // ── Mark user online (only on first socket) ────────────────────────────────
  if (socketCount === 1) {
    await User.findByIdAndUpdate(userId, { isOnline: true }).catch((e) =>
      console.error("DB online update failed:", e.message)
    );
  }

  // ── Join all chat rooms this user belongs to ───────────────────────────────
  try {
    const chats = await Chat.find({ participants: userId }).select("_id");
    chats.forEach((chat) => socket.join(chat._id.toString()));
    console.log(`   Joined ${chats.length} chat room(s) for ${user.username}`);
  } catch (err) {
    console.error("Error joining rooms:", err.message);
  }

  broadcastOnlineUsers();

  // ─────────────────────────────────────────────────────────────────────────
  // Messaging — with ACK
  // ─────────────────────────────────────────────────────────────────────────

  socket.on("send_message", async ({ chatId, content }, ack) => {
    try {
      if (!chatId || !content?.trim()) {
        ack?.({ error: "chatId and content are required" });
        return;
      }

      console.log(`   📨 send_message: user=${user.username} chatId=${chatId}`);

      const chat = await Chat.findOne({ _id: chatId, participants: userId });
      if (!chat) {
        ack?.({ error: "Chat not found or access denied" });
        return;
      }

      // 1. Persist message
      const newMessage = await Message.create({
        senderId: userId,
        chatId,
        content: content.trim(),
        status: "sent",
        receiverId: !chat.isGroup
          ? chat.participants.find((p) => p.toString() !== userId)
          : undefined,
      });

      // 2. Update chat metadata atomically
      await Chat.findByIdAndUpdate(chatId, {
        $push: { messages: newMessage._id },
        latestMessage: newMessage._id,
        updatedAt: new Date(),
      });

      // 3. Increment unread counts for other participants
      const otherParticipants = chat.participants.filter(
        (p) => p.toString() !== userId
      );
      for (const participantId of otherParticipants) {
        const exists = chat.unreadCounts?.some(
          (u) => u.userId?.toString() === participantId.toString()
        );
        if (exists) {
          await Chat.updateOne(
            { _id: chatId, "unreadCounts.userId": participantId },
            { $inc: { "unreadCounts.$.count": 1 } }
          );
        } else {
          await Chat.findByIdAndUpdate(chatId, {
            $push: { unreadCounts: { userId: participantId, count: 1 } },
          });
        }
      }

      // 4. Populate sender for UI
      const populated = await Message.findById(newMessage._id).populate(
        "senderId",
        "fullName username profilePic"
      );

      // 5. Emit to chat room — ALL participants (including sender's other tabs)
      io.to(chatId).emit("receive_message", populated);

      // 6. ACK sender — confirms DB write + emit succeeded
      ack?.({ success: true, messageId: newMessage._id });

    } catch (err) {
      console.error("send_message error:", err.message);
      ack?.({ error: "Internal server error" });
    }
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Typing Indicators
  // ─────────────────────────────────────────────────────────────────────────

  socket.on("typing", ({ chatId }) => {
    // Broadcast to room EXCLUDING sender
    socket.to(chatId).emit("typing", { chatId, senderId: userId });
  });

  socket.on("stop_typing", ({ chatId }) => {
    socket.to(chatId).emit("stop_typing", { chatId, senderId: userId });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Message Seen / Mark Read
  // ─────────────────────────────────────────────────────────────────────────

  socket.on("message_seen", async ({ chatId, messageId }) => {
    try {
      await Message.findByIdAndUpdate(messageId, { status: "seen" });

      await Chat.updateOne(
        { _id: chatId, "unreadCounts.userId": userId },
        { $set: { "unreadCounts.$.count": 0 } }
      );

      io.to(chatId).emit("message_seen", { chatId, messageId, seenBy: userId });
    } catch (err) {
      console.error("message_seen error:", err.message);
    }
  });

  socket.on("mark_read", async ({ chatId }) => {
    try {
      await Message.updateMany(
        { chatId, receiverId: userId, status: { $ne: "seen" } },
        { status: "seen" }
      );

      await Chat.updateOne(
        { _id: chatId, "unreadCounts.userId": userId },
        { $set: { "unreadCounts.$.count": 0 } }
      );

      io.to(chatId).emit("chat_read", { chatId, userId });
    } catch (err) {
      console.error("mark_read error:", err.message);
    }
  });

  // ─────────────────────────────────────────────────────────────────────────
  // WebRTC Signaling
  // Signaling events use "user:<targetId>" room to reach ALL of the user's
  // tabs simultaneously, rather than picking a single arbitrary socketId.
  // ─────────────────────────────────────────────────────────────────────────

  socket.on("call_user", async ({ userToCall, signalData, callerName, callerPic, callType }) => {
    try {
      const call = await Call.create({
        callerId: userId,
        receiverId: userToCall,
        type: callType || "video",
        status: "missed",
      });

      // Emit to ALL tabs of the callee
      io.to(`user:${userToCall}`).emit("incoming_call", {
        signal: signalData,
        from: userId,
        callerName,
        callerPic,
        callType,
        callId: call._id,
      });
    } catch (err) {
      console.error("call_user error:", err.message);
    }
  });

  socket.on("call_accepted", async ({ to, signal, callId }) => {
    io.to(`user:${to}`).emit("call_accepted", signal);
    if (callId) await Call.findByIdAndUpdate(callId, { status: "completed" });
  });

  socket.on("call_rejected", async ({ to, callId }) => {
    io.to(`user:${to}`).emit("call_rejected");
    if (callId) await Call.findByIdAndUpdate(callId, { status: "rejected" });
  });

  socket.on("webrtc_offer", ({ to, offer }) => {
    io.to(`user:${to}`).emit("webrtc_offer", { offer, from: userId });
  });

  socket.on("webrtc_answer", ({ to, answer }) => {
    io.to(`user:${to}`).emit("webrtc_answer", { answer, from: userId });
  });

  socket.on("ice_candidate", ({ to, candidate }) => {
    io.to(`user:${to}`).emit("ice_candidate", { candidate, from: userId });
  });

  socket.on("end_call", async ({ to, callId, duration }) => {
    io.to(`user:${to}`).emit("end_call");
    if (callId) {
      await Call.findByIdAndUpdate(callId, {
        status: "completed",
        duration: duration || 0,
      });
    }
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Disconnect
  // ─────────────────────────────────────────────────────────────────────────

  socket.on("disconnect", async (reason) => {
    const sockets = userSocketMap.get(userId);
    if (sockets) {
      sockets.delete(socket.id);
      // Delete the entry entirely once no sockets remain — prevents memory leak
      if (sockets.size === 0) {
        userSocketMap.delete(userId);
      }
    }

    const remaining = sockets?.size ?? 0;
    console.log(
      `❌ Disconnected: user=${user.username}(${userId}) socket=${socket.id} reason="${reason}" remaining=${remaining}`
    );

    // Only mark offline when the user has ZERO remaining live sockets
    if (remaining === 0) {
      await User.findByIdAndUpdate(userId, {
        isOnline: false,
        lastSeen: new Date(),
      }).catch((e) => console.error("DB offline update failed:", e.message));
    }

    broadcastOnlineUsers();
  });
});

export { app, io, server };
