import type { ChatMessage } from "../types/chat";

interface ChatMessageBubbleProps {
  message: ChatMessage;
}

export function ChatMessageBubble({ message }: ChatMessageBubbleProps) {
  const isOutgoing = message.isOutgoing ?? true; // Default to outgoing

  if (isOutgoing) {
    // Right-aligned blue bubble (outgoing)
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] flex flex-col items-end">
          <div className="bg-[#1B54FE] text-white rounded-2xl rounded-br-sm px-4 py-2.5 ">
            <p className="text-sm leading-relaxed">{message.text}</p>
          </div>
          <span className="text-xs text-slate-500 mt-1 px-1">
            {message.timestamp}
          </span>
        </div>
      </div>
    );
  }

  // Left-aligned gray bubble (incoming)
  return (
    <div className="flex justify-start">
      <div className="max-w-[80%] flex flex-col items-start">
        <div className="bg-slate-100 text-slate-900 rounded-2xl rounded-bl-sm px-4 py-2.5 ">
          <p className="text-sm leading-relaxed">{message.text}</p>
        </div>
        <span className="text-xs text-slate-500 mt-1 px-1">
          {message.timestamp}
        </span>
      </div>
    </div>
  );
}
