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
        "flex mb-3 animate-fade-in-up"
      )}
    >
      <div className={classNames("flex flex-col", isSender ? "items-end" : "items-start", "max-w-[85%] lg:max-w-[65%]")}>
        <div
          className={classNames(
            isSender ? "wa-bubble-sender" : "wa-bubble-receiver",
            isImage ? "p-1" : "px-3 py-2 pb-1.5",
            "min-w-[60px]"
          )}
        >
          {isImage ? (
            <div className="rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
              <img 
                src={decryptedContent} 
                alt="Sent" 
                className="max-w-full max-h-80 object-cover hover:scale-[1.02] transition-transform duration-300 cursor-pointer"
                onClick={() => window.open(decryptedContent, '_blank')}
              />
            </div>
          ) : (
            <p className="text-[14.2px] leading-relaxed whitespace-pre-wrap break-words pr-2">
              {decryptedContent}
            </p>
          )}
          
          <div className={classNames(
            "flex justify-end items-center gap-1 mt-0.5 select-none",
            isImage ? "absolute bottom-2 right-2 bg-black/30 px-1.5 py-0.5 rounded-full backdrop-blur-sm" : ""
          )}>
            <span className={classNames(
              "text-[10px]",
              isImage ? "text-white" : "text-gray-500 dark:text-gray-400"
            )}>
              {format(message.createdAt)}
            </span>

             {isSender && (
              <span className={classNames(
                message.isRead ? "text-[#34b7f1]" : isImage ? "text-white/70" : "text-gray-400 dark:text-gray-500",
                "text-[12px] flex items-center"
              )}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 13l3 3 7-7" />
                  <path d="M12 13l3 3 7-7" />
                </svg>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
