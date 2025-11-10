import { useRef, useEffect, useCallback } from "react";
import type { ShipmentData } from "../types/shipmentTypes";
import type { SegmentData } from "../segments/components/SegmentDetails";

export function useSegmentHandlers(
  allItems: ShipmentData[],
  _editedSegmentsByShipmentId: Record<string, ShipmentData["segments"]>,
  setEditedSegmentsByShipmentId: React.Dispatch<
    React.SetStateAction<Record<string, ShipmentData["segments"]>>
  >
) {
  const timeoutsRef = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((id) => clearTimeout(id));
      timeoutsRef.current = [];
    };
  }, []);

  const handleSegmentUpdate = useCallback(
    (
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
    },
    [allItems, setEditedSegmentsByShipmentId]
  );

  const handleSegmentSave = useCallback(
    (
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
    },
    [allItems, setEditedSegmentsByShipmentId]
  );

  const handleAddSegment = useCallback(
    (shipmentId: string) => {
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
    },
    [allItems, setEditedSegmentsByShipmentId]
  );

  return {
    handleSegmentUpdate,
    handleSegmentSave,
    handleAddSegment,
    timeoutsRef,
  };
}

