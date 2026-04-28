import { useState, useRef } from "react";
import { PaperAirplaneIcon } from "@heroicons/react/24/solid";
import { FaceSmileIcon, PhotoIcon } from "@heroicons/react/24/outline";
import EmojiPicker from "emoji-picker-react";

export default function ChatForm({ handleFormSubmit, disabled = false }) {
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef();

  const handleEmojiClick = (emojiData) => {
    setMessage((prev) => prev + emojiData.emoji);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFormSubmit(file, "image");
    }
  };

  const submit = (e) => {
    e.preventDefault();
    if (!message.trim() || disabled) return;
    handleFormSubmit(message, "text");
    setMessage("");
    setShowEmojiPicker(false);
  };

  return (
    <div className="relative p-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-t border-gray-200 dark:border-slate-700 shadow-lg">
      {showEmojiPicker && (
        <div className="absolute bottom-20 left-4 z-50 shadow-2xl rounded-xl overflow-hidden animate-fade-in-up">
          <EmojiPicker 
            onEmojiClick={handleEmojiClick} 
            theme="auto"
            emojiStyle="apple"
          />
        </div>
      )}

      <form onSubmit={submit} className="flex items-center gap-2">
        <button 
          type="button"
          disabled={disabled}
          className="p-2.5 text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          title="Emoji"
        >
          <FaceSmileIcon className="h-6 w-6" />
        </button>

        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
          disabled={disabled}
        />
        <button 
          type="button"
          disabled={disabled}
          className="p-2.5 text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"
          onClick={() => fileInputRef.current?.click()}
          title="Upload Image"
        >
          <PhotoIcon className="h-6 w-6" />
        </button>

        <div className="flex-1 flex items-center bg-white dark:bg-slate-700 rounded-full px-4 py-2.5 border border-gray-200 dark:border-slate-600 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all shadow-sm">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={disabled}
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm dark:text-white placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-50"
            placeholder="Type a message..."
            autoComplete="off"
          />

          <button 
            type="submit"
            disabled={!message.trim() || disabled}
            className="ml-2 text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:text-gray-300 dark:disabled:text-gray-600 transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110"
          >
            <PaperAirplaneIcon className="h-5 w-5 transition-transform" />
          </button>
        </div>
      </form>
    </div>
  );
}