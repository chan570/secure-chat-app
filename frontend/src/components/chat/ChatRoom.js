import { useState, useEffect, useRef } from "react";
import { getMessagesOfChatRoom, sendMessage } from "../../services/ChatService";

import Message from "./Message";
import Contact from "./Contact";
import ChatForm from "./ChatForm";

export default function ChatRoom({ currentChat, currentUser, socket }) {
  const [messages, setMessages] = useState([]);
  const scrollRef = useRef();

  useEffect(() => {
    if (!currentChat?._id) return;

    const fetchData = async () => {
      try {
        const res = await getMessagesOfChatRoom(currentChat._id);
        setMessages(res || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, [currentChat]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const currentSocket = socket.current;
    if (!currentSocket) return;

    const handler = (data) => {
      setMessages((prev) => [...prev, data]);
    };

    currentSocket.on("getMessage", handler);

    return () => {
      currentSocket.off("getMessage", handler);
    };
  }, [socket]);

  const handleFormSubmit = async (message) => {
    if (!message) return;

    const receiverId = currentChat.members.find(
      (m) => m !== currentUser.uid
    );

    socket.current.emit("sendMessage", {
      senderId: currentUser.uid,
      receiverId,
      message,
    });

    try {
      const res = await sendMessage({
        chatRoomId: currentChat._id,
        sender: currentUser.uid,
        message,
      });

      setMessages((prev) => [...prev, res]);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white/30 dark:bg-gray-900/30">
      <div className="sticky top-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50">
        <Contact chatRoom={currentChat} currentUser={currentUser} />
      </div>

      <div className="flex-1 p-6 overflow-y-auto scroll-smooth">
        {messages.map((msg, i) => (
          <div key={msg._id || i} ref={scrollRef}>
            <Message message={msg} self={currentUser.uid} />
          </div>
        ))}
      </div>

      <ChatForm handleFormSubmit={handleFormSubmit} />
    </div>
  );
}