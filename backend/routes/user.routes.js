import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import {
  getUsersForSidebar,
  getUserById,
  updateProfile,
  updateSettings,
  getSettings,
} from "../controllers/user.controller.js";

const router = express.Router();

// ⚠️  Static routes MUST come BEFORE parameterised /:id routes

// Sidebar users list
router.get("/", protectRoute, getUsersForSidebar);

// Settings — must be above /:id to avoid collision
router.get("/settings/me", protectRoute, getSettings);
router.put("/settings", protectRoute, updateSettings);

// Profile update (username, profilePic via Cloudinary URL)
router.put("/profile", protectRoute, updateProfile);

// User profile by ID — must be last
router.get("/:id", protectRoute, getUserById);

export default router;
