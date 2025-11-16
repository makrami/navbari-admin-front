import type { SegmentData } from "./segmentData";

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

export type Shipment = {
  id: string;
  title: string;
  status?: string; // legacy UI field; will remain for cards
  fromCountryCode?: string;
  toCountryCode?: string;
  progressPercent?: number;
  userName?: string;
  rating?: number;
  vehicle?: string;
  weight?: string;
  localCompany?: string;
  destination?: string;
  originCountry?: string;
  originCity?: string;
  destinationCountry?: string;
  destinationCity?: string;
  lastActivity?: string;
  lastActivityTime?: string;
  currentSegmentIndex?: number;
  isNew?: boolean;
  source: "api";
  segments: SegmentData[];
};

export const isReadOnlySegment = (): boolean => false;
