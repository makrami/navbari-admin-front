import { Paperclip, Loader2, Check, AlertTriangle } from "lucide-react";
import type { ChatMessage, MessageStatus } from "../types/chat";

interface ChatMessageBubbleProps {
  message: ChatMessage;
}

export function ChatMessageBubble({ message }: ChatMessageBubbleProps) {
  const isOutgoing = message.isOutgoing ?? true; // Default to outgoing
  const hasAttachment = Boolean(message.fileUrl);
  const status = message.status;

  // Debug: log status for outgoing messages
  if (isOutgoing && status) {
    console.log("🔍 Message status:", {
      id: message.id,
      status,
      text: message.text?.substring(0, 30),
    });
  }

  if (isOutgoing) {
    // Right-aligned blue bubble (outgoing)
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] flex flex-col items-end">
          <div className="bg-[#1B54FE] text-white rounded-2xl rounded-br-sm px-4 py-2.5 space-y-2">
            {message.text && (
              <p className="text-sm leading-relaxed">{message.text}</p>
            )}
            {hasAttachment && (
              <AttachmentLink
                fileName={message.fileName}
                fileUrl={message.fileUrl}
                fileMimeType={message.fileMimeType}
                isOutgoing
              />
            )}
          </div>
          <div className="flex items-center gap-1 mt-1 px-1">
            <span className="text-xs text-slate-500">{message.timestamp}</span>
            {status && <MessageStatusIcon status={status} />}
          </div>
        </div>
      </div>
    );
  }

  // Left-aligned gray bubble (incoming)
  return (
    <div className="flex justify-start">
      <div className="max-w-[80%] flex flex-col items-start">
        <div className="bg-slate-100 text-slate-900 rounded-2xl rounded-bl-sm px-4 py-2.5 space-y-2">
          {message.text && (
            <p className="text-sm leading-relaxed">{message.text}</p>
          )}
          {hasAttachment && (
            <AttachmentLink
              fileName={message.fileName}
              fileUrl={message.fileUrl}
              fileMimeType={message.fileMimeType}
            />
          )}
        </div>
        <span className="text-xs text-slate-500 mt-1 px-1">
          {message.timestamp}
        </span>
      </div>
    </div>
  );
}

function MessageStatusIcon({ status }: { status: MessageStatus }) {
  switch (status) {
    case "sending":
      return (
        <Loader2
          className="size-3 text-slate-400 animate-spin"
          aria-label="Sending"
        />
      );
    case "sent":
      return <Check className="size-3 text-green-500" aria-label="Sent" />;
    case "failed":
      return (
        <AlertTriangle className="size-3 text-red-500" aria-label="Failed" />
      );
    default:
      return null;
  }
}

type AttachmentLinkProps = {
  fileName?: string;
  fileUrl?: string;
  fileMimeType?: string;
  isOutgoing?: boolean;
};

function AttachmentLink({
  fileName,
  fileUrl,
  fileMimeType,
  isOutgoing = false,
}: AttachmentLinkProps) {
  if (!fileUrl) return null;
  const textColor = isOutgoing ? "text-white" : "text-slate-700";
  const label = fileName || "Attachment";
  return (
    <a
      href={fileUrl}
      target="_blank"
      rel="noreferrer"
      className={`inline-flex items-center gap-2 text-xs font-medium underline ${textColor}`}
    >
      <Paperclip className="size-4" />
      <span className="truncate max-w-[240px]">{label}</span>
      {fileMimeType && <span className="opacity-70">{fileMimeType}</span>}
    </a>
  );
}
