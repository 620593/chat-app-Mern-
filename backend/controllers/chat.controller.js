import Chat from "../models/chat.model.js";
import User from "../models/user.model.js";

// ─── Create or get 1-1 chat ───────────────────────────────────────────────────
export const accessChat = async (req, res) => {
  try {
    const { userId } = req.body;
    const currentUserId = req.user._id;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    let chat = await Chat.findOne({
      isGroup: false,
      participants: { $all: [currentUserId, userId] },
    })
      .populate("participants", "-password")
      .populate("latestMessage");

    if (chat) {
      return res.status(200).json(chat);
    }

    // Create new 1-1 chat
    chat = await Chat.create({
      participants: [currentUserId, userId],
      isGroup: false,
    });

    const fullChat = await Chat.findById(chat._id).populate(
      "participants",
      "-password"
    );

    res.status(201).json(fullChat);
  } catch (error) {
    console.error("accessChat error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ─── Get all chats for the current user ──────────────────────────────────────
export const getUserChats = async (req, res) => {
  try {
    const userId = req.user._id;

    const chats = await Chat.find({ participants: userId })
      .populate("participants", "-password")
      .populate({
        path: "latestMessage",
        populate: { path: "senderId", select: "fullName username profilePic" },
      })
      .sort({ updatedAt: -1 });

    // Attach unread count for the current user
    const chatsWithUnread = chats.map((chat) => {
      const unread = chat.unreadCounts?.find(
        (u) => u.userId?.toString() === userId.toString()
      );
      return {
        ...chat.toObject(),
        unreadCount: unread?.count || 0,
      };
    });

    res.status(200).json(chatsWithUnread);
  } catch (error) {
    console.error("getUserChats error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ─── Create Group Chat ────────────────────────────────────────────────────────
export const createGroupChat = async (req, res) => {
  try {
    const { name, participants } = req.body;
    const adminId = req.user._id;

    if (!name || !participants || participants.length < 2) {
      return res
        .status(400)
        .json({ error: "Name and at least 2 participants are required" });
    }

    const allParticipants = [adminId, ...participants];

    const group = await Chat.create({
      participants: allParticipants,
      isGroup: true,
      groupName: name,
      groupAdmin: adminId,
    });

    const fullGroup = await Chat.findById(group._id).populate(
      "participants",
      "-password"
    );

    res.status(201).json(fullGroup);
  } catch (error) {
    console.error("createGroupChat error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ─── Rename Group ─────────────────────────────────────────────────────────────
export const renameGroup = async (req, res) => {
  try {
    const { chatId, groupName } = req.body;
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { groupName },
      { new: true }
    ).populate("participants", "-password");

    if (!updatedChat) {
      return res.status(404).json({ error: "Chat not found" });
    }
    res.status(200).json(updatedChat);
  } catch (error) {
    console.error("renameGroup error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ─── Add to Group ─────────────────────────────────────────────────────────────
export const addToGroup = async (req, res) => {
  try {
    const { chatId, userId } = req.body;
    const chat = await Chat.findById(chatId);

    if (!chat) return res.status(404).json({ error: "Chat not found" });
    if (chat.groupAdmin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Only admin can add members" });
    }

    const updated = await Chat.findByIdAndUpdate(
      chatId,
      { $addToSet: { participants: userId } },
      { new: true }
    ).populate("participants", "-password");

    res.status(200).json(updated);
  } catch (error) {
    console.error("addToGroup error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ─── Remove from Group ────────────────────────────────────────────────────────
export const removeFromGroup = async (req, res) => {
  try {
    const { chatId, userId } = req.body;
    const chat = await Chat.findById(chatId);

    if (!chat) return res.status(404).json({ error: "Chat not found" });
    if (chat.groupAdmin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Only admin can remove members" });
    }

    const updated = await Chat.findByIdAndUpdate(
      chatId,
      { $pull: { participants: userId } },
      { new: true }
    ).populate("participants", "-password");

    res.status(200).json(updated);
  } catch (error) {
    console.error("removeFromGroup error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
