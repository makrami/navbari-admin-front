import { cn } from "../../../../shared/utils/cn";
import { AlertTriangle } from "lucide-react";
import type { ProgressExtraField } from "../../utils/progressFlowHelpers";

type StepConfig = {
  iconColor: string;
};

type ProgressBadgeProps = {
  badge?: string;
  showWarningIcon: boolean;
  stepConfig: StepConfig;
};

export function ProgressBadge({
  badge,
  showWarningIcon,
  stepConfig,
}: ProgressBadgeProps) {
  if (!badge && !showWarningIcon) return null;

  return (
    <div className="flex items-center gap-1.5">
      {badge && (
        <span
          className={cn(
            "text-[10px] font-semibold uppercase tracking-wide",
            stepConfig.iconColor === "text-yellow-600" && "text-yellow-700",
            stepConfig.iconColor === "text-orange-600" && "text-orange-700",
            stepConfig.iconColor === "text-green-600" && "text-green-700"
          )}
        >
          {badge}
        </span>
      )}
      {showWarningIcon && <AlertTriangle className="size-3 text-red-500" />}
    </div>
  );
}

type ProgressExtraFieldsProps = {
  extraFields: ProgressExtraField[];
  stepConfig: StepConfig;
};

export function ProgressExtraFields({
  extraFields,
  stepConfig,
}: ProgressExtraFieldsProps) {
  if (extraFields.length === 0) return null;

  return (
    <div className="flex flex-col gap-1 mt-1">
      {extraFields.map((field, fieldIdx) => {
        // Special handling for "34 KM" - show as value only
        if (field.label === "34 KM" && !field.value) {
          return (
            <span
              key={fieldIdx}
              className={cn(
                "text-xs",
                stepConfig.iconColor === "text-yellow-600" &&
                  "text-yellow-700/80",
                stepConfig.iconColor === "text-orange-600" &&
                  "text-orange-700/80",
                stepConfig.iconColor === "text-green-600" && "text-green-700/80"
              )}
            >
              {field.label}
            </span>
          );
        }

        // Special handling for "Click to Summary" - make it look clickable
        if (field.label === "Click to Summary" && !field.value) {
          return (
            <span
              key={fieldIdx}
              className={cn(
                "text-xs cursor-pointer hover:underline",
                stepConfig.iconColor === "text-yellow-600" &&
                  "text-yellow-700/80",
                stepConfig.iconColor === "text-orange-600" &&
                  "text-orange-700/80",
                stepConfig.iconColor === "text-green-600" && "text-green-700/80"
              )}
            >
              {field.label}
            </span>
          );
        }

        return (
          <div key={fieldIdx} className="flex flex-col gap-0.5">
            <span
              className={cn(
                "text-[10px] font-medium",
                field.textColor === "red" && "text-red-600",
                field.textColor === "green" && "text-green-600",
                !field.textColor &&
                  stepConfig.iconColor === "text-yellow-600" &&
                  "text-yellow-700/70",
                !field.textColor &&
                  stepConfig.iconColor === "text-orange-600" &&
                  "text-orange-700/70",
                !field.textColor &&
                  stepConfig.iconColor === "text-green-600" &&
                  "text-green-700/70"
              )}
            >
              {field.label}
            </span>
            {field.value && (
              <span
                className={cn(
                  "text-xs",
                  field.textColor === "red" && "text-red-600",
                  field.textColor === "green" && "text-green-600",
                  !field.textColor &&
                    stepConfig.iconColor === "text-yellow-600" &&
                    "text-yellow-700/80",
                  !field.textColor &&
                    stepConfig.iconColor === "text-orange-600" &&
                    "text-orange-700/80",
                  !field.textColor &&
                    stepConfig.iconColor === "text-green-600" &&
                    "text-green-700/80"
                )}
              >
                {field.value}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
