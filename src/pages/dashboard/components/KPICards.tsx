import { useTranslation } from "react-i18next";
import {
  IdCard,
  MessageSquareDot,
  UsersRoundIcon,
  BellDot,
} from "lucide-react";
import { cn } from "../../../shared/utils/cn";
import { renderNumbersBold } from "../utils";
import { useDashboardSummary } from "../../../services/dashboard/hooks";

type KPICard = {
  id: string;
  title: string;
  metaTop: string;
  metaBottom: string;
  iconBg: string;
  renderIcon: () => React.ReactElement;
};

type KPICardsProps = {
  onCardClick: (
    cardId: string,
    position: { top: number; left: number; width: number }
  ) => void;
};

function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds}s ago`;
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
}

export function KPICards({ onCardClick }: KPICardsProps) {
  const { t } = useTranslation();
  const { data: summary, isLoading } = useDashboardSummary();

  // Helper function to format card data based on API response
  const getCardData = (cardId: string): KPICard | null => {
    if (!summary) return null;

    switch (cardId) {
      case "segmentsAwaitingDriver": {
        return {
          id: cardId,
          title: t("dashboard.kpiCards.segmentsAwaitingDriver.title"),
          metaTop: `${summary.segmentsArrivingToOriginCount} arriving, ${summary.segmentsUnassignedCount} unassigned`,
          metaBottom: `${summary.shipmentsImpactedCount} shipments impacted`,
          iconBg: "bg-amber-50",
          renderIcon: () => (
            <UsersRoundIcon className="size-4 text-amber-600" />
          ),
        };
      }
      case "newAwaitingRegistrations": {
        const lastRegisterTime = summary.lastDriverOrCompanyRegisterTimestamp
          ? formatTimeAgo(summary.lastDriverOrCompanyRegisterTimestamp)
          : "N/A";
        return {
          id: cardId,
          title: t("dashboard.kpiCards.newAwaitingRegistrations.title"),
          metaTop: `${summary.companiesWaitingForApprovalCount} companies, ${summary.driversWaitingForApprovalCount} drivers`,
          metaBottom: `Last: ${lastRegisterTime}`,
          iconBg: "bg-orange-50",
          renderIcon: () => <IdCard className="size-4 text-orange-600" />,
        };
      }
      case "totalAlerts": {
        return {
          id: cardId,
          title: t("dashboard.kpiCards.totalAlerts.title"),
          metaTop: `${summary.newAlertsCount} new alerts`,
          metaBottom: `${summary.totalAlertsCount} total alerts`,
          iconBg: "bg-red-50",
          renderIcon: () => <BellDot className="size-4 text-red-600" />,
        };
      }
      case "unreadMessages": {
        const lastMessageTime = summary.lastMessageTimestamp
          ? formatTimeAgo(summary.lastMessageTimestamp)
          : "N/A";
        return {
          id: cardId,
          title: t("dashboard.kpiCards.unreadMessages.title"),
          metaTop: `${summary.unreadMessagesCount} unread, ${summary.waitingToResponseChatCount} waiting`,
          metaBottom: `Last message: ${lastMessageTime}`,
          iconBg: "bg-violet-50",
          renderIcon: () => (
            <MessageSquareDot className="size-4 text-violet-600" />
          ),
        };
      }
      default:
        return null;
    }
  };

  const cards: KPICard[] = [
    "segmentsAwaitingDriver",
    "newAwaitingRegistrations",
    "totalAlerts",
    "unreadMessages",
  ]
    .map((cardId) => getCardData(cardId))
    .filter((card): card is KPICard => card !== null);

  if (isLoading) {
    return (
      <div className="pointer-events-auto absolute top-10 left-10 right-20 z-40 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-lg bg-white/90 backdrop-blur border border-slate-200 p-4 min-h-[120px] w-full animate-pulse"
          >
            <div className="h-4 bg-slate-200 rounded w-3/4 mb-3"></div>
            <div className="h-3 bg-slate-200 rounded w-full mb-2"></div>
            <div className="h-3 bg-slate-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="pointer-events-auto absolute top-10 left-10 right-20 z-40 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <button
          key={card.id}
          type="button"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            onCardClick(card.id, {
              top: rect.bottom,
              left: rect.left,
              width: rect.width,
            });
          }}
          className="text-start rounded-lg bg-white/90 backdrop-blur border border-slate-200 p-4 hover:shadow transition min-h-[120px] w-full flex flex-col justify-between"
        >
          <div className="flex flex-col items-start gap-3">
            <div className="flex items-center gap-1">
              <span
                className={cn(
                  "inline-flex h-8 w-8 items-center justify-center rounded-lg",
                  card.iconBg
                )}
              >
                {card.renderIcon()}
              </span>
              <div className="text-sm font-semibold text-slate-900 truncate max-w-full">
                {card.title}
              </div>
            </div>
            <div className="flex flex-col gap-1.5 flex-1">
              <div className="text-[11px] text-slate-500 font-medium leading-tight overflow-hidden">
                <div className="truncate">
                  {renderNumbersBold(card.metaTop, `${card.id}-top`)}
                </div>
              </div>
              <div className="text-sm text-slate-900 leading-tight overflow-hidden">
                <div className="truncate">
                  {renderNumbersBold(card.metaBottom, `${card.id}-bottom`)}
                </div>
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
