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
    if (!socket.current) return;

    const handler = (data) => {
      setMessages((prev) => [...prev, data]);
    };

    socket.current.on("getMessage", handler);

    return () => {
      socket.current.off("getMessage", handler);
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
    <div className="lg:col-span-2">
      <Contact chatRoom={currentChat} currentUser={currentUser} />

      <div className="p-6 h-[30rem] overflow-y-auto">
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