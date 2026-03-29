import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import {
  getMessages,
  sendMessage,
  addReaction,
  markAsSeen,
} from "../controllers/message.controller.js";

const router = express.Router();

// Get all messages for a chat
router.get("/:chatId", protectRoute, getMessages);

// Send a message (HTTP fallback — primary path is Socket.IO)
router.post("/send/:chatId", protectRoute, sendMessage);

// Emoji reaction on a message
router.post("/reaction/:messageId", protectRoute, addReaction);

// Mark all messages in a chat as seen
router.put("/seen/:chatId", protectRoute, markAsSeen);

export default router;
