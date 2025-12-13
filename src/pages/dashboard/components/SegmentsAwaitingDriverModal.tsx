import {useEffect} from "react";
import {useTranslation} from "react-i18next";
import {useNavigate} from "react-router-dom";
import {Truck, ArrowRight} from "lucide-react";
import {cn} from "../../../shared/utils/cn";
import ReactCountryFlag from "react-country-flag";
import {useSegmentSummaries} from "../../../services/dashboard/hooks";
import {getCountryCode} from "../../../shared/utils/countryCode";
import type {SegmentSummaryType} from "../../../services/dashboard/dashboard.service";
import type {Segment} from "../../../shared/types/segmentData";

type SegmentsAwaitingDriverModalProps = {
  open: boolean;
  onClose: () => void;
  cardPosition: {top: number; left: number; width: number} | null;
  onSegmentClick?: (segmentId: string) => void;
  activeSegments?: Segment[];
};

type SegmentDisplay = {
  id: string;
  title: string;
  shipmentId: string;
  segmentOrder: number;
  status: string;
  textColor: string;
  statusColor: string;
  origin: {
    step: string;
    city: string;
    countryCode: string;
  };
  destination: {
    city: string;
    countryCode: string;
  };
};

function mapTypeToStatus(type: SegmentSummaryType): {
  status: string;
  textColor: string;
  statusColor: string;
} {
  switch (type) {
    case "arriving_soon":
      return {
        status: "Arriving Soon",
        textColor: "text-yellow-400",
        statusColor: "bg-yellow-400/20",
      };
    case "pending_driver_action":
      return {
        status: "Pending Action",
        textColor: "text-orange-400",
        statusColor: "bg-orange-400/20",
      };
    default:
      return {
        status: "Unknown",
        textColor: "text-slate-400",
        statusColor: "bg-slate-400/20",
      };
  }
}

export function SegmentsAwaitingDriverModal({
  open,
  onClose,
  cardPosition,
  onSegmentClick,
  activeSegments = [],
}: SegmentsAwaitingDriverModalProps) {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const {data: segmentSummaries = [], isLoading} = useSegmentSummaries();

  const segments: SegmentDisplay[] = segmentSummaries.map((summary) => {
    const statusInfo = mapTypeToStatus(summary.type);
    return {
      id: `${summary.shipmentId}-${summary.segmentOrder}`,
      title: summary.shipmentTitle,
      shipmentId: summary.shipmentId,
      segmentOrder: summary.segmentOrder,
      status: statusInfo.status,
      textColor: statusInfo.textColor,
      statusColor: statusInfo.statusColor,
      origin: {
        step: `Step ${summary.segmentOrder + 1}`,
        city: summary.segmentOriginCity,
        countryCode: getCountryCode(summary.segmentOriginCountry),
      },
      destination: {
        city: summary.segmentDestinationCity,
        countryCode: getCountryCode(summary.segmentDestinationCountry),
      },
    };
  });

  const handleSegmentClick = (segment: SegmentDisplay) => {
    // Find the matching segment from activeSegments
    // segmentOrder is 0-indexed, so we need to match with order (0-indexed) or step (1-indexed)
    const matchingSegment = activeSegments.find(
      (seg) =>
        seg.shipmentId === segment.shipmentId &&
        (seg.order === segment.segmentOrder ||
          (seg.step !== undefined && seg.step === segment.segmentOrder + 1))
    );

    if (matchingSegment && onSegmentClick) {
      onSegmentClick(matchingSegment.id);
      onClose();
    }
  };

  const handleShowAll = () => {
    onClose();
    navigate("/shipments");
  };

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-50 transition-opacity duration-300",
          open
            ? " opacity-100 pointer-events-auto"
            : "bg-transparent opacity-0 pointer-events-none"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className={cn(
          "fixed z-[60] bg-black/50 w-full max-w-md rounded-3xl backdrop-blur-[50px]  ease-in-out flex flex-col",
          open
            ? "opacity-100 translate-x-0 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        )}
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow: "0px 4px 6px -4px #0000001A, 0px 10px 15px -3px #0000001A",
          ...(cardPosition
            ? {
                top: `${cardPosition.top + 8}px`,
                left: `${cardPosition.left}px`,
              }
            : {
                left: "24%",
                top: "41%",
                transform: "translateY(-50%)",
              }),
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="segments-modal-title"
      >
        {/* Segments List */}
        <div className="max-h-[60vh] overflow-y-auto  flex-1">
          <div className="space-y-3">
            {isLoading ? (
              <div className="text-center py-8 text-slate-400">Loading...</div>
            ) : segments.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                No segments awaiting driver
              </div>
            ) : (
              segments.map((segment: SegmentDisplay, index: number) => (
                <div
                  key={segment.id}
                  onClick={() => handleSegmentClick(segment)}
                  className={cn(
                    "flex items-start gap-3 p-3 transition-colors cursor-pointer hover:bg-white/10",
                    index !== segments.length - 1 &&
                      "border-b-1 border-slate-600"
                  )}
                >
                  {/* Truck Icon */}
                  <div className="w-10 py-6 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 ">
                    <Truck className="w-6 h-6 text-white" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 flex-col min-w-0 flex items-start justify-between gap-1">
                    {/* Title and Status */}
                    <div className="flex-1 flex items-center justify-between w-full min-w-0">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-bold text-white">
                          {segment.title}
                        </span>
                        <span className="text-xs text-slate-400">
                          {segment.shipmentId}
                        </span>
                      </div>
                      {/* Status badge */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div
                          className={cn(
                            "flex items-center text-xs font-bold px-2 py-2 rounded-lg",
                            segment.textColor,
                            segment.statusColor
                          )}
                        >
                          {segment.status}
                        </div>
                      </div>
                    </div>
                    {/* Origin and Destination */}
                    <div className="flex items-center gap-2 w-full mt-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-slate-300">
                          {segment.origin.step}
                        </span>
                        <span className="text-xs text-slate-300">
                          {segment.origin.city}
                        </span>
                        <ReactCountryFlag
                          countryCode={segment.origin.countryCode}
                          svg
                          style={{
                            width: "1rem",
                            height: "0.75rem",
                          }}
                        />
                      </div>
                      <ArrowRight className="w-3 h-3 text-slate-300" />
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-slate-300">
                          {segment.destination.city}
                        </span>
                        <ReactCountryFlag
                          countryCode={segment.destination.countryCode}
                          svg
                          style={{
                            width: "1rem",
                            height: "0.75rem",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <button
          onClick={handleShowAll}
          className="w-full bg-[#1B54FE] hover:bg-[#1B54FE]/80 text-sm text-white font-semibold py-3 px-4 rounded-b-3xl transition-colors"
        >
          {t("dashboard.kpiCards.segmentsAwaitingDriver.modal.showAll")}
        </button>
      </div>
    </>
  );
}
