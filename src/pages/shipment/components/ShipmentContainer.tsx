import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ShipmentDetailsView } from "./ShipmentDetailsView";
import { useShipmentSelection } from "../hooks/useShipmentSelection";
import { useSegmentHandlers } from "../hooks/useSegmentHandlers";
import type { ShipmentData } from "../types/shipmentTypes";

export function ShipmentContainer() {
  const [searchParams] = useSearchParams();
  const [showAddShipment, setShowAddShipment] = useState(false);
  const [editedSegmentsByShipmentId, setEditedSegmentsByShipmentId] = useState<
    Record<string, ShipmentData["segments"]>
  >({});

  const {
    selectedId,
    setSelectedId,
    selectedShipment,
    allItems,
    serviceShipments,
    handleCreateShipment,
    handleUpdateShipment,
  } = useShipmentSelection();

  const {
    handleSegmentUpdate,
    handleSegmentSave,
    handleAddSegment,
    timeoutsRef,
  } = useSegmentHandlers(
    allItems,
    editedSegmentsByShipmentId,
    setEditedSegmentsByShipmentId
  );

  return (
    <ShipmentDetailsView
      shipments={allItems}
      selectedShipment={selectedShipment}
      selectedId={selectedId ?? ""}
      segmentStep={
        searchParams.get("segmentStep")
          ? Number(searchParams.get("segmentStep"))
          : undefined
      }
      onShipmentSelect={setSelectedId}
      onDeselect={() => setSelectedId(null)}
      onAddShipment={() => setShowAddShipment(true)}
      showAddShipment={showAddShipment}
      onCloseAddShipment={() => setShowAddShipment(false)}
      onCreateShipment={handleCreateShipment}
      editedSegmentsByShipmentId={editedSegmentsByShipmentId}
      onSegmentUpdate={handleSegmentUpdate}
      onAddSegment={handleAddSegment}
      onSegmentSave={handleSegmentSave}
      serviceShipments={serviceShipments ?? undefined}
      timeoutsRef={timeoutsRef}
      onShipmentIsNewOverride={() => {}}
      onUpdateShipment={handleUpdateShipment}
    />
  );
}
