import {useState, useMemo, useEffect} from "react";
import dayjs from "dayjs";
import {
  useChatConversations,
  useConversationMessages,
  useSendChatMessage,
  useSendChatAlert,
  useMarkConversationRead,
} from "../../services/chat/hooks";
import {useChatSocket} from "../../services/chat/socket";
import {useCurrentUser} from "../../services/user/hooks";
import {
  CHAT_RECIPIENT_TYPE,
  CHAT_MESSAGE_TYPE,
  CHAT_ALERT_TYPE,
  type ChatAlertType,
  type MessageReadDto,
  type ChatRecipientType,
  type ConversationReadDto,
} from "../../services/chat/chat.types";
import type {
  ActionableAlertChip,
  AlertType,
  Message,
} from "../../pages/chat-alert/types/chat";
import {ENV} from "../../lib/env";

export interface UseChatWithRecipientOptions {
  recipientType: ChatRecipientType;
  driverId?: string | null;
  companyId?: string | null;
  recipientName: string; // For display purposes
}

export interface UseChatWithRecipientReturn {
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

export function useChatWithRecipient({
  recipientType,
  driverId,
  companyId,
}: UseChatWithRecipientOptions): UseChatWithRecipientReturn {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const {data: currentUser} = useCurrentUser();

  // Fetch conversations based on recipient type
  const {data: conversations = []} = useChatConversations(recipientType);

  // Find conversation for this recipient
  const conversation = useMemo(() => {
    if (recipientType === CHAT_RECIPIENT_TYPE.DRIVER && driverId) {
      return conversations.find((conv) => conv.driverId === driverId);
    }
    if (recipientType === CHAT_RECIPIENT_TYPE.COMPANY && companyId) {
      return conversations.find((conv) => conv.companyId === companyId);
    }
    return undefined;
  }, [conversations, driverId, companyId, recipientType]);

  // Fetch messages if conversation exists
  const {
    data: messagesPages,
    isLoading: messagesLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useConversationMessages(conversation?.id);

  const sendMessageMutation = useSendChatMessage();
  const sendAlertMutation = useSendChatAlert();
  const markConversationRead = useMarkConversationRead();

  // Use socket for real-time updates
  useChatSocket(conversation?.id, setIsTyping);

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
    if (
      isChatOpen &&
      conversation &&
      (conversation.unreadAlertCount > 0 ||
        conversation.unreadMessageCount > 0) &&
      !markConversationRead.isPending
    ) {
      markConversationRead.mutate(conversation.id);
    }
  }, [isChatOpen, conversation, markConversationRead]);

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

    const basePayload = {
      content: payload.content,
      file: payload.file ?? undefined,
      recipientType,
    };

    if (recipientType === CHAT_RECIPIENT_TYPE.DRIVER && driverId) {
      sendMessageMutation.mutate({
        ...basePayload,
        driverId,
      });
    } else if (recipientType === CHAT_RECIPIENT_TYPE.COMPANY && companyId) {
      sendMessageMutation.mutate({
        ...basePayload,
        companyId,
      });
    }
  };

  const handleAlertChipClick = (chip: ActionableAlertChip) => {
    const basePayload = {
      alertType: chip.alertType as ChatAlertType,
      content: chip.label,
      recipientType,
    };

    if (recipientType === CHAT_RECIPIENT_TYPE.DRIVER && driverId) {
      sendAlertMutation.mutate({
        ...basePayload,
        driverId,
      });
    } else if (recipientType === CHAT_RECIPIENT_TYPE.COMPANY && companyId) {
      sendAlertMutation.mutate({
        ...basePayload,
        companyId,
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
