import { format } from "timeago.js";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Message({ message, self }) {
  const isSender = self === message.sender;

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
            "px-5 py-3"
          )}
        >
          <span className="block font-normal text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message.message}
          </span>
        </div>
        <span className="block text-[10px] text-gray-400 dark:text-gray-500 mt-1 mx-1">
          {format(message.createdAt)}
        </span>
      </div>
    </div>
  );
}
