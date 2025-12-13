import {useState, useMemo, useEffect, useRef} from "react";
import dayjs from "dayjs";
import {
  useChatConversation,
  useConversationMessages,
  useSendChatMessage,
  useSendChatAlert,
  useMarkConversationRead,
} from "../../services/chat/hooks";
import {useChatSocket} from "../../services/chat/socket";
import {useCurrentUser} from "../../services/user/hooks";
import {
  CHAT_MESSAGE_TYPE,
  CHAT_ALERT_TYPE,
  type ChatAlertType,
  type MessageReadDto,
  type ConversationReadDto,
} from "../../services/chat/chat.types";
import type {
  ActionableAlertChip,
  AlertType,
  Message,
} from "../../pages/chat-alert/types/chat";
import {ENV} from "../../lib/env";

export interface UseChatWithConversationOptions {
  conversationId: string;
  recipientName: string; // For display purposes
}

export interface UseChatWithConversationReturn {
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean) => void;
  isTyping: boolean;
  conversation: ConversationReadDto | undefined;
  messages: Message[];
  messagesLoading: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  sendMessageMutation: ReturnType<typeof useSendChatMessage>;
  sendAlertMutation: ReturnType<typeof useSendChatAlert>;
  handleSendMessage: (payload: {content: string; file?: File | null}) => void;
  handleAlertChipClick: (chip: ActionableAlertChip) => void;
  fetchNextPage: () => void;
  canLoadMore: boolean;
  isEmpty: boolean;
}

