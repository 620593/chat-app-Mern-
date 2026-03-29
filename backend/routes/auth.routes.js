import express from "express";
import { login, logout, signup } from "../controllers/auth.controller.js";
import protectRoute from "../middleware/protectRoute.js";

const router = express.Router();

router.post("/signup", signup);

router.post("/login", login);

router.post("/logout", logout);

// Diagnostic endpoint — returns current user if authenticated, else 401
router.get("/me", protectRoute, (req, res) => {
	res.status(200).json({
		_id: req.user._id,
		fullName: req.user.fullName,
		username: req.user.username,
		profilePic: req.user.profilePic,
		authenticated: true,
	});
});

export default router;
