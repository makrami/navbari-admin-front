import {AlertTriangle, AlertCircle, CheckCircle2, Info} from "lucide-react";
import type {ActionableAlertChip, AlertType} from "../types/chat";
import {cn} from "../../../shared/utils/cn";

interface ActionableChipsBarProps {
  chips: ActionableAlertChip[];
  onChipClick?: (chip: ActionableAlertChip) => void;
}

// Style configuration for each alert type
const alertTypeStyles: Record<
  AlertType,
  {
    icon: typeof AlertTriangle;
    textColor: string;
    bgColor: string;
    hoverBgColor: string;
    iconColor: string;
  }
> = {
  alert: {
    icon: AlertTriangle,
    textColor: "text-red-600",
    bgColor: "bg-red-50",
    hoverBgColor: "hover:bg-red-100",
    iconColor: "text-red-600",
  },
  warning: {
    icon: AlertCircle,
    textColor: "text-amber-600",
    bgColor: "bg-amber-50",
    hoverBgColor: "hover:bg-amber-100",
    iconColor: "text-amber-600",
  },
  success: {
    icon: CheckCircle2,
    textColor: "text-green-600",
    bgColor: "bg-green-50",
    hoverBgColor: "hover:bg-green-100",
    iconColor: "text-green-600",
  },
  info: {
    icon: Info,
    textColor: "text-blue-600",
    bgColor: "bg-blue-50",
    hoverBgColor: "hover:bg-blue-100",
    iconColor: "text-blue-600",
  },
};

export function ActionableChipsBar({
  chips,
  onChipClick,
}: ActionableChipsBarProps) {
  const handleClick = (chip: ActionableAlertChip) => {
    onChipClick?.(chip);
  };

  return (
    <div className="overflow-x-auto bg-white no-scrollbar px-4 py-3 border-t border-slate-200">
      <div className="flex gap-2 min-w-max">
        {chips.map((chip) => {
          const styles = alertTypeStyles[chip.alertType];
          const Icon = styles.icon;

          return (
            <button
              key={chip.id}
              type="button"
              onClick={() => handleClick(chip)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap",
                styles.textColor,
                styles.bgColor,
                styles.hoverBgColor
              )}
            >
              <Icon className={cn("size-4", styles.iconColor)} />
              {chip.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
