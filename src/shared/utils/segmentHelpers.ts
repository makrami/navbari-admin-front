import type {Segment} from "../types/segmentData";
import {SEGMENT_STATUS} from "../../services/shipment/shipment.api.service";

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

export function computeSegmentNextPlace(segment: Segment): string | undefined {
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
