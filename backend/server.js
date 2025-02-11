import express from "express";
import dotenv from "dotenv";
import authRoutes from "./Routes/authroutes.js";
import messageRoutes from "./Routes/messageRoutes.js";
import userRoutes from "./Routes/userRoutes.js";
import connectToMongoDb from "./db/connect.js";
import cookieParser from "cookie-parser";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); //to parse the incoming request with JSON payloads (from req.body)
app.use(cookieParser()); //to parse the incoming request with cookies (from req.cookies)

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);

// app.get("/", (req, res) => {
//   res.send("Hello World!!");
// });

app.listen(PORT, () => {
  connectToMongoDb();
  console.log(`app is listening to port ${PORT}`);
});
