import axios from "axios";
import auth from "../config/firebase";
import { io } from "socket.io-client";

// ✅ Use environment variable (NO localhost)
const API_BASE_URL = process.env.REACT_APP_API_URL;
const SOCKET_BASE_URL = process.env.REACT_APP_SOCKET_URL;

// ================= TOKEN =================
const getUserToken = async () => {
  const user = auth.currentUser;
  return user ? await user.getIdToken() : null;
};

// ================= SOCKET =================
export const initiateSocketConnection = async () => {
  const token = await getUserToken();

  const socket = io(SOCKET_BASE_URL, {
    auth: { token },
    transports: ["websocket"], // improves reliability on Vercel
  });

  return socket;
};

// ================= HEADERS =================
const createHeader = async () => {
  const token = await getUserToken();

  return {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };
};

// ================= USER APIs =================
export const getAllUsers = async () => {
  const header = await createHeader();

  try {
    const res = await axios.get(`${API_BASE_URL}/user`, header);
    return res.data;
  } catch (e) {
    console.error("getAllUsers error:", e);
  }
};

export const getUser = async (userId) => {
  const header = await createHeader();

  try {
    const res = await axios.get(`${API_BASE_URL}/user/${userId}`, header);
    return res.data;
  } catch (e) {
    console.error("getUser error:", e);
  }
};

// ⚠️ FIXED: axios.get params syntax
export const getUsers = async (users) => {
  const header = await createHeader();

  try {
    const res = await axios.get(`${API_BASE_URL}/user/users`, {
      ...header,
      params: { users },
    });
    return res.data;
  } catch (e) {
    console.error("getUsers error:", e);
  }
};

// ================= CHAT ROOM =================
export const getChatRooms = async (userId) => {
  const header = await createHeader();

  try {
    const res = await axios.get(`${API_BASE_URL}/room/${userId}`, header);
    return res.data;
  } catch (e) {
    console.error("getChatRooms error:", e);
  }
};

export const getChatRoomOfUsers = async (firstUserId, secondUserId) => {
  const header = await createHeader();

  try {
    const res = await axios.get(
      `${API_BASE_URL}/room/${firstUserId}/${secondUserId}`,
      header
    );
    return res.data;
  } catch (e) {
    console.error("getChatRoomOfUsers error:", e);
  }
};

export const createChatRoom = async (members) => {
  const header = await createHeader();

  try {
    const res = await axios.post(`${API_BASE_URL}/room`, members, header);
    return res.data;
  } catch (e) {
    console.error("createChatRoom error:", e);
  }
};

// ================= MESSAGES =================
export const getMessagesOfChatRoom = async (chatRoomId) => {
  const header = await createHeader();

  try {
    const res = await axios.get(
      `${API_BASE_URL}/message/${chatRoomId}`,
      header
    );
    return res.data;
  } catch (e) {
    console.error("getMessages error:", e);
  }
};

export const sendMessage = async (messageBody) => {
  const header = await createHeader();

  try {
    const res = await axios.post(
      `${API_BASE_URL}/message`,
      messageBody,
      header
    );
    return res.data;
  } catch (e) {
    console.error("sendMessage error:", e);
  }
};