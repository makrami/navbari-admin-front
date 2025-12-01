import { useRef, useState } from "react";
import { Paperclip, SendHorizonal, X } from "lucide-react";
import { useTranslation } from "react-i18next";

interface MessageInputProps {
  onSend?: (payload: { content: string; file?: File | null }) => void;
  isSending?: boolean;
}

const ACCEPTED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/jpg",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
].join(",");

export function MessageInput({ onSend, isSending = false }: MessageInputProps) {
  const { t } = useTranslation();
  const [message, setMessage] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = message.trim();
    if (!trimmed && !attachment) return;
    onSend?.({ content: trimmed, file: attachment });
    setMessage("");
    setAttachment(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAttachment(file);
    }
  };

  const handleRemoveAttachment = () => {
    setAttachment(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const isSubmitDisabled = isSending || (!message.trim() && !attachment);

  return (
    <form dir="ltr" onSubmit={handleSubmit} className="p-4 space-y-2">
      {attachment && (
        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700">
          <div className="flex items-center gap-2 truncate">
            <Paperclip className="size-4 text-slate-400" />
            <span className="truncate max-w-[240px]">{attachment.name}</span>
          </div>
          <button
            type="button"
            onClick={handleRemoveAttachment}
            className="text-slate-400 hover:text-red-500 transition-colors"
            aria-label={t("chatAlert.messageInput.removeAttachment")}
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      <div className="flex items-center gap-2 bg-slate-50 rounded-2xl px-4 py-3 ">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t("chatAlert.messageInput.placeholder")}
          className="flex-1 bg-transparent border-none outline-none text-sm text-slate-900 placeholder-slate-400"
          disabled={isSending}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_FILE_TYPES}
          className="hidden"
          onChange={handleFileChange}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex-shrink-0 text-slate-500 hover:text-slate-900 transition-colors"
          aria-label={t("chatAlert.messageInput.attachFile")}
          disabled={isSending}
        >
          <Paperclip className="size-5" />
        </button>
        <button
          type="submit"
          disabled={isSubmitDisabled}
          className="flex-shrink-0 bg-[#1B54FE] text-white rounded-full p-2 hover:bg-[#1545d4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={t("chatAlert.messageInput.sendMessage")}
        >
          <SendHorizonal className="size-4" />
        </button>
      </div>
    </form>
  );
}
