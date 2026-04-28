import { useState, useRef } from "react";
import { PaperAirplaneIcon } from "@heroicons/react/24/solid";
import { FaceSmileIcon, PhotoIcon } from "@heroicons/react/24/outline";
import EmojiPicker from "emoji-picker-react";

export default function ChatForm({ handleFormSubmit }) {
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
    if (!message.trim()) return;
    handleFormSubmit(message, "text");
    setMessage("");
    setShowEmojiPicker(false);
  };

  return (
    <div className="relative p-4 bg-white/40 dark:bg-gray-900/40 backdrop-blur-md border-t border-gray-200/50 dark:border-gray-700/50">
      {showEmojiPicker && (
        <div className="absolute bottom-20 left-4 z-50 shadow-2xl rounded-xl overflow-hidden animate-fade-in-up">
          <EmojiPicker 
            onEmojiClick={handleEmojiClick} 
            theme="auto"
            emojiStyle="apple"
          />
        </div>
      )}

      <form onSubmit={submit} className="flex items-center">
        <div className="flex-1 flex items-center glass-input rounded-full px-4 py-2 bg-white/80 dark:bg-gray-800/80">
          <button 
            type="button"
            className="text-gray-400 hover:text-indigo-500 transition-colors focus:outline-none"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <FaceSmileIcon className="h-6 w-6" />
          </button>

          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
          <button 
            type="button"
            className="text-gray-400 hover:text-indigo-500 transition-colors ml-2 focus:outline-none"
            onClick={() => fileInputRef.current.click()}
          >
            <PhotoIcon className="h-6 w-6" />
          </button>

          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 mx-3 bg-transparent border-none focus:ring-0 text-sm dark:text-white placeholder-gray-400"
            placeholder="Type a message..."
            autoComplete="off"
          />

          <button 
            type="submit"
            disabled={!message.trim()}
            className="text-indigo-500 hover:text-indigo-600 disabled:text-gray-300 disabled:dark:text-gray-600 transition-colors focus:outline-none"
          >
            <PaperAirplaneIcon className="h-6 w-6 transition-transform hover:-translate-y-0.5 hover:translate-x-0.5" />
          </button>
        </div>
      </form>
    </div>
  );
}