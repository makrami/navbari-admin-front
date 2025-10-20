export type DriverStatus = "pending" | "active" | "rejected" | "inactive";


export type Driver = {
  id: string;
  name: string;
  avatarUrl?: string; // optional, will fallback to initials badge
  status: DriverStatus;
  country: string; // country name
  city: string;
  countryCode: string; // ISO 3166-1 alpha-2 (e.g., "CN")
  managerName: string;
  phone: string;
  numShipments: number;
  numActiveVehicles: number;
  lastActivity: string; // humanized e.g., "2d ago"
};

export const STATUS_TO_COLOR: Record<DriverStatus, { bar: string; pill: string; pillText: string; }> = {
  pending: {
    bar: "bg-amber-300",
    pill: "bg-amber-100",
    pillText: "text-amber-700",
  },
  active: {
    bar: "bg-emerald-300",
    pill: "bg-emerald-100",
    pillText: "text-emerald-700",
  },
  rejected: {
    bar: "bg-rose-300",
    pill: "bg-rose-100",
    pillText: "text-rose-700",
  },
  inactive: {
    bar: "bg-slate-300",
    pill: "bg-slate-200",
    pillText: "text-slate-700",
  },
};
