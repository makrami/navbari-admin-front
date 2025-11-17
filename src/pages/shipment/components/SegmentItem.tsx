import type {SegmentData} from "../../../shared/types/segmentData";
import type {
  Shipment as DomainShipment,
  Shipment,
} from "../../../shared/types/shipment";
import {getSegmentProgressStage} from "../utils/progressStageHelpers";
import SegmentDetails from "../segments/components/SegmentDetails";

type SegmentItemProps = {
  segment: SegmentData;
  index: number;
  shipment: Shipment;
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
  onUpdateShipment: (shipmentId: string, update: Partial<Shipment>) => void;
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
  const isCurrent =
    shipment.currentSegmentIndex &&
    shipment.currentSegmentIndex >= 0 &&
    index === shipment.currentSegmentIndex;
  const isCompleted = Boolean(segment.isCompleted);

  // Allow all segments to be editable when clicked - don't lock based on previous completion
  // Segments should be editable immediately when shipment is created

  const progressStage = getSegmentProgressStage(shipment, Boolean(isCurrent));

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
      if (shipment.currentSegmentIndex && shipment.currentSegmentIndex < 0) {
        onUpdateShipment(shipment.id, {currentSegmentIndex: index});
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

  return (
    <SegmentDetails
      key={segment.step}
      shipment={shipment}
      segmentId={segment.id}
      data={
        {
          // Override with ShipmentData segment properties (UI-specific fields)
          ...segment,
          // Map field name differences
          startedAt: segment.startedAt ?? domainSegment?.estimatedStartTime,
          finishedAt:
            segment.estimatedFinishTime ?? domainSegment?.estimatedFinishTime,
          baseFee: domainSegment?.baseFee ?? null,
          distanceKm: segment.distanceKm
            ? segment.distanceKm
            : domainSegment?.distanceKm ?? null,
          // Add UI-specific computed fields
          assignmentStatus: domainSegment?.status,
          logisticsStatus: domainSegment?.status,
          isPlaceholder: segment.isPlaceholder,
          isCurrent,
          isCompleted,
          assigneeName: segment.driverName,
          assigneeAvatarUrl: segment.driverPhoto,
          progressStage,
          nextPlace,
          hasDisruption,
        } as SegmentData
      }
      defaultOpen={segmentStep === segment.step}
      onToggle={onToggle}
      editable={
        !isReadOnly && !segment.isCompleted && !segment.hasPendingAnnouncements
      }
      onSave={handleSave}
    />
  );
}
