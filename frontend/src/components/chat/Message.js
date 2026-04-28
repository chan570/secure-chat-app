import { format } from "timeago.js";
import { decryptMessage } from "../../utils/Encryption";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Message({ message, self }) {
  const isSender = self === message.sender;
  const decryptedContent = decryptMessage(message.message, message.chatRoomId);
  const isImage = message.type === "image";

  return (
    <div
      className={classNames(
        isSender ? "justify-end" : "justify-start",
        "flex mb-4 animate-fade-in-up"
      )}
    >
      <div className={classNames("flex flex-col", isSender ? "items-end" : "items-start", "max-w-[75%]")}>
        <div
          className={classNames(
            isSender
              ? "bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-[0_4px_14px_0_rgba(99,102,241,0.39)] rounded-2xl rounded-tr-sm"
              : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-gray-700 shadow-sm rounded-2xl rounded-tl-sm",
            isImage ? "p-1.5" : "px-5 py-3",
            "relative"
          )}
        >
          {isImage ? (
            <div className="rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700">
              <img 
                src={decryptedContent} 
                alt="Sent" 
                className="max-w-full max-h-64 object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                onClick={() => window.open(decryptedContent, '_blank')}
              />
            </div>
          ) : (
            <span className="block font-normal text-sm leading-relaxed whitespace-pre-wrap break-words">
              {decryptedContent}
            </span>
          )}
          
          <div className={classNames(
            "flex justify-end mt-1",
            isImage ? "px-2 pb-1" : ""
          )}>
             {isSender && (
              <span className={classNames(
                message.isRead ? "text-sky-300" : isImage ? "text-gray-400" : "text-white/60",
                "text-[12px] flex items-center ml-2"
              )}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 13l3 3 7-7" />
                  <path d="M12 13l3 3 7-7" />
                </svg>
              </span>
            )}
          </div>
        </div>
        <span className="block text-[10px] text-gray-400 dark:text-gray-500 mt-1 mx-1">
          {format(message.createdAt)}
        </span>
      </div>
    </div>
  );
}
