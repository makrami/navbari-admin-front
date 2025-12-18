import ReactCountryFlag from "react-country-flag";
import {ArrowRight, UsersIcon} from "lucide-react";
import {cn} from "../../shared/utils/cn";
import type {Shipment} from "../../shared/types/shipment";
import type {Segment} from "../../shared/types/segmentData";
import {SegmentStatus} from "../../shared/types/segmentData";
import {getFileUrl} from "../../pages/LocalCompanies/utils";
import {getCountryCode} from "../../shared/utils/countryCode";
import {useTranslation} from "react-i18next";
import {DriverInfo} from "../../shared/components/DriverInfo";

type FormattedSegment = {
  step: number;
  place: string;
  datetime: string; // e.g., 06/11 - 17:45
  isCompleted?: boolean;
};

type ShipmentItemProps = Omit<Partial<Shipment>, "segments"> & {
  className?: string;
  fromCountryCode?: string; // ISO 3166-1 alpha-2, e.g., "CN" (maps to originCountry)
  toCountryCode?: string; // ISO 3166-1 alpha-2, e.g., "RU" (maps to destinationCountry)
  progressPercent?: number; // 0-100
  userName?: string;
  rating?: number;
  selected?: boolean;
  onClick?: () => void;
  segments?: FormattedSegment[]; // Formatted segments for display in timeline
  fullSegments?: Segment[]; // Full segment data for driver info extraction
  segmentsLoading?: boolean;
};

