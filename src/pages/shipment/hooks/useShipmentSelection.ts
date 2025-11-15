import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useShipments } from "../../../services/shipment/hooks";
import { useShipmentData } from "../hooks/useShipmentData";
import type { ShipmentData } from "../types/shipmentTypes";

export function useShipmentSelection() {
  const [searchParams] = useSearchParams();
  const { data: serviceShipments } = useShipments();
  const items = useShipmentData(serviceShipments ?? undefined);
  const [addedShipments, setAddedShipments] = useState<ShipmentData[]>([]);
  const hasInitializedRef = useRef(false);
  const selectedIdRef = useRef<string | null>(null);

  const allItems = useMemo(() => {
    // Deduplicate shipments by ID - addedShipments take priority over items
    const seenIds = new Set<string>();
    const result: ShipmentData[] = [];
    
    // First add addedShipments (user-created shipments take priority)
    addedShipments.forEach((shipment) => {
      const id = String(shipment.id);
      if (!seenIds.has(id)) {
        seenIds.add(id);
        result.push(shipment);
      }
    });
    
    // Then add items (service/demo shipments) if not already present
    items.forEach((shipment) => {
      const id = String(shipment.id);
      if (!seenIds.has(id)) {
        seenIds.add(id);
        result.push(shipment);
      }
    });
    
    return result;
  }, [addedShipments, items]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  // Keep ref in sync with state
  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  const selectedShipment = useMemo(() => {
    if (!selectedId) return undefined;
    // Use strict string comparison to ensure exact match
    return allItems.find((i) => String(i.id) === String(selectedId));
  }, [allItems, selectedId]);

  // Sync selectedId with URL params and auto-select first "In Origin" if needed
  useEffect(() => {
    const urlSelectedId = searchParams.get("selectedId");
    // Always use the latest ref value, not the one from closure
    const currentSelectedId = selectedIdRef.current;
    
    // Handle URL param selection (always takes priority)
    if (urlSelectedId) {
      const shipmentExists =
        addedShipments.some((item) => item.id === urlSelectedId) ||
        items.some((item) => item.id === urlSelectedId);
      if (shipmentExists && currentSelectedId !== urlSelectedId) {
        setSelectedId(urlSelectedId);
        selectedIdRef.current = urlSelectedId;
        hasInitializedRef.current = true;
        return;
      } else if (shipmentExists) {
        hasInitializedRef.current = true;
        return;
      }
    }

    // Auto-select first "In Origin" shipment only once when items are first loaded
    // Don't auto-select if there's already a selected shipment (to avoid overriding explicit selections)
    // Also skip if we've already initialized (to prevent interference with manual selections)
    if (!hasInitializedRef.current && allItems.length > 0 && !currentSelectedId) {
      const firstInOrigin = allItems.find((s) => s.status === "In Origin");
      if (firstInOrigin) {
        setSelectedId(firstInOrigin.id);
        selectedIdRef.current = firstInOrigin.id;
      }
      hasInitializedRef.current = true;
    }
  }, [searchParams, addedShipments, items, allItems.length]);

  const handleCreateShipment = useCallback((shipment: ShipmentData) => {
    // Update ref immediately BEFORE any state updates to prevent race conditions
    selectedIdRef.current = shipment.id;
    // Mark as initialized to prevent auto-selection effect from interfering
    hasInitializedRef.current = true;
    
    // Use functional updates to ensure we're working with the latest state
    // This ensures the previous selection is cleared before adding the new shipment
    setSelectedId(() => shipment.id);
    setAddedShipments((prev) => [shipment, ...prev]);
  }, []);

  const handleUpdateShipment = useCallback((shipmentId: string, update: Partial<ShipmentData>) => {
    setAddedShipments((prev) =>
      prev.map((s) => (s.id === shipmentId ? { ...s, ...update } : s))
    );
  }, []);

  return {
    selectedId,
    setSelectedId,
    selectedShipment,
    allItems,
    addedShipments,
    setAddedShipments,
    serviceShipments,
    handleCreateShipment,
    handleUpdateShipment,
  };
}

