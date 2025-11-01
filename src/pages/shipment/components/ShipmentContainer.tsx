import { useState, useEffect, useRef, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useShipments } from "../../../services/shipment/hooks";
import { useShipmentData } from "../hooks/useShipmentData";
import { ShipmentListView } from "./ShipmentListView";
import { ShipmentDetailsView } from "./ShipmentDetailsView";
import type { ShipmentData } from "../types/shipmentTypes";
import type { SegmentData } from "../segments/components/SegmentDetails";

export function ShipmentContainer() {
  const [searchParams] = useSearchParams();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showAddShipment, setShowAddShipment] = useState(false);
  const [addedShipments, setAddedShipments] = useState<ShipmentData[]>([]);
  const [editedSegmentsByShipmentId, setEditedSegmentsByShipmentId] = useState<
    Record<string, ShipmentData["segments"]>
  >({});
  const timeoutsRef = useRef<number[]>([]);
  const { data: serviceShipments } = useShipments();
  const items = useShipmentData(serviceShipments ?? undefined);

  const allItems = useMemo(() => {
    return [...addedShipments, ...items];
  }, [addedShipments, items]);
  const selectedShipment = allItems.find((i) => i.id === selectedId);

  // Read selectedId from URL on mount and when it changes
  useEffect(() => {
    const urlSelectedId = searchParams.get("selectedId");
    if (urlSelectedId) {
      // Check if the shipment exists in our items
      const shipmentExists =
        addedShipments.some((item) => item.id === urlSelectedId) ||
        items.some((item) => item.id === urlSelectedId);
      if (shipmentExists) {
        setSelectedId(urlSelectedId);
      }
    } else {
      // Clear selection if URL param is removed
      setSelectedId(null);
    }
  }, [searchParams, addedShipments, items]);

  // Default selection: pick first "In Origin" shipment if none selected and no URL selection
  useEffect(() => {
    if (selectedId) return;
    if (searchParams.get("selectedId")) return;
    const firstInOrigin = allItems.find((s) => s.status === "In Origin");
    if (firstInOrigin) {
      setSelectedId(firstInOrigin.id);
    }
  }, [allItems, selectedId, searchParams]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((id) => clearTimeout(id));
      timeoutsRef.current = [];
    };
  }, []);

  const handleCreateShipment = (shipment: ShipmentData) => {
    setAddedShipments((prev) => [shipment, ...prev]);
    setSelectedId(shipment.id);
  };

  const handleSegmentUpdate = (
    shipmentId: string,
    segmentIndex: number,
    update: Partial<SegmentData>
  ) => {
    setEditedSegmentsByShipmentId((prev) => {
      const shipment = allItems.find((s) => s.id === shipmentId);
      if (!shipment) return prev;

      const base = prev[shipmentId]
        ? [...prev[shipmentId]!]
        : [...shipment.segments];
      const segment = base[segmentIndex];
      if (!segment) return prev;

      base[segmentIndex] = {
        ...base[segmentIndex],
        place: update.place ?? base[segmentIndex].place,
        nextPlace: update.nextPlace ?? base[segmentIndex].nextPlace,
        startAt: update.startAt ?? base[segmentIndex].startAt,
        estFinishAt: update.estFinishAt ?? base[segmentIndex].estFinishAt,
        baseFeeUsd: update.baseFeeUsd ?? base[segmentIndex].baseFeeUsd,
        cargoCompanies:
          update.cargoCompanies ?? base[segmentIndex].cargoCompanies,
        driverName: update.assigneeName ?? base[segmentIndex].driverName,
        driverPhoto: update.assigneeAvatarUrl ?? base[segmentIndex].driverPhoto,
        isPlaceholder: update.isPlaceholder ?? base[segmentIndex].isPlaceholder,
        isCompleted: update.isCompleted ?? base[segmentIndex].isCompleted,
      } as ShipmentData["segments"][number];

      return { ...prev, [shipmentId]: base };
    });
  };

  const handleSegmentSave = (
    shipmentId: string,
    segmentStep: number,
    update: Partial<SegmentData>
  ) => {
    setEditedSegmentsByShipmentId((prev) => {
      const shipment = allItems.find((s) => s.id === shipmentId);
      if (!shipment) return prev;

      const base = prev[shipmentId]
        ? [...prev[shipmentId]!]
        : [...shipment.segments];
      const index = base.findIndex((s) => s.step === segmentStep);
      if (index < 0) return prev;

      base[index] = {
        ...base[index],
        place: update.place ?? base[index].place,
        nextPlace: update.nextPlace ?? base[index].nextPlace,
        startAt: update.startAt ?? base[index].startAt,
        estFinishAt: update.estFinishAt ?? base[index].estFinishAt,
        baseFeeUsd: update.baseFeeUsd ?? base[index].baseFeeUsd,
        cargoCompanies: update.cargoCompanies ?? base[index].cargoCompanies,
        driverName: update.assigneeName ?? base[index].driverName,
        driverPhoto: update.assigneeAvatarUrl ?? base[index].driverPhoto,
        isPlaceholder: update.isPlaceholder ?? base[index].isPlaceholder,
        isCompleted: update.isCompleted ?? base[index].isCompleted,
      } as ShipmentData["segments"][number];

      return { ...prev, [shipmentId]: base };
    });
  };

  const handleAddSegment = (shipmentId: string) => {
    setEditedSegmentsByShipmentId((prev) => {
      const shipment = allItems.find((s) => s.id === shipmentId);
      if (!shipment) return prev;

      const base = prev[shipmentId]
        ? [...prev[shipmentId]!]
        : [...shipment.segments];
      const nextStep = base.length + 1;
      base.push({
        step: nextStep,
        place: "Assign Previous Segment First",
        datetime: "",
        isCompleted: false,
        isPlaceholder: true,
        driverName: "",
        driverRating: 0,
      });
      return { ...prev, [shipmentId]: base };
    });
  };

  // If nothing is selected yet, show grid view
  if (!selectedId || !selectedShipment) {
    return (
      <ShipmentListView
        shipments={allItems}
        onShipmentSelect={setSelectedId}
        onAddShipment={() => setShowAddShipment(true)}
        showAddShipment={showAddShipment}
        onCloseAddShipment={() => setShowAddShipment(false)}
        onCreateShipment={handleCreateShipment}
      />
    );
  }

  // Once a shipment is selected, show the split view
  return (
    <ShipmentDetailsView
      shipments={allItems}
      selectedShipment={selectedShipment}
      selectedId={selectedId}
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
      onShipmentIsNewOverride={() => {
        // Handler kept for compatibility but state removed as it was unused
      }}
    />
  );
}
