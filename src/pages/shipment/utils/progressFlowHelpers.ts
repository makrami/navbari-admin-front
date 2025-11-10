import type { SegmentProgressStage } from "../segments/components/SegmentProgress";
import type { ShipmentData } from "../types/shipmentTypes";

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
  segment: ShipmentData["segments"][number] | undefined,
  shipment: ShipmentData
): ProgressFlowData {
  let badge: string | undefined;
  let showWarningIcon = false;
  const dateTime =
    segment?.datetime || shipment.lastActivityTime || "14 Aug - 03:45";
  const extraFields: ProgressExtraField[] = [];

  // Determine badge and extra fields based on progress stage
  switch (progressStage) {
    case "start":
      badge = "Planned";
      showWarningIcon = !segment?.isCompleted;
      if (segment?.startAt) {
        extraFields.push({
          label: "Started At",
          value: segment.startAt,
          textColor: "red",
        });
      }
      break;
    case "to_origin":
      badge = "Planned";
      showWarningIcon = !segment?.isCompleted;
      extraFields.push({ label: "34 KM", value: "" });
      if (segment?.estFinishAt) {
        extraFields.push({
          label: "Est. (GPS)",
          value: segment.estFinishAt,
          textColor: "green",
        });
      }
      break;
    case "in_origin":
      badge = "Planned";
      showWarningIcon = !segment?.isCompleted;
      if (segment?.startAt) {
        extraFields.push({
          label: "Start Shipment at",
          value: segment.startAt,
          textColor: "red",
        });
      }
      break;
    case "loading":
      badge = "Loading";
      showWarningIcon = !segment?.isCompleted;
      if (segment?.estFinishAt) {
        extraFields.push({
          label: "Est.",
          value: segment.estFinishAt,
          textColor: "red",
        });
      }
      break;
    case "in_customs":
      badge = "Planned";
      if (segment?.estFinishAt) {
        extraFields.push({
          label: "Est.",
          value: segment.estFinishAt,
          textColor: "green",
        });
      }
      break;
    case "to_dest":
      badge = "Planned";
      extraFields.push({ label: "34 KM", value: "" });
      if (segment?.estFinishAt) {
        extraFields.push({
          label: "Est. (GPS)",
          value: segment.estFinishAt,
          textColor: "green",
        });
      }
      break;
    case "delivered":
      badge = "Planned";
      extraFields.push({ label: "Click to Summary", value: "" });
      if (segment?.datetime) {
        extraFields.push({
          label: "Delivered At",
          value: segment.datetime,
          textColor: "red",
        });
      }
      break;
  }

  return { progressStage, badge, showWarningIcon, dateTime, extraFields };
}

