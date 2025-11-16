import { useMemo } from "react";
import type { Segment } from "../../../components/CargoMap";
import { useSegmentsData } from "../../segments/hooks/useSegmentsData";
import { getSegmentListId } from "../../segments/utils/getSegmentListId";
import {
  getCityCoordinates,
  getIso2FromPlace,
  toFlagEmojiFromIso2,
} from "../../../shared/utils/geography";
import { STATUS_COLORS } from "../constants";
import { seededCount } from "../utils";

type SegmentStatus = "pending" | "normal" | "alert";

export function useMapSegments(
  serviceShipments: any,
  statusFilter: Record<SegmentStatus, boolean>
) {
  const { allSegments } = useSegmentsData(serviceShipments ?? null, "all", "");

  // API segments
  const apiSegments = useMemo((): Segment[] => {
    return allSegments
      .map((segment): Segment | null => {
        const originCoords = getCityCoordinates(segment.place);
        const destCoords = getCityCoordinates(segment.nextPlace);
        if (!originCoords || !destCoords) return null;
        const segmentKey = getSegmentListId(segment.shipmentId, segment.step);
        const status: SegmentStatus = "normal";
        const originIso2 =
          getIso2FromPlace(segment.place) ||
          segment.shipmentFromCountryCode ||
          null;
        const destIso2 =
          getIso2FromPlace(segment.nextPlace) ||
          segment.shipmentToCountryCode ||
          null;
        const originFlag = toFlagEmojiFromIso2(originIso2);
        const destFlag = toFlagEmojiFromIso2(destIso2);
        return {
          color: STATUS_COLORS[status],
          path: [originCoords, destCoords] as readonly [number, number][],
          meta: {
            segmentKey,
            shipmentId: segment.shipmentId,
            step: segment.step,
            status,
            trucksCount: seededCount(segmentKey),
            originFlag: originFlag ?? "",
            destFlag: destFlag ?? "",
            originIso2: originIso2 ?? "",
            destIso2: destIso2 ?? "",
          },
        };
      })
      .filter((segment): segment is Segment => segment !== null);
  }, [allSegments]);

  const mapSegments = useMemo((): Segment[] => {
    const combined = [...apiSegments];
    return combined.filter((s) => {
      const st = (s.meta?.status as SegmentStatus | undefined) ?? "normal";
      return statusFilter[st];
    });
  }, [apiSegments, statusFilter]);

  return mapSegments;
}

