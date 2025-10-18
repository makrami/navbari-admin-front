import { cn } from "../../../../shared/utils/cn";
import { Activity, UserRound, Loader, Truck, Check } from "lucide-react";

export type SegmentProgressStage =
  | "to_origin"
  | "in_origin"
  | "loading"
  | "to_dest"
  | "delivered";

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
];

function StepIcon({ stage }: { stage: SegmentProgressStage }) {
  switch (stage) {
    case "to_origin":
      return <Activity className="size-[14px]" />;
    case "in_origin":
      return <UserRound className="size-[14px]" />;
    case "loading":
      return <Loader className="size-[14px]" />;
    case "to_dest":
      return <Truck className="size-[14px]" />;
    case "delivered":
      return <Check className="size-[14px]" />;
    default:
      return null;
  }
}

export function SegmentProgress({ className, current }: SegmentProgressProps) {
  const currentIndex = steps.findIndex((s) => s.key === current);

  return (
    <div
      className={cn(
        "w-full flex-1 min-w-0  flex items-center justify-center  py-3",
        className
      )}
      data-name="Segment Progress"
    >
      {steps.map((step, index) => {
        const isDone = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isUpcoming = index > currentIndex;

        const chipClass = cn(
          "inline-flex items-center flex-1  justify-center  gap-1.5 rounded-lg px-3 py-2 text-xs ",

          isDone && "bg-green-50 text-green-600",
          isCurrent && "bg-yellow-50 text-yellow-600 d",
          isUpcoming && "bg-slate-50 text-slate-400"
        );

        // Connector lines connect directly to cards with no gap
        const connectorClass = cn(
          "h-0.5 flex-1 rounded-full",
          isDone && "bg-green-200",
          isCurrent && "bg-yellow-200",
          isUpcoming && "bg-slate-200"
        );

        return (
          <div key={step.key} className="flex items-center flex-1">
            <div className={chipClass}>
              <span>{step.label}</span>
              <StepIcon stage={step.key} />
            </div>
            {index < steps.length - 1 ? (
              <div className={connectorClass} aria-hidden="true" />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export default SegmentProgress;
