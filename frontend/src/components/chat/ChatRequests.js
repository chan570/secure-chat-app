import { useState, useEffect } from "react";
import { getChatRequests, updateChatRequestStatus, getUser } from "../../services/ChatService";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/solid";

export default function ChatRequests({ currentUser, setChatRooms, socket }) {
  const [requests, setRequests] = useState([]);
  const [senderDetails, setSenderDetails] = useState({});
  const [loadingRequestIds, setLoadingRequestIds] = useState(new Set());

  useEffect(() => {
    if (!currentUser) return;

    const fetchRequests = async () => {
      const res = await getChatRequests(currentUser.uid);
      setRequests(res || []);

      // Fetch details for each sender
      if (res) {
        res.forEach(async (req) => {
          if (!senderDetails[req.senderId]) {
            const user = await getUser(req.senderId);
            setSenderDetails((prev) => ({ ...prev, [req.senderId]: user }));
          }
        });
      }
    };

    fetchRequests();
    
    // Listen for real-time request updates via socket
    if (socket?.current) {
      const handleNewRequest = () => {
        fetchRequests();
      };

      socket.current.on("newChatRequest", handleNewRequest);

      return () => {
        socket.current.off("newChatRequest", handleNewRequest);
      };
    }
    
    // Refresh every 30 seconds as fallback
    const interval = setInterval(fetchRequests, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const handleAction = async (requestId, status) => {
    // Add to loading set
    setLoadingRequestIds((prev) => new Set(prev).add(requestId));
    
    const res = await updateChatRequestStatus(requestId, status);
    
    if (status === "accepted" && res) {
      setChatRooms((prev) => [...prev, res]);
    }
    
    setRequests((prev) => prev.filter((r) => r._id !== requestId));
    
    // Remove from loading set
    setLoadingRequestIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(requestId);
      return newSet;
    });
  };

  if (requests.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-700/50 dark:to-slate-700/30 border-b border-blue-200 dark:border-slate-700/50 px-4 py-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold tracking-wider text-blue-700 dark:text-blue-300 uppercase flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold bg-blue-600 text-white rounded-full">
            {requests.length}
          </span>
          📬 Chat Requests
        </h2>
      </div>
      
      <div className="space-y-2">
        {requests.map((req) => (
          <div 
            key={req._id} 
            className="flex items-center justify-between bg-white dark:bg-slate-700/70 p-3 rounded-lg border border-blue-100 dark:border-slate-600 hover:shadow-md dark:hover:shadow-slate-900/30 transition-all duration-200"
          >
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <img 
                src={senderDetails[req.senderId]?.photoURL || "https://via.placeholder.com/40"} 
                alt="" 
                className="w-10 h-10 rounded-full object-cover flex-shrink-0 ring-2 ring-blue-200 dark:ring-blue-400/30"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">
                  {senderDetails[req.senderId]?.displayName || "Loading..."}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  wants to chat
                </p>
              </div>
            </div>
            
            <div className="flex space-x-2 ml-2 flex-shrink-0">
              <button 
                onClick={() => handleAction(req._id, "accepted")}
                disabled={loadingRequestIds.has(req._id)}
                className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:scale-105 active:scale-95"
                title="Accept request"
              >
                <CheckIcon className="h-4 w-4" />
              </button>
              <button 
                onClick={() => handleAction(req._id, "declined")}
                disabled={loadingRequestIds.has(req._id)}
                className="p-2 bg-gray-200 dark:bg-slate-600 hover:bg-gray-300 dark:hover:bg-slate-500 text-gray-700 dark:text-gray-300 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:scale-105 active:scale-95"
                title="Decline request"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
