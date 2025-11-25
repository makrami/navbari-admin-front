import { useState, useMemo, useEffect, useRef } from "react";
import { AlertTriangle, MessageSquareText, Loader2 } from "lucide-react";
import { cn } from "../../../shared/utils/cn";
import { ChatMessageBubble } from "./ChatMessageBubble";
import { AlertCard } from "./AlertCard";
import { DateGroupLabel } from "./DateGroupLabel";
import { ActionableChipsBar } from "./ActionableChipsBar";
import { MessageInput } from "./MessageInput";
import { TypingIndicator } from "./TypingIndicator";
import type { Message, DateGroup, ActionableAlertChip } from "../types/chat";

type FilterType = "all" | "chats" | "alerts";

interface ChatSectionProps {
  messages: Message[];
  actionableAlerts?: ActionableAlertChip[];
  onSendMessage?: (payload: { content: string; file?: File | null }) => void;
  onAlertChipClick?: (chip: ActionableAlertChip) => void;
  isSendingMessage?: boolean;
  isLoading?: boolean;
  canLoadMore?: boolean;
  onLoadMore?: () => void;
  isFetchingMore?: boolean;
  isTyping?: boolean;
  emptyState?: {
    icon: React.ReactNode;
    text: string;
  };
}

// Helper function to check if a message is new (has Date.now() timestamp)
const isNewMessage = (messageId: string): boolean => {
  // New messages have IDs like "msg-1734567890123" (13 digits from Date.now())
  return /^msg-\d{13}$/.test(messageId);
};

// Helper function to get sort order for messages
const getMessageSortOrder = (message: Message): number => {
  // Use createdAt if available (preferred)
  if (message.createdAt) {
    return new Date(message.createdAt).getTime();
  }

  // Fallback: For new messages with Date.now() in ID (e.g., "msg-1734567890123")
  if (isNewMessage(message.id)) {
    const timestampMatch = message.id.match(/msg-(\d{13})/);
    if (timestampMatch) {
      return parseInt(timestampMatch[1], 10);
    }
  }

  // Last resort: Use timestamp and ID as fallback (shouldn't happen with real data)
  const [hours, minutes] = message.timestamp.split(":").map(Number);
  const timestampMinutes = hours * 60 + minutes;
  const idMatch = message.id.match(/\d+/);
  const idNum = idMatch ? parseInt(idMatch[0], 10) : 0;
  return timestampMinutes * 60000 + idNum;
};

