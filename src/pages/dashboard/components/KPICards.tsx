import { useTranslation } from "react-i18next";
import {
  IdCard,
  MessageSquareDot,
  UsersRoundIcon,
  BellDot,
} from "lucide-react";
import { cn } from "../../../shared/utils/cn";
import { renderNumbersBold } from "../utils";

type KPICard = {
  id: string;
  title: string;
  metaTop: string;
  metaBottom: string;
  iconBg: string;
  renderIcon: () => React.ReactElement;
};

type KPICardsProps = {
  onCardClick: (cardId: string) => void;
};

export function KPICards({ onCardClick }: KPICardsProps) {
  const { t } = useTranslation();

  const cards: KPICard[] = [
    {
      id: "segmentsAwaitingDriver",
      title: t("dashboard.kpiCards.segmentsAwaitingDriver.title"),
      metaTop: t("dashboard.kpiCards.segmentsAwaitingDriver.metaTop"),
      metaBottom: t("dashboard.kpiCards.segmentsAwaitingDriver.metaBottom"),
      iconBg: "bg-amber-50",
      renderIcon: () => <UsersRoundIcon className="size-4 text-amber-600" />,
    },
    {
      id: "newAwaitingRegistrations",
      title: t("dashboard.kpiCards.newAwaitingRegistrations.title"),
      metaTop: t("dashboard.kpiCards.newAwaitingRegistrations.metaTop"),
      metaBottom: t("dashboard.kpiCards.newAwaitingRegistrations.metaBottom"),
      iconBg: "bg-orange-50",
      renderIcon: () => <IdCard className="size-4 text-orange-600" />,
    },
    {
      id: "totalAlerts",
      title: "Total Alerts",
      metaTop: "76 new alerts",
      metaBottom: "614 total",
      iconBg: "bg-red-50",
      renderIcon: () => <BellDot className="size-4 text-red-600" />,
    },
    {
      id: "unreadMessages",
      title: t("dashboard.kpiCards.unreadMessages.title"),
      metaTop: t("dashboard.kpiCards.unreadMessages.metaTop"),
      metaBottom: t("dashboard.kpiCards.unreadMessages.metaBottom"),
      iconBg: "bg-violet-50",
      renderIcon: () => <MessageSquareDot className="size-4 text-violet-600" />,
    },
  ];

  return (
    <div className="pointer-events-auto absolute top-10 left-10 right-20 z-40 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <button
          key={card.id}
          type="button"
          onClick={() => onCardClick(card.id)}
          className="text-left rounded-lg bg-white/90 backdrop-blur border border-slate-200  p-4 hover:shadow transition"
        >
          <div className="flex flex-col items-start gap-3">
            <div className="flex items-center gap-1">
              <span
                className={cn(
                  "inline-flex h-8 w-8 items-center justify-center rounded-lg bg-",
                  card.iconBg
                )}
              >
                {card.renderIcon()}
              </span>
              <div className="text-sm font-semibold text-slate-900 truncate">
                {card.title}
              </div>
            </div>
            <div className="flex flex-col ">
              <div className=" text-[11px] text-slate-500 font-medium">
                {renderNumbersBold(card.metaTop, `${card.title}-top`)}
              </div>
              <div className="mt-1.5 text-sm text-slate-900">
                {renderNumbersBold(card.metaBottom, `${card.title}-bottom`)}
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
