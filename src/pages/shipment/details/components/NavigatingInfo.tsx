import type { PropsWithChildren } from "react";
import { useEffect, useRef, useState, useMemo } from "react";
import { cn } from "../../../../shared/utils/cn";
import {
  MapPinIcon,
  MessagesSquareIcon,
  CarIcon,
  Building2Icon,
  WeightIcon,
  LocateFixedIcon,
  PlusIcon,
  MinusIcon,
  PlaneIcon,
  UserRoundIcon,
  BellIcon,
  XIcon,
  Check,
  Paperclip,
  ListCheck,
  MessageSquareText,
  X,
} from "lucide-react";
import { type MapRef } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { MAPBOX_TOKEN } from "../../../dashboard/constants";
import type { Segment } from "../../../../shared/types/segmentData";
import { ChatSection } from "../../../chat-alert/components/ChatSection";
import {
  useChatConversations,
  useConversationMessages,
  useSendChatMessage,
  useSendChatAlert,
  useMarkConversationRead,
} from "../../../../services/chat/hooks";
import { useChatSocket } from "../../../../services/chat/socket";
import { useCurrentUser } from "../../../../services/user/hooks";
import {
  CHAT_RECIPIENT_TYPE,
  CHAT_MESSAGE_TYPE,
  CHAT_ALERT_TYPE,
  type ChatAlertType,
  type MessageReadDto,
} from "../../../../services/chat/chat.types";
import type {
  ActionableAlertChip,
  AlertType,
  Message,
} from "../../../chat-alert/types/chat";
import dayjs from "dayjs";
import { ENV } from "../../../../lib/env";

type NavigatingInfoProps = PropsWithChildren<{
  segments: Segment[];
  className?: string;
  title: string;
  shipmentId: string;
  driverName: string;
  driverPhoto?: string; // Optional - if not provided, show user icon
  vehicle: string;
  weight: string;
  localCompany: string;
  destination: string;
  lastActivity: string;
  lastActivityTime: string;
  onClose?: () => void;
}>;

// Figma snapshot image URLs (used as static assets to match design)

import avatarImg from "../../../../assets/images/avatar.png";
import { getFileUrl } from "../../../LocalCompanies/utils";
import CargoMap from "../../../../components/CargoMap";
import { getCountryCode } from "../../../../shared/utils/countryCode";
import ReactCountryFlag from "react-country-flag";

const ACTIONABLE_ALERTS: ActionableAlertChip[] = [
  { id: "1", label: "GPS Lost", alertType: "alert" },
  { id: "2", label: "Delay Expected", alertType: "warning" },
  { id: "3", label: "Route Cleared", alertType: "success" },
  { id: "4", label: "Documentation Pending", alertType: "info" },
];

