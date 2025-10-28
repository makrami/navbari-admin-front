import { cn } from "../../../../shared/utils/cn";
import {
  Truck,
  Car,
  LocateFixed,
  Sun,
  Check,
  UserRound,
  ChevronsRight,
  Stamp,
} from "lucide-react";

export type SegmentProgressStage =
  | "to_origin"
  | "in_origin"
  | "loading"
  | "to_dest"
  | "delivered"
  | "end";

type SegmentProgressProps = {
  className?: string;
  current: SegmentProgressStage;
};

const steps: Array<{ key: SegmentProgressStage; label: string }> = [
  { key: "to_origin", label: "To Origin" },
  { key: "in_origin", label: "In Origin" },
  { key: "loading", label: "Loading" },
  { key: "to_dest", label: "To Dest." },
  { key: "delivered", label: "Delivered" },
  { key: "end", label: "End" },
];

function StepIcon({ stage }: { stage: SegmentProgressStage }) {
  switch (stage) {
    case "to_origin":
      return <Truck className="size-[14px]" />;
    case "in_origin":
      return <Car className="size-[14px]" />;
    case "loading":
      return <LocateFixed className="size-[14px]" />;
    case "to_dest":
      return <Sun className="size-[14px]" />;
    case "delivered":
      return <Stamp className="size-[14px]" />;
    case "end":
      return <Check className="size-[14px]" />;
    default:
      return null;
  }
}

export function SegmentProgress({ className, current }: SegmentProgressProps) {
  const activeStages: SegmentProgressStage[] = [
    "to_origin",
    "in_origin",
    "loading",
    "to_dest",
  ];
  const hasActive = activeStages.includes(current);
  const activeIndex = hasActive
    ? steps.findIndex((s) => s.key === current)
    : -1;

  return (
    <div
      className={cn(
        " flex-1 min-w-0 flex items-center justify-center py-3 px-6",
        className
      )}
      data-name="Segment Progress"
    >
      {steps.map((step, index) => {
        const isEndStep = step.key === "end";
        const isSegmentCompleted = current === "delivered" || current === "end";
        const isCurrent = hasActive && index === activeIndex;
        const isDone = isSegmentCompleted
          ? !isEndStep
          : hasActive
          ? index < activeIndex
          : false;
        const isUpcoming = !isDone && !isCurrent;

        // Square step (done or upcoming)
        const square = (
          <div
            className={cn(
              "size-10 rounded-xl inline-flex items-center justify-center",
              // End step special coloring
              isEndStep
                ? isSegmentCompleted
                  ? "bg-green-50 text-green-600 ring-1 ring-green-100"
                  : "bg-slate-50 text-slate-400 ring-1 ring-slate-100"
                : undefined,
              // Regular steps
              !isEndStep &&
                isDone &&
                "bg-green-50 text-green-600 ring-1 ring-green-100",
              !isEndStep &&
                isUpcoming &&
                "bg-slate-50 text-slate-400 ring-1 ring-slate-100"
            )}
          >
            <StepIcon stage={step.key} />
          </div>
        );

        // Yellow info card for current step
        const currentCard = (
          <div className="inline-flex items-center gap-8 bg-yellow-50 text-amber-700 rounded-md py-1 px-3 ring-1 ring-amber-100">
            <div className="">
              <div className="text-xs font-semibold text-amber-700">
                Planned
              </div>
              <div className="text-xs text-amber-700/80">14 Aug - 03:45</div>
            </div>
            <div className="">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-700">
                <span>To Dest.</span>
                <UserRound className="size-4 text-amber-700" />
              </div>
              <div className="text-xs text-amber-700/80">34 KM</div>
            </div>
            <div className="">
              <div className="text-xs font-semibold text-red-600">
                Est. (GPS)
              </div>
              <div className="text-xs text-red-600">14 Aug - 03:45</div>
            </div>
          </div>
        );

        return (
          <div key={step.key} className="flex items-center">
            {isCurrent ? currentCard : square}
            {index < steps.length - 1 ? (
              <ChevronsRight
                className={cn(
                  "mx-2 size-4",
                  isSegmentCompleted
                    ? "text-green-500/60"
                    : index === activeIndex - 1
                    ? "text-amber-700"
                    : index < activeIndex - 1
                    ? "text-green-500/60"
                    : "text-slate-300"
                )}
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export default SegmentProgress;
