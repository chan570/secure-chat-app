import { useState, useEffect, useRef } from "react";
import { ChevronLeftIcon, EllipsisVerticalIcon, MagnifyingGlassIcon, ExclamationIcon, CheckIcon } from "@heroicons/react/24/outline";
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
  const [error, setError] = useState(null);
  const [sendingError, setSendingError] = useState(false);
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
        setError("Failed to load messages");
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

    const errorHandler = (data) => {
      setSendingError(true);
      setError(data.message || "Failed to send message");
      setTimeout(() => {
        setSendingError(false);
        setError(null);
      }, 4000);
    };

    currentSocket.on("getMessage", handler);
    currentSocket.on("messagesRead", readHandler);
    currentSocket.on("messageError", errorHandler);

    return () => {
      currentSocket.off("getMessage", handler);
      currentSocket.off("messagesRead", readHandler);
      currentSocket.off("messageError", errorHandler);
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
        setError("Failed to upload image");
        setUploading(false);
        setTimeout(() => setError(null), 4000);
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
      setSendingError(true);
      setError(err.response?.data?.message || "Failed to send message");
      setTimeout(() => {
        setSendingError(false);
        setError(null);
      }, 4000);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-gradient-to-b from-white to-gray-50 dark:from-slate-800 dark:to-slate-900">
      {/* Modern Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-slate-700 dark:to-slate-800 border-b border-indigo-200 dark:border-slate-700 py-3.5 px-4 flex items-center justify-between z-20 shadow-md">
        <div className="flex items-center flex-1 gap-3">
          <button
            onClick={onBack}
            className="lg:hidden p-1.5 rounded-lg hover:bg-indigo-400/20 transition-colors"
          >
            <ChevronLeftIcon className="h-6 w-6 text-white" />
          </button>
          <div className="text-white">
            <Contact chatRoom={currentChat} currentUser={currentUser} users={users} />
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-white">
          <button className="p-1.5 rounded-lg hover:bg-indigo-400/20 transition-colors">
            <MagnifyingGlassIcon className="h-5 w-5" />
          </button>
          <button className="p-1.5 rounded-lg hover:bg-indigo-400/20 transition-colors">
            <EllipsisVerticalIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Error Notification */}
      {error && (
        <div className={`bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 px-4 py-3 flex items-center gap-3 animate-slide-down`}>
          <ExclamationIcon className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
          <p className="text-sm font-medium text-red-800 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-6 space-y-3">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-center">
            <div>
              <p className="text-5xl mb-3">💬</p>
              <p className="text-gray-500 dark:text-gray-400 font-medium">Chat started</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Send your first message!</p>
            </div>
          </div>
        )}
        
        {messages.map((msg, i) => (
          <div key={msg._id || i} ref={scrollRef}>
            <Message message={msg} self={currentUser.uid} />
          </div>
        ))}
        
        {uploading && (
          <div className="flex justify-end mb-4">
             <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-5 py-2.5 rounded-full animate-pulse text-sm font-medium shadow-lg flex items-center gap-2">
               <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
               Uploading...
             </div>
          </div>
        )}
      </div>

      {/* Chat Form */}
      <ChatForm handleFormSubmit={handleFormSubmit} disabled={uploading || sendingError} />
    </div>
  );
}