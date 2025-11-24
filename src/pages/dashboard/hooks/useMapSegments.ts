import {useMemo} from "react";
import {useSegmentsData} from "../../segments/hooks/useSegmentsData";
import {getCityCoordinates} from "../../../shared/utils/geography";

type SegmentStatus = "pending" | "normal" | "alert";

export function useMapSegments(
  serviceShipments: any,
  _statusFilter: Record<SegmentStatus, boolean>
) {
  const {allSegments} = useSegmentsData(serviceShipments ?? null, "all", "");

  // Filter segments and extract segmentIds
  const segmentIds = useMemo((): string[] => {
    return allSegments
      .filter((segment) => {
        const originCoords = getCityCoordinates(segment.place);
        const destCoords = getCityCoordinates(segment.nextPlace);
        if (!originCoords || !destCoords) return false;
        // For now, we'll include all segments that have valid coordinates
        // You can add status filtering here if needed
        return true;
      })
      .map((segment) => segment.id)
      .filter((id): id is string => !!id);
  }, [allSegments]);

  return segmentIds;
}
