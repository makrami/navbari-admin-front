import type { SegmentProgressStage } from "../segments/components/SegmentProgress";
import type { Shipment } from "../../../shared/types/shipment";
import type { Segment } from "../../../shared/types/segmentData";
export type ProgressExtraField = {
  label: string;
  value: string;
  textColor?: "red" | "green" | "default";
};

export type ProgressFlowData = {
  progressStage: SegmentProgressStage;
  badge?: string;
  showWarningIcon: boolean;
  dateTime: string;
  extraFields: ProgressExtraField[];
};

/**
 * Extracts progress flow data from current segment based on progress stage
 */
export function getProgressFlowData(
  progressStage: SegmentProgressStage,
  segment: Segment | undefined,
  shipment: Shipment
): ProgressFlowData {
  let badge: string | undefined;
  let showWarningIcon = false;
  const dateTime =
    segment?.estimatedStartTime ||
    shipment.lastActivityTime ||
    "14 Aug - 03:45";
  const extraFields: ProgressExtraField[] = [];

  // Determine badge and extra fields based on progress stage
  switch (progressStage) {
    case "pending_assignment":
      badge = "Pending";
      showWarningIcon = !segment?.isCompleted;
      break;
    case "assigned":
      badge = "Planned";
      showWarningIcon = !segment?.isCompleted;
      if (segment?.startedAt) {
        extraFields.push({
          label: "Started At",
          value: segment.startedAt,
          textColor: "red",
        });
      }
      break;
    case "to_origin":
      badge = "Planned";
      showWarningIcon = !segment?.isCompleted;
      extraFields.push({ label: "34 KM", value: "" });
      if (segment?.estimatedFinishTime) {
        extraFields.push({
          label: "Est. (GPS)",
          value: segment.estimatedFinishTime,
          textColor: "green",
        });
      }
      break;
    case "at_origin":
      badge = "Planned";
      showWarningIcon = !segment?.isCompleted;
      if (segment?.startedAt) {
        extraFields.push({
          label: "Start Shipment at",
          value: segment.startedAt,
          textColor: "red",
        });
      }
      break;
    case "loading":
      badge = "Loading";
      showWarningIcon = !segment?.isCompleted;
      if (segment?.estimatedFinishTime) {
        extraFields.push({
          label: "Est.",
          value: segment.estimatedFinishTime,
          textColor: "red",
        });
      }
      break;
    case "in_customs":
      badge = "Planned";
      if (segment?.estimatedFinishTime) {
        extraFields.push({
          label: "Est.",
          value: segment.estimatedFinishTime,
          textColor: "green",
        });
      }
      break;
    case "to_destination":
      badge = "Planned";
      extraFields.push({ label: "34 KM", value: "" });
      if (segment?.estimatedFinishTime) {
        extraFields.push({
          label: "Est. (GPS)",
          value: segment.estimatedFinishTime,
          textColor: "green",
        });
      }
      break;
    case "at_destination":
      badge = "At Destination";
      showWarningIcon = !segment?.isCompleted;
      if (segment?.estimatedFinishTime) {
        extraFields.push({
          label: "Est.",
          value: segment.estimatedFinishTime,
          textColor: "green",
        });
      }
      break;
    case "delivered":
      badge = "Planned";
      extraFields.push({ label: "Click to Summary", value: "" });
      if (segment?.deliveredAt) {
        extraFields.push({
          label: "Delivered At",
          value: segment.deliveredAt ?? "",
          textColor: "red",
        });
      }
      break;
    case "cancelled":
      badge = "Cancelled";
      showWarningIcon = true;
      break;
  }

  return { progressStage, badge, showWarningIcon, dateTime, extraFields };
}
