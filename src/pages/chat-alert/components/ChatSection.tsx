import { useState, useMemo, useEffect, useRef } from "react";
import { AlertTriangle, MessageSquareText } from "lucide-react";
import { cn } from "../../../shared/utils/cn";
import { ChatMessageBubble } from "./ChatMessageBubble";
import { AlertCard } from "./AlertCard";
import { DateGroupLabel } from "./DateGroupLabel";
import { ActionableChipsBar } from "./ActionableChipsBar";
import { MessageInput } from "./MessageInput";
import { TypingIndicator } from "./TypingIndicator";
import type { Message, DateGroup, ChatMessage } from "../types/chat";

type FilterType = "all" | "chats" | "alerts";

interface ChatSectionProps {
  messages: Message[];
  actionableAlerts?: Array<{
    id: string;
    label: string;
    alertType: string;
  }>;
}

// Helper function to get current time in HH:mm format
const getCurrentTime = () => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

// Helper function to get date group
const getDateGroup = (): DateGroup => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // For simplicity, we'll use "today" for now
  // You can enhance this to check actual dates
  return "today";
};

// Helper function to check if a message is new (has Date.now() timestamp)
const isNewMessage = (messageId: string): boolean => {
  // New messages have IDs like "msg-1734567890123" (13 digits from Date.now())
  return /^msg-\d{13}$/.test(messageId);
};

// Helper function to get sort order for messages
const getMessageSortOrder = (message: Message): number => {
  // For new messages with Date.now() in ID (e.g., "msg-1734567890123")
  if (isNewMessage(message.id)) {
    const timestampMatch = message.id.match(/msg-(\d{13})/);
    if (timestampMatch) {
      // New messages should always come after initial messages
      // Add a large offset to ensure they're at the bottom
      return parseInt(timestampMatch[1], 10);
    }
  }

  // For initial messages, use a combination of dateGroup and timestamp
  // Parse HH:mm timestamp and convert to minutes since midnight
  const [hours, minutes] = message.timestamp.split(":").map(Number);
  const timestampMinutes = hours * 60 + minutes;

  // Extract numeric ID for tiebreaker
  const idMatch = message.id.match(/\d+/);
  const idNum = idMatch ? parseInt(idMatch[0], 10) : 0;

  // Create a sort order that considers dateGroup
  // Yesterday messages should have lower values than today messages
  let dateGroupOffset = 0;
  if (message.dateGroup === "yesterday") {
    dateGroupOffset = 0; // Yesterday comes first
  } else if (message.dateGroup === "today") {
    dateGroupOffset = 1000000; // Today comes after yesterday
  } else {
    dateGroupOffset = 2000000; // Other dates come last
  }

  // Convert timestamp to milliseconds and add offsets
  return dateGroupOffset + timestampMinutes * 60000 + idNum;
};

export function ChatSection({
  messages: initialMessages,
  actionableAlerts = [],
}: ChatSectionProps) {
  const [filter, setFilter] = useState<FilterType>("all");
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
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

  // Handle sending a message
  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    const now = Date.now();
    const newMessage: ChatMessage = {
      id: `msg-${now}`,
      type: "chat",
      text: text.trim(),
      timestamp: getCurrentTime(),
      dateGroup: getDateGroup(),
      isOutgoing: true,
    };

    // Append message to the end of the array (bottom of chat)
    setMessages((prev) => [...prev, newMessage]);

    // Show typing indicator immediately
    setIsTyping(true);

    // Clear any existing typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Simulate auto-reply after 1-2 seconds
    const delay = Math.random() * 1000 + 1000;
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);

      const autoReplies = [
        "Got it, thanks!",
        "I'll check on that right away.",
        "Understood, I'll keep you updated.",
        "Thanks for the update!",
        "I'll look into it.",
      ];
      const randomReply =
        autoReplies[Math.floor(Math.random() * autoReplies.length)];

      const replyNow = Date.now();
      const replyMessage: ChatMessage = {
        id: `msg-${replyNow}`,
        type: "chat",
        text: randomReply,
        timestamp: getCurrentTime(),
        dateGroup: getDateGroup(),
        isOutgoing: false,
      };

      // Append reply message to the end (after user's message)
      setMessages((prev) => [...prev, replyMessage]);
    }, delay);
  };

  // Handle chip click - send chip label as message
  const handleChipClick = (chipLabel: string) => {
    handleSendMessage(chipLabel);
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

    // Sort groups by date (yesterday first, then today, then others)
    // This ensures initial messages appear before new messages
    const sortedGroups: [DateGroup, Message[]][] = [];

    if (groups.yesterday) sortedGroups.push(["yesterday", groups.yesterday]);
    if (groups.today) sortedGroups.push(["today", groups.today]);

    // Add other date groups
    Object.entries(groups).forEach(([dateGroup, msgs]) => {
      if (dateGroup !== "today" && dateGroup !== "yesterday") {
        sortedGroups.push([dateGroup, msgs]);
      }
    });

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
        {/* Show typing indicator after all messages */}
        {isTyping && (
          <div className="space-y-4">
            <TypingIndicator />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Section: Chips and Input */}
      <div className="border-t border-slate-100 bg-white">
        {actionableAlerts.length > 0 && (
          <ActionableChipsBar
            chips={actionableAlerts}
            onChipClick={handleChipClick}
          />
        )}
        <MessageInput onSend={handleSendMessage} />
      </div>
    </div>
  );
}
