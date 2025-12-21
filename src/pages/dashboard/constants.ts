export const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as
  | string
  | undefined;

export const STATUS_COLORS = {
  normal: "#1b54fe",
  pending: "#f59e0b",
  alert: "#ef4444",
} as const;
