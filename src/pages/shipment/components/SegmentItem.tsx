import type { Segment } from "../../../shared/types/segmentData";
import type {
  Shipment as DomainShipment,
  Shipment,
} from "../../../shared/types/shipment";
import SegmentDetails from "../segments/components/SegmentDetails";

type SegmentItemProps = {
  segment: Segment;
  index: number;
  shipment: Shipment;
  selectedId: string;
  domainShipment: DomainShipment | undefined;
  renderSegments: Segment[];
  isReadOnly: boolean;
  segmentStep?: number;
  editedSegmentsByShipmentId: Record<string, Segment[]>;
  onSegmentSave: (
    shipmentId: string,
    segmentStep: number,
    update: Partial<Segment>
  ) => void;
  onSegmentUpdate: (
    shipmentId: string,
    segmentIndex: number,
    update: Partial<Segment>
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
  isReadOnly,
  segmentStep,
  renderSegments,
  onSegmentSave,
  onToggle,
}: SegmentItemProps) {
  // Allow all segments to be editable when clicked - don't lock based on previous completion
  // Segments should be editable immediately when shipment is created

  const handleSave = (update: Partial<Segment>) => {
    onSegmentSave(shipment.id, segment.step ?? 0, update);

    if (update.cargoCompanies?.length) {
      // When a segment is assigned, update currentSegmentIndex to this segment's index
      // Only update if no segment is currently assigned (currentSegmentIndex < 0)
      // This ensures segments only become current after explicit assignment
      // Driver assignment should only come from backend API approval
      // Driver name and avatar will only be displayed after actual backend/company approval
    }
  };

  // Get previous segment
  const previousSegment = index > 0 ? renderSegments[index - 1] : undefined;

  return (
    <SegmentDetails
      key={segment.step}
      shipment={shipment}
      segmentId={segment.id}
      data={segment}
      previousSegment={previousSegment}
      defaultOpen={segmentStep === segment.step}
      onToggle={onToggle}
      editable={
        !isReadOnly && !segment.isCompleted && !segment.hasPendingAnnouncements
      }
      onSave={handleSave}
    />
  );
}
