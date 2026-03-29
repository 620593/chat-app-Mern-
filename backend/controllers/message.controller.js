import Message from "../models/message.model.js";
import Chat from "../models/chat.model.js";
import { io } from "../socket/socket.js";

// ─── Get all messages for a chat ─────────────────────────────────────────────
export const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;

    const chat = await Chat.findOne({
      _id: chatId,
      participants: userId,
    });

    if (!chat) {
      return res.status(403).json({ error: "Not a participant of this chat" });
    }

    const messages = await Message.find({ chatId })
      .populate("senderId", "fullName username profilePic")
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error("getMessages error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ─── Send Message (HTTP fallback; primary path is via socket) ─────────────────
export const sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { content } = req.body;
    const senderId = req.user._id;

    const chat = await Chat.findOne({
      _id: chatId,
      participants: senderId,
    });

    if (!chat) {
      return res.status(403).json({ error: "Not a participant of this chat" });
    }

    const newMessage = await Message.create({
      senderId,
      chatId,
      content,
      status: "sent",
      receiverId: !chat.isGroup
        ? chat.participants.find((p) => p.toString() !== senderId.toString())
        : undefined,
    });

    // Update chat metadata
    await Chat.findByIdAndUpdate(chatId, {
      $push: { messages: newMessage._id },
      latestMessage: newMessage._id,
    });

    // Increment unread counts for others
    for (const participantId of chat.participants) {
      if (participantId.toString() === senderId.toString()) continue;

      const entry = chat.unreadCounts?.find(
        (u) => u.userId?.toString() === participantId.toString()
      );
      if (entry) {
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

    const populated = await Message.findById(newMessage._id).populate(
      "senderId",
      "fullName username profilePic"
    );

    // Emit to socket room
    io.to(chatId).emit("receive_message", populated);

    res.status(201).json(populated);
  } catch (error) {
    console.error("sendMessage error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ─── Add/Toggle Reaction ─────────────────────────────────────────────────────
export const addReaction = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ error: "Message not found" });

    const existingIndex = message.reactions.findIndex(
      (r) => r.userId?.toString() === userId.toString()
    );

    if (existingIndex !== -1) {
      // Toggle off if same emoji, else update
      if (message.reactions[existingIndex].emoji === emoji) {
        message.reactions.splice(existingIndex, 1);
      } else {
        message.reactions[existingIndex].emoji = emoji;
      }
    } else {
      message.reactions.push({ userId, emoji });
    }

    await message.save();

    // Notify room
    io.to(message.chatId.toString()).emit("reaction_updated", {
      messageId,
      reactions: message.reactions,
    });

    res.status(200).json({ reactions: message.reactions });
  } catch (error) {
    console.error("addReaction error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ─── Mark messages as seen ───────────────────────────────────────────────────
export const markAsSeen = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;

    await Message.updateMany(
      { chatId, receiverId: userId, status: { $ne: "seen" } },
      { status: "seen" }
    );

    await Chat.updateOne(
      { _id: chatId, "unreadCounts.userId": userId },
      { $set: { "unreadCounts.$.count": 0 } }
    );

    io.to(chatId).emit("chat_read", { chatId, userId });

    res.status(200).json({ message: "Messages marked as seen" });
  } catch (error) {
    console.error("markAsSeen error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
