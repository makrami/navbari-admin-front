import { Fragment } from "react";
import { cn } from "../../../../shared/utils/cn";
import { PROGRESS_STEPS_CONFIG } from "../config/progressSteps";
import { ProgressIconCard, ProgressActiveCard } from "./ProgressStepCards";
import { getChevronColor, getStepState } from "../utils/progressUtils";
import type { ProgressExtraField } from "../../utils/progressFlowHelpers";
import { ChevronsRightIcon } from "lucide-react";

export type SegmentProgressStage =
  | "start"
  | "to_origin"
  | "in_origin"
  | "loading"
  | "in_customs"
  | "to_dest"
  | "delivered";

type SegmentProgressProps = {
  className?: string;
  current: SegmentProgressStage;
  badge?: string;
  showWarningIcon?: boolean;
  dateTime?: string;
  distance?: string;
  plannedDate?: string;
  estFinishAt?: string;
  extraFields?: ProgressExtraField[];
};

export function SegmentProgress({
  className,
  current,
  badge,
  showWarningIcon = false,
  dateTime,
}: SegmentProgressProps) {
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
                plannedDate={step.plannedDate}
                estFinishAt={step.estFinishAt}
                distance={step.distance}
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
