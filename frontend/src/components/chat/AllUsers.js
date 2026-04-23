import { useState, useEffect } from "react";

import { createChatRoom } from "../../services/ChatService";
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

  // Extract contact IDs safely
  useEffect(() => {
    if (!chatRooms.length || !currentUser) return;

    const Ids = chatRooms.map((chatRoom) => {
      return chatRoom.members?.find(
        (member) => member !== currentUser.uid
      );
    });

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

  const handleNewChatRoom = async (user) => {
    try {
      const members = {
        senderId: currentUser.uid,
        receiverId: user.uid,
      };

      const res = await createChatRoom(members);

      // Safe update
      setChatRooms((prev = []) => [...prev, res]);

      changeChat(res);
    } catch (err) {
      console.error("Error creating chat room:", err);
    }
  };

  return (
    <ul className="overflow-auto h-[30rem]">
      {/* Chats Section */}
      <h2 className="my-2 mb-2 ml-2 text-gray-900 dark:text-white">
        Chats
      </h2>

      <li>
        {(chatRooms || []).length > 0 ? (
          chatRooms.map((chatRoom, index) => (
            <div
              key={index}
              className={classNames(
                index === selectedChat
                  ? "bg-gray-100 dark:bg-gray-700"
                  : "transition duration-150 ease-in-out cursor-pointer bg-white border-b border-gray-200 hover:bg-gray-100 dark:bg-gray-900 dark:border-gray-700 dark:hover:bg-gray-700",
                "flex items-center px-3 py-2 text-sm"
              )}
              onClick={() => changeCurrentChat(index, chatRoom)}
            >
              <Contact
                chatRoom={chatRoom}
                onlineUsersId={onlineUsersId}
                currentUser={currentUser}
              />
            </div>
          ))
        ) : (
          <p className="ml-2 text-gray-500">No chats yet</p>
        )}
      </li>

      {/* Other Users Section */}
      <h2 className="my-2 mb-2 ml-2 text-gray-900 dark:text-white">
        Other Users
      </h2>

      <li>
        {(nonContacts || []).length > 0 ? (
          nonContacts.map((nonContact, index) => (
            <div
              key={index}
              className="flex items-center px-3 py-2 text-sm bg-white border-b border-gray-200 hover:bg-gray-100 dark:bg-gray-900 dark:border-gray-700 dark:hover:bg-gray-700 cursor-pointer"
              onClick={() => handleNewChatRoom(nonContact)}
            >
              <UserLayout
                user={nonContact}
                onlineUsersId={onlineUsersId}
              />
            </div>
          ))
        ) : (
          <p className="ml-2 text-gray-500">No users available</p>
        )}
      </li>
    </ul>
  );
}