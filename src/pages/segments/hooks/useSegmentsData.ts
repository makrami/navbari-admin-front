import { useMemo } from "react";
import type { Shipment as DomainShipment } from "../../../shared/types/shipment";
import { SegmentAssignmentStatus } from "../../../shared/types/shipment";
import { DEMO_SHIPMENTS } from "../../shipment/data/demoShipments";
import type { SegmentWithShipment } from "../components/SegmentCard";
import type { FilterType } from "../components/SegmentsFilters";
import type { SegmentProgressStage } from "../../shipment/segments/components/SegmentProgress";

export function useSegmentsData(
  serviceShipments: DomainShipment[] | null | undefined,
  filter: FilterType,
  searchQuery: string,
  extraSegments: SegmentWithShipment[] | undefined = []
) {
  // Convert shipments to segments with shipment context.
  // Show ALL segments (no assignment-status filter). If service shipments are
  // unavailable, fall back to demo shipments to populate the list.
  const fromService = useMemo(() => {
    return (serviceShipments ?? []).flatMap((shipment: DomainShipment) => {
      const segments = shipment.segments || [];
      return segments.map((seg, idx) => {
        const allSegments = shipment.segments || [];
        const segmentIndex = allSegments.findIndex((s) => s === seg);
        const isCurrent = segmentIndex === shipment.currentSegmentIndex;
        const isCompleted = Boolean(seg.isCompleted);

        let progressStage: SegmentProgressStage | undefined;
        if (!shipment.isNew) {
          if (segmentIndex < (shipment.currentSegmentIndex ?? 0)) {
            progressStage = "delivered";
          } else if (isCurrent) {
            if (shipment.status === "Loading") {
              progressStage = "loading";
            } else if (shipment.status === "In Origin") {
              progressStage = "in_origin";
            } else if (shipment.status === "Delivered") {
              progressStage = "delivered";
            } else if (shipment.status === "In Transit") {
              progressStage = "to_dest";
            } else if (shipment.status === "Customs") {
              progressStage = "to_dest";
            }
          }
        }

        const nextPlace =
          seg.nextPlace !== undefined &&
          seg.nextPlace !== null &&
          seg.nextPlace !== ""
            ? seg.nextPlace
            : segmentIndex < allSegments.length - 1
            ? allSegments[segmentIndex + 1]?.place
            : undefined;

        return {
          step: seg.step ?? idx + 1,
          place: seg.place || "",
          datetime: seg.datetime || "",
          isCompleted,
          progressStage,
          nextPlace,
          startAt: seg.startAt,
          estFinishAt: seg.estFinishAt,
          vehicleLabel: seg.vehicleLabel,
          localCompany: seg.localCompany,
          baseFeeUsd: seg.baseFeeUsd,
          assigneeName: seg.driverName || "",
          assigneeAvatarUrl: seg.driverPhoto,
          driverRating: seg.driverRating ?? 0,
          assignmentStatus: seg.assignmentStatus,
          logisticsStatus: seg.logisticsStatus,
          documents: seg.documents?.map((doc) => ({
            id: doc.id,
            name: doc.name || "",
            sizeLabel: "1.2MB",
            status: "pending" as const,
            author: seg.driverName,
          })),
          shipmentId: shipment.id,
          shipmentTitle: shipment.title,
          shipmentStatus: shipment.status,
          shipmentFromCountryCode: shipment.fromCountryCode,
          shipmentToCountryCode: shipment.toCountryCode,
        };
      });
    });
  }, [serviceShipments]);

  const fallbackSegments = useMemo(() => {
    if (fromService.length > 0) return [] as SegmentWithShipment[];

    return DEMO_SHIPMENTS.flatMap((shipment) => {
      const segments = shipment.segments || [];
      return segments.map((seg, idx) => {
        const allSegments = shipment.segments || [];
        const segmentIndex = idx;
        const isCompleted = Boolean(seg.isCompleted);

        let progressStage: SegmentProgressStage | undefined;
        if (segmentIndex < (shipment.currentSegmentIndex ?? 0)) {
          progressStage = "delivered";
        } else if (segmentIndex === (shipment.currentSegmentIndex ?? 0)) {
          if (shipment.status === "Loading") progressStage = "loading";
          else if (shipment.status === "In Origin") progressStage = "in_origin";
          else if (shipment.status === "Delivered") progressStage = "delivered";
          else progressStage = "to_dest";
        }

        const nextPlace =
          segmentIndex < allSegments.length - 1
            ? allSegments[segmentIndex + 1]?.place
            : undefined;

        return {
          step: seg.step ?? idx + 1,
          place: seg.place || "",
          datetime: seg.datetime || "",
          isCompleted,
          progressStage,
          nextPlace,
          startAt: undefined,
          estFinishAt: undefined,
          vehicleLabel: undefined,
          localCompany: shipment.localCompany,
          baseFeeUsd: undefined,
          assigneeName: seg.driverName || "",
          assigneeAvatarUrl: seg.driverPhoto,
          driverRating: seg.driverRating ?? 0,
          assignmentStatus: SegmentAssignmentStatus.READY_TO_START,
          logisticsStatus: undefined,
          documents: [],
          shipmentId: shipment.id,
          shipmentTitle: shipment.title,
          shipmentStatus: shipment.status,
          shipmentFromCountryCode: shipment.fromCountryCode,
          shipmentToCountryCode: shipment.toCountryCode,
        };
      });
    });
  }, [fromService.length]);

  const baseSegments = fromService.length > 0 ? fromService : fallbackSegments;

  const allSegments: SegmentWithShipment[] = useMemo(() => {
    let segments: SegmentWithShipment[];
    
    if (!extraSegments?.length) {
      segments = baseSegments;
    } else {
      const byKey = new Map<string, SegmentWithShipment>();
      const keyOf = (segment: SegmentWithShipment) =>
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

  // Filter segments (all segments are already assigned, so filters adjust based on status)
  const filteredSegments = useMemo(() => {
    let filtered = allSegments;

    // Apply filter
    if (filter === "need-action") {
      filtered = filtered.filter(
        (seg) =>
          !seg.isCompleted &&
          seg.assignmentStatus === SegmentAssignmentStatus.READY_TO_START
      );
    } else if (filter === "alert") {
      filtered = filtered.filter(
        (seg) =>
          !seg.isCompleted &&
          seg.logisticsStatus &&
          ["CANCELLED", "AT_ORIGIN"].includes(seg.logisticsStatus)
      );
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (seg) =>
          seg.place.toLowerCase().includes(query) ||
          seg.nextPlace?.toLowerCase().includes(query) ||
          seg.assigneeName?.toLowerCase().includes(query) ||
          seg.shipmentTitle.toLowerCase().includes(query)
      );
    }

    // Sort segments based on active filter
    return [...filtered].sort((a, b) => {
      const aIsNeedAction = !a.isCompleted && a.assignmentStatus === SegmentAssignmentStatus.READY_TO_START;
      const bIsNeedAction = !b.isCompleted && b.assignmentStatus === SegmentAssignmentStatus.READY_TO_START;
      const aIsAlert = !a.isCompleted && a.logisticsStatus && ["CANCELLED", "AT_ORIGIN"].includes(a.logisticsStatus);
      const bIsAlert = !b.isCompleted && b.logisticsStatus && ["CANCELLED", "AT_ORIGIN"].includes(b.logisticsStatus);
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
          if (a.logisticsStatus === "CANCELLED" && b.logisticsStatus !== "CANCELLED") return -1;
          if (a.logisticsStatus !== "CANCELLED" && b.logisticsStatus === "CANCELLED") return 1;
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
        seg.assignmentStatus === SegmentAssignmentStatus.READY_TO_START
    ).length;
  }, [allSegments]);

  const alertCount = useMemo(() => {
    return allSegments.filter(
      (seg) =>
        !seg.isCompleted &&
        seg.logisticsStatus &&
        ["CANCELLED", "AT_ORIGIN"].includes(seg.logisticsStatus)
    ).length;
  }, [allSegments]);

  return {
    allSegments,
    filteredSegments,
    needActionCount,
    alertCount,
  };
}

