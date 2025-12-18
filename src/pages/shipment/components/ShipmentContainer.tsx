import {useState, useEffect, useRef} from "react";
import {useSearchParams} from "react-router-dom";
import {ShipmentDetailsView} from "./ShipmentDetailsView";
import {useShipmentSelection} from "../hooks/useShipmentSelection";
import {useSegmentHandlers} from "../hooks/useSegmentHandlers";
import {
  useShipmentSegments,
  useCreateSegment,
} from "../../../services/shipment/hooks";
import type {Segment} from "../../../shared/types/segmentData";

export function ShipmentContainer() {
  const [searchParams] = useSearchParams();
  const [showAddShipment, setShowAddShipment] = useState(false);
  const [editedSegmentsByShipmentId, setEditedSegmentsByShipmentId] = useState<
    Record<string, Segment[]>
  >({});

  const {
    selectedId,
    setSelectedId,
    selectedShipment,
    shipments,
    handleCreateShipment,
    handleUpdateShipment,
  } = useShipmentSelection();

  const {handleSegmentUpdate, handleSegmentSave, timeoutsRef} =
    useSegmentHandlers(
      shipments ?? [],
      editedSegmentsByShipmentId,
      setEditedSegmentsByShipmentId
    );

  // Fetch segments when a shipment is selected
  const {data: fetchedSegments, loading: segmentsLoading} =
    useShipmentSegments(selectedId);

  // Create segment mutation
  const createSegmentMutation = useCreateSegment();

  // Handle add segment - calls API
  const handleAddSegment = async (shipmentId: string) => {
    try {
      await createSegmentMutation.mutateAsync({shipmentId});
      // The mutation will automatically invalidate and refetch segments
    } catch (error) {
      console.error("Failed to create segment:", error);
      // Optionally show error toast/notification here
    }
  };

  // Track previous segments data to prevent unnecessary updates during refetch
  const prevSegmentsKeyRef = useRef<string>("");
  const prevSelectedIdRef = useRef<string | null>(null);

  // Update editedSegmentsByShipmentId when segments are fetched
  // This ensures ShipmentItem can display segments in the list panel
  // Only update when shipment changes or when segments data actually changes
  useEffect(() => {
    if (selectedId && fetchedSegments && !segmentsLoading) {
      // Create a key from segment IDs and count to detect actual changes
      const segmentsKey = fetchedSegments
        .map((seg) => `${seg.id}-${seg.step}`)
        .join("|");
      const shipmentChanged = prevSelectedIdRef.current !== selectedId;
      const segmentsChanged =
        shipmentChanged || prevSegmentsKeyRef.current !== segmentsKey;

      if (segmentsChanged) {
        setEditedSegmentsByShipmentId((prev) => ({
          ...prev,
          [selectedId]: fetchedSegments,
        }));
        prevSegmentsKeyRef.current = segmentsKey;
        prevSelectedIdRef.current = selectedId;
      }
    } else if (!selectedId) {
      // Reset refs when no shipment is selected
      prevSegmentsKeyRef.current = "";
      prevSelectedIdRef.current = null;
    }
  }, [selectedId, fetchedSegments, segmentsLoading]);

  return (
    <ShipmentDetailsView
      shipments={shipments ?? []}
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
      serviceShipments={shipments ?? undefined}
      timeoutsRef={timeoutsRef}
      onShipmentIsNewOverride={() => {}}
      onUpdateShipment={handleUpdateShipment}
      segmentsLoading={segmentsLoading}
      fetchedSegments={fetchedSegments}
    />
  );
}