export function ShipmentItem({
  className,
  title,
  id,
  status,
  originCountry,
  destinationCountry,
  progressPercent = 25,
  userName,
  selected = false,
  onClick,
  segments = [],
  fullSegments = [],
  segmentsLoading = false,
}: ShipmentItemProps) {
  const {t} = useTranslation();
  const clampedProgress = Math.max(0, Math.min(100, progressPercent));
  const isDelivered = status === "Delivered";

  // Helper function to translate status
  const getTranslatedStatus = (status: string | undefined): string => {
    if (!status) return "";
    const statusMap: Record<string, string> = {
      Delivered: t("shipment.status.delivered"),
      Pending: t("shipment.status.pending"),
      "In Transit": t("shipment.status.inTransit"),
      Cancelled: t("shipment.status.cancelled"),
      "Pending Assignment": t("shipment.status.pendingAssignment"),
    };
    return statusMap[status] || status;
  };

  // Helper function to get status colors matching StatusFilterChips
  const getStatusColors = (status: string | undefined) => {
    switch (status) {
      case "Pending":
        return {
          bg: "bg-yellow-400/10",
          text: "text-yellow-700",
        };
      case "In Transit":
        return {
          bg: "bg-indigo-50",
          text: "text-indigo-700",
        };
      case "Delivered":
        return {
          bg: "bg-emerald-50",
          text: "text-emerald-700",
        };
      case "Cancelled":
        return {
          bg: "bg-red-50",
          text: "text-red-700",
        };
      default:
        return {
          bg: "bg-yellow-50",
          text: "text-yellow-700",
        };
    }
  };

  const statusColors = getStatusColors(status);

  // Convert country names to ISO country codes using library
  const fromCode = getCountryCode(originCountry ?? "");
  const toCode = getCountryCode(destinationCountry ?? "");

  // Find first in-progress segment (not completed, not cancelled, not pending_assignment)
  const inProgressSegment = fullSegments.find(
    (seg) =>
      seg.status !== SegmentStatus.DELIVERED &&
      seg.status !== SegmentStatus.CANCELLED &&
      seg.status !== SegmentStatus.PENDING_ASSIGNMENT &&
      !seg.isCompleted
  );

  // Extract driver info from first in-progress segment
  const driverName = inProgressSegment?.driverName || userName || null;
  const driverAvatarUrl = inProgressSegment?.driverAvatarUrl || undefined;
  const driverRating = inProgressSegment?.driverRating ?? null;

  return (
    <button
      type="button"
      onClick={onClick}
      dir="ltr"
      className={cn(
        "text-left rounded-2xl p-4 ",
        selected ? "bg-[#1b54fe] text-white" : "bg-white",
        className
      )}
      aria-pressed={selected}
      data-name="Shipment Item"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-xs leading-none flex flex-col gap-2">
          <p
            className={cn(
              "font-semibold",
              selected ? "text-white" : "text-slate-900"
            )}
          >
            {title}
          </p>
          <p className={cn(selected ? "text-white/70" : "text-slate-400")}>
            {id?.split("-").pop() ?? ""}
          </p>
        </div>
        <div className={cn("rounded-md px-2.5 py-2", statusColors.bg)}>
          <p className={cn("text-sm font-semibold", statusColors.text)}>
            {getTranslatedStatus(status)}
          </p>
        </div>
      </div>

      {/* Progress or Not Assigned */}
      {status !== "Pending Assignment" ? (
        <div className="mt-4 flex w-full items-center gap-2">
          <ReactCountryFlag
            svg
            countryCode={fromCode}
            style={{width: 22, height: 16, borderRadius: 2}}
          />
          <div
            className={cn(
              "h-[9px] flex-1 rounded-full",
              selected ? "bg-white/30" : "bg-slate-100"
            )}
          >
            <div
              className={cn(
                "h-[9px] rounded-full",
                isDelivered
                  ? "bg-[#22c55e]"
                  : selected
                  ? "bg-white"
                  : "bg-[#1b54fe]"
              )}
              style={{width: `${clampedProgress}%`}}
            />
          </div>
          <ArrowRight
            className={cn(
              "h-3.5 w-3.5",
              selected ? "text-white/60" : "text-slate-300"
            )}
          />
          <ReactCountryFlag
            svg
            countryCode={toCode}
            style={{width: 22, height: 16, borderRadius: 2}}
          />
        </div>
      ) : (
        <div className="mt-4 flex w-full items-center justify-center">
          <span
            className={cn(
              "text-xs font-medium",
              selected ? "text-white/80" : "text-slate-400"
            )}
          >
            {t("shipment.shipmentItem.notAssigned")}
          </span>
        </div>
      )}
      {/* Divider and expanded details (only when selected) */}
      {selected && (
        <>
          {/* Divider */}
          <div className="mt-4 h-px bg-white/20" />

          {/* Expanded details */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-white/80">
              <UsersIcon className="h-3.5 w-3.5 text-white/70" />
              {driverName ? (
                <DriverInfo
                  driverAvatarUrl={driverAvatarUrl ?? null}
                  driverName={driverName}
                  driverRating={driverRating}
                  avatarSize="sm"
                  nameClassName="text-xs font-medium text-white"
                  showRating={true}
                  selected={selected}
                  className="gap-2"
                />
              ) : null}
            </div>
          </div>
        </>
      )}
      {/* Segments timeline (selected) */}
      {selected && (
        <>
          {segmentsLoading ? (
            // Loading placeholder for segments
            <div className="mt-4 grid gap-3">
              {Array.from({length: 3}).map((_, idx) => (
                <div
                  key={`loading-${idx}`}
                  className="grid grid-cols-[14px_1fr_auto] items-start gap-2 animate-pulse"
                >
                  {/* Timeline column */}
                  <div className="relative flex justify-center">
                    <div className="mt-0.5 h-2 w-2 rounded-full bg-white/40" />
                    {idx !== 2 && (
                      <div className="absolute left-1/2 top-2 -translate-x-1/2 h-6 w-px bg-white/20" />
                    )}
                  </div>

                  {/* Title column */}
                  <div className="h-4 bg-white/20 rounded w-24" />

                  {/* Date/time column */}
                  <div className="h-3 bg-white/20 rounded w-16" />
                </div>
              ))}
            </div>
          ) : (
            segments &&
            segments.length > 0 && (
              <div className="mt-4 grid gap-3">
                {segments.map((seg: FormattedSegment, idx) => (
                  <div
                    key={`${seg.step}-${seg.place}`}
                    className="grid grid-cols-[14px_1fr_auto] items-start gap-2"
                  >
                    {/* Timeline column */}
                    <div className="relative flex justify-center">
                      <div
                        className={cn(
                          "mt-0.5 h-2 w-2 rounded-full",
                          seg.isCompleted
                            ? "bg-white"
                            : "border border-white/80"
                        )}
                      />
                      {idx !== segments.length - 1 && (
                        <div className="absolute left-1/2 top-2 -translate-x-1/2 h-6 w-px bg-white/40" />
                      )}
                    </div>

                    {/* Title column */}
                    <div className="truncate text-xs text-white/90">
                      <span className="font-medium">#{seg.step}</span>{" "}
                      {seg.place}
                    </div>

                    {/* Date/time column */}
                    <div className="text-[11px] text-white/80">
                      {seg.datetime}
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </>
      )}

      {/* Footer */}
    </button>
  );
}
