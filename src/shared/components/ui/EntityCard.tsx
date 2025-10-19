import ReactCountryFlag from "react-country-flag";
import { Button } from "./Button";
import { cn } from "../../utils/cn";
import {
  User as UserIcon,
  Users as UsersIcon,
  Truck as TruckIcon,
  Clock as ClockIcon,
  Phone as PhoneIcon,
  X as XIcon,
  Check as CheckIcon,
} from "lucide-react";
import { STATUS_TO_COLOR } from "./entity-card-constants";
import type { EntityStatus } from "./entity-card-constants";

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
  statsLabels = {
    driversLabel: "drivers",
    activeLabel: "active",
    lastActivityLabel: "",
  },
  actionLabels = {
    approveLabel: "Approve",
    rejectLabel: "Reject",
    viewLabel: "View",
    viewDetailsLabel: "View Details",
  },
}: Props) {
  const colors = STATUS_TO_COLOR[entity.status];

  return (
    <div
      className={cn(
        "relative overflow-hidden p-2 rounded-2xl transition-shadow",
        selected ? "bg-[#1b54fe] text-white shadow" : "bg-white",
        className
      )}
      aria-pressed={selected}
    >
      <div className={cn("h-1.5 rounded-full", `${colors.bar}`)} />

      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            {entity.logoUrl ? (
              <img
                src={entity.logoUrl}
                alt="logo"
                className="h-8 w-8 rounded"
              />
            ) : (
              <div className="h-8 w-8 rounded bg-slate-200 grid place-items-center text-xs font-semibold"></div>
            )}
            <p
              className={cn(
                "font-semibold truncate",
                selected ? "text-white" : "text-slate-900"
              )}
            >
              {entity.name}
            </p>
          </div>
          <span
            className={cn(
              "px-2 py-0.5 rounded-full text-[10px]",
              selected
                ? "bg-white/15 text-white"
                : `${colors.pill} ${colors.pillText}`
            )}
          >
            {entity.status.charAt(0).toUpperCase() + entity.status.slice(1)}
          </span>
        </div>

        {/* Location & Manager */}
        <div
          className={cn(
            "flex items-center justify-between text-sm",
            selected ? "text-white" : "text-slate-900"
          )}
        >
          <div className="flex items-center gap-2">
            <ReactCountryFlag
              svg
              countryCode={entity.countryCode}
              style={{ width: 22, height: 16, borderRadius: 2 }}
            />
            <span className="flex text-xs items-center gap-1 font-bold">
              {entity.country} <span>/</span>{" "}
              <span className="font-normal">{entity.city}</span>
            </span>
          </div>
        </div>

        <div
          className={cn(
            "flex items-center justify-between gap-2 text-sm",
            selected ? "text-white/80" : "text-slate-600"
          )}
        >
          <span className="inline-flex items-center gap-2 text-xs">
            <UserIcon className="size-3" />
            {entity.managerName}
          </span>
          <div className="flex items-center gap-2">
            <PhoneIcon className="size-4" />
            <span
              className={cn(
                "text-mainBlue cursor-pointer select-none",
                selected ? "text-white" : "text-blue-600"
              )}
            >
              {entity.phone}
            </span>
          </div>
        </div>

        <div className=" h-[1px] bg-slate-100" />

        {/* Stats */}
        <div
          className={cn(
            "grid grid-cols-3 gap-2 text-xs",
            selected ? "text-white/80" : "text-slate-600"
          )}
        >
          <div className="flex items-center gap-2">
            <UsersIcon className="size-3" />
            <span>
              <span
                className={cn(
                  "text-xs font-medium",
                  selected ? "text-white" : "text-slate-900"
                )}
              >
                {entity.numDrivers ?? entity.numShipments ?? 0}
              </span>{" "}
              {statsLabels.driversLabel}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <TruckIcon className="size-3" />
            <span>
              <span
                className={cn(
                  "text-xs font-medium",
                  selected ? "text-white" : "text-slate-900"
                )}
              >
                {entity.numActiveVehicles}
              </span>{" "}
              {statsLabels.activeLabel}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ClockIcon className="size-3" />
            <span
              className={cn(
                "text-xs font-medium",
                selected ? "text-white" : "text-slate-900"
              )}
            >
              {entity.lastActivity}
            </span>
          </div>
        </div>

        {/* Actions */}
        {entity.status === "pending" ? (
          <div className="mt-5 grid grid-cols-3 gap-2">
            <Button
              variant="ghost"
              className={cn(
                "!p-0 h-7 inline-flex items-center gap-1.5",
                selected
                  ? "bg-white/15 text-white hover:bg-white/20"
                  : "bg-green-600/20 hover:!bg-green-600/30 text-green-600"
              )}
              onClick={() => onApprove?.(entity.id)}
            >
              {actionLabels.approveLabel}
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
              onClick={() => onReject?.(entity.id)}
            >
              {actionLabels.rejectLabel}
              <XIcon className="size-3" />
            </Button>
            <Button
              variant="ghost"
              className={cn(
                "!p-0 h-7 inline-flex items-center gap-1.5",
                selected
                  ? "bg-white/15 text-white hover:bg-white/20"
                  : "bg-slate-100 hover:bg-slate-200"
              )}
              onClick={() => onView?.(entity.id)}
            >
              {actionLabels.viewLabel}
              <EyeIcon className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="mt-2">
            <Button
              variant="ghost"
              className={cn(
                "!p-0 h-7 w-full inline-flex items-center justify-center gap-1.5",
                selected
                  ? "bg-white/15 text-white hover:bg-white/20"
                  : "bg-slate-100 hover:bg-slate-200"
              )}
              onClick={() => onView?.(entity.id)}
            >
              {actionLabels.viewDetailsLabel}
              <EyeIcon className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
