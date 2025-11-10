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
    }).map((_, i) => ({
      step: i + 1,
      place: i === 0 ? data.from || "" : "Assign Previous Segment First",
      datetime: "",
      isCompleted: false,
      isPlaceholder: i > 0,
      driverName: "",
      driverRating: 0,
    })),
    activities: [],
  };
}

