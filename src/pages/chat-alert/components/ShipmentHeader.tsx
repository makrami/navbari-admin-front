import { Bell, X, MessagesSquareIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ShipmentHeaderProps {
  shipmentNumber: string;
  shipmentId: string;
  onClose?: () => void;
}

export function ShipmentHeader({
  shipmentNumber,
  shipmentId,
  onClose,
}: ShipmentHeaderProps) {
  const { t } = useTranslation();
  return (
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-semibold text-slate-900">{shipmentNumber}</p>
        <p className="text-xs text-slate-400">{shipmentId}</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-400 hover:bg-slate-50 transition-colors"
          aria-label={t("chatAlert.shipmentHeader.chat")}
        >
          <MessagesSquareIcon className="size-5" />
        </button>
        <button
          type="button"
          className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-400 hover:bg-slate-50 transition-colors relative"
          aria-label={t("chatAlert.shipmentHeader.notifications")}
        >
          <Bell className="size-5" />
          <span className="absolute top-0 left-0 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/15 transition-colors"
            aria-label={t("chatAlert.shipmentHeader.close")}
          >
            <X className="size-5" />
          </button>
        )}
      </div>
    </div>
  );
}
