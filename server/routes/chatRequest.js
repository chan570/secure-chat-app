import express from "express";
import {
  sendRequest,
  getRequests,
  updateRequestStatus,
} from "../controllers/chatRequest.js";

const router = express.Router();

router.post("/", sendRequest);
router.get("/:userId", getRequests);
router.put("/:requestId", updateRequestStatus);

export default router;
