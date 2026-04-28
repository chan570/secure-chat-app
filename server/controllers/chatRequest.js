import ChatRequest from "../models/ChatRequest.js";
import ChatRoom from "../models/ChatRoom.js";

export const sendRequest = async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;

    // Check if request already exists
    const existingRequest = await ChatRequest.findOne({
      senderId,
      receiverId,
      status: "pending",
    });

    if (existingRequest) {
      return res.status(400).json({ message: "Request already sent" });
    }

    const newRequest = new ChatRequest({
      senderId,
      receiverId,
    });

    await newRequest.save();
    res.status(201).json(newRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRequests = async (req, res) => {
  try {
    const requests = await ChatRequest.find({
      receiverId: req.params.userId,
      status: "pending",
    });
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const request = await ChatRequest.findById(req.params.requestId);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    request.status = status;

    if (status === "accepted") {
      // Create a ChatRoom
      const newChatRoom = new ChatRoom({
        members: [request.senderId, request.receiverId],
      });
      await newChatRoom.save();
      
      // Delete the request after accepting
      await ChatRequest.findByIdAndDelete(req.params.requestId);
      return res.status(200).json(newChatRoom);
    } else {
      // If declined, we can just delete it or update status
      await ChatRequest.findByIdAndDelete(req.params.requestId);
      return res.status(200).json({ message: "Request declined" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