export function useChatWithConversation({
  conversationId,
}: UseChatWithConversationOptions): UseChatWithConversationReturn {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const {data: currentUser} = useCurrentUser();

  // Fetch conversation by ID
  const {data: conversation} = useChatConversation(conversationId);

  // Fetch messages if conversation exists
  const {
    data: messagesPages,
    isLoading: messagesLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useConversationMessages(conversationId);

  const sendMessageMutation = useSendChatMessage();
  const sendAlertMutation = useSendChatAlert();
  const markConversationRead = useMarkConversationRead();
  const lastMarkedReadRef = useRef<{
    conversationId: string;
    unreadAlertCount: number;
    unreadMessageCount: number;
  } | null>(null);

  // Use socket for real-time updates
  useChatSocket(conversationId, setIsTyping);

  // Auto-hide typing indicator after 5 seconds
  useEffect(() => {
    if (!isTyping) return;
    const timeout = setTimeout(() => {
      setIsTyping(false);
    }, 5000);
    return () => clearTimeout(timeout);
  }, [isTyping]);

  // Mark conversation as read when opened
  useEffect(() => {
    if (!isChatOpen || !conversation || markConversationRead.isPending) {
      return;
    }

    const hasUnreadMessages =
      conversation.unreadAlertCount > 0 || conversation.unreadMessageCount > 0;

    // Check if we've already marked this conversation as read with these exact counts
    const alreadyMarked =
      lastMarkedReadRef.current?.conversationId === conversation.id &&
      lastMarkedReadRef.current?.unreadAlertCount ===
        conversation.unreadAlertCount &&
      lastMarkedReadRef.current?.unreadMessageCount ===
        conversation.unreadMessageCount;

    if (hasUnreadMessages && !alreadyMarked) {
      markConversationRead.mutate(conversation.id, {
        onSuccess: () => {
          // Update ref to track that we've marked this conversation as read
          lastMarkedReadRef.current = {
            conversationId: conversation.id,
            unreadAlertCount: conversation.unreadAlertCount,
            unreadMessageCount: conversation.unreadMessageCount,
          };
        },
      });
    } else if (!hasUnreadMessages) {
      // Reset ref when there are no unread messages
      lastMarkedReadRef.current = null;
    }
  }, [
    isChatOpen,
    conversation?.id,
    conversation?.unreadAlertCount,
    conversation?.unreadMessageCount,
    markConversationRead,
  ]);

  // Map messages to UI format
  const messages = useMemo<Message[]>(() => {
    if (!conversation) return [];
    const pages = messagesPages?.pages ?? [];
    const flattened = pages.flat();
    const sorted = flattened.sort((a, b) =>
      dayjs(a.createdAt).diff(dayjs(b.createdAt))
    );
    return sorted.map((message) =>
      mapMessageDtoToUi(message, currentUser?.id ?? "")
    );
  }, [messagesPages, currentUser?.id, conversation]);

  const handleSendMessage = (payload: {
    content: string;
    file?: File | null;
  }) => {
    if (!payload.content && !payload.file) return;
    if (!conversation) return;

    const basePayload = {
      content: payload.content,
      file: payload.file ?? undefined,
      recipientType: conversation.recipientType,
      conversationId: conversation.id,
      senderId: currentUser?.id,
    };

    if (
      conversation.recipientType === "driver" &&
      conversation.driverId
    ) {
      sendMessageMutation.mutate({
        ...basePayload,
        driverId: conversation.driverId,
      });
    } else if (
      conversation.recipientType === "company" &&
      conversation.companyId
    ) {
      sendMessageMutation.mutate({
        ...basePayload,
        companyId: conversation.companyId,
      });
    }
  };

  const handleAlertChipClick = (chip: ActionableAlertChip) => {
    if (!conversation) return;

    const basePayload = {
      alertType: chip.alertType as ChatAlertType,
      content: chip.label,
      recipientType: conversation.recipientType,
      conversationId: conversation.id,
      senderId: currentUser?.id,
    };

    if (
      conversation.recipientType === "driver" &&
      conversation.driverId
    ) {
      sendAlertMutation.mutate({
        ...basePayload,
        driverId: conversation.driverId,
      });
    } else if (
      conversation.recipientType === "company" &&
      conversation.companyId
    ) {
      sendAlertMutation.mutate({
        ...basePayload,
        companyId: conversation.companyId,
      });
    }
  };

  return {
    isChatOpen,
    setIsChatOpen,
    isTyping,
    conversation,
    messages,
    messagesLoading,
    hasNextPage: Boolean(hasNextPage),
    isFetchingNextPage,
    sendMessageMutation,
    sendAlertMutation,
    handleSendMessage,
    handleAlertChipClick,
    fetchNextPage,
    canLoadMore: Boolean(hasNextPage),
    isEmpty: !conversation && messages.length === 0,
  };
}

function mapMessageDtoToUi(
  message: MessageReadDto,
  currentUserId: string
): Message {
  const date = dayjs(message.createdAt);
  const today = dayjs();
  const dateGroup = date.isSame(today, "day")
    ? "today"
    : date.isSame(today.subtract(1, "day"), "day")
    ? "yesterday"
    : date.format("DD MMM YYYY");

  const fileUrl = message.filePath
    ? resolveFileUrl(message.filePath)
    : undefined;

  if (message.messageType === CHAT_MESSAGE_TYPE.ALERT) {
    const alertType = (message.alertType ??
      CHAT_ALERT_TYPE.INFO) as ChatAlertType;
    const alertTitle = message.alertType
      ? `Alert: ${alertType.toUpperCase()}`
      : "Alert";
    return {
      id: message.id,
      type: "alert",
      alertType: alertType as AlertType,
      title: alertTitle,
      description: message.content || undefined,
      timestamp: date.format("HH:mm"),
      dateGroup,
      createdAt: message.createdAt,
      fileUrl,
      fileName: message.fileName || undefined,
    };
  }

  return {
    id: message.id,
    type: "chat",
    text: message.content || undefined,
    timestamp: date.format("HH:mm"),
    dateGroup,
    isOutgoing: message.senderId === currentUserId,
    createdAt: message.createdAt,
    fileUrl,
    fileName: message.fileName || undefined,
    fileMimeType: message.fileMimeType || undefined,
  };
}

function resolveFileUrl(filePath: string) {
  if (!filePath) return undefined;
  if (filePath.startsWith("http")) {
    return filePath;
  }
  return `${ENV.FILE_BASE_URL}/${filePath.replace(/^\/+/, "")}`;
}

