import axios from "axios";
import auth from "../config/firebase";
import { io } from "socket.io-client";

const baseURL = process.env.REACT_APP_API_URL;

// TOKEN
const getUserToken = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");
  return await user.getIdToken();
};

// SOCKET
export const initiateSocketConnection = async () => {
  const token = await getUserToken();

  const socket = io(baseURL.replace("/api", ""), {
    auth: { token },
    transports: ["websocket"],
  });

  return socket;
};

// HEADERS
const createHeader = async () => {
  const token = await getUserToken();

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// APIs
export const getAllUsers = async () => {
  const res = await axios.get(`${baseURL}/user`, await createHeader());
  return res.data;
};

export const getChatRooms = async (userId) => {
  const res = await axios.get(`${baseURL}/room/${userId}`, await createHeader());
  return res.data;
};

export const getMessagesOfChatRoom = async (id) => {
  const res = await axios.get(`${baseURL}/message/${id}`, await createHeader());
  return res.data;
};

export const sendMessage = async (data) => {
  const res = await axios.post(`${baseURL}/message`, data, await createHeader());
  return res.data;
};

export const createChatRoom = async (data) => {
  const res = await axios.post(`${baseURL}/room`, data, await createHeader());
  return res.data;
};