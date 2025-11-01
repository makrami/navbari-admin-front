import ReactCountryFlag from "react-country-flag";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import type { Shipment as DomainShipment } from "../../../shared/types/shipment";
import type { SegmentWithShipment } from "./SegmentCard";

type SegmentInfoBannerProps = {
  segment: SegmentWithShipment;
  shipment?: DomainShipment;
};

export function SegmentInfoBanner({
  segment,
  shipment,
}: SegmentInfoBannerProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Get origin from first segment's place, destination from shipment.destination or last segment
  const originCity = segment.place;
  const destinationCity =
    shipment?.destination ||
    segment.nextPlace ||
    t("segments.infoBanner.notSet");

  const handleShipmentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(
      `/shipments?selectedId=${segment.shipmentId}&segmentStep=${segment.step}`
    );
  };

  return (
    <div className="bg-blue-50 border border-[#1b54fe]/10 flex justify-between rounded-xl px-4 py-3">
      <div className="flex flex-1  items-center justify-between">
        {/* Left: Shipment Title and ID */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShipmentClick}
            className="font-semibold text-base text-[#1b54fe] hover:underline cursor-pointer"
          >
            {segment.shipmentTitle}
          </button>
          <span className="text-slate-400 text-sm">
            (#SH-{segment.shipmentId.slice(-4).toUpperCase()})
          </span>
        </div>

        {/* Center: Origin and Destination */}
        <div className="flex flex-1 items-center justify-end gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-gray-600">
              {t("segments.infoBanner.from")}
            </span>
            {shipment?.fromCountryCode && (
              <ReactCountryFlag
                svg
                countryCode={shipment.fromCountryCode}
                style={{ width: 18, height: 13, borderRadius: 2 }}
              />
            )}
            <span className="text-sm font-semibold text-gray-900">
              {originCity}
            </span>
          </div>
          <ArrowRight className="size-3.5 text-gray-400" />
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-gray-600">
              {t("segments.infoBanner.to")}
            </span>
            {shipment?.toCountryCode && (
              <ReactCountryFlag
                svg
                countryCode={shipment.toCountryCode}
                style={{ width: 18, height: 13, borderRadius: 2 }}
              />
            )}
            <span className="text-sm font-semibold text-gray-900">
              {destinationCity}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
