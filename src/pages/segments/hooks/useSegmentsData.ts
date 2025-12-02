import {useMemo} from "react";
import type {Shipment as DomainShipment} from "../../../shared/types/shipment";
import type {Segment} from "../../../shared/types/segmentData";
import type {FilterType} from "../components/SegmentsFilters";
import {SEGMENT_STATUS} from "../../../services/shipment/shipment.api.service";
import {
  computeSegmentPlace,
  computeSegmentNextPlace,
} from "../../../shared/utils/segmentHelpers";

export function useSegmentsData(
  serviceShipments: DomainShipment[] | null | undefined,
  filter: FilterType,
  searchQuery: string,
  extraSegments: Segment[] | undefined = []
) {
  // Convert shipments to segments with shipment context.
  // Show ALL segments (no assignment-status filter).
  const fromService = useMemo(() => {
    return (serviceShipments ?? []).flatMap((shipment: DomainShipment) => {
      const segments = shipment.segments || [];
      return segments.map((seg, idx) => {
        const allSegments = shipment.segments || [];
        const segmentIndex = allSegments.findIndex((s) => s.id === seg.id);
        const isCurrent = segmentIndex === shipment.currentSegmentIndex;
        const isCompleted = seg.status === SEGMENT_STATUS.DELIVERED;

        // Use helper functions to compute place and nextPlace
        const place = computeSegmentPlace(seg);
        const nextPlace =
          computeSegmentNextPlace(seg) ||
          (segmentIndex < allSegments.length - 1
            ? computeSegmentPlace(allSegments[segmentIndex + 1])
            : undefined);

        return {
          ...seg, // All fields from Segment
          step: seg.step ?? idx + 1,
          isCurrent,
          isCompleted,
          progressStage: seg.status as unknown as SEGMENT_STATUS,
          place,
          nextPlace,
          shipmentTitle: shipment.title,
          shipmentStatus: shipment.status,
          shipmentFromCountryCode: shipment.fromCountryCode,
          shipmentToCountryCode: shipment.toCountryCode,
        } as Segment;
      });
    });
  }, [serviceShipments]);

  const baseSegments = fromService;

  const allSegments: Segment[] = useMemo(() => {
    let segments: Segment[];

    if (!extraSegments?.length) {
      segments = baseSegments;
    } else {
      const byKey = new Map<string, Segment>();
      const keyOf = (segment: Segment) =>
        `${segment.shipmentId}::${segment.step ?? 0}`;

      baseSegments.forEach((segment) => {
        byKey.set(keyOf(segment), segment);
      });

      extraSegments.forEach((segment) => {
        byKey.set(keyOf(segment), segment);
      });

      segments = Array.from(byKey.values());
    }

    return segments;
  }, [baseSegments, extraSegments]);

  // Filter segments using SEGMENT_STATUS directly
  const filteredSegments = useMemo(() => {
    let filtered = allSegments;

    // Apply filter
    if (filter === "need-action") {
      filtered = filtered.filter((seg) => seg.needToAction);
    } else if (filter === "alert") {
      filtered = filtered.filter((seg) => seg.hasAlerts);
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (seg) =>
          seg.place?.toLowerCase().includes(query) ||
          seg.nextPlace?.toLowerCase().includes(query) ||
          seg.driverName?.toLowerCase().includes(query) ||
          seg.shipmentTitle?.toLowerCase().includes(query)
      );
    }

    // Sort segments based on active filter
    return [...filtered].sort((a, b) => {
      const aIsNeedAction = a.needToAction;
      const bIsNeedAction = b.needToAction;
      const aIsAlert = a.hasAlerts;
      const bIsAlert = b.hasAlerts;
      const aIsCompleted = Boolean(a.isCompleted);
      const bIsCompleted = Boolean(b.isCompleted);

      if (filter === "all") {
        // "All" filter: Need to Action first, then completed segments, then others
        if (aIsNeedAction && !bIsNeedAction) return -1;
        if (!aIsNeedAction && bIsNeedAction) return 1;
        if (!aIsNeedAction && !bIsNeedAction) {
          if (aIsCompleted && !bIsCompleted) return -1;
          if (!aIsCompleted && bIsCompleted) return 1;
        }
      } else if (filter === "need-action") {
        // "Need to Action" filter: Already filtered, maintain order (or sort by urgency if needed)
        // Keep original order for segments in the same category
      } else if (filter === "alert") {
        // "Alert" filter: Alert segments first, then others
        if (aIsAlert && !bIsAlert) return -1;
        if (!aIsAlert && bIsAlert) return 1;
        // Within alerts, prioritize by status severity if needed
        if (aIsAlert && bIsAlert) {
          // CANCELLED might be more urgent than AT_ORIGIN
          if (
            a.status === SEGMENT_STATUS.CANCELLED &&
            b.status !== SEGMENT_STATUS.CANCELLED
          )
            return -1;
          if (
            a.status !== SEGMENT_STATUS.CANCELLED &&
            b.status === SEGMENT_STATUS.CANCELLED
          )
            return 1;
        }
      }

      // Keep original order for segments in the same category
      return 0;
    });
  }, [allSegments, filter, searchQuery]);

  const needActionCount = useMemo(() => {
    return allSegments.filter(
      (seg) =>
        !seg.isCompleted &&
        (seg.status === SEGMENT_STATUS.PENDING_ASSIGNMENT ||
          seg.status === SEGMENT_STATUS.ASSIGNED)
    ).length;
  }, [allSegments]);

  const alertCount = useMemo(() => {
    return allSegments.filter(
      (seg) =>
        !seg.isCompleted &&
        (seg.status === SEGMENT_STATUS.CANCELLED ||
          seg.status === SEGMENT_STATUS.AT_ORIGIN)
    ).length;
  }, [allSegments]);

  return {
    allSegments,
    filteredSegments,
    needActionCount,
    alertCount,
  };
}
