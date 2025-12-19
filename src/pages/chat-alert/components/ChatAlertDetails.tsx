import {useEffect, useMemo, useState, useRef} from "react";
import dayjs from "dayjs";
import "dayjs/locale/en";
import "dayjs/locale/fa";
import "dayjs/locale/ar";
import "dayjs/locale/ru";
import "dayjs/locale/zh";
import {useTranslation} from "react-i18next";
import type {ChatAlert} from "../data";
import {ChatSection} from "./ChatSection";
import {ShipmentHeader} from "./ShipmentHeader";
import {
  useConversationMessages,
  useMarkConversationRead,
  useSendChatAlert,
  useSendChatMessage,
} from "../../../services/chat/hooks";
import {useChatSocket} from "../../../services/chat/socket";
import {
  CHAT_ALERT_TYPE,
  CHAT_MESSAGE_TYPE,
  CHAT_RECIPIENT_TYPE,
  type ChatAlertType,
  type ConversationReadDto,
  type MessageReadDto,
} from "../../../services/chat/chat.types";
import type {ActionableAlertChip, AlertType, Message} from "../types/chat";
import {ENV} from "../../../lib/env";
import {useDriverDetails} from "../../../services/driver/hooks";
import {useCompanyDetails} from "../../../services/company/hooks";
import {DriverDetails} from "../../Drivers/components/DriverDetails";
import {CompanyDetails} from "../../LocalCompanies/components/CompanyDetails";
import {DEFAULT_ACTIONABLE_ALERTS} from "../../../shared/constants/actionableAlerts";

type ChatAlertDetailsProps = {
  chatAlert: ChatAlert;
  conversation: ConversationReadDto;
  currentUserId?: string;
  onClose?: () => void;
  currentStateIndex?: number; // 0-6, where 0 is the first state and 6 is the last (optional, will be calculated from driver data if not provided)
};

const LOCALE_MAP: Record<string, string> = {
  en: "en",
  fa: "fa",
  ar: "ar",
  ru: "ru",
  zh: "zh",
};

export function ChatAlertDetails({
  chatAlert,
  conversation,
  currentUserId,
  onClose,
}: ChatAlertDetailsProps) {
  const {i18n} = useTranslation();
  const [isTyping, setIsTyping] = useState(false);

  // Set dayjs locale based on current i18n language
  const currentLocale = LOCALE_MAP[i18n.language] || "en";
  dayjs.locale(currentLocale);
  const {
    data: messagesPages,
    isLoading: messagesLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useConversationMessages(conversation.id);

  const sendMessageMutation = useSendChatMessage();
  const sendAlertMutation = useSendChatAlert();
  const markConversationRead = useMarkConversationRead();
  const lastMarkedReadRef = useRef<{
    conversationId: string;
    unreadAlertCount: number;
    unreadMessageCount: number;
  } | null>(null);

  // Fetch driver or company data based on recipient type
  const selectedDriver = useDriverDetails(conversation.driverId ?? null);
  const selectedCompany = useCompanyDetails(conversation.companyId ?? null);
  // Listen to typing events via socket
  useChatSocket(conversation.id, setIsTyping);

  // Auto-hide typing indicator after 5 seconds if no new message arrives
  useEffect(() => {
    if (!isTyping) return;
    const timeout = setTimeout(() => {
      setIsTyping(false);
    }, 5000);
    return () => clearTimeout(timeout);
  }, [isTyping]);

  useEffect(() => {
    if (markConversationRead.isPending) {
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
    conversation.id,
    conversation.unreadAlertCount,
    conversation.unreadMessageCount,
    markConversationRead,
  ]);

  const messages = useMemo<Message[]>(() => {
    // Ensure locale is set before processing messages
    dayjs.locale(currentLocale);

    const pages = messagesPages?.pages ?? [];
    const flattened = pages.flat();
    const sorted = flattened.sort((a, b) =>
      dayjs(a.createdAt).diff(dayjs(b.createdAt))
    );
    const mapped = sorted.map((message) =>
      mapMessageDtoToUi(message, currentUserId ?? "")
    );

    return mapped;
  }, [messagesPages, currentUserId, conversation.id, currentLocale]);

  const handleSendMessage = (payload: {
    content: string;
    file?: File | null;
  }) => {
    if (!payload.content && !payload.file) return;
    sendMessageMutation.mutate({
      content: payload.content,
      file: payload.file ?? undefined,
      recipientType: conversation.recipientType,
      driverId: conversation.driverId ?? undefined,
      companyId: conversation.companyId ?? undefined,
      conversationId: conversation.id, // Pass conversationId for optimistic updates
      senderId: currentUserId, // Pass senderId for optimistic updates
    });
  };

  const handleAlertChipClick = (chip: ActionableAlertChip) => {
    sendAlertMutation.mutate({
      alertType: chip.alertType as ChatAlertType,
      content: chip.label,
      recipientType: conversation.recipientType,
      driverId: conversation.driverId ?? undefined,
      companyId: conversation.companyId ?? undefined,
      conversationId: conversation.id, // Pass conversationId for optimistic updates
      senderId: currentUserId, // Pass senderId for optimistic updates
    });
  };

  return (
    <div className="flex rounded-xl flex-col gap-6">
      {/* Header Section */}
      <div className="bg-white rounded-xl p-4 space-y-4">
        <ShipmentHeader
          shipmentNumber={chatAlert.shipmentNumber || ""}
          shipmentId={chatAlert.shipmentId || ""}
          onClose={onClose}
        />

        {/* Show Driver or Company Details based on recipient type */}
        {conversation.recipientType === CHAT_RECIPIENT_TYPE.DRIVER &&
          selectedDriver.data && <DriverDetails driver={selectedDriver.data} />}
        {conversation.recipientType === CHAT_RECIPIENT_TYPE.COMPANY &&
          selectedCompany.data && (
            <CompanyDetails company={selectedCompany.data} />
          )}
      </div>

      {/* Chat Section */}
      <div className="bg-white rounded-xl overflow-hidden h-[600px]  flex flex-col">
        <ChatSection
          key={chatAlert.driverId || chatAlert.companyId || chatAlert.id}
          messages={messages}
          actionableAlerts={DEFAULT_ACTIONABLE_ALERTS}
          onSendMessage={handleSendMessage}
          onAlertChipClick={handleAlertChipClick}
          isSendingMessage={
            sendMessageMutation.isPending || sendAlertMutation.isPending
          }
          isLoading={messagesLoading && messages.length === 0}
          canLoadMore={Boolean(hasNextPage)}
          onLoadMore={() => fetchNextPage()}
          isFetchingMore={isFetchingNextPage}
          isTyping={isTyping}
        />
      </div>
    </div>
  );
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
      isOutgoing: message.senderId === currentUserId, // Determine if alert is outgoing
      createdAt: message.createdAt,
      fileUrl,
      fileName: message.fileName || undefined,
      status: (
        message as MessageReadDto & {_status?: "sending" | "failed" | "sent"}
      )._status, // Get status from temporary message
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
    status: (
      message as MessageReadDto & {_status?: "sending" | "failed" | "sent"}
    )._status, // Get status from temporary message
  };
}

function resolveFileUrl(filePath: string) {
  if (!filePath) return undefined;
  if (filePath.startsWith("http")) {
    return filePath;
  }
  return `${ENV.FILE_BASE_URL}/${filePath.replace(/^\/+/, "")}`;
}