export function ChatSection({
  messages,
  actionableAlerts = [],
  onSendMessage,
  onAlertChipClick,
  isSendingMessage = false,
  isLoading = false,
  canLoadMore = false,
  onLoadMore,
  isFetchingMore = false,
  isTyping = false,
  emptyState,
}: ChatSectionProps) {
  const [filter, setFilter] = useState<FilterType>("all");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Auto-scroll to bottom when messages change or typing state changes
  useEffect(() => {
    // Clear any existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Use setTimeout to ensure DOM has updated
    scrollTimeoutRef.current = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);

    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [messages, isTyping]);

  const handleChipClick = (chip: ActionableAlertChip) => {
    onAlertChipClick?.(chip);
  };

  // Filter messages based on selected tab
  const filteredMessages = useMemo(() => {
    if (filter === "all") return messages;
    if (filter === "chats") return messages.filter((m) => m.type === "chat");
    return messages.filter((m) => m.type === "alert");
  }, [messages, filter]);

  // Sort all messages chronologically together
  const groupedMessages = useMemo(() => {
    // Sort all messages chronologically by timestamp and ID
    const sortedMessages = [...filteredMessages].sort((a, b) => {
      const orderA = getMessageSortOrder(a);
      const orderB = getMessageSortOrder(b);
      return orderA - orderB; // Ascending order (oldest first)
    });

    // Then group by date while maintaining chronological order
    const groups: Record<DateGroup, Message[]> = {};

    sortedMessages.forEach((message) => {
      const group = message.dateGroup;
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(message);
    });

    // Sort groups by actual date (oldest first)
    const sortedGroups: [DateGroup, Message[]][] = Object.entries(groups)
      .map(([dateGroup, msgs]) => {
        // Get the earliest message timestamp in this group to determine group order
        const timestamps = msgs
          .map((msg) =>
            msg.createdAt ? new Date(msg.createdAt).getTime() : null
          )
          .filter((ts): ts is number => ts !== null && ts > 0)
          .sort((a, b) => a - b);
        const earliestTimestamp = timestamps[0] || Number.MAX_SAFE_INTEGER; // Groups without timestamps go to end
        return { dateGroup, msgs, earliestTimestamp };
      })
      .sort((a, b) => a.earliestTimestamp - b.earliestTimestamp) // Oldest groups first
      .map(
        ({ dateGroup, msgs }) => [dateGroup, msgs] as [DateGroup, Message[]]
      );

    return sortedGroups;
  }, [filteredMessages]);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Filter Tabs */}
      <div className="flex gap-2 max-w-84 p-4 border-b border-slate-100">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={cn(
            "flex-1 flex items-center justify-center px-4 py-1 rounded-3xl font-medium text-sm transition-colors",
            filter === "all"
              ? "border-2 bg-[#1B54FE1A] border-[#1B54FE] text-[#1B54FE] "
              : "bg-slate-50 text-slate-900 hover:bg-slate-100"
          )}
        >
          All
        </button>
        <button
          type="button"
          onClick={() => setFilter("chats")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 px-4 py-1 rounded-3xl font-medium text-sm transition-colors",
            filter === "chats"
              ? "border-2 bg-[#1B54FE1A] border-[#1B54FE] text-[#1B54FE] "
              : "bg-slate-50 text-slate-900 hover:bg-slate-100"
          )}
        >
          <MessageSquareText className="size-4" />
          Chats
        </button>
        <button
          type="button"
          onClick={() => setFilter("alerts")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 px-4 py-1 rounded-3xl font-medium text-sm transition-colors",
            filter === "alerts"
              ? "border-2 bg-[#1B54FE1A] border-[#1B54FE] text-[#1B54FE] "
              : "bg-slate-50 text-slate-900 hover:bg-slate-100"
          )}
        >
          <AlertTriangle className="size-4" />
          Alerts
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-6">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="size-5 animate-spin text-slate-400" />
          </div>
        ) : emptyState && messages.length === 0 && !canLoadMore ? (
          <div className="flex-1 flex items-center justify-center h-full">
            <div className="text-center">
              {emptyState.icon}
              <p className="text-slate-500 font-medium text-sm">
                {emptyState.text}
              </p>
            </div>
          </div>
        ) : (
          <>
            {canLoadMore && (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={onLoadMore}
                  disabled={isFetchingMore}
                  className="text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors disabled:opacity-50"
                >
                  {isFetchingMore ? "Loading..." : "Load older messages"}
                </button>
              </div>
            )}
            {groupedMessages.map(([dateGroup, groupMessages]) => (
              <div key={dateGroup} className="space-y-4">
                <DateGroupLabel dateGroup={dateGroup} />

                <div className="space-y-4">
                  {groupMessages.map((message) => {
                    if (message.type === "chat") {
                      return (
                        <ChatMessageBubble key={message.id} message={message} />
                      );
                    }
                    return <AlertCard key={message.id} message={message} />;
                  })}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="space-y-4">
                <TypingIndicator />
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Bottom Section: Chips and Input */}
      <div className="border-t border-slate-100 bg-white">
        {actionableAlerts.length > 0 && (
          <ActionableChipsBar
            chips={actionableAlerts}
            onChipClick={handleChipClick}
          />
        )}
        <MessageInput onSend={onSendMessage} isSending={isSendingMessage} />
      </div>
    </div>
  );
}
