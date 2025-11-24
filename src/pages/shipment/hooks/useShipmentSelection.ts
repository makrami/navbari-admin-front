import {useState, useRef, useEffect, useMemo, useCallback} from "react";
import {useSearchParams} from "react-router-dom";
import {
  useShipments,
  useCreateShipment,
  useUpdateShipment,
} from "../../../services/shipment/hooks";
import type {
  CreateShipmentDto,
  UpdateShipmentDto,
} from "../../../services/shipment/shipment.api.service";
import type {Shipment} from "../../../shared/types/shipment";

export function useShipmentSelection() {
  const [searchParams] = useSearchParams();
  const {data: shipments, loading: serviceLoading} = useShipments();
  const createShipmentMutation = useCreateShipment();
  const updateShipmentMutation = useUpdateShipment();
  const hasInitializedRef = useRef(false);
  const selectedIdRef = useRef<string | null>(null);

  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Keep ref in sync with state
  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  const selectedShipment = useMemo(() => {
    if (!selectedId) return undefined;
    // Use strict string comparison to ensure exact match
    return shipments?.find((i) => String(i.id) === String(selectedId));
  }, [shipments, selectedId]);

  // Sync selectedId with URL params and auto-select first "In Origin" if needed
  useEffect(() => {
    const urlSelectedId = searchParams.get("selectedId");
    // Always use the latest ref value, not the one from closure
    const currentSelectedId = selectedIdRef.current;

    // Handle URL param selection (always takes priority)
    if (urlSelectedId) {
      const shipmentExists = shipments?.some(
        (item) => String(item.id) === urlSelectedId
      );
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
    if (
      !hasInitializedRef.current &&
      (shipments?.length ?? 0) > 0 &&
      !currentSelectedId
    ) {
      const firstInOrigin = shipments?.find((s) => s.status === "In Origin");
      if (firstInOrigin) {
        setSelectedId(firstInOrigin.id);
        selectedIdRef.current = firstInOrigin.id;
      }
      hasInitializedRef.current = true;
    }
  }, [searchParams, shipments?.length ?? 0]);

  const handleCreateShipment = useCallback(
    async (data: CreateShipmentDto) => {
      // Create shipment via API
      try {
        // Create via API using mutation hook
        const createdShipment = await createShipmentMutation.mutateAsync(data);

        // Update selected ID to the new shipment ID from API (UUID) immediately
        setSelectedId(createdShipment.id);
        selectedIdRef.current = createdShipment.id;

        // Query invalidation is handled automatically by the mutation hook
      } catch (error) {
        // Error creating shipment - will be handled by UI
        console.error("Error creating shipment", error);
        return;
      }
    },
    [createShipmentMutation]
  );

  const handleUpdateShipment = useCallback(
    async (shipmentId: string, update: Partial<Shipment>) => {
      // Update via API
      try {
        // Map update to UpdateShipmentDto format
        const updateDto: UpdateShipmentDto = {};
        if (update.title) updateDto.title = update.title;
        if (update.cargoWeight) {
          const weight = parseFloat(update.cargoWeight.replace(/[^0-9.]/g, ""));
          if (!isNaN(weight)) updateDto.cargoWeight = weight;
        }
        // Note: Other fields like origin/destination would need to be mapped if available

        // Update via API using mutation hook
        await updateShipmentMutation.mutateAsync({
          id: shipmentId,
          data: updateDto,
        });

        // Query invalidation is handled automatically by the mutation hook
      } catch (error) {
        // Error updating shipment - will be handled by UI
        console.error("Error updating shipment", error);
        return;
      }
    },
    [updateShipmentMutation]
  );

  return {
    selectedId,
    setSelectedId,
    selectedShipment,
    shipments,
    serviceLoading,
    handleCreateShipment,
    handleUpdateShipment,
  };
}
