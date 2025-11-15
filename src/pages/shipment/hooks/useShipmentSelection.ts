import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useShipments } from "../../../services/shipment/hooks";
import { useShipmentData } from "../hooks/useShipmentData";
import { isApiMode } from "../../../services/config";
import { ShipmentService } from "../../../services/shipment/ShipmentService";
import { createShipment as apiCreateShipment } from "../../../services/shipment/shipment.api.service";
import type { ShipmentData } from "../types/shipmentTypes";

export function useShipmentSelection() {
  const [searchParams] = useSearchParams();
  const { data: serviceShipments, loading: serviceLoading, service, refresh: refreshShipments } = useShipments();
  const items = useShipmentData(serviceShipments ?? undefined);
  const [addedShipments, setAddedShipments] = useState<ShipmentData[]>([]);
  const hasInitializedRef = useRef(false);
  const selectedIdRef = useRef<string | null>(null);

  const allItems = useMemo(() => {
    // In API mode, only use items from service (no addedShipments)
    if (isApiMode()) {
      return items;
    }
    
    // In demo mode, deduplicate shipments by ID - addedShipments take priority over items
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
      // In API mode, only check items (from service)
      // In demo mode, check both addedShipments and items
      const shipmentExists = isApiMode()
        ? items.some((item) => String(item.id) === urlSelectedId)
        : addedShipments.some((item) => String(item.id) === urlSelectedId) ||
          items.some((item) => String(item.id) === urlSelectedId);
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

  const handleCreateShipment = useCallback(async (shipment: ShipmentData) => {
    // Update ref immediately BEFORE any state updates to prevent race conditions
    selectedIdRef.current = shipment.id;
    // Mark as initialized to prevent auto-selection effect from interfering
    hasInitializedRef.current = true;
    
    // Use functional updates to ensure we're working with the latest state
    // This ensures the previous selection is cleared before adding the new shipment
    setSelectedId(() => shipment.id);
    
    // In API mode, create shipment via API
    if (isApiMode()) {
      try {
        // Map ShipmentData to CreateShipmentDto format
        // Extract origin/destination from shipment data
        // The form provides 'from' and 'to' as city names in the segments
        // We'll extract from the first segment's place or use defaults
        const firstSegment = shipment.segments?.[0];
        const originCity = firstSegment?.place || shipment.fromCountryCode || "Unknown";
        const destinationCity = shipment.destination || shipment.toCountryCode || "Unknown";
        // Use city names as both city and country (backend requires both, but form only has cities)
        const originCountry = shipment.fromCountryCode || originCity;
        const destinationCountry = shipment.toCountryCode || destinationCity;
        const cargoWeight = shipment.weight ? parseFloat(shipment.weight.replace(/[^0-9.]/g, "")) : 0;
        const segmentCount = shipment.segments?.length || 1;
        
        // Create via API
        const createdShipment = await apiCreateShipment({
          title: shipment.title,
          originCountry: originCountry,
          originCity: originCity,
          destinationCountry: destinationCountry,
          destinationCity: destinationCity,
          cargoType: "General",
          cargoWeight: cargoWeight,
          segmentCount: segmentCount,
        });
        
        // Update selected ID to the new shipment ID from API (UUID) immediately
        setSelectedId(createdShipment.id);
        selectedIdRef.current = createdShipment.id;
        
        // Refresh the shipments list to get the newly created shipment from API
        // This will update the list and the new shipment will appear
        refreshShipments();
      } catch (error) {
        // Error creating shipment - will be handled by UI
        // Still add to local state for UI feedback, but it won't persist
        setAddedShipments((prev) => [shipment, ...prev]);
        return;
      }
    } else {
      // In demo mode, just add to local state
      setAddedShipments((prev) => [shipment, ...prev]);
    }
  }, [service]);

  const handleUpdateShipment = useCallback(async (shipmentId: string, update: Partial<ShipmentData>) => {
    // In API mode, update via API
    if (isApiMode()) {
      try {
        // Map update to UpdateShipmentDto format
        const updateDto: any = {};
        if (update.title) updateDto.title = update.title;
        if (update.weight) {
          const weight = parseFloat(update.weight.replace(/[^0-9.]/g, ""));
          if (!isNaN(weight)) updateDto.cargoWeight = weight;
        }
        // Note: Other fields like origin/destination would need to be mapped if available
        
        // Import updateShipment function
        const { updateShipment } = await import("../../../services/shipment/shipment.api.service");
        await updateShipment(shipmentId, updateDto);
        
        // Refresh the shipments list
        refreshShipments();
      } catch (error) {
        // Error updating shipment - will be handled by UI
        // Still update local state for UI feedback
        setAddedShipments((prev) =>
          prev.map((s) => (s.id === shipmentId ? { ...s, ...update } : s))
        );
        return;
      }
    } else {
      // In demo mode, just update local state
      setAddedShipments((prev) =>
        prev.map((s) => (s.id === shipmentId ? { ...s, ...update } : s))
      );
    }
  }, [refreshShipments]);

  return {
    selectedId,
    setSelectedId,
    selectedShipment,
    allItems,
    addedShipments,
    setAddedShipments,
    serviceShipments,
    serviceLoading,
    handleCreateShipment,
    handleUpdateShipment,
  };
}

