import {
  SegmentAssignmentStatus,
  SegmentLogisticsStatus,
} from "../types/shipment";
import { getIso2FromPlace } from "./geography";
import type { SegmentWithShipment } from "../../pages/segments/components/SegmentCard";
import type { DemoRoute } from "../data/demoRoutes";

export function segmentWithShipmentFromDemoRoute(
  route: DemoRoute
): SegmentWithShipment {
  const originIso2 = getIso2FromPlace(route.from);
  const destIso2 = getIso2FromPlace(route.to);
  const isCompleted = route.details.stateLabel
    .toLowerCase()
    .includes("delivered");

  const assignmentStatus =
    route.status === "pending"
      ? SegmentAssignmentStatus.READY_TO_START
      : route.status === "alert"
      ? SegmentAssignmentStatus.PENDING_ASSIGNMENT
      : SegmentAssignmentStatus.ASSIGNED;

  const logisticsStatus =
    route.status === "pending"
      ? SegmentLogisticsStatus.AT_ORIGIN
      : route.status === "alert"
      ? SegmentLogisticsStatus.CANCELLED
      : SegmentLogisticsStatus.IN_TRANSIT;

  return {
    step: 1,
    place: route.from,
    nextPlace: route.to,
    isCompleted,
    progressStage:
      route.status === "pending"
        ? "in_origin"
        : route.status === "normal"
        ? "to_dest"
        : undefined,
    shipmentId: route.id,
    shipmentTitle: route.details.shipmentTitle,
    shipmentStatus: route.details.stateLabel,
    shipmentFromCountryCode: originIso2 ?? undefined,
    shipmentToCountryCode: destIso2 ?? undefined,
    assigneeName: route.details.driverName,
    driverRating: route.details.driverRating,
    assignmentStatus,
    logisticsStatus,
  } satisfies SegmentWithShipment;
}

