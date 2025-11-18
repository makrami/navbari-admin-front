import { Fragment, useMemo } from "react";
import { cn } from "../../../../shared/utils/cn";
import { PROGRESS_STEPS_CONFIG } from "../config/progressSteps";
import { ProgressIconCard, ProgressActiveCard } from "./ProgressStepCards";
import { getChevronColor, getStepState } from "../utils/progressUtils";
import type { ProgressExtraField } from "../../utils/progressFlowHelpers";
import { ChevronsRightIcon } from "lucide-react";
import type { Segment } from "../../../../shared/types/segmentData";
import { formatDistance } from "../../../../shared/utils/segmentHelpers";
import type { SEGMENT_STATUS } from "../../../../services/shipment/shipment.api.service";

/**
 * Formats a date string to "DD MMM - HH:mm" format (e.g., "14 Aug - 03:45")
 */
function formatDateTime(dateString: string | null | undefined): string {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";

    const day = date.getDate();
    const month = date.toLocaleDateString("en-US", { month: "short" });
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
};

export function SegmentProgress({
  className,
  current,
  badge,
  showWarningIcon = false,
  dateTime,
  segment,
}: SegmentProgressProps) {
  // Compute date and distance values from segment data
  const { plannedDate, estFinishAt, distance } = useMemo(() => {
    if (segment) {
      return {
        plannedDate: formatDateTime(segment.estimatedStartTime),
        estFinishAt: formatDateTime(segment.estimatedFinishTime),
        distance:
          formatDistance(
            segment.distanceKm ? parseFloat(segment.distanceKm) : null
          ) || "",
      };
    }
    return {
      plannedDate: "",
      estFinishAt: "",
      distance: "",
    };
  }, [segment]);

  const activeIndex = PROGRESS_STEPS_CONFIG.findIndex((s) => s.key === current);
  const validIndex = activeIndex >= 0 ? activeIndex : 0;

  return (
    <div
      className={cn(
        "flex flex-1 b justify-between items-center w-full overflow-x-auto py-2 ",
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

        return (
          <Fragment key={step.key}>
            {/* Render stage card as independent element */}
            {isActive ? (
              <ProgressActiveCard
                step={step}
                badge={badge}
                showWarningIcon={showWarningIcon}
                dateTime={dateTime}
                plannedDate={plannedDate}
                estFinishAt={estFinishAt}
                distance={distance}
              />
            ) : (
              <ProgressIconCard
                Icon={Icon}
                isCompleted={isCompleted}
                isUpcoming={isUpcoming}
              />
            )}
            {/* Render chevron between stages, not attached to any stage */}
            {index < PROGRESS_STEPS_CONFIG.length - 1 && (
              <ChevronsRightIcon
                className={cn(
                  "size-3 flex-shrink-0 transition-colors",
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
