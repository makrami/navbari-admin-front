import {useRef, useEffect, useCallback} from "react";
import type {Shipment} from "../../../shared/types/shipment";
import type {SegmentData} from "../../../shared/types/segmentData";

export function useSegmentHandlers(
  allItems: Shipment[],
  _editedSegmentsByShipmentId: Record<string, SegmentData[]>,
  setEditedSegmentsByShipmentId: React.Dispatch<
    React.SetStateAction<Record<string, SegmentData[]>>
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
          startedAt: update.startedAt ?? base[segmentIndex].startedAt,
          estimatedFinishTime:
            update.estimatedFinishTime ??
            base[segmentIndex].estimatedFinishTime,
          baseFee: update.baseFee ?? base[segmentIndex].baseFee,
          cargoCompanies:
            update.cargoCompanies ?? base[segmentIndex].cargoCompanies,
          driverName: update.assigneeName ?? base[segmentIndex].driverName,
          driverPhoto:
            update.assigneeAvatarUrl ?? base[segmentIndex].driverPhoto,
          isPlaceholder:
            update.isPlaceholder ?? base[segmentIndex].isPlaceholder,
          isCompleted: update.isCompleted ?? base[segmentIndex].isCompleted,
        } as SegmentData;

        return {...prev, [shipmentId]: base};
      });
    },
    [allItems, setEditedSegmentsByShipmentId]
  );

  const handleSegmentSave = useCallback(
    (shipmentId: string, segmentStep: number, update: Partial<SegmentData>) => {
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
          startedAt: update.startedAt ?? base[index].startedAt,
          estimatedFinishTime:
            update.estimatedFinishTime ?? base[index].estimatedFinishTime,
          baseFee: update.baseFee ?? base[index].baseFee,
          cargoCompanies: update.cargoCompanies ?? base[index].cargoCompanies,
          driverName: update.assigneeName ?? base[index].driverName,
          driverPhoto: update.assigneeAvatarUrl ?? base[index].driverPhoto,
          isPlaceholder: update.isPlaceholder ?? base[index].isPlaceholder,
          isCompleted: update.isCompleted ?? base[index].isCompleted,
        } as SegmentData;

        return {...prev, [shipmentId]: base};
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
          nextPlace: "Assign Previous Segment First",
        } as SegmentData);
        return {...prev, [shipmentId]: base};
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
