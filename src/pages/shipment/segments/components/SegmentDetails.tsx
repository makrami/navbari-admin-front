import { useMemo, useState, type ReactNode } from "react";
import SegmentProgress, { type SegmentProgressStage } from "./SegmentProgress";
import { cn } from "../../../../shared/utils/cn";
import {
  ChevronDown,
  Check,
  MoreVertical,
  Car,
  CalendarRange,
  Clock3,
  Building2,
  UserRoundIcon,
  ArrowRight,
} from "lucide-react";
import { InfoCard } from "../../../../shared/components/ui/InfoCard";
import FinancialSection from "./FinancialSection";
import DocumentsSection from "./DocumentsSection";
export type SegmentData = {
  step: number;
  place: string;
  datetime?: string;
  isCompleted?: boolean;
  progressStage?: SegmentProgressStage;
  isCurrent?: boolean;
  assigneeName?: string;
  assigneeAvatarUrl?: string;
  vehicleLabel?: string;
  startAt?: string;
  estFinishAt?: string;
  localCompany?: string;
  baseFeeUsd?: number;
  /** Title helper: start of the next segment (if any). If undefined, treated as destination. */
  nextPlace?: string;
  documents?: Array<{
    id: string | number;
    name: string;
    sizeLabel: string;
    status: "ok" | "error" | "info";
    author?: string;
    thumbnailUrl?: string;
  }>;
};

type DocumentItem = NonNullable<SegmentData["documents"]>[number];

type SegmentDetailsProps = {
  className?: string;
  data: SegmentData;
  defaultOpen?: boolean;
  children?: ReactNode;
  onToggle?: (open: boolean) => void;
};

export function SegmentDetails({
  className,
  data,
  defaultOpen = false,
  children,
  onToggle,
}: SegmentDetailsProps) {
  const [open, setOpen] = useState(defaultOpen);
  const { step, place } = data;
  const headerId = `segment-header-${step}`;

  const documents = useMemo<DocumentItem[]>(() => {
    if (data.documents && data.documents.length) return data.documents;
    // Fallback sample items
    return [
      {
        id: 1,
        name: "photo_af1.jpg",
        sizeLabel: "1.2MB",
        status: "ok" as const,
        author: data.assigneeName,
      },
      {
        id: 2,
        name: "photo_af2.jpg",
        sizeLabel: "1.2MB",
        status: "error" as const,
        author: data.assigneeName,
      },
      {
        id: 3,
        name: "photo_af3.jpg",
        sizeLabel: "1.3MB",
        status: "info" as const,
        author: data.assigneeName,
      },
      {
        id: 4,
        name: "photo_af4.jpg",
        sizeLabel: "1.2MB",
        status: "ok" as const,
        author: data.assigneeName,
      },
    ];
  }, [data.documents, data.assigneeName]);

  return (
    <div
      className={cn(
        "relative bg-white border-3 border-slate-200 rounded-[12px] shadow-[0_0_0_1px_rgba(99,102,241,0.04)]",
        className
      )}
      data-name="Segment Item"
    >
      <button
        type="button"
        id={headerId}
        className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-slate-50 transition-colors"
        aria-label={open ? "Collapse segment" : "Expand segment"}
        aria-expanded={open}
        aria-controls={`segment-content-${step}`}
        onClick={() => {
          setOpen((prev) => {
            const next = !prev;
            onToggle?.(next);
            return next;
          });
        }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <ChevronDown
            className={cn(
              "size-4 text-blue-600 transition-transform",
              open && "rotate-180"
            )}
          />
          <div className="flex items-center gap-3 min-w-0">
            {data.isCurrent ? (
              <div className="flex items-center gap-2 max-w-16">
                <span className="bg-green-600 text-white text-[12px] font-black leading-none px-1 py-1 rounded-[2px]">
                  #{step}
                </span>
                <span className="text-[8px] text-green-600 font-bold leading-none">
                  CURRENT SEGMENT
                </span>
              </div>
            ) : (
              <span className="text-[12px] text-slate-400 font-black">
                #{step}
              </span>
            )}
            <span className="text-sm font-medium text-slate-900 ">{place}</span>
            <ArrowRight className="size-3.5 text-slate-300" />
            <span className="text-sm text-slate-400 truncate">
              {data.nextPlace ? data.nextPlace : "(DESTINATION)"}
            </span>
            {data.isCompleted ? (
              <Check className="size-[14px] text-green-600 shrink-0" />
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {data.assigneeAvatarUrl ? (
            <span className="relative inline-flex items-center justify-center rounded-full bg-slate-200 size-4 overflow-hidden">
              <img
                alt=""
                src={data.assigneeAvatarUrl}
                className="block size-full object-cover"
              />
            </span>
          ) : (
            <span className="relative inline-flex items-center justify-center rounded-full bg-slate-200 size-4">
              <UserRoundIcon className="size-2.5 text-slate-500" />
            </span>
          )}

          {data.assigneeName ? (
            <span className="text-sm font-medium text-slate-900">
              {data.assigneeName}
            </span>
          ) : null}

          <MoreVertical className="size-5 text-slate-400" />
        </div>
      </button>

      {/* Expandable content container */}
      <div
        id={`segment-content-${step}`}
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-in-out",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
        aria-hidden={!open}
        role="region"
        aria-labelledby={headerId}
      >
        <div className={cn("overflow-hidden", open)}>
          <div className="px-3 py-3 grid gap-6">
            {/* Segment progress */}
            {children ? (
              <div>{children}</div>
            ) : data.progressStage ? (
              <SegmentProgress current={data.progressStage} />
            ) : null}

            {/* Info */}
            <div className="h-px bg-slate-100" />
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <InfoCard
                icon={<Car className="size-4 text-slate-400" />}
                title="Driver Vehicle"
                value={data.vehicleLabel ?? "Cargo Truck HD320"}
              />
              <InfoCard
                icon={<CalendarRange className="size-4 text-slate-400" />}
                title="Start"
                value={data.startAt ?? "13 Aug · 13:04"}
              />
              <InfoCard
                icon={<Building2 className="size-4 text-slate-400" />}
                title="Local Company"
                value={data.localCompany ?? "Sendm Co."}
              />
              <InfoCard
                icon={<Clock3 className="size-4 text-slate-400" />}
                title="Est. Finish"
                value={data.estFinishAt ?? "14 Aug · 03:45"}
              />
            </section>
            <div className="h-px bg-slate-100" />

            {/* Financial */}
            <FinancialSection />
            <div className="h-px bg-slate-100" />

            {/* Documents */}
            <DocumentsSection documents={documents} />
          </div>
        </div>
      </div>

      {/* Vertical spine notch overlay to visually connect to the left rail */}
      <div
        aria-hidden="true"
        className="absolute left-[26px] top-0 bottom-0 w-[12px] bg-slate-200 rounded-full -z-10"
      />

      {/* Current segment red dot indicator */}
      {data.isCurrent ? (
        <span
          aria-hidden="true"
          className="absolute -left-[4px] -top-1 -bg-conic-150  size-[10px] rounded-full bg-red-500 border-2 border-white"
        />
      ) : null}
    </div>
  );
}

export default SegmentDetails;
