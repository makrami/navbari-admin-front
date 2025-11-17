import type {SegmentProgressStage} from "../segments/components/SegmentProgress";
import type {Shipment} from "../../../shared/types/shipment";
import {SEGMENT_STATUS} from "../../../services/shipment/shipment.api.service";

/**
 * Maps shipment status to SegmentProgressStage
 */
export function getShipmentProgressStage(
  shipment: Shipment
): SegmentProgressStage {
  if (shipment.isNew) return "start";

  const statusMap: Record<string, SegmentProgressStage> = {
    [SEGMENT_STATUS.LOADING]: "loading",
    [SEGMENT_STATUS.AT_ORIGIN]: "in_origin",
    [SEGMENT_STATUS.DELIVERED]: "delivered",
    [SEGMENT_STATUS.TO_DESTINATION]: "to_dest",
    [SEGMENT_STATUS.IN_CUSTOMS]: "in_customs",
  };

  // If we have completed segments, determine stage based on status
  if (shipment.currentSegmentIndex && shipment.currentSegmentIndex > 0) {
    return statusMap[shipment.status as string] ?? "to_origin";
  }

  // If no segment is current (unassigned state), return start
  if (shipment.currentSegmentIndex && shipment.currentSegmentIndex < 0) {
    return "start";
  }

  // First segment - could be start or to_origin
  return statusMap[shipment.status as string] ?? "start";
}

/**
 * Maps shipment status to SegmentProgressStage for individual segments
 */
export function getSegmentProgressStage(
  shipment: Shipment,
  isCurrent: boolean
): SegmentProgressStage | undefined {
  if (shipment.isNew) return undefined;

  // If no segment is current (unassigned state), no segment should show progress
  if (shipment.currentSegmentIndex && shipment.currentSegmentIndex < 0) {
    return undefined;
  }

  // if (segmentIndex < shipment.currentSegmentIndex) {
  //   return "delivered";
  // }

  if (isCurrent) {
    const statusMap: Record<string, SegmentProgressStage> = {
      Loading: "loading",
      "In Origin": "in_origin",
      Delivered: "delivered",
      "In Transit": "to_dest",
      Customs: "in_customs",
    };
    return statusMap[shipment.status as string] ?? undefined;
  }

  return undefined;
}
