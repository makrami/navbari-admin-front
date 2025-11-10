import { useCallback } from "react";
import { ShipmentListPanel } from "./ShipmentListPanel";
import { EmptyShipmentView } from "./EmptyShipmentView";
import { ShipmentContentArea } from "./ShipmentContentArea";
import { createShipmentFromFormData } from "../utils/shipmentHelpers";
import type { AddShipmentInput as AddShipmentFormInput } from "./AddShipmentModal";
import type { ShipmentData } from "../types/shipmentTypes";
import type { Shipment as DomainShipment } from "../../../shared/types/shipment";
import type { SegmentData } from "../segments/components/SegmentDetails";

type ShipmentDetailsViewProps = {
  shipments: ShipmentData[];
  selectedShipment: ShipmentData | undefined;
  selectedId: string;
  segmentStep?: number;
  onShipmentSelect: (id: string) => void;
  onDeselect: () => void;
  onAddShipment: () => void;
  showAddShipment: boolean;
  onCloseAddShipment: () => void;
  onCreateShipment: (shipment: ShipmentData) => void;
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

export function ShipmentDetailsView({
  shipments,
  selectedShipment,
  selectedId,
  segmentStep,
  onShipmentSelect,
  onDeselect,
  onAddShipment,
  showAddShipment,
  onCloseAddShipment,
  onCreateShipment,
  editedSegmentsByShipmentId,
  onSegmentUpdate,
  onAddSegment,
  onSegmentSave,
  serviceShipments,
  timeoutsRef,
  onShipmentIsNewOverride,
  onUpdateShipment,
}: ShipmentDetailsViewProps) {
  const handleCreateShipment = useCallback(
    (data: AddShipmentFormInput) => {
      onCreateShipment(createShipmentFromFormData(data));
    },
    [onCreateShipment]
  );

  return (
    <div className="flex w-full h-screen overflow-hidden">
      <ShipmentListPanel
        shipments={shipments}
        selectedId={selectedId}
        onShipmentSelect={onShipmentSelect}
        onAddShipment={onAddShipment}
      />

      {selectedShipment ? (
        <ShipmentContentArea
          selectedShipment={selectedShipment}
          selectedId={selectedId}
          segmentStep={segmentStep}
          showAddShipment={showAddShipment}
          onCloseAddShipment={onCloseAddShipment}
          onCreateShipment={handleCreateShipment}
          onDeselect={onDeselect}
          editedSegmentsByShipmentId={editedSegmentsByShipmentId}
          onSegmentUpdate={onSegmentUpdate}
          onAddSegment={onAddSegment}
          onSegmentSave={onSegmentSave}
          serviceShipments={serviceShipments}
          timeoutsRef={timeoutsRef}
          onShipmentIsNewOverride={onShipmentIsNewOverride}
          onUpdateShipment={onUpdateShipment}
        />
      ) : (
        <EmptyShipmentView
          showAddShipment={showAddShipment}
          onCloseAddShipment={onCloseAddShipment}
          onCreateShipment={handleCreateShipment}
        />
      )}
    </div>
  );
}
