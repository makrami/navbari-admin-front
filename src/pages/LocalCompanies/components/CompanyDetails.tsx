import type {CompanyReadDto} from "../../../services/company/company.service";
import ReactCountryFlag from "react-country-flag";
import {
  Phone as PhoneIcon,
  Users as UsersIcon,
  Truck as TruckIcon,
  User as UserIcon,
  Calendar as CalendarIcon,
  Pencil as PencilIcon,
  Mail as MailIcon,
  Plus as PlusIcon,
  PencilLine,
  MessageSquareText,
  X,
  MessagesSquareIcon,
} from "lucide-react";
import {STATUS_TO_COLOR, apiStatusToUiStatus} from "../types";
import {getLogoUrl} from "../utils";
import {useState, useMemo, useEffect} from "react";
import {ChatSection} from "../../chat-alert/components/ChatSection";
import {
  useChatConversations,
  useConversationMessages,
  useSendChatMessage,
  useSendChatAlert,
  useMarkConversationRead,
} from "../../../services/chat/hooks";
import {useChatSocket} from "../../../services/chat/socket";
import {useCurrentUser} from "../../../services/user/hooks";
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
import {ENV} from "../../../lib/env";
import {getCountryCode} from "../../../shared/utils/countryCode";

type Props = {
  company: CompanyReadDto;
};

const ACTIONABLE_ALERTS: ActionableAlertChip[] = [
  {id: "1", label: "GPS Lost", alertType: "alert"},
  {id: "2", label: "Delay Expected", alertType: "warning"},
  {id: "3", label: "Route Cleared", alertType: "success"},
  {id: "4", label: "Documentation Pending", alertType: "info"},
];

export function CompanyDetails({company}: Props) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const uiStatus = apiStatusToUiStatus(company.status);
  const colors = STATUS_TO_COLOR[uiStatus];

  const statusDotColor =
    uiStatus === "active"
      ? "bg-green-500"
      : uiStatus === "pending"
      ? "bg-amber-500"
      : uiStatus === "rejected"
      ? "bg-rose-500"
      : "bg-slate-500";

  const countryCode = getCountryCode(company.country);
  const city = company.address?.split(",")[0]?.trim() || company.country;

  // Fetch conversations for companies
  const {data: conversations = []} = useChatConversations("company");
  const {data: currentUser} = useCurrentUser();

  // Find conversation for this company
  const conversation = useMemo(() => {
    return conversations.find((conv) => conv.companyId === company.id);
  }, [conversations, company.id]);

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
      recipientType: CHAT_RECIPIENT_TYPE.COMPANY,
      companyId: company.id,
    });
  };

  const handleAlertChipClick = (chip: ActionableAlertChip) => {
    sendAlertMutation.mutate({
      alertType: chip.alertType as ChatAlertType,
      content: chip.label,
      recipientType: CHAT_RECIPIENT_TYPE.COMPANY,
      companyId: company.id,
    });
  };

  return (
    <section className="bg-white rounded-2xl p-4 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        {/* Left: Logo + Info */}
        <div className="flex items-center gap-4 min-w-0">
          <div className="h-24 w-24 rounded-lg bg-slate-50 overflow-hidden grid place-items-center">
            {getLogoUrl(company.logoUrl) ? (
              <img
                src={getLogoUrl(company.logoUrl)}
                alt="logo"
                className="max-h-14"
              />
            ) : (
              <div className="h-10 w-10 rounded bg-slate-200" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-slate-900 font-bold text-xl leading-none truncate">
                {company.name}
              </p>
              <button
                type="button"
                onClick={() => setIsChatOpen(true)}
                className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
                aria-label="Open chat"
              >
                <MessagesSquareIcon className="size-4 text-blue-600" />
              </button>
              <PencilIcon className="size-4 text-slate-400" />
            </div>

            <div className="mt-2 flex items-center gap-2 text-xs text-slate-900">
              <ReactCountryFlag
                svg
                countryCode={countryCode}
                className=" text-2xl"
              />
              <span className="flex items-center gap-1 font-bold">
                {company.country} <span>/</span>
                <span className="font-normal">{city}</span>
              </span>
            </div>

            <div className="mt-2 flex items-center gap-6 text-xs text-slate-900">
              <div className="flex items-center gap-2">
                <UserIcon className="size-3.5 text-slate-400" />
                <span>{company.primaryContactFullName}</span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarIcon className="size-3.5 text-slate-400" />
                <span>
                  Register: {new Date(company.createdAt).toLocaleDateString()}
                </span>
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
              {uiStatus.charAt(0).toUpperCase() + uiStatus.slice(1)}
            </span>
          </div>
          <div className="inline-flex items-center gap-2 rounded-lg px-3 py-2 w-full justify-center bg-blue-600/10">
            <UsersIcon className="size-4 text-blue-600" />
            <span className="text-xs font-bold text-blue-600">
              {company.totalDrivers ?? 0}
            </span>
            <span className="text-xs text-blue-600">Drivers</span>
          </div>
          <div className="inline-flex items-center gap-2 rounded-lg px-3 py-2 w-full justify-center bg-blue-600/10">
            <TruckIcon className="size-4 text-blue-600" />
            <span className="text-xs font-bold text-blue-600">
              {company.totalSegments ?? 0}
            </span>
            <span className="text-xs text-blue-600">Segments</span>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100" />

      {/* Contact Information */}
      <div className="space-y-3 flex">
        <div className="flex items-center gap-4 text-xs text-slate-900">
          <PhoneIcon className="size-5 text-slate-400" />
          <div className="flex flex-col gap-1">
            <p className="text-slate-400 font-semibold">Phone</p>
            <p className="text-xs text-slate-900">{company.phone}</p>
          </div>
        </div>
        <div className="w-px bg-slate-200 mx-6" />
        <div className="flex items-center gap-4 text-xs text-slate-900">
          <MailIcon className="size-5 text-slate-400" />
          <div className="flex flex-col gap-1">
            <p className="text-slate-400 font-semibold">Email</p>
            <p className="text-xs text-slate-900">{company.email}</p>
          </div>
        </div>
        <div className="w-px bg-slate-200 mx-6" />
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="w-10 h-10 rounded-lg border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50 transition-colors"
            aria-label="Add"
          >
            <PlusIcon className="size-5 text-slate-400" />
          </button>
          <button
            type="button"
            className="w-10 h-10 rounded-lg border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50 transition-colors"
            aria-label="Edit"
          >
            <PencilLine className="size-5 text-slate-400" />
          </button>
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
                Chat with {company.name}
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
                key={conversation?.id || company.id}
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
                        text: `Start Messaging to ${company.name}`,
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

export default CompanyDetails;
