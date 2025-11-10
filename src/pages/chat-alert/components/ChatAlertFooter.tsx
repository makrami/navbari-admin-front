import { cn } from "../../../shared/utils/cn";

type ChatAlertFooterProps = {
  messagePreview: string;
  timestamp: string;
  selected?: boolean;
  onMenuClick?: (e: React.MouseEvent) => void;
};

export function ChatAlertFooter({
  messagePreview,
  timestamp,
  selected = false,
  onMenuClick,
}: ChatAlertFooterProps) {
  return (
    <div className="flex items-center justify-between gap-2">
      <p
        className={cn(
          "text-sm truncate flex-1",
          selected ? "text-white/90" : "text-slate-400"
        )}
      >
        {messagePreview}
      </p>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span
          className={cn(
            "text-xs font-semibold",
            selected ? "text-white/80" : "text-slate-400"
          )}
        >
          {timestamp}
        </span>
        {onMenuClick && (
          <button
            className={cn(
              "p-1 rounded hover:bg-white/10 transition-colors",
              selected
                ? "text-white/80"
                : "text-slate-400 hover:text-slate-600"
            )}
            onClick={onMenuClick}
          />
        )}
      </div>
    </div>
  );
}

