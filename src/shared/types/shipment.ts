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

export type Segment = {
  id: string;
  assignmentStatus: SegmentAssignmentStatus;
  logisticsStatus?: SegmentLogisticsStatus;
  source: "demo-static" | "demo-sim" | "api";
  // Existing or future fields used by UI
  step?: number;
  place?: string;
  datetime?: string;
  isCompleted?: boolean;
  isPlaceholder?: boolean;
  nextPlace?: string;
  startAt?: string;
  estFinishAt?: string;
  distance?: string;
  vehicleLabel?: string;
  localCompany?: string;
  documents?: Array<{ id: string; name: string; url?: string }>;
  baseFeeUsd?: number;
  // Driver info used by cards/UI
  driverName?: string;
  driverPhoto?: string;
  driverRating?: number;
};

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
  lastActivity?: string;
  lastActivityTime?: string;
  currentSegmentIndex?: number;
  isNew?: boolean;
  source: "demo-static" | "demo-sim" | "api";
  segments: Segment[];
};

export const isReadOnlySegment = (segment: Segment): boolean =>
  segment.source === "demo-static";
