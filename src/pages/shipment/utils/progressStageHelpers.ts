import type { Shipment } from "../../../shared/types/shipment";
import { SEGMENT_STATUS } from "../../../services/shipment/shipment.api.service";

/**
 * Maps shipment status to SegmentProgressStage
 */
export function getShipmentProgressStage(shipment: Shipment): SEGMENT_STATUS {
  const statusMap: Record<string, SEGMENT_STATUS> = {
    [SEGMENT_STATUS.PENDING_ASSIGNMENT]: "pending_assignment",
    [SEGMENT_STATUS.ASSIGNED]: "assigned",
    [SEGMENT_STATUS.TO_ORIGIN]: "to_origin",
    [SEGMENT_STATUS.AT_ORIGIN]: "at_origin",
    [SEGMENT_STATUS.LOADING]: "loading",
    [SEGMENT_STATUS.IN_CUSTOMS]: "in_customs",
    [SEGMENT_STATUS.TO_DESTINATION]: "to_destination",
    [SEGMENT_STATUS.AT_DESTINATION]: "at_destination",
    [SEGMENT_STATUS.DELIVERED]: "delivered",
    [SEGMENT_STATUS.CANCELLED]: "cancelled",
  };

  return statusMap[shipment.status as string] ?? "assigned";
}

/**
 * Maps shipment status to SegmentProgressStage for individual segments
 */
export function getSegmentProgressStage(
  shipment: Shipment,
  isCurrent: boolean
): SEGMENT_STATUS | undefined {
  // if (segmentIndex < shipment.currentSegmentIndex) {
  //   return "delivered";
  // }

  if (isCurrent) {
    const statusMap: Record<string, SEGMENT_STATUS> = {
      [SEGMENT_STATUS.PENDING_ASSIGNMENT]: "pending_assignment",
      [SEGMENT_STATUS.ASSIGNED]: "assigned",
      [SEGMENT_STATUS.TO_ORIGIN]: "to_origin",
      [SEGMENT_STATUS.AT_ORIGIN]: "at_origin",
      [SEGMENT_STATUS.LOADING]: "loading",
      [SEGMENT_STATUS.IN_CUSTOMS]: "in_customs",
      [SEGMENT_STATUS.TO_DESTINATION]: "to_destination",
      [SEGMENT_STATUS.AT_DESTINATION]: "at_destination",
      [SEGMENT_STATUS.DELIVERED]: "delivered",
      [SEGMENT_STATUS.CANCELLED]: "cancelled",
      // Legacy string mappings for backward compatibility
      Loading: "loading",
      "In Origin": "at_origin",
      Delivered: "delivered",
      "In Transit": "to_destination",
      Customs: "in_customs",
    };
    return statusMap[shipment.status as string] ?? undefined;
  }

  return undefined;
}
