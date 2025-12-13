import {useEffect, useState, useRef, useLayoutEffect, useMemo} from "react";
import {useTranslation} from "react-i18next";
import {AlertTriangle, MessageSquareText} from "lucide-react";
import {cn} from "../../../shared/utils/cn";
import {useConversationsSummaries} from "../../../services/dashboard/hooks";
import type {ConversationSummary} from "../../../services/dashboard/dashboard.service";
import dayjs from "dayjs";
import {ENV} from "../../../lib/env";
import {useChatWithConversation} from "../../../shared/hooks/useChatWithConversation";
import {ChatOverlay} from "../../../shared/components/ChatOverlay";

type UnreadMessagesModalProps = {
  open: boolean;
  onClose: () => void;
  cardPosition: {top: number; left: number; width: number} | null;
  type: "messages" | "alerts";
};

/**
 * Construct full URL for file (avatar, logo, etc.)
 */
function getFileUrl(filePath: string | null | undefined): string | undefined {
  if (!filePath) return undefined;

  // If already a full URL, return as is
  if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
    return filePath;
  }

  // Construct full URL from relative path
  const cleanPath = filePath.startsWith("/") ? filePath.slice(1) : filePath;
  return `${ENV.FILE_BASE_URL}/${cleanPath}`;
}

/**
 * Format timestamp to relative time (e.g., "2h ago", "3m ago")
 */
function formatTimeAgo(timestamp: string): string {
  const now = dayjs();
  const date = dayjs(timestamp);
  const diffInSeconds = now.diff(date, "second");

  if (diffInSeconds < 60) {
    return `${diffInSeconds}s ago`;
  }

  const diffInMinutes = now.diff(date, "minute");
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }

  const diffInHours = now.diff(date, "hour");
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  const diffInDays = now.diff(date, "day");
  return `${diffInDays}d ago`;
}

