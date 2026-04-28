import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { getChatRooms, getAllUsers } from "../../services/ChatService";
import AllUsers from "../chat/AllUsers";
import ChatRoom from "../chat/ChatRoom";
import Welcome from "../chat/Welcome";

export default function ChatLayout({ currentUser }) {
  const [chatRooms, setChatRooms] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentChat, setCurrentChat] = useState();
  const [onlineUsersId, setOnlineUsersId] = useState([]);
  const socket = useRef();

  useEffect(() => {
    const socketUrl = process.env.REACT_APP_SOCKET_URL || "http://localhost:8080";
    socket.current = io(socketUrl, {
      auth: { token: currentUser.accessToken },
      transports: ["websocket"]
    });

    socket.current.emit("addUser", currentUser.uid);

    socket.current.on("getUsers", (users) => {
      setOnlineUsersId(users.map(u => u[0]));
    });

    return () => {
      socket.current.disconnect();
    };
  }, [currentUser]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [roomsRes, usersRes] = await Promise.all([
          getChatRooms(currentUser.uid),
          getAllUsers()
        ]);
        setChatRooms(roomsRes || []);
        setUsers(usersRes || []);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, [currentUser.uid]);

  const handleChatChange = (chat) => {
    setCurrentChat(chat);
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-[#f0f2f5] dark:bg-[#0b141a]">
      {/* Sidebar - Chat List & Discover */}
      <div className={classNames(
        currentChat ? "hidden lg:flex" : "flex",
        "w-full lg:w-[400px] xl:w-[450px] flex-col border-r border-gray-300 dark:border-gray-700/50 bg-white dark:bg-[#111b21] z-30"
      )}>
        <AllUsers
          users={users}
          chatRooms={chatRooms}
          setChatRooms={setChatRooms}
          onlineUsersId={onlineUsersId}
          currentUser={currentUser}
          changeChat={handleChatChange}
        />
      </div>

      {/* Main Chat Area */}
      <div className={classNames(
        !currentChat ? "hidden lg:flex" : "flex",
        "flex-1 flex-col relative"
      )}>
        {currentChat ? (
          <ChatRoom
            currentChat={currentChat}
            currentUser={currentUser}
            socket={socket}
            users={users}
            onBack={() => setCurrentChat(null)}
          />
        ) : (
          <Welcome />
        )}
      </div>
    </div>
  );
}

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}