import ReactCountryFlag from "react-country-flag";
import { ArrowRight, UsersIcon } from "lucide-react";
import { cn } from "../../shared/utils/cn";
import imgAvatar from "../../assets/images/avatar.png";

export type ShipmentStatus =
  | "In Origin"
  | "Delivered"
  | "Loading"
  | "In Transit"
  | "Customs";

type ShipmentItemProps = {
  className?: string;
  title?: string;
  id?: string;
  status?: ShipmentStatus;
  fromCountryCode?: string; // ISO 3166-1 alpha-2, e.g., "CN"
  toCountryCode?: string; // ISO 3166-1 alpha-2, e.g., "RU"
  progressPercent?: number; // 0-100
  userName?: string;
  rating?: number;
  selected?: boolean;
  onClick?: () => void;
  segments?: {
    step: number;
    place: string;
    datetime: string; // e.g., 06/11 - 17:45
    isCompleted?: boolean;
  }[];
};

export function ShipmentItem({
  className,
  title = "Origin Shipment n.21",
  id = "#6c23m68",
  status = "In Origin",
  fromCountryCode = "CN",
  toCountryCode = "RU",
  progressPercent = 25,
  userName,
  selected = false,
  onClick,
  segments = [],
}: ShipmentItemProps) {
  const clampedProgress = Math.max(0, Math.min(100, progressPercent));
  const isDelivered = status === "Delivered";

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "text-left rounded-2xl p-4 shadow-sm transition-colors",
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
            {id}
          </p>
        </div>
        <div
          className={cn(
            "rounded-md px-2.5 py-2",
            isDelivered ? "bg-[#22c55e]/10" : "bg-[#CA8A04]/10"
          )}
        >
          <p
            className={cn(
              "text-sm font-semibold",
              isDelivered ? "text-[#22c55e]" : "text-yellow-600"
            )}
          >
            {status}
          </p>
        </div>
      </div>

      {/* Progress or Not Assigned */}
      {userName ? (
        <div className="mt-4 flex w-full items-center gap-2">
          <ReactCountryFlag
            svg
            countryCode={fromCountryCode}
            style={{ width: 22, height: 16, borderRadius: 2 }}
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
              style={{ width: `${clampedProgress}%` }}
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
            countryCode={toCountryCode}
            style={{ width: 22, height: 16, borderRadius: 2 }}
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
            Not Assigned
          </span>
        </div>
      )}
      {/* Divider */}
      <div
        className={cn("mt-4 h-px", selected ? "bg-white/20" : "bg-slate-100")}
      />

      {/* Expanded details (selected) */}
      <div className="mt-4 flex items-center justify-between">
        <div
          className={cn(
            "flex items-center gap-2",
            selected ? "text-white/80" : "text-slate-600"
          )}
        >
          <UsersIcon
            className={cn(
              "h-3.5 w-3.5",
              selected ? "text-white/70" : "text-slate-400"
            )}
          />
          {userName ? (
            <>
              <img
                src={imgAvatar}
                alt="Avatar"
                className="size-4 rounded-full"
              />
              <span
                className={cn(
                  "text-xs font-medium",
                  selected ? "text-white" : "text-slate-900"
                )}
              >
                {userName}
              </span>
            </>
          ) : null}
        </div>
      </div>
      {/* Segments timeline (selected) */}
      {selected && segments && segments.length > 0 && (
        <div className="mt-4 grid gap-3">
          {segments.map((seg, idx) => (
            <div
              key={`${seg.step}-${seg.place}`}
              className="grid grid-cols-[14px_1fr_auto] items-start gap-2"
            >
              {/* Timeline column */}
              <div className="relative flex justify-center">
                <div
                  className={cn(
                    "mt-0.5 h-2 w-2 rounded-full",
                    seg.isCompleted ? "bg-white" : "border border-white/80"
                  )}
                />
                {idx !== segments.length - 1 && (
                  <div className="absolute left-1/2 top-2 -translate-x-1/2 h-6 w-px bg-white/40" />
                )}
              </div>

              {/* Title column */}
              <div className="truncate text-xs text-white/90">
                <span className="font-medium">#{seg.step}</span> {seg.place}
              </div>

              {/* Date/time column */}
              <div className="text-[11px] text-white/80">{seg.datetime}</div>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
    </button>
  );
}