export function UnreadMessagesModal({
  open,
  onClose,
  cardPosition,
  type,
}: UnreadMessagesModalProps) {
  const {t} = useTranslation();
  const modalRef = useRef<HTMLDivElement>(null);
  const [calculatedPosition, setCalculatedPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const {data: conversationsData, isLoading} = useConversationsSummaries();
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [selectedConversationName, setSelectedConversationName] = useState<
    string | null
  >(null);
  const openChatRef = useRef<string | null>(null);

  // Chat hook for selected conversation
  const chatHook = useChatWithConversation({
    conversationId: selectedConversationId || "",
    recipientName: selectedConversationName || "",
  });

  // Open chat when conversation ID is set and we have a pending open request
  useEffect(() => {
    if (openChatRef.current && selectedConversationId === openChatRef.current) {
      // Open chat - ChatOverlay will handle loading state
      chatHook.setIsChatOpen(true);
      openChatRef.current = null;
    }
  }, [selectedConversationId, chatHook.setIsChatOpen]);

  // Get the appropriate summaries based on type
  const summaries: ConversationSummary[] = useMemo(() => {
    if (!conversationsData) return [];
    return type === "messages"
      ? conversationsData.unreadMessageSummaries
      : conversationsData.unreadAlertSummaries;
  }, [conversationsData, type]);

  useEffect(() => {
    if (!open) {
      // Don't reset selected conversation here - let chat overlay handle its own close
      return;
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  // Calculate position immediately when cardPosition changes
  useLayoutEffect(() => {
    if (!open || !cardPosition) {
      setCalculatedPosition(null);
      return;
    }

    // Find the container (max-w-7xl mx-auto)
    const container = document.querySelector(
      ".h-full.w-full.max-w-7xl.mx-auto"
    ) as HTMLElement;
    if (!container) {
      setCalculatedPosition({
        top: cardPosition.top + 8,
        left: cardPosition.left,
      });
      return;
    }

    const containerRect = container.getBoundingClientRect();

    // Use approximate dimensions for initial calculation (no need to wait for render)
    const modalWidth = 448; // max-w-md = 28rem = 448px
    const modalHeight = 400; // approximate height

    let left = cardPosition.left;
    let top = cardPosition.top + 8;

    // Check if modal goes beyond right edge
    if (left + modalWidth > containerRect.right) {
      left = containerRect.right - modalWidth - 20; // 20px padding from edge
    }

    // Check if modal goes beyond left edge
    if (left < containerRect.left) {
      left = containerRect.left + 20; // 20px padding from edge
    }

    // Check if modal goes beyond bottom edge
    if (top + modalHeight > containerRect.bottom) {
      // Try to position above the card
      const topAbove = cardPosition.top - modalHeight - 8;
      if (topAbove >= containerRect.top) {
        top = topAbove;
      } else {
        // If can't fit above, position at bottom of container
        top = containerRect.bottom - modalHeight - 20;
      }
    }

    // Check if modal goes beyond top edge
    if (top < containerRect.top) {
      top = containerRect.top + 20; // 20px padding from edge
    }

    setCalculatedPosition({top, left});
  }, [open, cardPosition]);

  // Fine-tune position after modal is rendered with actual dimensions
  useEffect(() => {
    if (!open || !cardPosition || !calculatedPosition || !modalRef.current) {
      return;
    }

    const container = document.querySelector(
      ".h-full.w-full.max-w-7xl.mx-auto"
    ) as HTMLElement;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const modalRect = modalRef.current.getBoundingClientRect();

    // Only adjust if there's a significant difference
    if (modalRect.width === 0 || modalRect.height === 0) return;

    let needsUpdate = false;
    let left = calculatedPosition.left;
    let top = calculatedPosition.top;

    // Re-check with actual dimensions
    if (left + modalRect.width > containerRect.right) {
      left = containerRect.right - modalRect.width - 20;
      needsUpdate = true;
    }

    if (top + modalRect.height > containerRect.bottom) {
      const topAbove = cardPosition.top - modalRect.height - 8;
      if (topAbove >= containerRect.top) {
        top = topAbove;
      } else {
        top = containerRect.bottom - modalRect.height - 20;
      }
      needsUpdate = true;
    }

    if (needsUpdate) {
      setCalculatedPosition({top, left});
    }
  }, [open, cardPosition, calculatedPosition]);

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
        ref={modalRef}
        className={cn(
          "fixed z-[60] bg-black/50 w-full max-w-md rounded-3xl backdrop-blur-[50px] ease-out",
          open && calculatedPosition
            ? "opacity-100 translate-x-0 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        )}
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow: "0px 4px 6px -4px #0000001A, 0px 10px 15px -3px #0000001A",
          ...(calculatedPosition
            ? {
                top: `${calculatedPosition.top}px`,
                left: `${calculatedPosition.left}px`,
              }
            : cardPosition
            ? {
                // Hide modal until position is calculated
                top: `${cardPosition.top + 8}px`,
                left: `${cardPosition.left}px`,
                visibility: "hidden",
              }
            : {
                right: "65px",
                top: "38%",
                transform: "translateY(-50%)",
              }),
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="messages-modal-title"
      >
        {/* Messages List */}
        <div className="max-h-[60vh] overflow-y-auto pt-3">
          {isLoading ? (
            <div className="text-center py-8 text-slate-400">
              {t("common.loading")}
            </div>
          ) : summaries.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              {type === "messages" ? "No unread messages" : "No unread alerts"}
            </div>
          ) : (
            <div className="space-y-3">
              {summaries.map((summary, index) => {
                const avatarUrl = getFileUrl(summary.conversationAvatarUrl);
                const hasImageError = imageErrors.has(summary.conversationId);

                return (
                  <div
                    key={summary.conversationId}
                    className={cn(
                      "flex items-start gap-3 p-3 transition-colors cursor-pointer hover:bg-slate-800/50",
                      index !== summaries.length - 1 &&
                        "border-b-2 border-slate-600"
                    )}
                    onClick={() => {
                      const conversationId = summary.conversationId;
                      const conversationName = summary.conversationTitle;

                      // Set the conversation ID and mark that we want to open chat
                      setSelectedConversationId(conversationId);
                      setSelectedConversationName(conversationName);
                      openChatRef.current = conversationId;

                      onClose(); // Close the modal when opening chat
                    }}
                  >
                    {/* Avatar */}
                    {avatarUrl && !hasImageError ? (
                      <img
                        src={avatarUrl}
                        alt={summary.conversationTitle}
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                        onError={() => {
                          setImageErrors((prev) =>
                            new Set(prev).add(summary.conversationId)
                          );
                        }}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-600 flex-shrink-0 flex items-center justify-center">
                        <span className="text-white text-xs font-semibold">
                          {summary.conversationTitle.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 flex-col min-w-0 flex items-start justify-between gap-1">
                      {/* Left side: Name and message */}
                      <div className="flex-1 flex items-center justify-between w-full min-w-0">
                        <span className="text-sm font-semibold text-white truncate">
                          {summary.conversationTitle}
                        </span>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {/* Alert badge */}
                          {summary.unreadAlertCount > 0 && (
                            <div className="flex items-center text-xs font-bold text-yellow-500 bg-[#CA8A041A] px-2 py-1 rounded-lg gap-2">
                              <AlertTriangle className="w-4 h-4" />
                              {summary.unreadAlertCount}
                            </div>
                          )}
                          {/* Message badge */}
                          {summary.unreadMessageCount > 0 && (
                            <div className="flex items-center text-xs font-bold text-blue-400 bg-[#1B54FE1A] px-2 py-1 rounded-lg gap-2">
                              <MessageSquareText className="w-4 h-4" />
                              {summary.unreadMessageCount}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 w-full justify-between">
                        <p className="text-sm text-white truncate flex-1">
                          {summary.lastMessageContent}
                        </p>
                        <span className="text-sm font-semibold text-white flex-shrink-0">
                          {formatTimeAgo(summary.lastMessageAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <button
          onClick={onClose}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-b-3xl transition-colors"
        >
          {t("dashboard.kpiCards.unreadMessages.modal.showAll")}
        </button>
      </div>

      {/* Chat Overlay */}
      {selectedConversationId && (
        <ChatOverlay
          isOpen={chatHook.isChatOpen}
          onClose={() => {
            chatHook.setIsChatOpen(false);
            setSelectedConversationId(null);
            setSelectedConversationName(null);
            openChatRef.current = null;
          }}
          recipientName={selectedConversationName || ""}
          chatHook={chatHook}
          actionableAlerts={[]}
        />
      )}
    </>
  );
}
