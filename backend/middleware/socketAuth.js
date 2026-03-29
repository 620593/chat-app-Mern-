import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

/**
 * Socket.IO middleware — validates JWT from cookie (httpOnly) or handshake auth token.
 * Attaches verified user as socket.data.user so handlers never trust client-sent userId.
 */
const socketAuth = async (socket, next) => {
  try {
    // 1. Try cookie first (browser clients send it automatically)
    let token = socket.handshake.headers.cookie
      ?.split("; ")
      .find((c) => c.startsWith("jwt="))
      ?.split("=")[1];

    // 2. Fallback to auth handshake (mobile / non-browser clients)
    if (!token) {
      token = socket.handshake.auth?.token;
    }

    if (!token) {
      return next(new Error("UNAUTHORIZED: No token provided"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded?.userId) {
      return next(new Error("UNAUTHORIZED: Invalid token"));
    }

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return next(new Error("UNAUTHORIZED: User not found"));
    }

    // Attach verified user — handlers use socket.data.user, NOT query params
    socket.data.user = user;
    next();
  } catch (err) {
    console.error("Socket auth error:", err.message);
    next(new Error("UNAUTHORIZED: " + err.message));
  }
};

export default socketAuth;
