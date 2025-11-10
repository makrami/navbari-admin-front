import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Search,
  ListFilterPlus,
  MessagesSquareIcon,
  BellIcon,
} from "lucide-react";
import { ListPanel } from "../../shared/components/ui/ListPanel";
import { DetailsPanel } from "../shipment/details/DetailsPanel";
import { CHAT_ALERTS } from "./data";
import { ChatAlertItem } from "./components/ChatAlertItem";
import { ChatAlertDetails } from "./components/ChatAlertDetails";
import {
  ChatAlertPageSkeleton,
  ChatAlertGridSkeleton,
} from "./components/ChatAlertSkeleton";

export function ChatAlertPage() {
  const { t } = useTranslation();
  const [selectedId, setSelectedId] = useState<string | null>(
    CHAT_ALERTS[0]?.id || null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading for 2 seconds
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const filteredAlerts = useMemo(() => {
    if (!searchQuery.trim()) return CHAT_ALERTS;
    const query = searchQuery.toLowerCase();
    return CHAT_ALERTS.filter(
      (alert) =>
        alert.name.toLowerCase().includes(query) ||
        alert.messagePreview.toLowerCase().includes(query) ||
        alert.shipmentNumber.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const selectedAlert = useMemo(
    () => CHAT_ALERTS.find((alert) => alert.id === selectedId) || null,
    [selectedId]
  );

  if (isLoading) {
    if (!selectedId) {
      return <ChatAlertGridSkeleton />;
    }
    return <ChatAlertPageSkeleton />;
  }

  // Default list view
  if (!selectedId) {
    return (
      <div className="py-6 space-y-6 h-screen max-w-7xl mx-auto transition-all">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">
              {t("chatAlert.page.title")}
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          <button
            type="button"
            className="bg-white border hover:scale-105 transition-all duration-300 border-slate-200 rounded-[8px] p-2 size-auto relative"
            aria-label="Chat"
          >
            <MessagesSquareIcon className="block size-5 text-slate-400" />
          </button>
          <button
            type="button"
            className="bg-white border hover:scale-105 transition-all duration-300 border-slate-200 rounded-[8px] p-2 size-auto relative"
            aria-label="Notifications"
          >
            <BellIcon className="block size-5 text-slate-400" />
            <span className="absolute -top-0 -left-0 block size-[6px] rounded-full bg-red-500" />
          </button>
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

        {/* Chat Alert List */}
        <div className="flex flex-col gap-2 flex-1 min-h-0 overflow-y-auto no-scrollbar">
          {filteredAlerts.map((alert) => (
            <ChatAlertItem
              key={alert.id}
              chatAlert={alert}
              selected={selectedId === alert.id}
              onSelect={setSelectedId}
            />
          ))}
        </div>
      </ListPanel>

      <div className="flex-1 h-screen max-w-4xl mx-auto overflow-hidden">
        <div className="h-full overflow-y-auto no-scrollbar">
          <div className="p-9 flex flex-col gap-4">
            <DetailsPanel className="min-h-0 p-0" title="Details">
              {selectedAlert && (
                <ChatAlertDetails
                  chatAlert={selectedAlert}
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
