import {Button} from "./Button";
import {cn} from "../../utils/cn";
import {
  Truck as TruckIcon,
  X as XIcon,
  Check as CheckIcon,
  ScanLine as ScanLineIcon,
  Calendar as CalendarIcon,
} from "lucide-react";
import {STATUS_TO_COLOR} from "./entity-card-constants";
import type {EntityStatus} from "./entity-card-constants";
import {useTranslation} from "react-i18next";
import {DriverInfo} from "../DriverInfo";

function EyeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z"
      />
      <circle cx="12" cy="12" r="3" strokeWidth="1.8" />
    </svg>
  );
}

export type EntityCardData = {
  id: string;
  name: string;
  logoUrl?: string;
  avatarUrl?: string;
  companyName?: string;
  vehicleTypes?: ("tented" | "refrigerated" | "flatbed" | "double_wall")[];
  vehicleType?: "tented" | "refrigerated" | "flatbed" | "double_wall";
  vehiclePlate?: string;
  vehicleCapacity?: number;
  lostShipments?: number;
  status: EntityStatus;
  country: string;
  city: string;
  countryCode: string;
  managerName: string;
  phone: string;
  numDrivers?: number;
  numShipments?: number;
  numActiveVehicles: number;
  lastActivity: string;
  rating?: number;
};

type Props = {
  entity: EntityCardData;
  selected?: boolean;
  className?: string;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onView?: (id: string) => void;
  // Customizable labels for different entity types
  statsLabels?: {
    driversLabel?: string;
    activeLabel?: string;
    lastActivityLabel?: string;
  };
  actionLabels?: {
    approveLabel?: string;
    rejectLabel?: string;
    viewLabel?: string;
    viewDetailsLabel?: string;
  };
};

