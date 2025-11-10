import type { SegmentWithShipment } from "../components/SegmentCard";
import type { SegmentData } from "../../shipment/segments/components/SegmentDetails";
import type {
  SegmentAssignmentStatus,
  SegmentLogisticsStatus,
} from "../../../shared/types/shipment";

/**
 * Converts SegmentWithShipment to SegmentData format for use with SegmentDetails component
 */
export function convertSegmentWithShipmentToSegmentData(
  segment: SegmentWithShipment,
  allSegments: SegmentWithShipment[],
  currentSegmentIndex?: number
): SegmentData {
  const segmentIndex = allSegments.findIndex(
    (s) => s.shipmentId === segment.shipmentId && s.step === segment.step
  );
  const isCurrent = currentSegmentIndex !== undefined && segmentIndex === currentSegmentIndex;

  // Determine if segment has disruption based on logistics status
  const hasDisruption =
    segment.logisticsStatus === "CANCELLED" ||
    segment.logisticsStatus === "AT_ORIGIN" ||
    segment.progressStage === "loading";

  return {
    step: segment.step,
    place: segment.place,
    datetime: segment.datetime,
    isCompleted: segment.isCompleted,
    progressStage: segment.progressStage,
    isCurrent,
    isPlaceholder: false,
    assigneeName: segment.assigneeName,
    assigneeAvatarUrl: segment.assigneeAvatarUrl,
    vehicleLabel: segment.vehicleLabel,
    startAt: segment.startAt,
    estFinishAt: segment.estFinishAt,
    distance: undefined, // Can be added if available in SegmentWithShipment
    localCompany: segment.localCompany,
    baseFeeUsd: segment.baseFeeUsd,
    nextPlace: segment.nextPlace,
    hasDisruption,
    documents: segment.documents,
    cargoCompanies: undefined, // Not available in SegmentWithShipment
    assignmentStatus: segment.assignmentStatus as SegmentAssignmentStatus | undefined,
    logisticsStatus: segment.logisticsStatus as SegmentLogisticsStatus | undefined,
  };
}

