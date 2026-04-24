import { useState } from "react";
import { PaperAirplaneIcon } from "@heroicons/react/solid";
import { EmojiHappyIcon } from "@heroicons/react/outline";
import Picker from "emoji-picker-react";

export default function ChatForm({ handleFormSubmit }) {
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleEmojiClick = (emojiData) => {
    setMessage((prev) => prev + emojiData.emoji);
  };

  const submit = (e) => {
    e.preventDefault();
    handleFormSubmit(message);
    setMessage("");
  };

  return (
    <div>
      {showEmojiPicker && <Picker onEmojiClick={handleEmojiClick} />}

      <form onSubmit={submit}>
        <div className="flex p-3">
          <button onClick={(e) => {
            e.preventDefault();
            setShowEmojiPicker(!showEmojiPicker);
          }}>
            <EmojiHappyIcon className="h-7 w-7" />
          </button>

          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 mx-3"
            placeholder="Write a message"
          />

          <button type="submit">
            <PaperAirplaneIcon className="h-6 w-6 rotate-90" />
          </button>
        </div>
      </form>
    </div>
  );
}