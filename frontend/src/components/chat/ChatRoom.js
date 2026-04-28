import { useState, useEffect, useRef } from "react";
import { ChevronLeftIcon, EllipsisVerticalIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
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
    <div className="flex-1 flex flex-col h-full bg-[#f0f2f5] dark:bg-[#0b141a]">
      {/* WhatsApp Header */}
      <div className="bg-[#f0f2f5] dark:bg-[#202c33] border-l border-gray-300 dark:border-gray-700/50 py-2.5 px-4 flex items-center justify-between z-20">
        <div className="flex items-center flex-1">
          <button
            onClick={onBack}
            className="lg:hidden mr-3 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <ChevronLeftIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
          </button>
          <Contact chatRoom={currentChat} currentUser={currentUser} users={users} />
        </div>
        
        <div className="flex items-center gap-5 mr-2">
          <MagnifyingGlassIcon className="h-5 w-5 text-[#54656f] dark:text-[#aebac1] cursor-pointer" />
          <EllipsisVerticalIcon className="h-5 w-5 text-[#54656f] dark:text-[#aebac1] cursor-pointer" />
        </div>
      </div>

      {/* WhatsApp Background Wallpaper */}
      <div className="flex-1 overflow-y-auto wa-bg p-4 lg:p-8 space-y-2">
        {messages.map((msg, i) => (
          <div key={msg._id || i} ref={scrollRef}>
            <Message message={msg} self={currentUser.uid} />
          </div>
        ))}
        {uploading && (
          <div className="flex justify-end mb-4">
             <div className="bg-[#dcf8c6] dark:bg-[#005c4b] px-4 py-2 rounded-xl animate-pulse text-xs text-gray-600 dark:text-gray-200 shadow-sm">
               Uploading...
             </div>
          </div>
        )}
      </div>

      <ChatForm handleFormSubmit={handleFormSubmit} />
    </div>
  );
}