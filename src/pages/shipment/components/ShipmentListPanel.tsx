import {
  SearchShipment,
  AddShipment,
  SegmentButton,
  ShipmentItem,
} from "../../../components";
import { ListPanel } from "../../../shared/components/ui/ListPanel";
import type { ShipmentData } from "../types/shipmentTypes";
import { useMemo } from "react";

type ShipmentListPanelProps = {
  shipments: ShipmentData[];
  selectedId: string;
  onShipmentSelect: (id: string) => void;
  onAddShipment: () => void;
};

export function ShipmentListPanel({
  shipments,
  selectedId,
  onShipmentSelect,
  onAddShipment,
}: ShipmentListPanelProps) {
  // Memoize the selection map to ensure consistent comparison
  const selectionMap = useMemo(() => {
    const map = new Map<string, boolean>();
    if (selectedId && selectedId.trim()) {
      shipments.forEach((item) => {
        // Use strict equality and ensure both are strings
        map.set(item.id, String(item.id) === String(selectedId));
      });
    }
    return map;
  }, [shipments, selectedId]);

  return (
    <ListPanel title="Shipment" className="w-[372px] min-w-[372px]">
      <SearchShipment />
      <div className="flex items-center gap-2">
        <AddShipment onClick={onAddShipment} />
        <SegmentButton />
      </div>
      <div className="grid gap-4">
        {shipments.map((item) => {
          // Use the memoized selection map for consistent comparison
          const isSelected = selectionMap.get(item.id) ?? false;
          return (
            <ShipmentItem
              key={item.id}
              title={item.title}
              id={item.id}
              status={item.status}
              fromCountryCode={item.fromCountryCode}
              toCountryCode={item.toCountryCode}
              progressPercent={item.progressPercent}
              userName={item.userName}
              rating={item.rating}
              segments={item.segments}
              selected={isSelected}
              onClick={() => onShipmentSelect(item.id)}
            />
          );
        })}
      </div>
    </ListPanel>
  );
}
