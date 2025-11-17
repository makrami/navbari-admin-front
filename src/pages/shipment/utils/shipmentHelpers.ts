import {SHIPMENT_STATUS} from "../../../services/shipment/shipment.api.service";
import type {Shipment} from "../../../shared/types/shipment";
import type {AddShipmentInput} from "../components/AddShipmentModal";

/**
 * Helper function to create shipment from form data
 */
export function createShipmentFromFormData(data: AddShipmentInput): Shipment {
  return {
    title: data.title,
    id: data.id,
    status: SHIPMENT_STATUS.PENDING,
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
    segments: [],
    activities: [],
    source: "api",
  };
}