export function NavigatingInfo({
  segments,
  className,
  title,
  shipmentId,
  driverName,
  driverPhoto,
  vehicle,
  weight,
  localCompany,
  destination,
  lastActivity,
  lastActivityTime,
  onClose,
}: NavigatingInfoProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const notifRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapRef | null>(null);

  // Find first segment with driverId
  const segmentWithDriver = useMemo(() => {
    return segments.find((segment) => segment.driverId);
  }, [segments]);

  const driverId = segmentWithDriver?.driverId || null;

  // Fetch conversations for drivers
  const { data: conversations = [] } = useChatConversations("driver");
  const { data: currentUser } = useCurrentUser();

  // Find conversation for this driver
  const conversation = useMemo(() => {
    if (!driverId) return null;
    return conversations.find((conv) => conv.driverId === driverId);
  }, [conversations, driverId]);

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
    if (!driverId) return;
    sendMessageMutation.mutate({
      content: payload.content,
      file: payload.file ?? undefined,
      recipientType: CHAT_RECIPIENT_TYPE.DRIVER,
      driverId: driverId,
    });
  };

  const handleAlertChipClick = (chip: ActionableAlertChip) => {
    if (!driverId) return;
    sendAlertMutation.mutate({
      alertType: chip.alertType as ChatAlertType,
      content: chip.label,
      recipientType: CHAT_RECIPIENT_TYPE.DRIVER,
      driverId: driverId,
    });
  };

  // Default map viewport (can be updated with actual coordinates if available)
  const [viewport] = useState({
    longitude: 116.4074, // Beijing, China (default)
    latitude: 39.9042,
    zoom: 10,
  });
  // Show details if we have a shipment selected (title and shipmentId are required props)
  // This ensures the details section always shows when a shipment is selected
  const hasDetails = Boolean(title && shipmentId);

  useEffect(() => {
    if (!showNotifications) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (notifRef.current && !notifRef.current.contains(target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showNotifications]);

  const notifications = [
    {
      id: 1,
      time: "13:04",
      actor: "Oni Chan",
      text: "Turned their GPS on.",
      highlight: true,
    },
    {
      id: 2,
      time: "12:56",
      actor: "Driver changed from",
      text: "Xin Zhao to Oni Chan",
      highlight: true,
      isChange: true,
    },
    {
      id: 3,
      time: "11:58",
      actor: "Xin Zhao",
      text: "Turned their GPS off.",
      highlight: true,
    },
    {
      id: 4,
      time: "11:04",
      actor: "Oni Chan",
      text: "Uploaded",
      link: "photo_616512026.jpg",
      highlight: false,
    },
  ];

  return (
    <section className="flex flex-col   gap-4 p-4 bg-white rounded-[16px]">
      <div
        className="flex items-center justify-between w-full"
        data-name="Shipment Header"
      >
        <div className="flex flex-col gap-1 min-w-px" data-name="Shipment Info">
          <p className="text-slate-900 font-semibold text-xs leading-none">
            {title}
          </p>
          <p className="text-slate-400 text-xs leading-none">{shipmentId}</p>
        </div>

        <div className="relative flex items-center gap-2" ref={notifRef}>
          {/* Icon buttons (outline, subtle) */}

          <button
            type="button"
            onClick={() => driverId && setIsChatOpen(true)}
            disabled={!driverId}
            className={cn(
              "bg-white border hover:scale-105 transition-all duration-300 border-slate-200 rounded-[8px] p-2 size-auto relative",
              !driverId && "opacity-50 cursor-not-allowed"
            )}
            aria-label="Chat"
          >
            <MessagesSquareIcon className="block size-5 text-slate-400" />
          </button>
          <button
            type="button"
            className="bg-white border hover:scale-105 transition-all duration-300 border-slate-200 rounded-[8px] p-2 size-auto relative"
            aria-label="Notifications"
            aria-expanded={showNotifications}
            aria-haspopup="menu"
            onClick={() => setShowNotifications((v) => !v)}
          >
            <BellIcon className="block size-5 text-slate-400" />
            <span className="absolute -top-0 -left-0 block size-[6px] rounded-full bg-red-500" />
          </button>
          {showNotifications ? (
            <div
              role="menu"
              className="absolute right-0 top-12 z-50 w-[520px] rounded-[12px] bg-white shadow-lg border border-slate-200 overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
                <h3 className="text-sm font-semibold text-slate-900">
                  Notifications
                </h3>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-[8px] border border-slate-200 bg-white size-7 text-slate-400 hover:text-slate-600"
                    aria-label="Filter"
                  >
                    <ListCheck className="size-4" />
                  </button>
                </div>
              </div>
              <ul className="max-h-[360px] overflow-auto px-1 py-2">
                {notifications.map((n) => (
                  <li key={n.id} className="px-2 py-1">
                    <div
                      className={cn(
                        "flex items-center justify-between gap-3 rounded-[10px] px-3 py-2",
                        n.highlight ? "bg-amber-50" : "bg-transparent"
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xs text-slate-500 bg-slate-100 rounded-full px-2 py-[2px] shrink-0">
                          {n.time}
                        </span>
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="inline-flex items-center justify-center rounded-full bg-slate-200 size-5 overflow-hidden">
                            <img
                              src={avatarImg}
                              alt=""
                              className="block size-full object-cover"
                            />
                          </span>
                          {n.isChange ? (
                            <div className="flex items-center gap-2 min-w-0 text-[13px]">
                              <span className="text-slate-700">
                                Driver changed from
                              </span>
                              <span className="inline-flex items-center gap-1 min-w-0">
                                <span className="inline-flex items-center justify-center rounded-full bg-slate-200 size-5 overflow-hidden">
                                  <img
                                    src={avatarImg}
                                    alt=""
                                    className="block size-full object-cover"
                                  />
                                </span>
                                <span className="font-semibold text-amber-700">
                                  Xin Zhao
                                </span>
                              </span>
                              <span className="text-slate-400">to</span>
                              <span className="font-semibold text-amber-700">
                                Oni Chan
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 min-w-0 text-[13px]">
                              <span className="font-semibold text-amber-700 truncate">
                                {n.actor}
                              </span>
                              <span className="text-slate-700 truncate">
                                {n.text}
                              </span>
                              {n.link ? (
                                <span className="inline-flex items-center gap-1 text-blue-600 truncate">
                                  <Paperclip className="size-4" />
                                  <a href="#" className="underline truncate">
                                    {n.link}
                                  </a>
                                </span>
                              ) : null}
                            </div>
                          )}
                        </div>
                      </div>
                      <Check className="size-4 text-slate-300 shrink-0" />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <button
            type="button"
            className="bg-red-500/10 hover:scale-105 transition-all duration-300 rounded-[8px] p-2 size-auto"
            aria-label="Close"
            onClick={onClose}
          >
            <XIcon className="block size-5 text-red-500" />
          </button>
        </div>
      </div>
      {hasDetails ? (
        <div className="flex gap-4">
          <div
            data-name="Navigating Info"
            className={cn(" w-1/2 flex flex-col gap-4", className)}
          >
            {/* Shipment Header */}

            {/* Header: Driver name, rating, quick chat */}
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-4 min-w-0">
                {driverPhoto ? (
                  <img
                    src={driverPhoto ? getFileUrl(driverPhoto) : undefined}
                    alt="Driver avatar"
                    className="size-7 rounded-full object-cover"
                  />
                ) : (
                  <div className="size-7 rounded-full bg-slate-200 flex items-center justify-center">
                    <UserRoundIcon className="size-4 text-slate-500" />
                  </div>
                )}
                <p className="text-slate-900 font-medium">
                  {driverName || "Unknown"}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => driverId && setIsChatOpen(true)}
                  disabled={!driverId}
                  aria-label="Open chat"
                  className={cn(
                    "bg-blue-100 text-blue-600 rounded-[8px] p-2 hover:scale-105 transition-transform",
                    !driverId && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <MessagesSquareIcon className="size-4" />
                </button>
              </div>
            </div>

            {/* Activity chip */}
            <div className="bg-slate-50 rounded-[8px] px-3 py-[6px] flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900">
                <MapPinIcon className="size-[14px] text-slate-400" />
                <span className="text-[12px]">{lastActivity}</span>
              </div>
              <span className="text-[12px] text-slate-400">
                {lastActivityTime}
              </span>
            </div>

            <div className="border-t border-slate-200" />

            {/* Content: left details + right image */}
            <div className="grid gap-4 md:grid-cols-[1fr,320px] items-start">
              {/* Left info columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-3 px-1">
                  <div className="flex items-center gap-2">
                    <CarIcon className="size-[14px] text-slate-300" />
                    <span className="uppercase text-[10px] text-slate-400">
                      Vehicle
                    </span>
                  </div>
                  <p className="text-xs text-slate-900">
                    {vehicle || "Unknown"}
                  </p>
                </div>

                <div className="flex flex-col gap-3 px-1">
                  <div className="flex items-center gap-2">
                    <Building2Icon className="size-[14px] text-slate-300" />
                    <span className="uppercase text-[10px] text-slate-400">
                      Local Company
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-slate-900">
                      {localCompany || "N/A"}
                    </p>
                    <span className="inline-flex items-center justify-center p-1 rounded-full bg-blue-600">
                      <PlaneIcon className="size-3 text-white" />
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-3 px-1">
                  <div className="flex items-center gap-2">
                    <WeightIcon className="size-[14px] text-slate-300" />
                    <span className="uppercase text-[10px] text-slate-400">
                      Weight
                    </span>
                  </div>
                  <p className="text-[12px] text-slate-900">
                    {(() => {
                      // Extract numeric value from weight string (handles "146.5 KG", "146.5", etc.)
                      const numericValue = parseFloat(
                        weight.replace(/[^0-9.]/g, "")
                      );
                      if (isNaN(numericValue)) return "0 Tons";
                      // Convert from kilograms to tons (1 ton = 1000 kg)
                      const tons = numericValue / 1000;
                      // Format to 2 decimal places, remove trailing zeros
                      return `${tons.toFixed(2).replace(/\.?0+$/, "")} Tons`;
                    })()}
                  </p>
                </div>
                <div className="flex flex-col gap-3 px-1">
                  <div className="flex items-center gap-2">
                    <LocateFixedIcon className="size-[14px] text-slate-300" />
                    <span className="uppercase text-[10px] text-slate-400">
                      Destination
                    </span>
                  </div>
                  <p className="text-[12px] text-slate-900">
                    <ReactCountryFlag
                      className="mr-1 mb-1"
                      svg
                      countryCode={getCountryCode(destination.split(", ")[1])}
                      style={{ width: 16, borderRadius: 2 }}
                    />
                    {destination}
                  </p>
                </div>
              </div>

              {/* Right vehicle image with controls */}
            </div>
          </div>
          <div className="relative h-auto max-h-[240px] w-1/2 rounded-2xl overflow-hidden">
            <CargoMap
              segmentIds={segments
                .filter(
                  (segment) => segment.originCity && segment.destinationCity
                )
                .map((segment) => segment.id)
                .filter((id): id is string => !!id)}
              initialView={viewport}
              mapboxToken={MAPBOX_TOKEN}
            />

            {/* Zoom & locate controls */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 w-[30px] z-10">
              <div className="flex flex-col overflow-hidden rounded-[8px] shadow-sm">
                <button
                  className="bg-white p-2 hover:bg-slate-50 transition-colors"
                  onClick={() => {
                    mapRef.current?.zoomIn({ duration: 300 });
                  }}
                >
                  <PlusIcon className="size-[14px] text-slate-500" />
                </button>
                <button
                  className="bg-white border-t border-slate-300 p-2 hover:bg-slate-50 transition-colors"
                  onClick={() => {
                    mapRef.current?.zoomOut({ duration: 300 });
                  }}
                >
                  <MinusIcon className="size-[14px] text-slate-500" />
                </button>
              </div>
              <button
                className="bg-white rounded-[8px] p-2 hover:bg-slate-50 transition-colors"
                onClick={() => {
                  if (mapRef.current) {
                    // Reset to initial viewport
                    mapRef.current.flyTo({
                      center: [viewport.longitude, viewport.latitude],
                      zoom: viewport.zoom,
                      duration: 1000,
                    });
                  }
                }}
              >
                <LocateFixedIcon className="size-[14px] text-slate-500" />
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Chat Overlay */}
      {isChatOpen && driverId && (
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
                Chat with {driverName || "Driver"}
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
                key={conversation?.id || driverId}
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
                        text: `Start Messaging to ${driverName || "Driver"}`,
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

export default NavigatingInfo;
