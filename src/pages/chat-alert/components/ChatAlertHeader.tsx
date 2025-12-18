import {MoreVertical} from "lucide-react";
import {cn} from "../../../shared/utils/cn";
import {AlertBadge} from "./AlertBadge";
import {MessageBadge} from "./MessageBadge";
import {DriverInfo} from "../../../shared/components/DriverInfo";

type ChatAlertHeaderProps = {
  name: string;
  alerts: number;
  messages: number;
  selected?: boolean;
  rating?: number;
  avatarUrl?: string;
  onMenuClick?: (e: React.MouseEvent) => void;
};

export function ChatAlertHeader({
  name,
  alerts,
  messages,
  selected = false,
  rating,
  avatarUrl,
  onMenuClick,
}: ChatAlertHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-2 mb-1">
      <div className="flex items-center gap-1.5 min-w-0">
        <DriverInfo
          selected={selected}
          driverName={name}
          driverAvatarUrl={avatarUrl ?? null}
          driverRating={rating}
          showRating={true}
          avatarSize="sm"
          nameClassName={cn(
            "text-sm font-bold truncate",
            selected ? "text-white" : "text-slate-900"
          )}
          showRatingBeforeName={false}
          className="gap-1.5"
        />
      </div>
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
