import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import {
  accessChat,
  getUserChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
} from "../controllers/chat.controller.js";

const router = express.Router();

// 1-1 chat: create or fetch
router.post("/", protectRoute, accessChat);

// All chats for current user
router.get("/", protectRoute, getUserChats);

// Group operations
router.post("/group", protectRoute, createGroupChat);
router.put("/group/rename", protectRoute, renameGroup);
router.put("/group/add", protectRoute, addToGroup);
router.put("/group/remove", protectRoute, removeFromGroup);

export default router;
