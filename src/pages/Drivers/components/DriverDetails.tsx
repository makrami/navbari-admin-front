import type { Driver } from "../types";
import {
  Phone as PhoneIcon,
  Users as UsersIcon,
  Truck as TruckIcon,
  Calendar as CalendarIcon,
  ScanBarcode,
  Weight,
  MessageSquareText,
  X,
  MessagesSquareIcon,
} from "lucide-react";
import { STATUS_TO_COLOR } from "../types";
import { formatDriverForEntityCard } from "../utils";
import { ENV } from "../../../lib/env";
import { useState, useMemo, useEffect } from "react";
import { ChatSection } from "../../chat-alert/components/ChatSection";
import {
  useChatConversations,
  useConversationMessages,
  useSendChatMessage,
  useSendChatAlert,
  useMarkConversationRead,
} from "../../../services/chat/hooks";
import { useChatSocket } from "../../../services/chat/socket";
import { useCurrentUser } from "../../../services/user/hooks";
import {
  CHAT_RECIPIENT_TYPE,
  CHAT_MESSAGE_TYPE,
  CHAT_ALERT_TYPE,
  type ChatAlertType,
  type MessageReadDto,
} from "../../../services/chat/chat.types";
import type {
  ActionableAlertChip,
  AlertType,
  Message,
} from "../../chat-alert/types/chat";
import dayjs from "dayjs";

type Props = {
  driver: Driver;
};

const ACTIONABLE_ALERTS: ActionableAlertChip[] = [
  { id: "1", label: "GPS Lost", alertType: "alert" },
  { id: "2", label: "Delay Expected", alertType: "warning" },
  { id: "3", label: "Route Cleared", alertType: "success" },
  { id: "4", label: "Documentation Pending", alertType: "info" },
];

function getFileUrl(filePath: string | null | undefined): string | undefined {
  if (!filePath) return undefined;
  if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
    return filePath;
  }
  const cleanPath = filePath.startsWith("/") ? filePath.slice(1) : filePath;
  return `${ENV.FILE_BASE_URL}/${cleanPath}`;
}

