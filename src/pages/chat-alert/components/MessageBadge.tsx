import { MessageSquareText } from "lucide-react";
import { cn } from "../../../shared/utils/cn";

type MessageBadgeProps = {
  count: number;
  selected?: boolean;
};

export function MessageBadge({ count, selected = false }: MessageBadgeProps) {
  if (count === 0) return null;

  return (
    <div
      className={cn(
        "flex items-center text-xs font-bold px-2 py-1 rounded-lg gap-1",
        selected
          ? "bg-white/20 text-blue-300"
          : "bg-[#1B54FE1A] text-blue-600"
      )}
    >
      <MessageSquareText className="size-2.5" />
      {count}
    </div>
  );
}

