import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import { getCallHistory, getCallById } from "../controllers/call.controller.js";

const router = express.Router();

// Full call history for current user
router.get("/", protectRoute, getCallHistory);

// Single call detail
router.get("/:callId", protectRoute, getCallById);

export default router;
