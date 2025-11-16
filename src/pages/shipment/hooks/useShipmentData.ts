import { useMemo } from "react";
import type { Shipment as DomainShipment } from "../../../shared/types/shipment";
import type { ShipmentStatus } from "../../../components";
import type { ShipmentData } from "../types/shipmentTypes";
import type { SegmentData } from "../../../shared/types/segmentData";

export function useShipmentData(
  serviceShipments: DomainShipment[] | undefined
): ShipmentData[] {
  return useMemo(() => {
    if (!serviceShipments || serviceShipments.length === 0) {
      return [];
    }
    const itemsFromService: ShipmentData[] = (serviceShipments ?? []).map(
      (s: DomainShipment): ShipmentData => ({
        title: s.title,
        id: s.id,
        status: (s.status as ShipmentStatus) || "Pending",
        fromCountryCode: s.fromCountryCode || "CN",
        toCountryCode: s.toCountryCode || "RU",
        progressPercent: s.progressPercent ?? 0,
        userName: s.userName || "",
        rating: s.rating ?? 0,
        vehicle: s.vehicle || "",
        weight: s.weight || "",
        localCompany: s.localCompany || "",
        destination: s.destination || "",
        lastActivity: s.lastActivity || "",
        lastActivityTime: s.lastActivityTime || "",
        currentSegmentIndex: s.currentSegmentIndex ?? 0,
        isNew: false,
        segments: s.segments.map((seg: SegmentData) => ({
          ...seg,
          step: seg.step ?? 0,
        })),
        activities: [],
      })
    );

    return itemsFromService;
  }, [serviceShipments]);
}
