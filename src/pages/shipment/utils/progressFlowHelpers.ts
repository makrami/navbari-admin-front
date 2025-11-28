import type {Shipment} from "../../../shared/types/shipment";
import type {Segment} from "../../../shared/types/segmentData";
import {SEGMENT_STATUS} from "../../../services/shipment/shipment.api.service";
export type ProgressExtraField = {
  label: string;
  value: string;
  textColor?: "red" | "green" | "default";
};

export type ProgressFlowData = {
  progressStage: SEGMENT_STATUS;
  badge?: string;
  showWarningIcon: boolean;
  dateTime: string;
  extraFields: ProgressExtraField[];
};

/**
 * Extracts progress flow data from current segment based on progress stage
 */
export function getProgressFlowData(
  progressStage: SEGMENT_STATUS,
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
    case SEGMENT_STATUS.PENDING_ASSIGNMENT:
      badge = "Pending";
      showWarningIcon = !segment?.isCompleted;
      break;
    case SEGMENT_STATUS.ASSIGNED:
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
    case SEGMENT_STATUS.TO_ORIGIN:
      badge = "Planned";
      showWarningIcon = !segment?.isCompleted;
      extraFields.push({label: "34 KM", value: ""});
      if (segment?.estimatedFinishTime) {
        extraFields.push({
          label: "Est. (GPS)",
          value: segment.estimatedFinishTime,
          textColor: "green",
        });
      }
      break;
    case SEGMENT_STATUS.AT_ORIGIN:
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
    case SEGMENT_STATUS.LOADING:
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
    case SEGMENT_STATUS.IN_CUSTOMS:
      badge = "Planned";
      if (segment?.estimatedFinishTime) {
        extraFields.push({
          label: "Est.",
          value: segment.estimatedFinishTime,
          textColor: "green",
        });
      }
      break;
    case SEGMENT_STATUS.TO_DESTINATION:
      badge = "Planned";
      extraFields.push({label: "34 KM", value: ""});
      if (segment?.estimatedFinishTime) {
        extraFields.push({
          label: "Est. (GPS)",
          value: segment.estimatedFinishTime,
          textColor: "green",
        });
      }
      break;
    case SEGMENT_STATUS.AT_DESTINATION:
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
    case SEGMENT_STATUS.DELIVERED:
      badge = "Planned";
      extraFields.push({label: "Click to Summary", value: ""});
      if (segment?.deliveredAt) {
        extraFields.push({
          label: "Delivered At",
          value: segment.deliveredAt ?? "",
          textColor: "red",
        });
      }
      break;
    case SEGMENT_STATUS.CANCELLED:
      badge = "Cancelled";
      showWarningIcon = true;
      break;
  }

  return {progressStage, badge, showWarningIcon, dateTime, extraFields};
}
