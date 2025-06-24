import express from "express";
import http from "http";
import { Server } from "socket.io";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import grammarRoutes from "./routes/grammar.js";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";
import path from "path";

dotenv.config();

const app = express();
const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
    credentials: true,
  },
});

// Socket user mapping
const userSocketMap = {}; // { userId: socketId }

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  const userId = socket.handshake?.query?.userId;
  if (userId) {
    userSocketMap[userId] = socket.id;
  }

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
    if (userId) delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

// Utility function (optional)
export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

const PORT = process.env.PORT;
const _dirname = path.resolve();

app.use(express.json({ limit: '5mb' }));
app.use(cookieParser());
app.use(cors({
  origin: "https://gram-chat.vercel.app",
  credentials: true,
}));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/grammar-check", grammarRoutes);

// Serve frontend in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(_dirname, "../frontend/build")));

  app.get("*any", (req, res) => {
    res.sendFile(path.join(_dirname, "../frontend", "build", "index.html"));
  });
}


// Error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});



server.listen(PORT, () => {
    console.log("Server is running on port " + PORT);
    connectDB();
});
