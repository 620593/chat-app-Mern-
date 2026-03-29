import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const protectRoute = async (req, res, next) => {
	try {
		// 1. Try cookie first (httpOnly cookie sent by browser)
		let token = req.cookies.jwt;

		// 2. Fallback to Authorization header (for postman, mobile, etc.)
		if (!token && req.headers.authorization) {
			const parts = req.headers.authorization.split(" ");
			if (parts.length === 2 && parts[0] === "Bearer") {
				token = parts[1];
			}
		}

		if (!token) {
			console.warn(`[protectRoute] No token: cookies=${JSON.stringify(req.cookies)} header=${req.headers.authorization ? "present" : "missing"}`);
			return res.status(401).json({ error: "Unauthorized - No Token Provided" });
		}

		let decoded;
		try {
			decoded = jwt.verify(token, process.env.JWT_SECRET);
		} catch (verifyErr) {
			console.warn(`[protectRoute] Token verification failed: ${verifyErr.message}`);
			return res.status(401).json({ error: "Unauthorized - Invalid Token" });
		}

		if (!decoded?.userId) {
			console.warn("[protectRoute] Decoded token missing userId");
			return res.status(401).json({ error: "Unauthorized - Invalid Token" });
		}

		const user = await User.findById(decoded.userId).select("-password");

		if (!user) {
			console.warn(`[protectRoute] User not found: ${decoded.userId}`);
			return res.status(404).json({ error: "User not found" });
		}

		req.user = user;
		next();
	} catch (error) {
		console.error("Error in protectRoute middleware: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};

export default protectRoute;
