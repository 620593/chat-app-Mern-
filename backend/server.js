import path from "path";
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import messageRoutes from "./routes/message.routes.js";
import userRoutes from "./routes/user.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import callRoutes from "./routes/call.routes.js";

import connectToMongoDB from "./db/connectToMongoDB.js";
import { app, server } from "./socket/socket.js";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "production";

const allowedOrigins = (
  process.env.ALLOWED_ORIGINS ||
  process.env.CLIENT_URL ||
  "http://localhost:3000,http://localhost:5173"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests and same-origin requests with no Origin header.
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/calls", callRoutes);

// ─── Serve Frontend (production) ──────────────────────────────────────────────
const distPath = path.join(projectRoot, "Frontend", "dist");
app.use(express.static(distPath));

app.get("*", (req, res) => {
  const indexPath = path.join(distPath, "index.html");
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error(`Frontend dist not found at ${distPath}. Serving API only.`);
      res.status(404).json({ error: "Frontend not available" });
    }
  });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
server.listen(PORT, () => {
  connectToMongoDB();
  console.log(`🚀 Server running on port ${PORT}`);
});
