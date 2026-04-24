import { useEffect, useRef, useState } from "react";

import {
  getAllUsers,
  getChatRooms,
  initiateSocketConnection,
} from "../../services/ChatService";
import { useAuth } from "../../contexts/AuthContext";

import ChatRoom from "../chat/ChatRoom";
import Welcome from "../chat/Welcome";
import AllUsers from "../chat/AllUsers";
import SearchUsers from "../chat/SearchUsers";

export default function ChatLayout() {
  const [users, setUsers] = useState([]);
  const [chatRooms, setChatRooms] = useState([]);
  const [currentChat, setCurrentChat] = useState();
  const [onlineUsersId, setOnlineUsersId] = useState([]);

  const socket = useRef();
  const { currentUser } = useAuth();

  // ✅ SOCKET SETUP
  useEffect(() => {
    if (!currentUser) return;

    let socketInstance;

    const setupSocket = async () => {
      try {
        socketInstance = await initiateSocketConnection();
        socket.current = socketInstance;

        socketInstance.emit("addUser", currentUser.uid);

        socketInstance.on("getUsers", (users) => {
          setOnlineUsersId(users.map((u) => u[0]));
        });
      } catch (err) {
        console.error("Socket error:", err);
      }
    };

    setupSocket();

    return () => {
      socketInstance?.disconnect();
    };
  }, [currentUser]);

  // ✅ FETCH CHAT ROOMS
  useEffect(() => {
    if (!currentUser) return;

    const fetchData = async () => {
      try {
        const res = await getChatRooms(currentUser.uid);
        setChatRooms(res || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, [currentUser]);

  // ✅ FETCH USERS
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getAllUsers();
        setUsers(res || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  const handleChatChange = (chat) => {
    setCurrentChat(chat);
  };

  return (
    <div className="container mx-auto">
      <div className="min-w-full bg-white border rounded lg:grid lg:grid-cols-3">
        <div className="border-r lg:col-span-1">
          <SearchUsers handleSearch={() => {}} />

          <AllUsers
            users={users}
            chatRooms={chatRooms}
            setChatRooms={setChatRooms}
            onlineUsersId={onlineUsersId}
            currentUser={currentUser}
            changeChat={handleChatChange}
          />
        </div>

        {currentChat ? (
          <ChatRoom
            currentChat={currentChat}
            currentUser={currentUser}
            socket={socket}
          />
        ) : (
          <Welcome />
        )}
      </div>
    </div>
  );
}