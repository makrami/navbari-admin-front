import type { Segment } from "./segmentData";

// UI-only enums for backward compatibility (not used for mapping, only for UI display)
export const SegmentAssignmentStatus = {
  UNASSIGNED: "UNASSIGNED",
  PENDING_ASSIGNMENT: "PENDING_ASSIGNMENT",
  ASSIGNED: "ASSIGNED",
  READY_TO_START: "READY_TO_START",
} as const;
export type SegmentAssignmentStatus =
  (typeof SegmentAssignmentStatus)[keyof typeof SegmentAssignmentStatus];

export const SegmentLogisticsStatus = {
  AT_ORIGIN: "AT_ORIGIN",
  IN_TRANSIT: "IN_TRANSIT",
  LOADING: "LOADING",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
} as const;
export type SegmentLogisticsStatus =
  (typeof SegmentLogisticsStatus)[keyof typeof SegmentLogisticsStatus];

/**
 * Base Shipment type matching the API response structure
 */
export const ShipmentStatus = {
  Pending: "Pending",
  InOrigin: "In Origin",
  Delivered: "Delivered",
  Loading: "Loading",
  InTransit: "In Transit",
  Customs: "Customs",
  Cancelled: "Cancelled",
} as const;
export type ShipmentStatus =
  (typeof ShipmentStatus)[keyof typeof ShipmentStatus];

/**
 * Shipment type matching the API response structure
 */
export type Shipment = {
  id: string;
  title: string;
  originCountry: string;
  originCity: string;
  destinationCountry: string;
  destinationCity: string;
  cargoType: string;
  cargoWeight: string;
  cargoDescription: string | null;
  status: ShipmentStatus | string;
  createdAt: string;
  updatedAt: string;
  // UI-specific fields
  fromCountryCode?: string;
  toCountryCode?: string;
  progressPercent?: number;
  source?: "api";
  segments?: Segment[];
  userName?: string;
  rating?: number;
  vehicle?: string;
  weight?: string;
  localCompany?: string;
  destination?: string;
  lastActivity?: string;
  lastActivityTime?: string;
  currentSegmentIndex?: number;
  isNew?: boolean;
};

export const isReadOnlySegment = (): boolean => false;
