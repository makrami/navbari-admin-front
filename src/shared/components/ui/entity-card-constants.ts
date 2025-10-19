export type EntityStatus = "pending" | "active" | "rejected" | "inactive";

export const STATUS_TO_COLOR: Record<EntityStatus, { bar: string; pill: string; pillText: string; }> = {
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
