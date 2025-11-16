import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AlertTriangle, MessageSquareText } from "lucide-react";
import { cn } from "../../../shared/utils/cn";
import imgAvatar from "../../../assets/images/avatar.png";

type UnreadMessagesModalProps = {
  open: boolean;
  onClose: () => void;
};

// TODO: Replace with real API data
const MOCK_MESSAGES: never[] = [];

export function UnreadMessagesModal({
  open,
  onClose,
}: UnreadMessagesModalProps) {
  const { t } = useTranslation();

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-50 transition-opacity duration-300",
          open
            ? " opacity-100 pointer-events-auto"
            : "bg-transparent opacity-0 pointer-events-none"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className={cn(
          "fixed right-65 top-[38%] -translate-y-1/2 z-[60] bg-black/50 w-full max-w-md  rounded-3xl backdrop-blur-[50px] transition-all duration-300 ease-out",
          open
            ? "opacity-100 translate-x-0 pointer-events-auto"
            : "opacity-0  pointer-events-none"
        )}
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow: "0px 4px 6px -4px #0000001A, 0px 10px 15px -3px #0000001A",
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="messages-modal-title"
      >
        {/* Messages List */}
        <div className="max-h-[60vh] overflow-y-auto  pt-3">
          <div className="space-y-3">
            {MOCK_MESSAGES.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                No unread messages
              </div>
            ) : (
              MOCK_MESSAGES.map((msg, index) => (
              <div
                key={msg.id}
                className={cn(
                  "flex items-start gap-3 p-3 transition-colors cursor-pointer",
                  index !== MOCK_MESSAGES.length - 1 &&
                    "border-b-2 border-slate-600"
                )}
              >
                {/* Avatar */}
                <img
                  src={msg.avatar}
                  alt={msg.name}
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0 "
                />

                {/* Content */}
                <div className="flex-1  flex-col min-w-0 flex items-start justify-between gap-1">
                  {/* Left side: Name and message */}
                  <div className="flex-1 flex items-center justify-between w-full min-w-0">
                    <span className="text-sm font-semibold text-white">
                      {msg.name}
                    </span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Alert badge */}
                      <div className="flex items-center text-xs font-bold text-yellow-500 bg-[#CA8A041A] px-2  py-1 rounded-lg gap-2">
                        <AlertTriangle className="w-4 h-4 " />
                        {msg.alerts}
                      </div>
                      {/* Message badge */}
                      <div className="flex items-center text-xs font-bold text-blue-400 bg-[#1B54FE1A] px-2  py-1 rounded-lg gap-2">
                        <MessageSquareText className="w-4 h-4 " />
                        {msg.messages}
                      </div>
                      {/* Timestamp */}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 w-full justify-between">
                    <p className="text-sm text-white truncate">{msg.message}</p>
                    <span className="text-sm font-semibold text-white ">
                      {msg.time}
                    </span>
                  </div>
                  {/* Right side: Badges and timestamp */}
                </div>
              </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <button
          onClick={onClose}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-b-3xl transition-colors"
        >
          {t("dashboard.kpiCards.unreadMessages.modal.showAll")}
        </button>
      </div>
    </>
  );
}
