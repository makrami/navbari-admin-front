import type { ShipmentData } from "../types/shipmentTypes";
import type { SegmentData } from "../../../shared/types/segmentData";
import type { Shipment as DomainShipment } from "../../../shared/types/shipment";
import { getSegmentProgressStage } from "../utils/progressStageHelpers";
import SegmentDetails from "../segments/components/SegmentDetails";
import { SEGMENT_STATUS } from "../../../services/shipment/shipment.api.service";

type SegmentItemProps = {
  segment: SegmentData;
  index: number;
  shipment: ShipmentData;
  selectedId: string;
  domainShipment: DomainShipment | undefined;
  renderSegments: SegmentData[];
  isReadOnly: boolean;
  segmentStep?: number;
  editedSegmentsByShipmentId: Record<string, SegmentData[]>;
  onSegmentSave: (
    shipmentId: string,
    segmentStep: number,
    update: Partial<SegmentData>
  ) => void;
  onSegmentUpdate: (
    shipmentId: string,
    segmentIndex: number,
    update: Partial<SegmentData>
  ) => void;
  onShipmentIsNewOverride: (shipmentId: string, isNew: boolean) => void;
  onUpdateShipment: (shipmentId: string, update: Partial<ShipmentData>) => void;
  timeoutsRef: React.MutableRefObject<number[]>;
  open?: boolean;
  onToggle?: () => void;
};

export function SegmentItem({
  segment,
  index,
  shipment,
  domainShipment,
  isReadOnly,
  segmentStep,
  onSegmentSave,
  onUpdateShipment,
  onToggle,
}: SegmentItemProps) {
  console.log("segment", segment);
  const isCurrent =
    shipment.currentSegmentIndex >= 0 && index === shipment.currentSegmentIndex;
  const isCompleted = Boolean(segment.isCompleted);

  // Allow all segments to be editable when clicked - don't lock based on previous completion
  // Segments should be editable immediately when shipment is created

  const progressStage = getSegmentProgressStage(shipment, index, isCurrent);

  const isLastSegment = index === shipment.segments.length - 1;
  const nextPlace =
    segment.nextPlace ||
    (isLastSegment
      ? shipment.destination
      : index < shipment.segments.length - 1
      ? shipment.segments[index + 1]?.place
      : undefined);

  const handleSave = (update: Partial<SegmentData>) => {
    onSegmentSave(shipment.id, segment.step ?? 0, update);

    if (update.cargoCompanies?.length) {
      // When a segment is assigned, update currentSegmentIndex to this segment's index
      // Only update if no segment is currently assigned (currentSegmentIndex < 0)
      // This ensures segments only become current after explicit assignment
      if (shipment.currentSegmentIndex < 0) {
        onUpdateShipment(shipment.id, { currentSegmentIndex: index });
      }

      // Driver assignment should only come from backend API approval
      // Driver name and avatar will only be displayed after actual backend/company approval
    }
  };

  // Mark segments in loading state as having a disruption
  const hasDisruption = progressStage === "loading";

  // Get the domain segment which has all required SegmentReadDto fields
  const segmentByStep = domainShipment?.segments?.find(
    (s) => s.step === segment.step
  );
  const segmentByIdx = domainShipment?.segments?.[index];
  const domainSegment = segmentByStep || segmentByIdx;

  // For new segments without a domain segment, provide minimal required fields
  // SegmentReadDto requires: id, shipmentId, status, createdAt, updatedAt, contractAccepted
  const baseSegmentData: Partial<SegmentData> = domainSegment || {
    id: `temp-${segment.step}-${shipment.id}`,
    shipmentId: shipment.id,
    status: SEGMENT_STATUS.PENDING_ASSIGNMENT,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    contractAccepted: false,
    currentLatitude: null,
    currentLongitude: null,
  };

  return (
    <SegmentDetails
      key={segment.step}
      data={
        {
          // Start with domain segment (has all required SegmentReadDto fields like id, shipmentId, status, etc.)
          ...baseSegmentData,
          // Override with ShipmentData segment properties (UI-specific fields)
          ...segment,
          // Map field name differences
          startAt: segment.startAt ?? domainSegment?.estimatedStartTime,
          estFinishAt:
            segment.estFinishAt ?? domainSegment?.estimatedFinishTime,
          baseFee: domainSegment?.baseFee ?? null,
          distanceKm: segment.distance
            ? parseFloat((segment.distance as string).replace(/\s*KM\s*/i, ""))
            : domainSegment?.distanceKm ?? null,
          // Add UI-specific computed fields
          assignmentStatus: domainSegment?.assignmentStatus,
          logisticsStatus: domainSegment?.logisticsStatus,
          isPlaceholder: segment.isPlaceholder,
          isCurrent,
          isCompleted,
          assigneeName: segment.driverName,
          assigneeAvatarUrl: segment.driverPhoto,
          progressStage,
          nextPlace,
          hasDisruption,
          shipmentLinkProps: {
            shipmentTitle: shipment.title,
            shipmentId: shipment.id,
            fromPlace: shipment.originCity,
            fromCountryCode: shipment.originCountry,
            toPlace: shipment.destinationCity,
            toCountryCode: shipment.destinationCountry,
          },
        } as SegmentData
      }
      defaultOpen={segmentStep === segment.step}
      onToggle={onToggle}
      editable={
        !isReadOnly && !segment.isCompleted && !segment.hasPendingAnnouncements
      }
      segmentId={(() => {
        // Try to find segment by step number first (more reliable than index)
        const segmentByStep = domainShipment?.segments?.find(
          (s) => s.step === segment.step
        );
        // Fallback to index if step doesn't match
        const segmentByIdx = domainShipment?.segments?.[index];
        const matchedSegment = segmentByStep || segmentByIdx;
        const id = matchedSegment?.id;

        if (!id) {
          console.warn("SegmentItem: No segmentId found", {
            index,
            segmentStep: segment.step,
            domainShipmentId: domainShipment?.id,
            domainSegmentsCount: domainShipment?.segments?.length,
            domainSegmentSteps: domainShipment?.segments?.map((s, i) => ({
              index: i,
              id: s.id,
              step: s.step,
            })),
            foundByStep: !!segmentByStep,
            foundByIdx: !!segmentByIdx,
          });
        } else {
          console.log("SegmentItem: Found segmentId", {
            segmentId: id,
            segmentStep: segment.step,
            matchedBy: segmentByStep ? "step" : "index",
          });
        }
        return id;
      })()}
      onSave={handleSave}
    />
  );
}
