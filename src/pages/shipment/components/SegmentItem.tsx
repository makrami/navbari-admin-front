import type { ShipmentData } from "../types/shipmentTypes";
import type { SegmentData } from "../segments/components/SegmentDetails";
import type { Shipment as DomainShipment } from "../../../shared/types/shipment";
import { getSegmentProgressStage } from "../utils/progressStageHelpers";
import SegmentDetails from "../segments/components/SegmentDetails";

type SegmentItemProps = {
  segment: ShipmentData["segments"][number];
  index: number;
  shipment: ShipmentData;
  selectedId: string;
  domainShipment: DomainShipment | undefined;
  renderSegments: ShipmentData["segments"];
  isReadOnly: boolean;
  segmentStep?: number;
  editedSegmentsByShipmentId: Record<string, ShipmentData["segments"]>;
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
  renderSegments,
  isReadOnly,
  segmentStep,
  editedSegmentsByShipmentId,
  onSegmentSave,
  onSegmentUpdate,
  onShipmentIsNewOverride,
  onUpdateShipment,
  timeoutsRef,
  open,
  onToggle,
}: SegmentItemProps) {
  const isCurrent =
    shipment.currentSegmentIndex >= 0 && index === shipment.currentSegmentIndex;
  const isCompleted = Boolean(segment.isCompleted);
  const prevCompleted =
    index > 0 ? Boolean(renderSegments[index - 1]?.isCompleted) : false;
  const isNewShipment = shipment.isNew === true;
  // Allow all segments to be editable when clicked - don't lock based on previous completion
  // Segments should be editable immediately when shipment is created
  const locked = false;

  const progressStage = getSegmentProgressStage(shipment, index, isCurrent);

  const nextPlace =
    segment.nextPlace ||
    (index < shipment.segments.length - 1
      ? shipment.segments[index + 1]?.place
      : undefined);

  const handleSave = (update: Partial<SegmentData>) => {
    onSegmentSave(shipment.id, segment.step, update);

    if (update.cargoCompanies?.length) {
      const chosenCompany = update.cargoCompanies[0];
      const chosenDriver = chosenCompany.drivers?.[0];

      // When a segment is assigned, update currentSegmentIndex to this segment's index
      // Only update if no segment is currently assigned (currentSegmentIndex < 0)
      // This ensures segments only become current after explicit assignment
      if (shipment.currentSegmentIndex < 0) {
        onUpdateShipment(shipment.id, { currentSegmentIndex: index });
      }

      const timeoutId = window.setTimeout(() => {
        onSegmentUpdate(shipment.id, index, {
          assigneeName:
            chosenDriver?.name ||
            renderSegments[index]?.driverName ||
            "Xin Zhao",
          assigneeAvatarUrl:
            chosenDriver?.avatarUrl || renderSegments[index]?.driverPhoto,
          cargoCompanies: undefined,
          isCompleted: true,
        });

        const updatedSegments =
          editedSegmentsByShipmentId[shipment.id] ?? shipment.segments;
        const anyPending = updatedSegments.some(
          (s) => s.cargoCompanies?.length
        );
        if (!anyPending) {
          onShipmentIsNewOverride(shipment.id, false);
        }
      }, 10000);
      timeoutsRef.current.push(timeoutId);
    }
  };

  // Mark segments in loading state as having a disruption
  const hasDisruption = progressStage === "loading";

  return (
    <SegmentDetails
      key={segment.step}
      data={{
        ...segment,
        assignmentStatus: domainShipment?.segments?.[index]?.assignmentStatus,
        logisticsStatus: domainShipment?.segments?.[index]?.logisticsStatus,
        isPlaceholder: shipment.isNew
          ? locked || segment.isPlaceholder
          : segment.isPlaceholder,
        isCurrent,
        isCompleted,
        assigneeName: segment.driverName,
        assigneeAvatarUrl: segment.driverPhoto,
        progressStage,
        nextPlace,
        estFinishAt: segment.estFinishAt,
        // Use distance from segment (mapped from backend distanceKm) or fallback to domainShipment
        distance:
          segment.distance ?? domainShipment?.segments?.[index]?.distance,
        hasDisruption,
      }}
      defaultOpen={segmentStep === segment.step}
      open={open}
      onToggle={onToggle}
      editable={
        !isReadOnly &&
        !segment.isCompleted &&
        !locked &&
        !segment.cargoCompanies?.length
      }
      locked={locked}
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
