import { MoreVertical } from "lucide-react";
import { cn } from "../../../shared/utils/cn";
import { AlertBadge } from "./AlertBadge";
import { MessageBadge } from "./MessageBadge";

type ChatAlertHeaderProps = {
  name: string;
  alerts: number;
  messages: number;
  selected?: boolean;
  onMenuClick?: (e: React.MouseEvent) => void;
};

export function ChatAlertHeader({
  name,
  alerts,
  messages,
  selected = false,
  onMenuClick,
}: ChatAlertHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-2 mb-1">
      <span
        className={cn(
          "text-sm font-bold truncate",
          selected ? "text-white" : "text-slate-900"
        )}
      >
        {name}
      </span>
      <div className="flex items-center gap-1">
        <AlertBadge count={alerts} selected={selected} />
        <MessageBadge count={messages} selected={selected} />
        {onMenuClick && (
          <button onClick={onMenuClick} className="p-1">
            <MoreVertical className="size-4" />
          </button>
        )}
        {!onMenuClick && <MoreVertical className="size-4" />}
      </div>
    </div>
  );
}

