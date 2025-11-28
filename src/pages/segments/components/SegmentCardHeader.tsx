import {
  ChevronDown,
  ArrowRight,
  MoreVertical,
  Check,
  UserRound,
} from "lucide-react";
import {useTranslation} from "react-i18next";
import {cn} from "../../../shared/utils/cn";
import type {Shipment as DomainShipment} from "../../../shared/types/shipment";
import type {Segment} from "../../../shared/types/segmentData";
import SegmentProgress from "../../shipment/segments/components/SegmentProgress";
import {SEGMENT_STATUS} from "../../../services/shipment/shipment.api.service";
import {getFileUrl} from "../../LocalCompanies/utils";

type SegmentCardHeaderProps = {
  segment: Segment;
  shipment?: DomainShipment;
  isExpanded: boolean;
  onToggle: () => void;
  isHighlighted?: boolean;
};

export function SegmentCardHeader({
  segment,
  isExpanded,
  onToggle,
  isHighlighted = false,
}: SegmentCardHeaderProps) {
  const {t} = useTranslation();
  return (
    <div
      className={cn(
        "px-4 py-3 border-b border-slate-200 cursor-pointer select-none transition-colors",
        isHighlighted ? "bg-[#eef3ff]" : "bg-slate-50"
      )}
      onClick={onToggle}
      role="button"
      aria-expanded={isExpanded}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle();
        }
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            className="p-1 hover:bg-slate-100 rounded transition-colors"
          >
            <ChevronDown
              className={cn(
                "size-4 transition-transform text-slate-600",
                isExpanded ? "rotate-180" : ""
              )}
            />
          </button>
          <div className="flex flex-1 items-center justify-center gap-1 text-sm">
            <span className="text-slate-900 font-semibold">
              {segment.place}
            </span>
            <ArrowRight className="size-3.5 text-slate-400" />

            <span className="text-slate-900 font-semibold">
              {segment.nextPlace ||
                t("segments.cardHeader.destinationFallback")}
            </span>
            {segment.isCompleted &&
            segment.status === SEGMENT_STATUS.DELIVERED ? (
              <Check className="size-[14px] text-green-600 shrink-0" />
            ) : null}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {segment.driverName && (
            <>
              {segment.driverAvatarUrl ? (
                <img
                  src={getFileUrl(segment.driverAvatarUrl)}
                  alt={segment.driverName}
                  className="size-5 rounded-full"
                />
              ) : (
                <div className="size-5 rounded-full bg-slate-300 flex items-center justify-center">
                  <UserRound className="size-3 text-white fill-white" />
                </div>
              )}
              <span className="text-sm text-slate-900">
                {segment.driverName}
              </span>
            </>
          )}
          <div className="size-3 rounded-full bg-green-500 border-2 border-white" />
          <button
            type="button"
            onClick={(e) => e.stopPropagation()}
            className="p-1 hover:bg-slate-100 rounded transition-colors"
          >
            <MoreVertical className="size-4 text-slate-400" />
          </button>
        </div>
      </div>
      {segment.status && segment.status !== SEGMENT_STATUS.DELIVERED ? (
        <div className="px-4 pb-3 pt-2">
          <SegmentProgress
            current={segment.status as unknown as SEGMENT_STATUS}
          />
        </div>
      ) : null}
    </div>
  );
}
