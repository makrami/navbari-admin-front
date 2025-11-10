import { cn } from "../../../../shared/utils/cn";
import type { StepConfig } from "../config/progressSteps";
import type { ProgressExtraField } from "../../utils/progressFlowHelpers";
import { AlertTriangleIcon } from "lucide-react";

type ProgressIconCardProps = {
  Icon: React.ComponentType<{ className?: string }>;
  isCompleted: boolean;
  isUpcoming: boolean;
};

export function ProgressIconCard({
  Icon,
  isCompleted,
  isUpcoming,
}: ProgressIconCardProps) {
  return (
    <div
      className={cn(
        "size-12 rounded-lg inline-flex items-center justify-center flex-shrink-0 transition-all",
        isCompleted && "bg-green-50 text-green-600",
        isUpcoming && "bg-slate-100 text-slate-400"
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
  extraFields?: ProgressExtraField[];
};

export function ProgressActiveCard({
  step,
  showWarningIcon,
  plannedDate,
  estFinishAt,
  distance,
}: ProgressActiveCardProps) {
  const Icon = step.icon;

  const isDelivered = step.key === "delivered";

  return (
    <div
      className={cn(
        "min-w-[300px] flex items-center justify-between rounded-lg px-2 h-12 relative",
        step.bgColor,
        isDelivered && "border-2 border-green-600"
      )}
    >
      {/* Alert icon positioned at top-left, partially overlapping */}
      {showWarningIcon && (
        <div className="absolute -top-2 -left-3 z-30">
          <div className="relative group">
            <div className="bg-red-100 rounded-full p-1 border border-red-600 cursor-pointer">
              <AlertTriangleIcon className="size-3 text-red-600" />
            </div>
            {/* Tooltip - positioned to the right to avoid overflow clipping */}
            <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 hidden group-hover:block z-50 whitespace-nowrap">
              <div className="bg-red-100 text-red-600 text-xs rounded-md px-2 py-1.5 shadow-lg relative">
                Disruption detected: Loading delay
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
            step.iconColor === "text-yellow-600" && "text-yellow-700/80",
            step.iconColor === "text-orange-600" && "text-orange-700/80",
            step.iconColor === "text-green-600" && "text-green-700/80"
          )}
        >
          Planned
        </span>
        <span
          className={cn(
            "text-xs ",
            step.iconColor === "text-yellow-600" && "text-yellow-700/80",
            step.iconColor === "text-orange-600" && "text-orange-700/80",
            step.iconColor === "text-green-600" && "text-green-700/80"
          )}
        >
          {plannedDate}
        </span>
      </div>
      <div className="flex flex-col justify-between h-full items-center py-1">
        <div className="flex items-center gap-0.5">
          <Icon className={cn("size-3", step.iconColor)} />
          <span
            className={cn(
              "text-sm font-semibold",
              step.iconColor === "text-yellow-600" && "text-yellow-700",
              step.iconColor === "text-orange-600" && "text-orange-700",
              step.iconColor === "text-green-600" && "text-green-700"
            )}
          >
            {step.label}
          </span>
        </div>
        <span
          className={cn(
            "text-xs ",
            step.iconColor === "text-yellow-600" && "text-yellow-700/80",
            step.iconColor === "text-orange-600" && "text-orange-700/80",
            step.iconColor === "text-green-600" && "text-green-700/80"
          )}
        >
          {distance ? distance : "24 KM"}
        </span>
      </div>
      <div className="flex flex-col justify-between h-full items-end py-1">
        <span
          className={cn(
            "text-xs font-bold",
            showWarningIcon && "text-red-600",
            !showWarningIcon &&
              step.iconColor === "text-yellow-600" &&
              "text-yellow-700/80",
            !showWarningIcon &&
              step.iconColor === "text-orange-600" &&
              "text-orange-700/80",
            !showWarningIcon &&
              step.iconColor === "text-green-600" &&
              "text-green-700/80"
          )}
        >
          Est.
        </span>

        <span
          className={cn(
            "text-xs ",
            showWarningIcon && "text-red-600",
            !showWarningIcon &&
              step.iconColor === "text-yellow-600" &&
              "text-yellow-700/80",
            !showWarningIcon &&
              step.iconColor === "text-orange-600" &&
              "text-orange-700/80",
            !showWarningIcon &&
              step.iconColor === "text-green-600" &&
              "text-green-700/80"
          )}
        >
          {estFinishAt}
        </span>
      </div>
    </div>
  );
}
