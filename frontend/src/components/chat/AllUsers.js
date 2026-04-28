import { useState, useEffect } from "react";

import { sendChatRequest } from "../../services/ChatService";
import Contact from "./Contact";
import UserLayout from "../layouts/UserLayout";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function AllUsers({
  users = [],
  chatRooms = [],
  setChatRooms,
  onlineUsersId,
  currentUser,
  changeChat,
}) {
  const [selectedChat, setSelectedChat] = useState();
  const [nonContacts, setNonContacts] = useState([]);
  const [contactIds, setContactIds] = useState([]);
  const [requestSentTo, setRequestSentTo] = useState([]);

  // Extract contact IDs safely
  useEffect(() => {
    if (!chatRooms.length || !currentUser) return;

    const Ids = chatRooms.map((chatRoom) => {
      return chatRoom?.members?.find(
        (member) => member !== currentUser.uid
      );
    }).filter(Boolean);

    setContactIds(Ids);
  }, [chatRooms, currentUser]);

  // Filter non-contact users safely
  useEffect(() => {
    if (!users.length || !currentUser) return;

    const filtered = users.filter(
      (f) =>
        f.uid !== currentUser.uid &&
        !contactIds.includes(f.uid)
    );

    setNonContacts(filtered);
  }, [contactIds, users, currentUser]);

  const changeCurrentChat = (index, chat) => {
    setSelectedChat(index);
    changeChat(chat);
  };

  const handleSendRequest = async (user) => {
    if (requestSentTo.includes(user.uid)) return;

    try {
      const body = {
        senderId: currentUser.uid,
        receiverId: user.uid,
      };

      await sendChatRequest(body);
      setRequestSentTo((prev) => [...prev, user.uid]);
      alert(`Chat request sent to ${user.displayName || "user"}!`);
    } catch (err) {
      console.error("Error sending chat request:", err);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto pb-4">
      {/* Chats Section */}
      <h2 className="px-5 py-3 text-xs font-bold tracking-wider text-gray-500 dark:text-gray-400 uppercase sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md z-10">
        Recent Chats
      </h2>

      <ul className="space-y-1 px-3">
        {(chatRooms || []).length > 0 ? (
          chatRooms.map((chatRoom, index) => (
            <li
              key={index}
              className={classNames(
                index === selectedChat
                  ? "bg-indigo-50 dark:bg-indigo-500/20 border-indigo-100 dark:border-indigo-500/30 shadow-sm"
                  : "hover:bg-white/60 dark:hover:bg-gray-800/60 border-transparent hover:shadow-sm hover:translate-x-1",
                "transition-all duration-200 ease-in-out cursor-pointer rounded-xl border p-2 group"
              )}
              onClick={() => changeCurrentChat(index, chatRoom)}
            >
              <Contact
                chatRoom={chatRoom}
                onlineUsersId={onlineUsersId}
                currentUser={currentUser}
                users={users}
              />
            </li>
          ))
        ) : (
          <p className="px-4 py-2 text-sm text-gray-400 italic">No recent chats</p>
        )}
      </ul>

      {/* Other Users Section */}
      <h2 className="px-5 py-3 mt-4 text-xs font-bold tracking-wider text-gray-500 dark:text-gray-400 uppercase sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md z-10">
        Discover
      </h2>

      <ul className="space-y-1 px-3">
        {(nonContacts || []).length > 0 ? (
          nonContacts.map((nonContact, index) => (
            <li
              key={index}
              className={classNames(
                requestSentTo.includes(nonContact.uid) 
                  ? "opacity-60 cursor-default" 
                  : "cursor-pointer hover:bg-white/60 dark:hover:bg-gray-800/60 hover:shadow-sm hover:translate-x-1",
                "transition-all duration-200 ease-in-out rounded-xl border border-transparent p-2 group relative"
              )}
              onClick={() => handleSendRequest(nonContact)}
            >
              <UserLayout
                user={nonContact}
                onlineUsersId={onlineUsersId}
              />
              {requestSentTo.includes(nonContact.uid) && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-1 rounded-full uppercase tracking-tighter">
                  Request Sent
                </span>
              )}
            </li>
          ))
        ) : (
          <p className="px-4 py-2 text-sm text-gray-400 italic">No new users</p>
        )}
      </ul>
    </div>
  );
}