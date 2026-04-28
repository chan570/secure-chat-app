import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MagnifyingGlassIcon, FunnelIcon, ChatBubbleLeftEllipsisIcon, EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import { sendChatRequest } from "../../services/ChatService";
import Contact from "./Contact";
import UserLayout from "../layouts/UserLayout";
import Logout from "../accounts/Logout";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    if (!chatRooms.length || !currentUser) return;

    const Ids = chatRooms.map((chatRoom) => {
      return chatRoom?.members?.find(
        (member) => member !== currentUser.uid
      );
    }).filter(Boolean);

    setContactIds(Ids);
  }, [chatRooms, currentUser]);

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

  const filteredChatRooms = chatRooms.filter(room => {
    const otherMemberId = room.members.find(m => m !== currentUser.uid);
    const user = users.find(u => u.uid === otherMemberId);
    return user?.displayName?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white dark:bg-[#111b21]">
      {/* WhatsApp Sidebar Header */}
      <div className="bg-[#f0f2f5] dark:bg-[#202c33] px-4 py-2 flex items-center justify-between">
        <Link to="/profile">
          <img 
            src={currentUser?.photoURL || "https://www.gravatar.com/avatar/000?d=mp"} 
            alt="Profile" 
            className="h-10 w-10 rounded-full cursor-pointer hover:opacity-80 transition-opacity object-cover"
          />
        </Link>
        <div className="flex items-center gap-5 mr-1">
          <ChatBubbleLeftEllipsisIcon className="h-6 w-6 text-[#54656f] dark:text-[#aebac1] cursor-pointer" />
          <div className="relative">
             <EllipsisVerticalIcon 
              className="h-6 w-6 text-[#54656f] dark:text-[#aebac1] cursor-pointer" 
              onClick={() => setShowMenu(!showMenu)}
             />
             {showMenu && (
               <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#233138] shadow-lg rounded-md py-1 z-50 animate-fade-in">
                  <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 dark:text-[#d1d7db] hover:bg-[#f5f6f6] dark:hover:bg-[#111b21]">Profile</Link>
                  <button 
                    onClick={() => { setShowLogoutModal(true); setShowMenu(false); }}
                    className="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-[#d1d7db] hover:bg-[#f5f6f6] dark:hover:bg-[#111b21]"
                  >
                    Logout
                  </button>
               </div>
             )}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-3 py-2 flex items-center gap-2">
        <div className="flex-1 flex items-center bg-[#f0f2f5] dark:bg-[#202c33] rounded-lg px-3 py-1.5">
          <MagnifyingGlassIcon className="h-4 w-4 text-[#54656f] dark:text-[#aebac1]" />
          <input 
            type="text"
            placeholder="Search or start new chat"
            className="flex-1 bg-transparent border-none focus:ring-0 text-[14px] ml-4 text-gray-700 dark:text-[#d1d7db] placeholder-[#8696a0]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <FunnelIcon className="h-5 w-5 text-[#54656f] dark:text-[#aebac1] cursor-pointer" />
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Chats Section */}
        <div className="mt-2">
          {filteredChatRooms.length > 0 ? (
            filteredChatRooms.map((chatRoom, index) => (
              <div
                key={chatRoom._id || index}
                className={classNames(
                  index === selectedChat
                    ? "bg-[#f0f2f5] dark:bg-[#2a3942]"
                    : "hover:bg-[#f5f6f6] dark:hover:bg-[#202c33]",
                  "cursor-pointer transition-colors duration-200"
                )}
                onClick={() => changeCurrentChat(index, chatRoom)}
              >
                <div className="border-b border-[#f0f2f5] dark:border-[#222d34] ml-[74px] py-3 pr-4 -ml-[0px] pl-4">
                  <Contact
                    chatRoom={chatRoom}
                    onlineUsersId={onlineUsersId}
                    currentUser={currentUser}
                    users={users}
                  />
                </div>
              </div>
            ))
          ) : searchTerm && (
            <p className="px-4 py-4 text-center text-sm text-gray-500 dark:text-[#8696a0]">No chats found</p>
          )}
        </div>

        {/* Discover Section */}
        <div className="mt-6 pb-4">
          <h3 className="px-4 py-2 text-[14px] font-semibold text-[#00a884] uppercase tracking-wide">
            Discover People
          </h3>
          {nonContacts.length > 0 ? (
            nonContacts.map((nonContact) => (
              <div
                key={nonContact.uid}
                className={classNames(
                  requestSentTo.includes(nonContact.uid) 
                    ? "opacity-60 cursor-default" 
                    : "cursor-pointer hover:bg-[#f5f6f6] dark:hover:bg-[#202c33]",
                  "transition-colors duration-200 relative group"
                )}
                onClick={() => handleSendRequest(nonContact)}
              >
                <div className="border-b border-[#f0f2f5] dark:border-[#222d34] py-3 px-4">
                  <UserLayout
                    user={nonContact}
                    onlineUsersId={onlineUsersId}
                  />
                  {requestSentTo.includes(nonContact.uid) ? (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-bold text-[#00a884] bg-[#00a884]/10 px-2 py-0.5 rounded-md">
                      SENT
                    </span>
                  ) : (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-bold text-[#00a884] opacity-0 group-hover:opacity-100 transition-opacity">
                      SEND REQUEST
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="px-4 py-4 text-sm text-gray-400 italic text-center">No new users to discover</p>
          )}
        </div>
      </div>
      
      {showLogoutModal && <Logout modal={showLogoutModal} setModal={setShowLogoutModal} />}
    </div>
  );
}