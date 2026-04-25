export default function UserLayout({ user, onlineUsersId }) {
  const isOnline = onlineUsersId?.includes(user?.uid);
  
  // Create a nice fallback avatar if they don't have a photoURL
  const avatarUrl = user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || "User")}&background=6366f1&color=fff`;

  return (
    <div className="relative flex items-center p-1">
      <div className="relative">
        <img 
          className="w-10 h-10 rounded-full object-cover shadow-sm border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800" 
          src={avatarUrl} 
          alt={user?.displayName || "User"} 
          onError={(e) => {
            // If the image fails to load, use the fallback
            e.target.onerror = null; 
            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || "User")}&background=6366f1&color=fff`;
          }}
        />
        <span 
          className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white dark:border-gray-900 rounded-full ${
            isOnline ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" : "bg-gray-400"
          }`}
        ></span>
      </div>
      <div className="ml-3 overflow-hidden">
        <span className="block text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
          {user?.displayName}
        </span>
        <span className="block text-xs text-gray-500 dark:text-gray-400 truncate">
          {isOnline ? "Online" : "Offline"}
        </span>
      </div>
    </div>
  );
}