export function DriverDetails({ driver }: Props) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const colors = STATUS_TO_COLOR[driver.status];
  const driverCard = formatDriverForEntityCard(driver);
  const driverName = driver.user?.fullName || "Unknown Driver";
  const phone = driver.user?.phoneNumber || "N/A";

  const statusDotColor =
    driver.status === "approved"
      ? "bg-green-500"
      : driver.status === "pending"
      ? "bg-amber-500"
      : driver.status === "rejected"
      ? "bg-rose-500"
      : "bg-slate-500";

  const joinDate = driver.createdAt
    ? new Date(driver.createdAt).toLocaleDateString()
    : "N/A";

  // Fetch conversations for drivers
  const { data: conversations = [] } = useChatConversations("driver");
  const { data: currentUser } = useCurrentUser();

  // Find conversation for this driver
  const conversation = useMemo(() => {
    return conversations.find((conv) => conv.driverId === driver.id);
  }, [conversations, driver.id]);

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
    sendMessageMutation.mutate({
      content: payload.content,
      file: payload.file ?? undefined,
      recipientType: CHAT_RECIPIENT_TYPE.DRIVER,
      driverId: driver.id,
    });
  };

  const handleAlertChipClick = (chip: ActionableAlertChip) => {
    sendAlertMutation.mutate({
      alertType: chip.alertType as ChatAlertType,
      content: chip.label,
      recipientType: CHAT_RECIPIENT_TYPE.DRIVER,
      driverId: driver.id,
    });
  };

  return (
    <section className="bg-white rounded-2xl p-4 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        {/* Left: Avatar + Info */}
        <div className="flex items-center gap-4 min-w-0">
          <div className="h-24 w-24 rounded-full bg-slate-50 overflow-hidden grid place-items-center">
            {driver.avatarUrl ? (
              <img
                src={getFileUrl(driver.avatarUrl)}
                alt="avatar"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-10 w-10 rounded bg-slate-200" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-slate-900 font-bold text-xl leading-none truncate">
                {driverName}
              </p>
              <button
                type="button"
                onClick={() => setIsChatOpen(true)}
                className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
                aria-label="Open chat"
              >
                <MessagesSquareIcon className="size-4 text-blue-600" />
              </button>
            </div>

            <div className="mt-2 flex items-center gap-2 text-xs text-slate-900">
              {driver.company.logoUrl && (
                <img
                  src={getFileUrl(driver.company.logoUrl)}
                  alt="Company Logo"
                  className=" h-4 w-7 rounded object-cover"
                />
              )}
              <span className="flex items-center gap-1 font-bold">
                {driver.company.name}
              </span>
            </div>

            <div className="mt-2 flex items-center gap-6 text-xs text-slate-900">
              <div className="flex items-center gap-2">
                <PhoneIcon className="size-3.5 text-slate-400" />
                <span> {phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarIcon className="size-3.5 text-slate-400" />
                <span>Register: {joinDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Status & Stats */}
        <div className="flex flex-col gap-2 items-center justify-center min-w-[8.75rem]">
          <div
            className={`inline-flex items-center gap-2 rounded-lg px-2 py-2 w-full justify-center ${colors.pill}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${statusDotColor}`} />
            <span className={`text-xs ${colors.pillText}`}>
              {driver.status.charAt(0).toUpperCase() + driver.status.slice(1)}
            </span>
          </div>
          <div className="inline-flex items-center gap-2 rounded-lg px-3 py-2 w-full justify-center bg-blue-600/10">
            <UsersIcon className="size-4 text-blue-600" />
            <span className="text-xs font-bold text-blue-600">
              {driver.totalDeliveries || 0}
            </span>
            <span className="text-xs text-blue-600">Shipments</span>
          </div>
          <div className="inline-flex items-center gap-2 rounded-lg px-3 py-2 w-full justify-center bg-blue-600/10">
            <TruckIcon className="size-4 text-blue-600" />
            <span className="text-xs font-bold text-blue-600">
              {driverCard.numActiveVehicles}
            </span>
            <span className="text-xs text-blue-600">Vehicles</span>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100" />

      {/* Bottom contacts */}
      <div className="flex items-center gap-4 text-xs text-slate-900">
        <div className="flex items-center gap-6">
          <div className="flex flex-col gap-1 min-w-[7.5rem]">
            <p className="text-slate-400 flex items-center gap-2 font-semibold">
              <TruckIcon className="size-4  text-slate-400" />
              VEHICLE
            </p>

            <p>
              {driver.vehicleType
                ? driver.vehicleType.charAt(0).toUpperCase() +
                  driver.vehicleType.slice(1)
                : ""}
            </p>
          </div>

          <div className="h-10 border-l border-slate-200" />

          <div className="flex flex-col gap-1 min-w-[7.5rem]">
            <p className="text-slate-400 flex items-center gap-2 font-semibold">
              <ScanBarcode className="size-4  text-slate-400" />
              PLATE NUMBER
            </p>

            <p>{driver.vehiclePlate}</p>
          </div>

          <div className="h-10 border-l border-slate-200" />

          <div className="flex flex-col gap-1 min-w-[7.5rem]">
            <p className="text-slate-400 flex items-center gap-2 font-semibold">
              <Weight className="size-4  text-slate-400" />
              CAPACITY
            </p>

            <p>{(driver.vehicleCapacity / 1000).toFixed(2)} Tons</p>
          </div>
        </div>
      </div>

      {/* Chat Overlay */}
      {isChatOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300"
            onClick={() => setIsChatOpen(false)}
            aria-hidden="true"
          />

          {/* Floating Chat Panel */}
          <div
            className="fixed bottom-4 right-4 w-full max-w-md h-[600px] bg-white rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby="chat-title"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <h2
                id="chat-title"
                className="text-lg font-semibold text-slate-900"
              >
                Chat with {driverName}
              </h2>
              <button
                onClick={() => setIsChatOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
                aria-label="Close chat"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Chat Section */}
            <div className="flex-1 min-h-0">
              <ChatSection
                key={conversation?.id || driver.id}
                messages={messages}
                actionableAlerts={ACTIONABLE_ALERTS}
                onSendMessage={handleSendMessage}
                onAlertChipClick={handleAlertChipClick}
                isSendingMessage={
                  sendMessageMutation.isPending || sendAlertMutation.isPending
                }
                isLoading={
                  conversation
                    ? messagesLoading && messages.length === 0
                    : false
                }
                canLoadMore={Boolean(hasNextPage)}
                onLoadMore={() => fetchNextPage()}
                isFetchingMore={isFetchingNextPage}
                isTyping={isTyping}
                emptyState={
                  !conversation && messages.length === 0
                    ? {
                        icon: (
                          <div className="relative inline-block mb-4">
                            <MessageSquareText className="size-16 text-slate-300" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-12 h-0.5 bg-slate-400 rotate-45" />
                            </div>
                          </div>
                        ),
                        text: `Start Messaging to ${driverName}`,
                      }
                    : undefined
                }
              />
            </div>
          </div>
        </>
      )}
    </section>
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

export default DriverDetails;
