import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MagnifyingGlassIcon, FunnelIcon, ChatBubbleLeftEllipsisIcon, EllipsisVerticalIcon, PaperAirplaneIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
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
  const [sendingRequest, setSendingRequest] = useState(false);

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
    if (requestSentTo.includes(user.uid) || sendingRequest) return;

    setSendingRequest(true);
    try {
      const body = {
        senderId: currentUser.uid,
        receiverId: user.uid,
      };

      await sendChatRequest(body);
      setRequestSentTo((prev) => [...prev, user.uid]);
      
      // Show temporary success message
      setTimeout(() => {
        setSendingRequest(false);
      }, 1000);
    } catch (err) {
      console.error("Error sending chat request:", err);
      setSendingRequest(false);
    }
  };

  const filteredChatRooms = chatRooms.filter(room => {
    const otherMemberId = room.members.find(m => m !== currentUser.uid);
    const user = users.find(u => u.uid === otherMemberId);
    return user?.displayName?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const filteredNonContacts = nonContacts.filter(user =>
    user.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white dark:bg-slate-800">
      {/* Modern Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-700 dark:to-purple-800 px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-4">
          <Link to="/profile" className="group relative">
            <img 
              src={currentUser?.photoURL || "https://www.gravatar.com/avatar/000?d=mp"} 
              alt="Profile" 
              className="h-12 w-12 rounded-full cursor-pointer hover:ring-2 ring-white transition-all object-cover shadow-lg"
            />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
          </Link>
          <div className="text-white">
            <p className="font-bold text-lg">{currentUser?.displayName || "User"}</p>
            <p className="text-xs text-indigo-100">Online</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-white">
          <ChatBubbleLeftEllipsisIcon className="h-6 w-6 cursor-pointer hover:scale-110 transition-transform" />
          <div className="relative">
             <EllipsisVerticalIcon 
              className="h-6 w-6 cursor-pointer hover:scale-110 transition-transform" 
              onClick={() => setShowMenu(!showMenu)}
             />
             {showMenu && (
               <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-700 shadow-xl rounded-lg py-2 z-50 border border-gray-200 dark:border-gray-600">
                  <Link to="/profile" className="block px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-slate-600 transition-colors">
                    <span className="font-medium">Profile</span>
                  </Link>
                  <button 
                    onClick={() => { setShowLogoutModal(true); setShowMenu(false); }}
                    className="w-full text-left block px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <span className="font-medium">Logout</span>
                  </button>
               </div>
             )}
          </div>
        </div>
      </div>

      {/* Modern Search Bar */}
      <div className="px-4 py-3 bg-gray-50 dark:bg-slate-700/50 border-b border-gray-200 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center bg-white dark:bg-slate-700 rounded-full px-4 py-2.5 shadow-sm border border-gray-200 dark:border-slate-600 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            <input 
              type="text"
              placeholder="Search chats or users..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm ml-3 text-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="p-2.5 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-full transition-colors">
            <FunnelIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Chat List Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Active Chats Section */}
        {filteredChatRooms.length > 0 && (
          <div>
            <div className="px-6 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-slate-700/50 dark:to-slate-700/30 border-b border-indigo-200 dark:border-slate-700">
              <h3 className="text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-widest">
                💬 Active Chats ({filteredChatRooms.length})
              </h3>
            </div>
            {filteredChatRooms.map((chatRoom, index) => (
              <div
                key={chatRoom._id || index}
                className={classNames(
                  index === selectedChat
                    ? "bg-indigo-50 dark:bg-slate-700/50 border-l-4 border-indigo-500"
                    : "hover:bg-gray-50 dark:hover:bg-slate-700/30 border-l-4 border-transparent",
                  "cursor-pointer transition-all duration-200"
                )}
                onClick={() => changeCurrentChat(index, chatRoom)}
              >
                <div className="border-b border-gray-100 dark:border-slate-700/50 py-3 pr-4 pl-4">
                  <Contact
                    chatRoom={chatRoom}
                    onlineUsersId={onlineUsersId}
                    currentUser={currentUser}
                    users={users}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Discover Section */}
        {filteredNonContacts.length > 0 && (
          <div>
            <div className="px-6 py-3 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-slate-700/50 dark:to-slate-700/30 border-b border-emerald-200 dark:border-slate-700 mt-2">
              <h3 className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-widest">
                ✨ Discover People ({filteredNonContacts.length})
              </h3>
            </div>
            {filteredNonContacts.map((nonContact) => (
              <div
                key={nonContact.uid}
                className={classNames(
                  requestSentTo.includes(nonContact.uid) 
                    ? "opacity-60 cursor-default" 
                    : "cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/30",
                  "transition-all duration-200 relative group border-b border-gray-100 dark:border-slate-700/50 py-3 px-4"
                )}
                onClick={() => !requestSentTo.includes(nonContact.uid) && handleSendRequest(nonContact)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <UserLayout
                      user={nonContact}
                      onlineUsersId={onlineUsersId}
                    />
                  </div>
                  {requestSentTo.includes(nonContact.uid) ? (
                    <div className="flex items-center gap-2 ml-4">
                      <CheckCircleIcon className="h-5 w-5 text-green-500" />
                      <span className="text-xs font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full">
                        REQUEST SENT
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSendRequest(nonContact);
                        }}
                        className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:shadow-lg transition-all hover:scale-105"
                      >
                        <PaperAirplaneIcon className="h-4 w-4" />
                        <span>ADD</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!searchTerm && filteredChatRooms.length === 0 && filteredNonContacts.length === 0 && (
          <div className="flex items-center justify-center h-64 text-center px-4">
            <div>
              <p className="text-3xl mb-2">👋</p>
              <p className="text-gray-500 dark:text-gray-400 font-medium">No chats yet</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Start by sending a request to someone!</p>
            </div>
          </div>
        )}

        {/* Search No Results */}
        {searchTerm && filteredChatRooms.length === 0 && filteredNonContacts.length === 0 && (
          <div className="flex items-center justify-center h-64 text-center px-4">
            <div>
              <p className="text-3xl mb-2">🔍</p>
              <p className="text-gray-500 dark:text-gray-400 font-medium">No results found</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Try a different search term</p>
            </div>
          </div>
        )}
      </div>
      
      {showLogoutModal && <Logout modal={showLogoutModal} setModal={setShowLogoutModal} />}
    </div>
  );
}