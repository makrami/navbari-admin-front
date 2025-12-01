import {
  SearchShipment,
  AddShipment,
  SegmentButton,
  ShipmentItem,
} from "../../../components";
import { ListPanel } from "../../../shared/components/ui/ListPanel";
import type { Shipment } from "../../../shared/types/shipment";
import type { Segment } from "../../../shared/types/segmentData";
import { useMemo, useState } from "react";
import { StatusFilterChips, type FilterKey } from "./StatusFilterChips";
import { useTranslation } from "react-i18next";

// Helper function to format Segment for ShipmentItem
function formatSegmentsForShipmentItem(segments: Segment[]): Array<{
  step: number;
  place: string;
  datetime: string;
  isCompleted?: boolean;
}> {
  return segments.map((seg) => {
    // Format datetime from estimatedStartTime or startedAt
    let datetime = "";
    const dateTimeSource = seg.estimatedStartTime || seg.startedAt;
    if (dateTimeSource) {
      try {
        const date = new Date(dateTimeSource);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        datetime = `${day}/${month} - ${hours}:${minutes}`;
      } catch {
        // If date parsing fails, use empty string
      }
    }

    return {
      step: seg.step ?? 0,
      place: seg.place || seg.originCity || seg.destinationCity || "",
      datetime,
      isCompleted: seg.isCompleted ?? false,
    };
  });
}

type ShipmentListPanelProps = {
  shipments: Shipment[];
  selectedId: string;
  onShipmentSelect: (id: string) => void;
  onAddShipment: () => void;
  editedSegmentsByShipmentId?: Record<string, Segment[]>;
  segmentsLoading?: boolean;
};

export function ShipmentListPanel({
  shipments,
  selectedId,
  onShipmentSelect,
  onAddShipment,
  editedSegmentsByShipmentId = {},
  segmentsLoading = false,
}: ShipmentListPanelProps) {
  const { t } = useTranslation();
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");

  // Calculate counts for each filter based on backend shipment status enum
  const filterCounts = useMemo(() => {
    const counts: Record<FilterKey, number> = {
      all: shipments.length,
      Pending: 0,
      "In Transit": 0,
      Delivered: 0,
      Cancelled: 0,
    };

    shipments.forEach((shipment) => {
      // Map shipment status to filter key
      const statusKey = shipment.status as FilterKey;
      if (statusKey in counts) {
        counts[statusKey]++;
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
    <ListPanel
      title={t("shipment.listPanel.title")}
      className="w-[372px] min-w-[372px]"
    >
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

          // Get segments for this shipment (from editedSegmentsByShipmentId)
          // This allows showing driver info even if shipment is not currently selected
          const segmentsForItem = editedSegmentsByShipmentId[item.id] ?? [];

          // Format segments for ShipmentItem component (only show timeline when selected)
          const formattedSegments =
            isSelected && segmentsForItem.length > 0
              ? formatSegmentsForShipmentItem(segmentsForItem)
              : [];

          return (
            <ShipmentItem
              key={item.id}
              {...item}
              selected={isSelected}
              onClick={() => onShipmentSelect(item.id)}
              segments={formattedSegments}
              fullSegments={segmentsForItem}
              segmentsLoading={isSelected && segmentsLoading}
            />
          );
        })}
      </div>
    </ListPanel>
  );
}
