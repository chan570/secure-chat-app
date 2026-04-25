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

        // ✅ Re-register user on every connection/reconnection
        socketInstance.on("connect", () => {
          console.log("Socket connected, registering user:", currentUser.uid);
          socketInstance.emit("addUser", currentUser.uid);
        });

        socketInstance.on("getUsers", (users) => {
          setOnlineUsersId(users.map((u) => u[0]));
        });

        // If already connected when handler is added
        if (socketInstance.connected) {
          socketInstance.emit("addUser", currentUser.uid);
        }
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
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="glass rounded-2xl overflow-hidden lg:grid lg:grid-cols-3 h-[calc(100vh-6rem)] shadow-2xl flex flex-col">
        {/* Sidebar: Hidden on mobile when a chat is selected */}
        <div 
          className={`
            border-r border-gray-200/50 dark:border-gray-700/50 lg:col-span-1 bg-white/40 dark:bg-gray-900/40 backdrop-blur-md flex flex-col overflow-hidden h-full
            ${currentChat ? 'hidden lg:flex' : 'flex'}
          `}
        >
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

        {/* Chat Area: Hidden on mobile when no chat is selected */}
        <div 
          className={`
            lg:col-span-2 flex flex-col bg-white/60 dark:bg-gray-900/60 backdrop-blur-md relative h-full
            ${currentChat ? 'flex' : 'hidden lg:flex'}
          `}
        >
          {currentChat ? (
            <ChatRoom
              currentChat={currentChat}
              currentUser={currentUser}
              socket={socket}
              users={users}
              onBack={() => setCurrentChat(undefined)}
            />
          ) : (
            <Welcome />
          )}
        </div>
      </div>
    </div>
  );
}