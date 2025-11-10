import type { SegmentProgressStage } from "../segments/components/SegmentProgress";
import type { ShipmentData } from "../types/shipmentTypes";

/**
 * Maps shipment status to SegmentProgressStage
 */
export function getShipmentProgressStage(
  shipment: ShipmentData
): SegmentProgressStage {
  if (shipment.isNew) return "start";

  const statusMap: Record<string, SegmentProgressStage> = {
    Loading: "loading",
    "In Origin": "in_origin",
    Delivered: "delivered",
    "In Transit": "to_dest",
    Customs: "in_customs",
  };

  // If we have completed segments, determine stage based on status
  if (shipment.currentSegmentIndex > 0) {
    return statusMap[shipment.status] ?? "to_origin";
  }
  
  // If no segment is current (unassigned state), return start
  if (shipment.currentSegmentIndex < 0) {
    return "start";
  }

  // First segment - could be start or to_origin
  return statusMap[shipment.status] ?? "start";
}

/**
 * Maps shipment status to SegmentProgressStage for individual segments
 */
export function getSegmentProgressStage(
  shipment: ShipmentData,
  segmentIndex: number,
  isCurrent: boolean
): SegmentProgressStage | undefined {
  if (shipment.isNew) return undefined;

  // If no segment is current (unassigned state), no segment should show progress
  if (shipment.currentSegmentIndex < 0) {
    return undefined;
  }

  if (segmentIndex < shipment.currentSegmentIndex) {
    return "delivered";
  }

  if (isCurrent) {
    const statusMap: Record<string, SegmentProgressStage> = {
      Loading: "loading",
      "In Origin": "in_origin",
      Delivered: "delivered",
      "In Transit": "to_dest",
      Customs: "in_customs",
    };
    return statusMap[shipment.status];
  }

  return undefined;
}

