import { useState, useEffect } from "react";
import { getChatRequests, updateChatRequestStatus, getUser } from "../../services/ChatService";

export default function ChatRequests({ currentUser, setChatRooms }) {
  const [requests, setRequests] = useState([]);
  const [senderDetails, setSenderDetails] = useState({});

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
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchRequests, 30000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const handleAction = async (requestId, status) => {
    const res = await updateChatRequestStatus(requestId, status);
    if (status === "accepted" && res) {
      setChatRooms((prev) => [...prev, res]);
    }
    setRequests((prev) => prev.filter((r) => r._id !== requestId));
  };

  if (requests.length === 0) return null;

  return (
    <div className="px-5 py-4 border-b border-gray-200/50 dark:border-gray-700/50">
      <h2 className="text-xs font-bold tracking-wider text-indigo-600 dark:text-indigo-400 uppercase mb-3">
        Pending Requests ({requests.length})
      </h2>
      <div className="space-y-3">
        {requests.map((req) => (
          <div key={req._id} className="flex items-center justify-between bg-indigo-50/50 dark:bg-indigo-900/20 p-2 rounded-xl border border-indigo-100 dark:border-indigo-500/20">
            <div className="flex items-center space-x-2">
              <img 
                src={senderDetails[req.senderId]?.photoURL || "https://via.placeholder.com/40"} 
                alt="" 
                className="w-8 h-8 rounded-full"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {senderDetails[req.senderId]?.displayName || "Loading..."}
              </span>
            </div>
            <div className="flex space-x-1">
              <button 
                onClick={() => handleAction(req._id, "accepted")}
                className="p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                title="Accept"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              <button 
                onClick={() => handleAction(req._id, "declined")}
                className="p-1.5 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                title="Decline"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
