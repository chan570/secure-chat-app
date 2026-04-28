import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Server } from "socket.io";
import ChatRoom from "./models/ChatRoom.js";

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

  socket.on("sendMessage", async ({ senderId, receiverId, message, chatRoomId, type }) => {
    console.log(`Attempting to send message from ${senderId} to ${receiverId}`);
    
    try {
      // Validate chat room exists and both users are members
      const chatRoom = await ChatRoom.findById(chatRoomId);
      if (!chatRoom || !chatRoom.members.includes(senderId) || !chatRoom.members.includes(receiverId)) {
        console.log(`Unauthorized: Invalid chat room or user not a member`);
        socket.emit("messageError", { 
          message: "You cannot send messages to this user. Permission denied." 
        });
        return;
      }

      const receiverSocketId = onlineUsers.get(receiverId);
      
      if (receiverSocketId) {
        console.log(`Receiver ${receiverId} is online at socket ${receiverSocketId}. Sending...`);
        io.to(receiverSocketId).emit("getMessage", {
          senderId,
          message,
          chatRoomId,
          type,
        });
      } else {
        console.log(`Receiver ${receiverId} is OFFLINE. Message will be fetched from DB next time they open chat.`);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      socket.emit("messageError", { 
        message: "Error sending message. Please try again." 
      });
    }
  });

  socket.on("markAsRead", ({ chatRoomId, userId, receiverId }) => {
    const receiverSocketId = onlineUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messagesRead", { chatRoomId, userId });
    }
  });

  // 🔔 NEW: Emit event when a chat request is created
  socket.on("requestSent", ({ senderId, receiverId }) => {
    const receiverSocketId = onlineUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newChatRequest", { senderId });
    }
  });

  // 🔔 NEW: Emit event when a chat request is accepted or declined
  socket.on("requestStatusChanged", ({ senderId, receiverId, status }) => {
    const senderSocketId = onlineUsers.get(senderId);
    const receiverSocketId = onlineUsers.get(receiverId);
    
    if (senderSocketId) {
      io.to(senderSocketId).emit("chatRequestResponse", { 
        receiverId, 
        status 
      });
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
