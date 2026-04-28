import express from "express";

import {
  createMessage,
  getMessages,
  markMessagesAsRead,
} from "../controllers/chatMessage.js";

const router = express.Router();

router.post("/", createMessage);
router.get("/:chatRoomId", getMessages);
router.put("/markAsRead/:chatRoomId/:userId", markMessagesAsRead);

export default router;
