import { format } from "timeago.js";
import { decryptMessage } from "../../utils/Encryption";
import { CheckIcon } from "@heroicons/react/24/solid";

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
        "flex mb-2 animate-fade-in-up"
      )}
    >
      <div className={classNames("flex flex-col", isSender ? "items-end" : "items-start", "max-w-[85%] lg:max-w-[65%]")}>
        <div
          className={classNames(
            isSender 
              ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg hover:shadow-xl" 
              : "bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white shadow-md hover:shadow-lg",
            isImage ? "p-1.5 rounded-2xl" : "px-4 py-2.5 pb-2 rounded-2xl",
            "transition-all duration-200 hover:scale-[1.01]"
          )}
        >
          {isImage ? (
            <div className="rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 max-w-full max-h-80">
              <img 
                src={decryptedContent} 
                alt="Sent" 
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                onClick={() => window.open(decryptedContent, '_blank')}
              />
            </div>
          ) : (
            <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
              {decryptedContent}
            </p>
          )}
          
          <div className={classNames(
            "flex justify-end items-center gap-1.5 mt-1 select-none",
            isImage ? "absolute bottom-2 right-2 bg-black/40 px-2 py-1 rounded-full backdrop-blur-md" : ""
          )}>
            <span className={classNames(
              "text-[11px] font-medium",
              isImage ? "text-white" : isSender ? "text-indigo-100" : "text-gray-500 dark:text-gray-400"
            )}>
              {format(message.createdAt)}
            </span>

             {isSender && (
              <div className={classNames(
                message.isRead ? "text-indigo-200" : isSender ? "text-indigo-100" : "text-gray-400 dark:text-gray-500",
                "flex items-center ml-1"
              )}>
                {message.isRead ? (
                  <span className="text-xs" title="Read">✓✓</span>
                ) : (
                  <span className="text-xs" title="Sent">✓</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
