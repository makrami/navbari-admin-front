import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Truck, ArrowRight } from "lucide-react";
import { cn } from "../../../shared/utils/cn";
import ReactCountryFlag from "react-country-flag";

type SegmentsAwaitingDriverModalProps = {
  open: boolean;
  onClose: () => void;
};

// Mock data for segments awaiting driver - based on image description
const MOCK_SEGMENTS_AWAITING_DRIVER = [
  {
    id: "SH-7563",
    title: "Electronic Shipment",
    shipmentId: "#SH-7563",
    origin: {
      step: "#3",
      city: "Hejiang",
      country: "China",
      countryCode: "CN",
    },
    destination: {
      city: "Ningxia",
      country: "China",
      countryCode: "CN",
    },
    status: "Awaiting Driver...",
    statusColor: "bg-[#CA8A041A]",
    textColor: "text-yellow-500",
  },
  {
    id: "SH-7564",
    title: "Electronic Shipment",
    shipmentId: "#SH-7564",
    origin: {
      step: "#2",
      city: "Beijing",
      country: "China",
      countryCode: "CN",
    },
    destination: {
      city: "Shanghai",
      country: "China",
      countryCode: "CN",
    },
    status: "Arriving Soon",
    statusColor: "bg-[#22C55E1A]",
    textColor: "text-green-500",
  },
  {
    id: "SH-7565",
    title: "Electronic Shipment",
    shipmentId: "#SH-7565",
    origin: {
      step: "#1",
      city: "Shenzhen",
      country: "China",
      countryCode: "CN",
    },
    destination: {
      city: "Guangzhou",
      country: "China",
      countryCode: "CN",
    },
    status: "Awaiting Driver...",
    statusColor: "bg-[#CA8A041A]",
    textColor: "text-yellow-500",
  },
];

export function SegmentsAwaitingDriverModal({
  open,
  onClose,
}: SegmentsAwaitingDriverModalProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

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
          "fixed left-[24%] top-[41%] -translate-y-1/2 z-[60] bg-black/50 w-full max-w-md rounded-3xl backdrop-blur-[50px] transition-all duration-300 ease-in-out flex flex-col",
          open
            ? "opacity-100 translate-x-0 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        )}
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow: "0px 4px 6px -4px #0000001A, 0px 10px 15px -3px #0000001A",
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="segments-modal-title"
      >
        {/* Segments List */}
        <div className="max-h-[60vh] overflow-y-auto  flex-1">
          <div className="space-y-3">
            {MOCK_SEGMENTS_AWAITING_DRIVER.map((segment, index) => (
              <div
                key={segment.id}
                className={cn(
                  "flex items-start gap-3 p-3 transition-colors cursor-pointer",
                  index !== MOCK_SEGMENTS_AWAITING_DRIVER.length - 1 &&
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
            ))}
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
