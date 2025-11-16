import type { SegmentReadDto } from "../../services/shipment/shipment.api.service";
import type { SegmentProgressStage } from "../../pages/shipment/segments/components/SegmentProgress";
import type { CargoCompany } from "../../pages/shipment/components/CargoDeclarationModal";

/**
 * SegmentData - Extends SegmentReadDto with UI-specific computed fields only
 * Uses backend enums directly (SEGMENT_STATUS) - no mapping needed
 * Uses baseFee (not baseFeeUsd) and distanceKm (not distance) from API
 */
export type SegmentData = SegmentReadDto & {
  // UI-specific computed fields (optional)
  step?: number;
  isCurrent?: boolean;
  isPlaceholder?: boolean;
  progressStage?: SegmentProgressStage;
  hasDisruption?: boolean;

  // Computed location strings (for display)
  place?: string; // Computed from originCity + originCountry
  nextPlace?: string; // Computed from destinationCity + destinationCountry

  // UI display fields (from separate lookups)
  assigneeName?: string; // Driver name (from driverId lookup)
  assigneeAvatarUrl?: string; // Driver photo (from driverId lookup)
  driverName?: string; // Alias for assigneeName
  driverPhoto?: string; // Alias for assigneeAvatarUrl
  driverRating?: number;
  vehicleLabel?: string;
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
  shipmentTitle?: string;
  shipmentStatus?: string;
  shipmentFromCountryCode?: string;
  shipmentToCountryCode?: string;
  hasPendingAnnouncements?: boolean;

  // Source indicator
  source?: "api";

  // Computed completion status
  isCompleted?: boolean; // Computed from status === SEGMENT_STATUS.DELIVERED
};
