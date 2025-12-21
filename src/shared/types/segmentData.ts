import type {CargoCompany} from "../../pages/shipment/components/CargoDeclarationModal";

/**
 * SegmentStatus - All possible segment status values
 */
export const SegmentStatus = {
  PENDING_ASSIGNMENT: "pending_assignment",
  ASSIGNED: "assigned",
  TO_ORIGIN: "to_origin",
  AT_ORIGIN: "at_origin",
  LOADING: "loading",
  IN_CUSTOMS: "in_customs",
  TO_DESTINATION: "to_destination",
  AT_DESTINATION: "at_destination",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
} as const;

export type SegmentStatusType =
  (typeof SegmentStatus)[keyof typeof SegmentStatus];

/**
 * Segment - Base interface matching the API response structure
 */
export interface Segment {
  id: string;
  shipmentId: string;
  order: number;
  companyId: string | null;
  driverId: string | null;
  driverName: string | null;
  driverAvatarUrl: string | null;
  shipmentWeight: string | null;
  originCountry: string | null;
  originCity: string | null;
  originLatitude?: number | null;
  originLongitude?: number | null;
  destinationCountry: string | null;
  destinationCity: string | null;
  destinationLatitude?: number | null;
  destinationLongitude?: number | null;
  status: SegmentStatusType | string;
  eta: string | null;
  currentLatitude: number | null;
  currentLongitude: number | null;
  lastGpsUpdate: string | null;
  startedAt: string | null;
  arrivedOriginAt: string | null;
  startLoadingAt: string | null;
  arrivedDestinationAt: string | null;
  deliveredAt: string | null;
  etaToOrigin: string | null;
  etaToDestination: string | null;
  estimatedStartTime: string | null;
  estimatedFinishTime: string | null;
  distanceKm: string | null;
  baseFee: string | null;
  companyName: string | null;
  shipmentTitle: string | null;
  vehicleType: string | null;
  contractAccepted: boolean;
  contractAcceptedAt: string | null;
  hasPendingAnnouncements: boolean;
  hasDisruption: boolean;
  createdAt: string;
  updatedAt: string;

  // UI-specific computed fields (optional)
  step?: number;
  isCurrent?: boolean;
  isPlaceholder?: boolean;

  // Computed location strings (for display)
  place?: string; // Computed from originCity + originCountry
  nextPlace?: string; // Computed from destinationCity + destinationCountry

  // UI display fields (from separate lookups)
  driverRating?: number;
  rating?: number | null;

  localCompany?: string;

  // Documents (from separate API)
  documents?: Array<{
    id: string | number;
    name: string;
    sizeLabel?: string;
    status: "pending" | "approved" | "rejected";
    author?: string;
    thumbnailUrl?: string;
    url?: string;
  }>;

  // Cargo companies (from separate API)
  cargoCompanies?: CargoCompany[];

  // Shipment context (optional, for segments displayed with shipment info)
  shipmentStatus?: string;
  shipmentFromCountryCode?: string;
  shipmentToCountryCode?: string;

  // Source indicator
  source?: "api";

  // Computed completion status
  isCompleted?: boolean; // Computed from status === SegmentStatus.DELIVERED

  //Summary information
  alertCount?: number;
  delaysInMinutes?: number;
  pendingDocuments?: number;
  needToAction?: boolean;
  hasAlerts?: boolean;
  alertMessage?: string;

  // Estimated values
  distanceToOrigin: number | null;
  initialEtaToOrigin: string | null;
  initialDistanceToOrigin: number | null;
  estLoadingCompletionTime: string | null;
  loadingCompletedAt: string | null;

  enterCustomsAt: string | null;
  customsClearedAt: string | null;

  estCustomsClearanceTime: string | null;
  durationOriginToDestination: number | null;
}
