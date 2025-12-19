import {Fragment, useMemo, useState} from "react";
import {cn} from "../../../../shared/utils/cn";
import {getProgressStepsConfig} from "../config/progressSteps";
import {ProgressIconCard, ProgressActiveCard} from "./ProgressStepCards";
import {getChevronColor, getStepState} from "../utils/progressUtils";
import type {ProgressExtraField} from "../../utils/progressFlowHelpers";
import {ChevronsRightIcon, AlertTriangleIcon} from "lucide-react";
import type {Segment} from "../../../../shared/types/segmentData";
import {SEGMENT_STATUS} from "../../../../services/shipment/shipment.api.service";
import {useTranslation} from "react-i18next";
import {formatDistance} from "../../../../shared/utils/segmentHelpers";

/**
 * Formats a date string to "DD MMM - HH:mm" format (e.g., "14 Aug - 03:45")
 */
function formatDateTime(dateString: string | null | undefined): string {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";

    const day = date.getDate();
    const month = date.toLocaleDateString("en-US", {month: "short"});
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");

    return `${day} ${month} - ${hours}:${minutes}`;
  } catch {
    return "";
  }
}

type SegmentProgressProps = {
  className?: string;
  current: SEGMENT_STATUS;
  badge?: string;
  showWarningIcon?: boolean;
  dateTime?: string;
  distance?: string;
  plannedDate?: string;
  estFinishAt?: string;
  extraFields?: ProgressExtraField[];
  segment?: Segment | null;
  onAlertClick?: () => void;
};

