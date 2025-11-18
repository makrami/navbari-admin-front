import { useCallback } from "react";
import { ShipmentListPanel } from "./ShipmentListPanel";
import { EmptyShipmentView } from "./EmptyShipmentView";
import { ShipmentContentArea } from "./ShipmentContentArea";
import { createShipmentFromFormData } from "../utils/shipmentHelpers";
import type { AddShipmentInput as AddShipmentFormInput } from "./AddShipmentModal";
import type { Shipment } from "../../../shared/types/shipment";
import type { Shipment as DomainShipment } from "../../../shared/types/shipment";
import type { Segment } from "../../../shared/types/segmentData";

type ShipmentDetailsViewProps = {
  shipments: Shipment[];
  selectedShipment: Shipment | undefined;
  selectedId: string;
  segmentStep?: number;
  onShipmentSelect: (id: string) => void;
  onDeselect: () => void;
  onAddShipment: () => void;
  showAddShipment: boolean;
  onCloseAddShipment: () => void;
  onCreateShipment: (shipment: Shipment) => void;
  editedSegmentsByShipmentId: Record<string, Segment[]>;
  onSegmentUpdate: (
    shipmentId: string,
    segmentIndex: number,
    update: Partial<Segment>
  ) => void;
  onAddSegment: (shipmentId: string) => void;
  onSegmentSave: (
    shipmentId: string,
    segmentStep: number,
    update: Partial<Segment>
  ) => void;
  serviceShipments: DomainShipment[] | undefined;
  timeoutsRef: React.MutableRefObject<number[]>;
  onShipmentIsNewOverride: (shipmentId: string, isNew: boolean) => void;
  onUpdateShipment: (shipmentId: string, update: Partial<Shipment>) => void;
  segmentsLoading?: boolean;
  fetchedSegments?: Segment[] | null;
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
  segmentsLoading = false,
  fetchedSegments = null,
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
        editedSegmentsByShipmentId={editedSegmentsByShipmentId}
        segmentsLoading={segmentsLoading}
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
          segmentsLoading={segmentsLoading}
          fetchedSegments={fetchedSegments}
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
