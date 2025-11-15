import {
  SearchShipment,
  AddShipment,
  SegmentButton,
  ShipmentItem,
} from "../../../components";
import { ListPanel } from "../../../shared/components/ui/ListPanel";
import type { ShipmentData } from "../types/shipmentTypes";
import { useMemo, useState } from "react";
import { StatusFilterChips, type FilterKey } from "./StatusFilterChips";

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
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");

  // Calculate counts for each filter
  const filterCounts = useMemo(() => {
    const counts: Record<FilterKey, number> = {
      all: shipments.length,
      "In Origin": 0,
      Delivered: 0,
      Loading: 0,
      "In Transit": 0,
      Customs: 0,
    };

    shipments.forEach((shipment) => {
      if (shipment.status in counts) {
        counts[shipment.status as FilterKey]++;
      }
    });

    return counts;
  }, [shipments]);

  // Filter shipments based on active filter
  const filteredShipments = useMemo(() => {
    if (activeFilter === "all") {
      return shipments;
    }
    return shipments.filter((shipment) => shipment.status === activeFilter);
  }, [shipments, activeFilter]);

  // Memoize the selection map to ensure consistent comparison
  const selectionMap = useMemo(() => {
    const map = new Map<string, boolean>();
    if (selectedId && selectedId.trim()) {
      filteredShipments.forEach((item) => {
        // Use strict equality and ensure both are strings
        map.set(item.id, String(item.id) === String(selectedId));
      });
    }
    return map;
  }, [filteredShipments, selectedId]);

  return (
    <ListPanel title="Shipment" className="w-[372px] min-w-[372px]">
      <SearchShipment />
      <div className="flex items-center gap-2">
        <AddShipment onClick={onAddShipment} />
        <SegmentButton />
      </div>
      <StatusFilterChips
        active={activeFilter}
        onChange={setActiveFilter}
        counts={filterCounts}
        isListPanel={true}
      />

      <div className="grid gap-4">
        {filteredShipments.map((item) => {
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
