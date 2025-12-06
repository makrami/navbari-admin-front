import {cn} from "../../../../shared/utils/cn";
import type {StepConfig} from "../config/progressSteps";
import {AlertTriangleIcon} from "lucide-react";
import {useTranslation} from "react-i18next";

type ProgressIconCardProps = {
  Icon: React.ComponentType<{className?: string}>;
  isCompleted: boolean;
  isUpcoming: boolean;
  isActive?: boolean;
  activeBgColor?: string;
  activeIconColor?: string;
};

export function ProgressIconCard({
  Icon,
  isCompleted,
  isUpcoming,
  isActive,
  activeBgColor,
  activeIconColor,
}: ProgressIconCardProps) {
  return (
    <div
      className={cn(
        "size-12 rounded-lg inline-flex items-center justify-center flex-shrink-0 transition-all",
        isCompleted && "bg-green-50 text-green-600",
        isUpcoming && "bg-slate-100 text-slate-400",
        isActive &&
          activeBgColor &&
          activeIconColor &&
          `${activeBgColor} ${activeIconColor}`
      )}
    >
      <Icon className="size-3.5" />
    </div>
  );
}

type ProgressActiveCardProps = {
  step: StepConfig;
  badge?: string;
  showWarningIcon: boolean;
  dateTime?: string;
  plannedDate?: string;
  estFinishAt?: string;
  distance?: string;
  alertMessage?: string;
  isCompleted?: boolean;
  isUpcoming?: boolean;
  isActive?: boolean;
  isDelivered?: boolean;
  onAlertClick?: () => void;
};

export function ProgressActiveCard({
  step,
  showWarningIcon,
  plannedDate,
  estFinishAt,
  distance,
  alertMessage,
  isCompleted,
  isUpcoming,
  isActive,
  isDelivered,
  onAlertClick,
}: ProgressActiveCardProps) {
  const Icon = step.icon;
  const {t} = useTranslation();

  const handleAlertClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAlertClick && alertMessage) {
      onAlertClick();
    }
  };

  return (
    <div
      className={cn(
        "min-w-[300px] flex items-center justify-between rounded-lg px-2 h-12 relative",
        isDelivered && isActive && "border-2 border-green-600",
        isCompleted && "border-2 border-green-600",
        isUpcoming && "border-2 border-slate-400",
        isActive && !isDelivered && "border-2 border-yellow-600"
      )}
    >
      {/* Alert icon positioned at top-left, partially overlapping */}
      {showWarningIcon && (
        <div className="absolute -top-2 -left-3 z-50 ">
          <div className="relative group">
            <div
              className="bg-red-100 rounded-full p-1 border  border-red-600 cursor-pointer hover:bg-red-200 transition-colors"
              onClick={handleAlertClick}
              title={
                alertMessage
                  ? t(`shipment.segments.progress.alert.${alertMessage}`)
                  : undefined
              }
            >
              <AlertTriangleIcon className="size-3 text-red-600 " />
            </div>
            {/* Tooltip - positioned to the right to avoid overflow clipping */}
            <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 hidden group-hover:block z-50 whitespace-nowrap">
              <div className="bg-red-100 text-red-600 text-xs rounded-md px-2 py-1.5 shadow-lg relative">
                {alertMessage
                  ? t(`shipment.segments.progress.alert.${alertMessage}`)
                  : ""}
                {/* Arrow pointing left */}
                <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-b-[6px] border-r-[6px] border-transparent border-r-slate-900" />
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Main content in row: icon + label + date/time */}

      <div className="flex flex-col justify-between h-full items-start py-1">
        <span
          className={cn(
            "text-xs font-bold",
            isDelivered && isActive && "text-green-700/80",
            isActive && !isDelivered && "text-yellow-700/80",
            isUpcoming && "text-slate-700/80",
            isCompleted && "text-green-700/80"
          )}
        >
          {isCompleted ? step.leftLabelCompleted : step.leftLabel}
        </span>
        <span
          className={cn(
            "text-xs ",
            isDelivered && isActive && "text-green-700/80",

            isActive && !isDelivered && "text-yellow-700/80",
            isUpcoming && "text-slate-700/80",
            isCompleted && "text-green-700/80"
          )}
        >
          {plannedDate || "-"}
        </span>
      </div>
      <div className="flex flex-col justify-between h-full items-center py-1">
        <div className="flex items-center gap-0.5">
          <Icon
            className={cn(
              "size-3",
              isDelivered && isActive && "text-green-700",
              isActive && !isDelivered && "text-yellow-700",
              isUpcoming && "text-slate-400",
              isCompleted && "text-green-700"
            )}
          />
          <span
            className={cn(
              "text-sm font-semibold",
              isDelivered && isActive && "text-green-700",
              isActive && !isDelivered && "text-yellow-700",
              isUpcoming && "text-slate-700",
              isCompleted && "text-green-700"
            )}
          >
            {step.label}
          </span>
        </div>
        {distance && (
          <span
            className={cn(
              "text-xs ",
              isDelivered && isActive && "text-green-700/80",
              isActive && !isDelivered && "text-yellow-700/80",
              isUpcoming && "text-slate-700/80",
              isCompleted && "text-green-700/80"
            )}
          >
            {distance}
          </span>
        )}
      </div>
      <div className="flex flex-col justify-between h-full items-end py-1">
        <span
          className={cn(
            "text-xs font-bold",
            isDelivered && isActive && "text-green-700/80",

            showWarningIcon && isActive && "text-red-600",
            !showWarningIcon &&
              isActive &&
              !isDelivered &&
              "text-yellow-700/80",

            isUpcoming && "text-slate-700/80",
            isCompleted && "text-green-700/80"
          )}
        >
          {isCompleted ? step.rightLabelCompleted : step.rightLabel}
        </span>

        <span
          className={cn(
            "text-xs ",
            isDelivered && isActive && "text-green-700/80",
            showWarningIcon && isActive && "text-red-600",
            !showWarningIcon &&
              isActive &&
              !isDelivered &&
              "text-yellow-700/80",
            isUpcoming && "text-slate-700/80",
            isCompleted && "text-green-700/80"
          )}
        >
          {estFinishAt || "-"}
        </span>
      </div>
    </div>
  );
}
