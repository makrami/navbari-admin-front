import type { ShipmentData } from "../types/shipmentTypes";
import type { AddShipmentInput } from "../components/AddShipmentModal";

/**
 * Helper function to create shipment from form data
 */
export function createShipmentFromFormData(
  data: AddShipmentInput
): ShipmentData {
  return {
    title: data.title,
    id: data.id,
    status: "In Origin",
    fromCountryCode: "CN",
    toCountryCode: "RU",
    progressPercent: 0,
    userName: data.driverName || "",
    rating: data.driverRating || 0,
    vehicle: "Unknown",
    weight: `${data.cargoWeight ?? 0} KG`,
    localCompany: "N/A",
    destination: data.to || data.destination || "",
    lastActivity: "Created",
    lastActivityTime: "Just now",
    currentSegmentIndex: -1, // -1 means no segment is current (unassigned state)
    isNew: true,
    segments: Array.from({
      length: Math.max(0, Number(data.segmentsAmount ?? 0)),
    }).map((_, i, arr) => {
      const isFirst = i === 0;
      const isLast = i === arr.length - 1;

      return {
        step: i + 1,
        // First segment's origin is the shipment origin
        place: isFirst ? data.from || "" : "",
        // Last segment's destination is the shipment destination
        nextPlace: isLast ? data.to || "" : undefined,
        datetime: "",
        isCompleted: false,
        // Only mark as placeholder if it's not the first segment
        // First segment should be editable immediately
        isPlaceholder: !isFirst,
        driverName: "",
        driverRating: 0,
      };
    }),
    activities: [],
  };
}
