import type { Segment } from "../types/segmentData";
import { SEGMENT_STATUS } from "../../services/shipment/shipment.api.service";
import type { SegmentProgressStage } from "../../pages/shipment/segments/components/SegmentProgress";

/**
 * Computes UI fields from Segment
 * These are pure functions - no mapping, just computation
 */

export function computeSegmentPlace(segment: Segment): string {
  if (segment.place) return segment.place;
  if (segment.originCity && segment.originCountry) {
    return `${segment.originCity}, ${segment.originCountry}`;
  }
  return segment.originCity || segment.originCountry || "";
}

export function computeSegmentNextPlace(
  segment: Segment
): string | undefined {
  if (segment.nextPlace) return segment.nextPlace;
  if (segment.destinationCity && segment.destinationCountry) {
    return `${segment.destinationCity}, ${segment.destinationCountry}`;
  }
  return segment.destinationCity || segment.destinationCountry || undefined;
}

/**
 * Formats distanceKm to display string (e.g., "24 KM")
 */
export function formatDistance(
  distanceKm: number | null | undefined
): string | undefined {
  if (distanceKm === null || distanceKm === undefined) return undefined;
  return `${Math.round(distanceKm)} KM`;
}

export function computeIsCompleted(segment: Segment): boolean {
  if (segment.isCompleted !== undefined) return segment.isCompleted;
  return segment.status === SEGMENT_STATUS.DELIVERED;
}

export function computeHasDisruption(segment: Segment): boolean {
  if (segment.hasDisruption !== undefined) return segment.hasDisruption;
  return (
    segment.status === SEGMENT_STATUS.CANCELLED ||
    segment.status === SEGMENT_STATUS.AT_ORIGIN
  );
}

/**
 * Get progress stage from segment status (using backend enum directly)
 */
export function getProgressStageFromStatus(
  status: SEGMENT_STATUS,
  isCompleted: boolean
): SegmentProgressStage | undefined {
  if (isCompleted) return "delivered";

  switch (status) {
    case SEGMENT_STATUS.PENDING_ASSIGNMENT:
      return "pending_assignment";
    case SEGMENT_STATUS.ASSIGNED:
      return "assigned";
    case SEGMENT_STATUS.TO_ORIGIN:
      return "to_origin";
    case SEGMENT_STATUS.AT_ORIGIN:
      return "at_origin";
    case SEGMENT_STATUS.LOADING:
      return "loading";
    case SEGMENT_STATUS.IN_CUSTOMS:
      return "in_customs";
    case SEGMENT_STATUS.TO_DESTINATION:
      return "to_destination";
    case SEGMENT_STATUS.AT_DESTINATION:
      return "at_destination";
    case SEGMENT_STATUS.DELIVERED:
      return "delivered";
    case SEGMENT_STATUS.CANCELLED:
      return "cancelled";
    default:
      return undefined;
  }
}