export function EntityCard({
  entity,
  selected = false,
  className,
  onApprove,
  onReject,
  onView,
  actionLabels,
}: Props) {
  const {t} = useTranslation();
  const colors = STATUS_TO_COLOR[entity.status];

  const defaultActionLabels = {
    approveLabel: t("entityCard.actions.approve"),
    rejectLabel: t("entityCard.actions.reject"),
    viewLabel: t("entityCard.actions.view"),
    viewDetailsLabel: t("entityCard.actions.viewDetails"),
  };

  const finalActionLabels = {...defaultActionLabels, ...actionLabels};

  return (
    <div
      className={cn(
        "relative overflow-hidden p-2 rounded-2xl transition-shadow flex flex-col",
        selected ? "bg-[#1b54fe] text-white shadow" : "bg-white cursor-pointer",
        className
      )}
      aria-pressed={selected}
      role="button"
      tabIndex={0}
      onClick={() => onView?.(entity.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onView?.(entity.id);
        }
      }}
    >
      <div className={cn("h-1.5 rounded-full", `${colors.bar}`)} />

      <div className="p-4 space-y-3 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            {entity.avatarUrl ? (
              <img
                src={entity.avatarUrl}
                alt={t("entityCard.avatar")}
                className={cn("size-8 rounded-full object-cover flex-shrink-0")}
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-slate-200 grid place-items-center text-xs font-semibold flex-shrink-0"></div>
            )}
            <div className="flex flex-col gap-1 min-w-0">
              <DriverInfo
                driverName={entity.name}
                driverAvatarUrl={null}
                driverRating={entity.rating}
                showRating={true}
                avatarSize="sm"
                nameClassName={cn(
                  "font-semibold truncate",
                  selected ? "text-white" : "text-slate-900"
                )}
                showRatingBeforeName={false}
                selected={selected}
                className="gap-1.5"
              />
              <div
                className={cn(
                  "flex items-center justify-between text-sm",
                  selected ? "text-white" : "text-slate-900"
                )}
              >
                <div className="flex items-center gap-2">
                  {entity.logoUrl && (
                    <img
                      src={entity.logoUrl}
                      alt={t("entityCard.companyLogo")}
                      className="size-4 rounded object-cover"
                    />
                  )}
                  <span className="flex text-xs items-center gap-1 font-bold">
                    {entity.companyName || entity.name}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <span
            className={cn(
              "px-2 py-0.5 rounded-full text-[10px]",
              selected
                ? "bg-white/15 text-white"
                : `${colors.pill} ${colors.pillText}`
            )}
          >
            {t(`entityCard.status.${entity.status}`)}
          </span>
        </div>

        {/* Location & Manager */}

        <div
          className={cn("h-[0.5px]", selected ? "bg-blue-700" : "bg-slate-200")}
        />

        {/* Stats */}
        <div className={cn("flex flex-col gap-3 p-3 rounded-lg")}>
          {/* Top Row */}
          <div className="flex justify-between items-start gap-4">
            {/* Vehicle */}
            <div className="flex flex-col gap-1 flex-1">
              <div className="flex items-center gap-2">
                <TruckIcon
                  className={cn(
                    "size-3",
                    selected ? "text-white" : "text-slate-600"
                  )}
                />
                <span
                  className={cn(
                    "text-[10px] font-semibold uppercase tracking-wide",
                    selected ? "text-white/80" : "text-slate-600"
                  )}
                >
                  {t("entityCard.vehicle")}
                </span>
              </div>
              <span
                className={cn(
                  "text-xs  mt-0.5",
                  selected ? "text-white" : "text-slate-900"
                )}
              >
                {entity.vehicleType
                  ? t(`entityCard.vehicleType.${entity.vehicleType}`)
                  : t("entityCard.nA")}
              </span>
            </div>

            {/* Plate Number */}
            <div className="flex flex-col gap-1 flex-1">
              <div className="flex items-center gap-2">
                <ScanLineIcon
                  className={cn(
                    "size-3",
                    selected ? "text-white" : "text-slate-600"
                  )}
                />
                <span
                  className={cn(
                    "text-[10px] font-semibold uppercase tracking-wide",
                    selected ? "text-white/80" : "text-slate-600"
                  )}
                >
                  {t("entityCard.plateNumber")}
                </span>
              </div>
              <span
                className={cn(
                  "text-xs  mt-0.5",
                  selected ? "text-white" : "text-slate-900"
                )}
              >
                {entity.vehiclePlate || t("entityCard.nA")}
              </span>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="flex items-center gap-2">
            <CalendarIcon
              className={cn(
                "size-3",
                selected ? "text-white" : "text-slate-600"
              )}
            />
            <span
              className={cn(
                "text-[10px] font-semibold uppercase tracking-wide",
                selected ? "text-white/80" : "text-slate-600"
              )}
            >
              {t("entityCard.lostShipment")}:{" "}
              <span
                className={cn(
                  "font-medium",
                  selected ? "text-white" : "text-slate-900"
                )}
              >
                {entity.lostShipments && entity.lostShipments > 0
                  ? entity.lostShipments
                  : "-"}
              </span>
            </span>
          </div>
        </div>

        {/* Actions */}
        {entity.status === "pending" && onApprove && onReject ? (
          <div className="mt-auto pt-5 grid grid-cols-2 gap-2">
            <Button
              variant="ghost"
              className={cn(
                "!p-0 h-7 inline-flex items-center gap-1.5",
                selected
                  ? "bg-white/15 text-white hover:bg-white/20"
                  : "bg-green-600/20 hover:!bg-green-600/30 text-green-600"
              )}
              onClick={(e) => {
                e.stopPropagation();
                onApprove?.(entity.id);
              }}
            >
              {finalActionLabels.approveLabel}
              <CheckIcon className="size-3 " />
            </Button>
            <Button
              variant="ghost"
              className={cn(
                "h-7 !p-0 inline-flex items-center gap-1.5",
                selected
                  ? "bg-white/15 text-white hover:bg-white/20"
                  : "bg-red-600/20 hover:!bg-red-600/30 text-red-600"
              )}
              onClick={(e) => {
                e.stopPropagation();
                onReject?.(entity.id);
              }}
            >
              {finalActionLabels.rejectLabel}
              <XIcon className="size-3" />
            </Button>
          </div>
        ) : (
          <div className="mt-auto pt-2">
            <Button
              variant="ghost"
              className={cn(
                "!p-0 h-7 w-full inline-flex items-center justify-center gap-1.5",
                selected
                  ? "bg-white/15 text-white hover:bg-white/20"
                  : "bg-slate-100 hover:bg-slate-200"
              )}
              onClick={(e) => {
                e.stopPropagation();
                onView?.(entity.id);
              }}
            >
              {finalActionLabels.viewDetailsLabel}
              <EyeIcon className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
