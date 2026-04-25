export default function UserLayout({ user, onlineUsersId }) {
  const isOnline = onlineUsersId?.includes(user?.uid);

  return (
    <div className="relative flex items-center p-1">
      <div className="relative">
        <img 
          className="w-10 h-10 rounded-full object-cover shadow-sm border border-gray-200 dark:border-gray-700" 
          src={user?.photoURL} 
          alt={user?.displayName || "User"} 
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
