import { useState } from "react";
import { Paperclip, Camera, SendHorizonal } from "lucide-react";

interface MessageInputProps {
  onSend?: (message: string) => void;
}

export function MessageInput({ onSend }: MessageInputProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && onSend) {
      onSend(message);
      setMessage("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4">
      <div className="flex items-center gap-2 bg-slate-50 rounded-2xl px-4 py-3 ">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-transparent border-none outline-none text-sm text-slate-900 placeholder-slate-400"
        />
        <button
          type="button"
          className="flex-shrink-0 text-slate-500 hover:text-slate-900 transition-colors"
          aria-label="Attach file"
        >
          <Paperclip className="size-5" />
        </button>
        <button
          type="button"
          className="flex-shrink-0 text-slate-500 hover:text-slate-900 transition-colors"
          aria-label="Take photo"
        >
          <Camera className="size-5" />
        </button>
        <button
          type="submit"
          disabled={!message.trim()}
          className="flex-shrink-0 bg-[#1B54FE] text-white rounded-full p-2 hover:bg-[#1545d4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Send message"
        >
          <SendHorizonal className="size-4" />
        </button>
      </div>
    </form>
  );
}
