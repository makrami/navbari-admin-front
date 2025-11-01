import { useMemo } from "react";
import type { Shipment as DomainShipment } from "../../../shared/types/shipment";
import { SegmentAssignmentStatus } from "../../../shared/types/shipment";
import type { SegmentWithShipment } from "../components/SegmentCard";
import type { FilterType } from "../components/SegmentsFilters";
import type { SegmentProgressStage } from "../../shipment/segments/components/SegmentProgress";

export function useSegmentsData(
  serviceShipments: DomainShipment[] | null | undefined,
  filter: FilterType,
  searchQuery: string
) {
  // Convert all shipments to segments with shipment context
  // Only include assigned segments (ASSIGNED or READY_TO_START)
  const allSegments: SegmentWithShipment[] = useMemo(() => {
    if (!serviceShipments) return [];

    return serviceShipments.flatMap((shipment: DomainShipment) => {
      const assignedSegments = (shipment.segments || []).filter(
        (seg) =>
          seg.assignmentStatus === SegmentAssignmentStatus.ASSIGNED ||
          seg.assignmentStatus === SegmentAssignmentStatus.READY_TO_START
      );

      return assignedSegments.map((seg, idx) => {
        const allSegments = shipment.segments || [];
        const segmentIndex = allSegments.findIndex((s) => s === seg);
        const isCurrent = segmentIndex === shipment.currentSegmentIndex;
        const isCompleted = Boolean(seg.isCompleted);

        // Calculate progressStage based on shipment status and segment position
        let progressStage: SegmentProgressStage | undefined;
        if (!shipment.isNew) {
          if (segmentIndex < (shipment.currentSegmentIndex ?? 0)) {
            // All previous segments are fully delivered
            progressStage = "delivered";
          } else if (isCurrent) {
            // Current segment progress depends on shipment status
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

        // Determine nextPlace: if not set, use next segment's place, or undefined for destination
        const nextPlace =
          seg.nextPlace !== undefined &&
          seg.nextPlace !== null &&
          seg.nextPlace !== ""
            ? seg.nextPlace
            : segmentIndex < allSegments.length - 1
            ? allSegments[segmentIndex + 1]?.place
            : undefined; // undefined => Destination

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

    return filtered;
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

