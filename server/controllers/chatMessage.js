import ChatMessage from "../models/ChatMessage.js";
import ChatRoom from "../models/ChatRoom.js";

export const createMessage = async (req, res) => {
  try {
    const { chatRoomId, sender } = req.body;
    
    // Validate that the chat room exists and the sender is a member
    const chatRoom = await ChatRoom.findById(chatRoomId);
    if (!chatRoom) {
      return res.status(403).json({ 
        message: "Chat room does not exist. Please send a chat request first." 
      });
    }
    
    if (!chatRoom.members.includes(sender)) {
      return res.status(403).json({ 
        message: "You are not a member of this chat room." 
      });
    }

    const newMessage = new ChatMessage(req.body);
    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(409).json({
      message: error.message,
    });
  }
};

export const getMessages = async (req, res) => {
  try {
    const messages = await ChatMessage.find({
      chatRoomId: req.params.chatRoomId,
    });
    res.status(200).json(messages);
  } catch (error) {
    res.status(409).json({
      message: error.message,
    });
  }
};
export const markMessagesAsRead = async (req, res) => {
  try {
    const { chatRoomId, userId } = req.params;
    await ChatMessage.updateMany(
      { chatRoomId, sender: { $ne: userId }, isRead: false },
      { $set: { isRead: true } }
    );
    res.status(200).json({ message: "Messages marked as read" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
