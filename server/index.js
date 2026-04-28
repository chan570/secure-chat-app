import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Server } from "socket.io";

import "./config/mongo.js";

import { VerifyToken, VerifySocketToken } from "./middlewares/VerifyToken.js";
import chatRoomRoutes from "./routes/chatRoom.js";
import chatMessageRoutes from "./routes/chatMessage.js";
import userRoutes from "./routes/user.js";
import chatRequestRoutes from "./routes/chatRequest.js";

const app = express();

dotenv.config();

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000" }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(VerifyToken);

const PORT = process.env.PORT || 8080;

app.use("/api/room", chatRoomRoutes);
app.use("/api/message", chatMessageRoutes);
app.use("/api/user", userRoutes);
app.use("/api/request", chatRequestRoutes);

const server = app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  },
});

io.use(VerifySocketToken);

// Using a local map for better performance and scoping
const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("addUser", (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log(`User registered: ${userId} with socket ${socket.id}`);
    // ✅ BROADCAST to all users that someone new is online
    io.emit("getUsers", Array.from(onlineUsers));
  });

  socket.on("sendMessage", ({ senderId, receiverId, message }) => {
    console.log(`Attempting to send message from ${senderId} to ${receiverId}`);
    const receiverSocketId = onlineUsers.get(receiverId);
    
    if (receiverSocketId) {
      console.log(`Receiver ${receiverId} is online at socket ${receiverSocketId}. Sending...`);
      io.to(receiverSocketId).emit("getMessage", {
        senderId,
        message,
      });
    } else {
      console.log(`Receiver ${receiverId} is OFFLINE. Message will be fetched from DB next time they open chat.`);
    }
  });

  socket.on("disconnect", () => {
    let disconnectedUserId = null;
    for (let [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        disconnectedUserId = userId;
        break;
      }
    }
    
    if (disconnectedUserId) {
      onlineUsers.delete(disconnectedUserId);
      console.log(`User disconnected: ${disconnectedUserId}`);
      // ✅ BROADCAST updated list to all users
      io.emit("getUsers", Array.from(onlineUsers));
    }
  });
});
