import ReactCountryFlag from "react-country-flag";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "../../../../shared/utils/cn";

type ShipmentLinkSectionProps = {
  shipmentTitle: string;
  shipmentId: string;
  fromPlace: string;
  toPlace?: string;
  fromCountryCode?: string;
  toCountryCode?: string;
  step: number;
  className?: string;
};

export function ShipmentLinkSection({
  shipmentTitle,
  shipmentId,
  fromPlace,
  toPlace,
  fromCountryCode,
  toCountryCode,
  step,
  className,
}: ShipmentLinkSectionProps) {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/shipments?selectedId=${shipmentId}&segmentStep=${step}`);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "w-full text-left bg-blue-50 border border-[#1b54fe]/10 flex justify-between items-center rounded-xl px-4 py-3 hover:bg-blue-100 transition-colors cursor-pointer",
        className
      )}
    >
      <div className="flex flex-1 items-center justify-between gap-4">
        {/* Left: Shipment Title and ID */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-semibold text-base text-[#1b54fe] truncate">
            {shipmentTitle}
          </span>
          <span className="text-slate-400 text-sm whitespace-nowrap">
            (#SH-{shipmentId.slice(-4).toUpperCase()})
          </span>
        </div>

        {/* Right: Origin and Destination */}
        {toPlace && (
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm text-gray-600">From</span>
              {fromCountryCode && (
                <ReactCountryFlag
                  svg
                  countryCode={fromCountryCode}
                  style={{ width: 18, height: 13, borderRadius: 2 }}
                />
              )}
              <span className="text-sm font-semibold text-gray-900">
                {fromPlace && fromPlace.trim() ? fromPlace : "NOT ASSIGNED"}
              </span>
            </div>
            <ArrowRight className="size-3.5 text-gray-400" />
            <div className="flex items-center gap-1.5">
              <span className="text-sm text-gray-600">To</span>
              {toCountryCode && (
                <ReactCountryFlag
                  svg
                  countryCode={toCountryCode}
                  style={{ width: 18, height: 13, borderRadius: 2 }}
                />
              )}
              <span className="text-sm font-semibold text-gray-900">
                {toPlace}
              </span>
            </div>
          </div>
        )}
      </div>
    </button>
  );
}
