import { AlertTriangle } from "lucide-react";
import { cn } from "../../../shared/utils/cn";

type AlertBadgeProps = {
  count: number;
  selected?: boolean;
};

export function AlertBadge({ count, selected = false }: AlertBadgeProps) {
  return (
    <div
      className={cn(
        "flex items-center text-xs font-bold px-2 py-1 rounded-lg gap-1",
        selected
          ? "bg-white/20 text-yellow-300"
          : "bg-[#CA8A041A] text-yellow-500"
      )}
    >
      <AlertTriangle className="size-3" />
      {count}
    </div>
  );
}
