import {
  ChevronDown,
  ArrowRight,
  Check,
  MoreVertical,
  MapPinned,
  MessagesSquare,
  MapPin,
} from "lucide-react";
import { cn } from "../../../../shared/utils/cn";

type SegmentHeaderProps = {
  step: number;
  place: string;
  nextPlace?: string;
  isCompleted?: boolean;
  open: boolean;
  locked: boolean;
  isCurrent: boolean;
  distance?: string;
  avatarUrl?: string;
  assigneeName?: string;
  editable: boolean;
  headerId: string;
  onToggle: () => void;
  showCargoButton: boolean;
  onCargoClick: (e: React.MouseEvent) => void;
};

export default function SegmentHeader({
  step,
  place,
  nextPlace,
  isCompleted,
  open,
  locked,
  isCurrent,
  distance,
  avatarUrl,
  assigneeName,
  editable,
  headerId,
  onToggle,
  showCargoButton,
  onCargoClick,
}: SegmentHeaderProps) {
  return (
    <div
      id={headerId}
      className={cn(
        "w-full px-3 py-2.5 bg flex items-center justify-between",
        open && "bg-white",
        !open && editable && !locked && "bg-blue-100 rounded-xl",
        locked && "cursor-not-allowed opacity-60 bg-slate-50 rounded-xl"
      )}
      aria-controls={`segment-content-${step}`}
      role={locked ? undefined : "button"}
      aria-disabled={locked}
      onClick={locked ? undefined : onToggle}
    >
      <div className="flex items-center gap-2 min-w-0">
        <ChevronDown
          className={cn(
            "size-4 transition-transform",
            open ? "rotate-180" : "rotate-0",
            locked ? "text-slate-300" : "text-blue-600"
          )}
          aria-hidden="true"
        />
        <span
          className={cn("text-xs font-black", "text-slate-400", open && "")}
        >
          {!isCurrent ? `#${step}` : null}
          {isCurrent ? (
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-white bg-green-600  p-0.5">
                #{step}
              </span>
              <div className="flex flex-col items-center ">
                <span className="text-[8px] font-bold text-green-600 ">
                  CURRENT
                </span>
                <span className="text-[8px] font-bold text-green-600 ">
                  SEGMENT
                </span>
              </div>
            </div>
          ) : null}
        </span>
      </div>

      <div className="flex-1 flex items-center justify-center gap-2 min-w-0">
        <span className="text-sm font-bold text-slate-900 ">{place}</span>
        <ArrowRight className="size-3.5 text-slate-400" />
        <span className="text-sm font-bold text-slate-900 ">
          {nextPlace ? nextPlace : editable ? "NOT ASSIGNED" : "(DESTINATION)"}
        </span>
        {isCurrent ? (
          <div className="flex items-center gap-1">
            <MapPinned className="size-3.5 text-slate-300" />{" "}
            <span className="text-xs font-bold text-slate-400 ">
              {distance}
            </span>
          </div>
        ) : null}
        {isCompleted ? (
          <Check className="size-[14px] text-green-600 shrink-0" />
        ) : null}
      </div>

      <div className="flex items-center gap-3">
        {showCargoButton ? (
          <button
            type="button"
            className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-sm font-semibold"
            onClick={onCargoClick}
          >
            Cargo Declaration
          </button>
        ) : null}
        <div className="flex items-center gap-2">
          {avatarUrl ? (
            <img src={avatarUrl} alt="avatar" className="size-5 rounded-full" />
          ) : null}
          <span className="text-xs font-medium text-slate-900 ">
            {assigneeName}
          </span>
        </div>
        {isCurrent ? (
          <div className="flex items-center gap-2">
            <div className="bg-[#1B54FE]/10 rounded-md p-1.5">
              <MessagesSquare className="size-3.5 text-[#1B54FE]" />
            </div>
            <div className="bg-green-600/10 rounded-md p-1.5">
              <MapPin className="size-3.5 text-green-600" />
            </div>
          </div>
        ) : null}
        <MoreVertical className="size-5 text-slate-400" />
      </div>
    </div>
  );
}