export function SegmentProgress({
  className,
  current,
  badge,
  showWarningIcon = false,
  dateTime,
  segment,
  onAlertClick,
}: SegmentProgressProps) {
  // Change hoveredIndex to "selectedIndex" and switch hover logic to click logic
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const {t} = useTranslation();
  const PROGRESS_STEPS_CONFIG = useMemo(() => getProgressStepsConfig(t), [t]);
  const activeIndex = PROGRESS_STEPS_CONFIG.findIndex((s) => s.key === current);
  const validIndex = activeIndex >= 0 ? activeIndex : 0;

  // Compute date and distance values from segment data based on selected or current status
  const {plannedDate, estFinishAt, distance} = useMemo(() => {
    if (segment) {
      // Determine which step config to use: selected step or current step
      const targetStepConfig =
        selectedIndex !== null
          ? PROGRESS_STEPS_CONFIG[selectedIndex]
          : PROGRESS_STEPS_CONFIG.find((step) => step.key === current);
      // Use validIndex when nothing is selected to get the correct state for the active step
      const targetIndex = selectedIndex !== null ? selectedIndex : validIndex;
      const selectedState = getStepState(targetIndex, validIndex);
      if (targetStepConfig) {
        // Use the value selectors from config if available
        const leftValue = targetStepConfig.getLeftValue
          ? targetStepConfig.getLeftValue(segment)
          : segment.estimatedStartTime;

        const leftValueCompleted = targetStepConfig.getLeftValueCompleted
          ? targetStepConfig.getLeftValueCompleted(segment)
          : segment.estimatedStartTime;

        const rightValue = targetStepConfig.getRightValue
          ? targetStepConfig.getRightValue(segment)
          : segment.estimatedFinishTime;

        const rightValueCompleted = targetStepConfig.getRightValueCompleted
          ? targetStepConfig.getRightValueCompleted(segment)
          : segment.estimatedFinishTime;

        const centerValue = targetStepConfig?.getCenterValue
          ? targetStepConfig.getCenterValue(segment)
          : undefined;

        return {
          plannedDate: formatDateTime(
            selectedState === "completed" ? leftValueCompleted : leftValue
          ),
          estFinishAt: formatDateTime(
            selectedState === "completed" ? rightValueCompleted : rightValue
          ),
          distance:
            formatDistance(centerValue ? parseFloat(centerValue) : null) || "",
        };
      }

      // Fallback to default values if no config found
      return {
        plannedDate: formatDateTime(segment.estimatedStartTime),
        estFinishAt: formatDateTime(segment.estimatedFinishTime),
        distance:
          formatDistance(
            segment.distanceKm
              ? parseFloat(segment.distanceKm?.toString() || "")
              : null
          ) || "",
      };
    }
    return {
      plannedDate: "",
      estFinishAt: "",
      distance: "",
    };
  }, [segment, current, selectedIndex, PROGRESS_STEPS_CONFIG]);

  // Get the last "active" step by default if nothing is selected
  // We keep the UI logic as: if something is selected, show details for selected.
  // If nothing is selected, show details for active.
  return (
    <div
      className={cn(
        "flex flex-1 b justify-between items-center w-full overflow-x-auto py-2 px-3",
        className
      )}
      data-name="Segment Progress"
    >
      {PROGRESS_STEPS_CONFIG.map((step, index) => {
        const state = getStepState(index, validIndex);
        const Icon = step.icon;
        const isActive = state === "active";
        const isCompleted = state === "completed";
        const isUpcoming = state === "upcoming";
        const isDelivered = current === SEGMENT_STATUS.DELIVERED;
        const isSelected = selectedIndex === index;
        // Only show details if: this step is selected, OR (nothing is selected and this is active)
        const shouldShowDetails =
          selectedIndex !== null ? isSelected : isActive;

        const handleAlertClick = (e: React.MouseEvent) => {
          e.stopPropagation();
          if (onAlertClick && segment?.alertMessage) {
            onAlertClick();
          }
        };

        // For the card, we use onClick to select/deselect
        // Clicking on the already selected card will deselect
        const handleStageClick = () => {
          setSelectedIndex((idx) => (idx === index ? null : index));
        };

        return (
          <Fragment key={step.key}>
            {/* Render stage card as independent element */}
            <div
              className={cn(
                "relative flex-shrink-0 transition-all duration-300 ease-in-out",
                shouldShowDetails ? "w-[300px]" : "w-12"
              )}
              style={{cursor: "pointer"}}
              onClick={handleStageClick}
              // remove onMouseEnter/onMouseLeave
            >
              {/* Alert icon positioned outside overflow-hidden container */}
              {showWarningIcon && isActive && shouldShowDetails && (
                <div className="absolute  -top-2 -left-3 z-20">
                  <div className="relative group">
                    <div
                      className="bg-red-100 rounded-full p-1 border border-red-600 cursor-pointer hover:bg-red-200 transition-colors"
                      onClick={handleAlertClick}
                      title={
                        segment?.alertMessage
                          ? t(
                              `shipment.segments.progress.alert.${segment.alertMessage}`
                            )
                          : undefined
                      }
                    >
                      <AlertTriangleIcon className="size-3 text-red-600" />
                    </div>
                    {/* Tooltip */}
                    {segment?.alertMessage && (
                      <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 hidden group-hover:block z-50 whitespace-nowrap">
                        <div className="bg-red-100 text-red-600 text-xs rounded-md px-2 py-1.5 shadow-lg relative">
                          {t(
                            `shipment.segments.progress.alert.${segment.alertMessage}`
                          )}
                          {/* Arrow pointing left */}
                          <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-b-[6px] border-r-[6px] border-transparent border-r-red-100" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              <div className="relative h-12 overflow-hidden">
                {/* Expanded card with details */}
                <div
                  className={cn(
                    "absolute inset-0 transition-all duration-300 ease-in-out z-10",
                    shouldShowDetails
                      ? "opacity-100 scale-100 translate-x-0 pointer-events-auto"
                      : "opacity-0 scale-95 -translate-x-2 pointer-events-none"
                  )}
                >
                  <ProgressActiveCard
                    step={step}
                    badge={badge}
                    showWarningIcon={false}
                    dateTime={dateTime}
                    plannedDate={plannedDate}
                    estFinishAt={estFinishAt}
                    distance={distance}
                    alertMessage={undefined}
                    onAlertClick={undefined}
                    isCompleted={isCompleted}
                    isUpcoming={isUpcoming}
                    isActive={isActive}
                    isDelivered={isDelivered}
                  />
                </div>
                {/* Icon card */}
                <div
                  className={cn(
                    "absolute inset-0 flex items-center justify-center transition-all duration-300 ease-in-out z-0",
                    shouldShowDetails
                      ? "opacity-0 scale-95 translate-x-2 pointer-events-none"
                      : "opacity-100 scale-100 translate-x-0 pointer-events-auto"
                  )}
                >
                  <ProgressIconCard
                    Icon={Icon}
                    isCompleted={isCompleted}
                    isUpcoming={isUpcoming}
                    isActive={isActive && !shouldShowDetails}
                    activeBgColor={isActive ? step.bgColor : undefined}
                    activeIconColor={isActive ? step.iconColor : undefined}
                  />
                </div>
              </div>
            </div>
            {/* Render chevron between stages, not attached to any stage */}
            {index < PROGRESS_STEPS_CONFIG.length - 1 && (
              <ChevronsRightIcon
                className={cn(
                  "size-3 flex-shrink-0 transition-colors duration-300",
                  getChevronColor(index, validIndex, PROGRESS_STEPS_CONFIG)
                )}
                data-name="Progress Chevron"
              />
            )}
          </Fragment>
        );
      })}
    </div>
  );
}

export default SegmentProgress;
