import { useState, useEffect, useRef } from "react";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../config/firebase";
import { getMessagesOfChatRoom, sendMessage, markMessagesAsRead } from "../../services/ChatService";
import Message from "./Message";
import Contact from "./Contact";
import ChatForm from "./ChatForm";
import { encryptMessage } from "../../utils/Encryption";

export default function ChatRoom({ currentChat, currentUser, socket, users, onBack }) {
  const [messages, setMessages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const scrollRef = useRef();

  useEffect(() => {
    if (!currentChat?._id) return;

    const fetchData = async () => {
      try {
        const res = await getMessagesOfChatRoom(currentChat._id);
        setMessages(res || []);
        
        await markMessagesAsRead(currentChat._id, currentUser.uid);
        
        socket.current.emit("markAsRead", {
          chatRoomId: currentChat._id,
          userId: currentUser.uid,
          receiverId: currentChat.members.find(m => m !== currentUser.uid)
        });
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, [currentChat, currentUser.uid, socket]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const currentSocket = socket.current;
    if (!currentSocket) return;

    const handler = (data) => {
      setMessages((prev) => [...prev, data]);
      
      if (data.chatRoomId === currentChat?._id && data.sender !== currentUser.uid) {
        markMessagesAsRead(currentChat._id, currentUser.uid);
        currentSocket.emit("markAsRead", {
          chatRoomId: currentChat._id,
          userId: currentUser.uid,
          receiverId: data.sender
        });
      }
    };

    const readHandler = ({ chatRoomId }) => {
      if (chatRoomId === currentChat?._id) {
        setMessages((prev) => prev.map(m => ({ ...m, isRead: true })));
      }
    };

    currentSocket.on("getMessage", handler);
    currentSocket.on("messagesRead", readHandler);

    return () => {
      currentSocket.off("getMessage", handler);
      currentSocket.off("messagesRead", readHandler);
    };
  }, [socket, currentChat, currentUser.uid]);

  const handleFormSubmit = async (content, type = "text") => {
    if (!content) return;

    const receiverId = currentChat.members.find(
      (m) => m !== currentUser.uid
    );

    let messageToSend = content;

    if (type === "image") {
      try {
        setUploading(true);
        const storageRef = ref(storage, `chats/${currentChat._id}/${Date.now()}_${content.name}`);
        const snapshot = await uploadBytes(storageRef, content);
        messageToSend = await getDownloadURL(snapshot.ref);
        setUploading(false);
      } catch (err) {
        console.error("Upload error:", err);
        setUploading(false);
        return;
      }
    }

    // Encrypt message (images are URLs, we can encrypt them too for privacy)
    const encryptedMessage = encryptMessage(messageToSend, currentChat._id);

    socket.current.emit("sendMessage", {
      senderId: currentUser.uid,
      receiverId,
      message: encryptedMessage,
      chatRoomId: currentChat._id,
      type
    });

    try {
      const res = await sendMessage({
        chatRoomId: currentChat._id,
        sender: currentUser.uid,
        message: encryptedMessage,
        type
      });

      setMessages((prev) => [...prev, res]);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white/30 dark:bg-gray-900/30">
      <div className="sticky top-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 flex items-center">
        <button
          onClick={onBack}
          className="lg:hidden ml-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title="Back to contacts"
        >
          <ChevronLeftIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
        </button>
        
        <div className="flex-1">
          <Contact chatRoom={currentChat} currentUser={currentUser} users={users} />
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto scroll-smooth">
        {messages.map((msg, i) => (
          <div key={msg._id || i} ref={scrollRef}>
            <Message message={msg} self={currentUser.uid} />
          </div>
        ))}
        {uploading && (
          <div className="flex justify-end mb-4">
             <div className="bg-indigo-100 dark:bg-indigo-900/30 px-4 py-2 rounded-xl animate-pulse text-xs text-indigo-600 dark:text-indigo-400">
               Uploading image...
             </div>
          </div>
        )}
      </div>

      <ChatForm handleFormSubmit={handleFormSubmit} />
    </div>
  );
}