import { useMemo, useState, useEffect } from "react";
import { Segments } from "../segments/Segments";
import NavigatingInfo from "../details/components/NavigatingInfo";
import ActivitySection from "../Activity/components/ActivitySection";
import AddShipmentModal, {
  type AddShipmentInput as AddShipmentFormInput,
} from "./AddShipmentModal";
import { SegmentItem } from "./SegmentItem";
import { useSegmentScroll } from "../hooks/useSegmentScroll";
import type { ShipmentData } from "../types/shipmentTypes";
import type { Shipment as DomainShipment } from "../../../shared/types/shipment";
import type { SegmentData } from "../segments/components/SegmentDetails";

type ShipmentContentAreaProps = {
  selectedShipment: ShipmentData;
  selectedId: string;
  segmentStep?: number;
  showAddShipment: boolean;
  onCloseAddShipment: () => void;
  onCreateShipment: (data: AddShipmentFormInput) => void;
  onDeselect: () => void;
  editedSegmentsByShipmentId: Record<string, ShipmentData["segments"]>;
  onSegmentUpdate: (
    shipmentId: string,
    segmentIndex: number,
    update: Partial<SegmentData>
  ) => void;
  onAddSegment: (shipmentId: string) => void;
  onSegmentSave: (
    shipmentId: string,
    segmentStep: number,
    update: Partial<SegmentData>
  ) => void;
  serviceShipments: DomainShipment[] | undefined;
  timeoutsRef: React.MutableRefObject<number[]>;
  onShipmentIsNewOverride: (shipmentId: string, isNew: boolean) => void;
  onUpdateShipment: (shipmentId: string, update: Partial<ShipmentData>) => void;
};

export function ShipmentContentArea({
  selectedShipment,
  selectedId,
  segmentStep,
  showAddShipment,
  onCloseAddShipment,
  onCreateShipment,
  onDeselect,
  editedSegmentsByShipmentId,
  onSegmentUpdate,
  onAddSegment,
  onSegmentSave,
  serviceShipments,
  timeoutsRef,
  onShipmentIsNewOverride,
  onUpdateShipment,
}: ShipmentContentAreaProps) {
  const renderSegments = useMemo(
    () =>
      editedSegmentsByShipmentId[selectedShipment.id] ??
      selectedShipment.segments,
    [editedSegmentsByShipmentId, selectedShipment]
  );

  // Manage which segment is open (accordion behavior - only one at a time)
  const [openSegmentStep, setOpenSegmentStep] = useState<number | undefined>(
    segmentStep
  );

  // Update openSegmentStep when segmentStep prop changes (e.g., from URL)
  useEffect(() => {
    if (segmentStep !== undefined) {
      setOpenSegmentStep(segmentStep);
    }
  }, [segmentStep]);

  const handleSegmentToggle = (step: number) => {
    setOpenSegmentStep((current) => (current === step ? undefined : step));
  };

  const isReadOnlySelected = Boolean(
    serviceShipments?.find((s) => s.id === selectedId)?.source === "demo-static"
  );

  const currentSegment =
    selectedShipment.currentSegmentIndex >= 0
      ? renderSegments[selectedShipment.currentSegmentIndex]
      : undefined;
  useSegmentScroll(segmentStep, selectedShipment);

  return (
    <div className="flex-1 h-screen bg-slate-100 max-w-4xl mx-auto overflow-hidden">
      <div className="h-full overflow-y-auto no-scrollbar">
        <div className="p-7 flex flex-col gap-4">
          <AddShipmentModal
            open={showAddShipment}
            onClose={onCloseAddShipment}
            onCreate={onCreateShipment}
          />
          <NavigatingInfo
            title={selectedShipment.title}
            shipmentId={selectedShipment.id}
            driverName={currentSegment?.driverName || ""}
            driverPhoto={currentSegment?.driverPhoto}
            vehicle={selectedShipment.vehicle}
            weight={selectedShipment.weight}
            localCompany={selectedShipment.localCompany}
            destination={selectedShipment.destination}
            lastActivity={selectedShipment.lastActivity}
            lastActivityTime={selectedShipment.lastActivityTime}
            onClose={onDeselect}
          />

          <Segments
            readOnly={isReadOnlySelected}
            title="Segments"
            onAddSegment={
              !isReadOnlySelected && selectedShipment.status !== "Delivered"
                ? () => onAddSegment(selectedShipment.id)
                : undefined
            }
          >
            {renderSegments.map((seg, idx) => {
              const domainSelected = serviceShipments?.find(
                (s) => s.id === selectedId
              );

              return (
                <SegmentItem
                  key={seg.step}
                  segment={seg}
                  index={idx}
                  shipment={selectedShipment}
                  selectedId={selectedId}
                  domainShipment={domainSelected}
                  renderSegments={renderSegments}
                  isReadOnly={isReadOnlySelected}
                  segmentStep={segmentStep}
                  editedSegmentsByShipmentId={editedSegmentsByShipmentId}
                  onSegmentSave={onSegmentSave}
                  onSegmentUpdate={onSegmentUpdate}
                  onShipmentIsNewOverride={onShipmentIsNewOverride}
                  onUpdateShipment={onUpdateShipment}
                  timeoutsRef={timeoutsRef}
                  open={openSegmentStep === seg.step}
                  onToggle={() => handleSegmentToggle(seg.step)}
                />
              );
            })}
          </Segments>
          <ActivitySection
            items={selectedShipment.activities}
            defaultOpen={false}
          />
        </div>
      </div>
    </div>
  );
}
