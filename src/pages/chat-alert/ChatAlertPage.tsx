import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import {
  Search,
  ListFilterPlus,
  MessagesSquareIcon,
  Users,
  Boxes,
} from "lucide-react";
import { ListPanel } from "../../shared/components/ui/ListPanel";
import { DetailsPanel } from "../shipment/details/DetailsPanel";
import { ChatAlertItem } from "./components/ChatAlertItem";
import { ChatAlertDetails } from "./components/ChatAlertDetails";
import {
  ChatAlertPageSkeleton,
  ChatAlertGridSkeleton,
} from "./components/ChatAlertSkeleton";
import { useChatConversations } from "../../services/chat/hooks";
import { useDrivers } from "../../services/driver/hooks";
import { useCompanies } from "../../services/company/hooks";
import { useCurrentUser } from "../../services/user/hooks";
import type { ChatAlert } from "./data";
import type { ConversationReadDto } from "../../services/chat/chat.types";
import type { Driver } from "../Drivers/types";
import type { CompanyReadDto } from "../../services/company/company.service";
import { ENV } from "../../lib/env";
import avatarFallback from "../../assets/images/avatar.png";
import { cn } from "../../shared/utils/cn";

type FilterType = "all" | "driver" | "company";

export function ChatAlertPage() {
  const { t } = useTranslation();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  // Fetch conversations based on active filter
  const recipientTypeForApi = useMemo(() => {
    if (activeFilter === "driver") return "driver" as const;
    if (activeFilter === "company") return "company" as const;
    return undefined;
  }, [activeFilter]);

  const { data: conversations = [], isLoading: conversationsLoading } =
    useChatConversations(recipientTypeForApi);
  const { data: drivers = [], isLoading: driversLoading } = useDrivers();
  const { data: companies = [], isLoading: companiesLoading } = useCompanies();
  const { data: currentUser } = useCurrentUser();
  // Socket is handled in ChatAlertDetails component

  const driverMap = useMemo(() => {
    const map = new Map<string, Driver>();
    drivers.forEach((driver) => {
      map.set(driver.id, driver);
    });
    return map;
  }, [drivers]);

  const companyMap = useMemo(() => {
    const map = new Map<string, CompanyReadDto>();
    companies.forEach((company) => {
      map.set(company.id, company);
    });
    return map;
  }, [companies]);

  const chatAlerts = useMemo(() => {
    return conversations.map((conversation) =>
      buildChatAlert(
        conversation,
        driverMap.get(conversation.driverId ?? ""),
        companyMap.get(conversation.companyId ?? "")
      )
    );
  }, [conversations, driverMap, companyMap]);

  const sortedChatAlerts = useMemo(() => {
    return [...chatAlerts].sort((a, b) => {
      const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
      const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
      return bTime - aTime;
    });
  }, [chatAlerts]);

  const filteredAlerts = useMemo(() => {
    let filtered = sortedChatAlerts;

    // Filter by recipientType if not "all" (API already filters, but we double-check client-side)
    if (activeFilter !== "all") {
      filtered = filtered.filter((alert) => {
        if (activeFilter === "driver") {
          return alert.recipientType === "driver";
        }
        if (activeFilter === "company") {
          return alert.recipientType === "company";
        }
        return true;
      });
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (alert) =>
          alert.name.toLowerCase().includes(query) ||
          (alert.messagePreview || "").toLowerCase().includes(query) ||
          (alert.shipmentNumber || "").toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [searchQuery, sortedChatAlerts, activeFilter]);

  const selectedAlert = useMemo(
    () => chatAlerts.find((alert) => alert.id === selectedId) || null,
    [chatAlerts, selectedId]
  );

  const selectedConversation = useMemo(
    () => conversations.find((conv) => conv.id === selectedId),
    [conversations, selectedId]
  );

  useEffect(() => {
    if (!selectedId && filteredAlerts.length > 0) {
      setSelectedId(filteredAlerts[0].id);
    } else if (selectedId && filteredAlerts.length > 0) {
      // If selected chat is not in filtered list, select first available
      const isSelectedInFiltered = filteredAlerts.some(
        (alert) => alert.id === selectedId
      );
      if (!isSelectedInFiltered) {
        setSelectedId(filteredAlerts[0].id);
      }
    } else if (selectedId && filteredAlerts.length === 0) {
      // No chats available in filtered list
      setSelectedId(null);
    }
  }, [filteredAlerts, selectedId]);

  const isLoading = conversationsLoading || driversLoading || companiesLoading;

  if (isLoading) {
    return selectedId ? <ChatAlertPageSkeleton /> : <ChatAlertGridSkeleton />;
  }

  // Default list view - show list panel even when no chat is selected
  if (!selectedId || !selectedAlert || !selectedConversation) {
    return (
      <div className="flex w-full overflow-hidden">
        <ListPanel title={t("chatAlert.page.title")}>
          {/* Search Bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 z-10">
                <Search className="h-4 w-4" aria-hidden="true" />
              </div>
              <input
                type="text"
                placeholder={t("chatAlert.search.placeholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg bg-white border border-slate-200 pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button className="flex-shrink-0 grid h-10 w-10 place-items-center rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors">
              <ListFilterPlus className="h-4 w-4" />
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 px-1 py-2">
            <button
              onClick={() => setActiveFilter("all")}
              className={cn(
                "flex items-center justify-center px-4 py-2 rounded-full text-sm transition-colors",
                activeFilter === "all"
                  ? "bg-blue-50 border-2 border-blue-500 text-blue-700 font-bold"
                  : "bg-white text-slate-700 hover:bg-slate-50 font-medium"
              )}
            >
              {t("chatAlert.filters.all")}
            </button>
            <button
              onClick={() => setActiveFilter("driver")}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-full text-sm transition-colors",
                activeFilter === "driver"
                  ? "bg-blue-50 border-2 border-blue-500 text-blue-700 font-bold"
                  : "bg-white text-slate-700 hover:bg-slate-50 font-medium"
              )}
            >
              <Users
                className={cn(
                  "size-4",
                  activeFilter === "driver" ? "text-blue-700" : "text-slate-500"
                )}
              />
              {t("chatAlert.filters.drivers")}
            </button>
            <button
              onClick={() => setActiveFilter("company")}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-full text-sm transition-colors",
                activeFilter === "company"
                  ? "bg-blue-50 border-2 border-blue-500 text-blue-700 font-bold"
                  : "bg-white text-slate-700 hover:bg-slate-50 font-medium"
              )}
            >
              <Boxes
                className={cn(
                  "size-4",
                  activeFilter === "company"
                    ? "text-blue-700"
                    : "text-slate-500"
                )}
              />
              {t("chatAlert.filters.localCompanies")}
            </button>
          </div>

          {/* Chat Alert List */}
          <div className="flex flex-col gap-2 flex-1 min-h-0 overflow-y-auto no-scrollbar">
            {filteredAlerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12 px-4">
                <MessagesSquareIcon className="size-12 text-slate-300 mb-4" />
                <p className="text-slate-500 font-medium text-sm">
                  {activeFilter === "driver"
                    ? t("chatAlert.empty.drivers")
                    : activeFilter === "company"
                    ? t("chatAlert.empty.companies")
                    : t("chatAlert.empty.all")}
                </p>
              </div>
            ) : (
              filteredAlerts.map((alert) => (
                <ChatAlertItem
                  key={alert.id}
                  chatAlert={alert}
                  selected={selectedId === alert.id}
                  onSelect={setSelectedId}
                />
              ))
            )}
          </div>
        </ListPanel>

        {/* Empty Details Panel */}
        <div className="flex-1 h-screen max-w-4xl mx-auto overflow-hidden">
          <div className="h-full overflow-y-auto no-scrollbar">
            <div className="p-9 flex flex-col gap-4">
              <div className="flex items-center justify-center h-full text-center">
                <div>
                  <MessagesSquareIcon className="size-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 font-medium">
                    {t("chatAlert.selectChat")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Split view with list panel and details
  return (
    <div className="flex w-full overflow-hidden">
      <ListPanel title={t("chatAlert.page.title")}>
        {/* Search Bar */}
        <div className="flex  gap-2">
          <div className="relative flex-1">
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 z-10">
              <Search className="h-4 w-4" aria-hidden="true" />
            </div>
            <input
              type="text"
              placeholder={t("chatAlert.search.placeholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg bg-white border border-slate-200 pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="flex-shrink-0 grid h-10 w-10 place-items-center rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors">
            <ListFilterPlus className="h-4 w-4" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 px-1 py-2">
          <button
            onClick={() => setActiveFilter("all")}
            className={cn(
              "flex items-center justify-center px-4 py-2 rounded-full text-sm transition-colors",
              activeFilter === "all"
                ? "bg-blue-50 border-2 border-blue-500 text-blue-700 font-bold"
                : "bg-white text-slate-700 hover:bg-slate-50 font-medium"
            )}
          >
            {t("chatAlert.filters.all")}
          </button>
          <button
            onClick={() => setActiveFilter("driver")}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-full text-sm transition-colors",
              activeFilter === "driver"
                ? "bg-blue-50 border-2 border-blue-500 text-blue-700 font-bold"
                : "bg-white text-slate-700 hover:bg-slate-50 font-medium"
            )}
          >
            <Users
              className={cn(
                "size-4",
                activeFilter === "driver" ? "text-blue-700" : "text-slate-500"
              )}
            />
            {t("chatAlert.filters.drivers")}
          </button>
          <button
            onClick={() => setActiveFilter("company")}
            className={cn(
              "flex items-center gap-2 px-3 py-2  rounded-full text-sm transition-colors",
              activeFilter === "company"
                ? "bg-blue-50 border-2 border-blue-500 text-blue-700 font-bold"
                : "bg-white text-slate-700 hover:bg-slate-50 font-medium"
            )}
          >
            <Boxes
              className={cn(
                "size-4",
                activeFilter === "company" ? "text-blue-700" : "text-slate-500"
              )}
            />
            {t("chatAlert.filters.localCompanies")}
          </button>
        </div>

        {/* Chat Alert List */}
        <div className="flex flex-col gap-2 flex-1 min-h-0 overflow-y-auto no-scrollbar">
          {filteredAlerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12 px-4">
              <MessagesSquareIcon className="size-12 text-slate-300 mb-4" />
              <p className="text-slate-500 font-medium text-sm">
                {activeFilter === "driver"
                  ? t("chatAlert.empty.drivers")
                  : activeFilter === "company"
                  ? t("chatAlert.empty.companies")
                  : t("chatAlert.empty.all")}
              </p>
            </div>
          ) : (
            filteredAlerts.map((alert) => (
              <ChatAlertItem
                key={alert.id}
                chatAlert={alert}
                selected={selectedId === alert.id}
                onSelect={setSelectedId}
              />
            ))
          )}
        </div>
      </ListPanel>

      <div className="flex-1 h-screen max-w-4xl mx-auto overflow-hidden">
        <div className="h-full overflow-y-auto no-scrollbar">
          <div className="p-9 flex flex-col gap-4">
            <DetailsPanel
              className="min-h-0 p-0"
              title={t("chatAlert.details.title")}
            >
              {selectedAlert && selectedConversation && (
                <ChatAlertDetails
                  chatAlert={selectedAlert}
                  conversation={selectedConversation}
                  currentUserId={currentUser?.id}
                  onClose={() => setSelectedId(null)}
                />
              )}
            </DetailsPanel>
          </div>
        </div>
      </div>
    </div>
  );
}

function buildChatAlert(
  conversation: ConversationReadDto,
  driver?: Driver,
  company?: CompanyReadDto
): ChatAlert {
  const timestamp = conversation.lastMessageAt
    ? dayjs(conversation.lastMessageAt).format("HH:mm")
    : "";

  // Determine avatar and name based on recipient type
  let avatarUrl = avatarFallback;
  let name = conversation.id;

  if (conversation.recipientType === "driver" && driver) {
    avatarUrl = driver.avatarUrl
      ? resolveFileUrl(driver.avatarUrl)
      : avatarFallback;
    name = driver.user.fullName || driver.user.email || conversation.id;
  } else if (conversation.recipientType === "company" && company) {
    avatarUrl = company.logoUrl
      ? resolveFileUrl(company.logoUrl)
      : avatarFallback;
    name = company.name || conversation.companyId || conversation.id;
  }

  // Truncate message preview to match UI design (similar to "i'm trying to turn on m...")
  const messagePreview = conversation.lastMessageContent
    ? conversation.lastMessageContent.length > 25
      ? `${conversation.lastMessageContent.substring(0, 25)}...`
      : conversation.lastMessageContent
    : "";

  return {
    id: conversation.id,
    name,
    avatarUrl,
    messagePreview,
    alerts: conversation.unreadAlertCount,
    messages: conversation.unreadMessageCount,
    timestamp,
    lastMessageAt: conversation.lastMessageAt || undefined,
    shipmentId: driver?.company?.name ? `#${driver.company.name}` : "",
    shipmentNumber: driver?.company?.name || "",
    driverId: conversation.driverId || undefined,
    companyId: conversation.companyId || undefined,
    recipientType: conversation.recipientType,
    rating: driver?.rating ?? 0,
    status: driver?.status ?? "",
    statusTime: conversation.lastMessageAt
      ? dayjs(conversation.lastMessageAt).format("DD MMM - HH:mm")
      : "",
    vehicle: driver?.vehicleType || "",
    weight: driver?.vehicleCapacity ? `${driver.vehicleCapacity} KG` : "0 KG",
    estFinish: driver?.updatedAt
      ? dayjs(driver.updatedAt).format("DD MMM - HH:mm")
      : "",
    localCompany: driver?.company?.name || "",
    destination: driver?.company?.country || "",
    totalPaid: "$0",
    totalPending: "$0",
    currentSegment: {
      number: 1,
      from: driver?.company?.country || "",
      to: driver?.country || "",
      distance: "0 KM",
    },
    segmentPath: [],
  };
}

function resolveFileUrl(filePath?: string | null) {
  if (!filePath) return avatarFallback;
  if (filePath.startsWith("http")) return filePath;
  return `${ENV.FILE_BASE_URL}/${filePath.replace(/^\/+/, "")}`;
}
