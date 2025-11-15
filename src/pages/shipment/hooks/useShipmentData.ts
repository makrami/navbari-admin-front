import { useMemo } from "react";
import type { Shipment as DomainShipment } from "../../../shared/types/shipment";
import type { ShipmentStatus } from "../../../components";
import type { ShipmentData } from "../types/shipmentTypes";
import { DEMO_SHIPMENTS } from "../data/demoShipments";

export function useShipmentData(
  serviceShipments: DomainShipment[] | undefined
): ShipmentData[] {
  return useMemo(() => {
    // Prefer service-provided shipments when available; fallback to inline demo list
    const itemsFromService: ShipmentData[] = (serviceShipments ?? []).map(
      (s: DomainShipment): ShipmentData => ({
        title: s.title,
        id: s.id,
        status: (s.status as ShipmentStatus) || "In Origin",
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
        isNew: s.source === "demo-sim",
        segments: (s.segments || []).map((seg) => ({
          step: seg.step ?? 0,
          place: seg.place || "",
          datetime: seg.datetime || "",
          isCompleted: seg.isCompleted ?? seg.logisticsStatus === "DELIVERED",
          nextPlace: seg.nextPlace,
          startAt: seg.startAt,
          estFinishAt: seg.estFinishAt,
          vehicleLabel: seg.vehicleLabel,
          localCompany: seg.localCompany,
          baseFeeUsd: seg.baseFeeUsd,
          driverName: seg.driverName || "",
          driverPhoto: seg.driverPhoto,
          driverRating: seg.driverRating ?? 0,
        })),
        activities: [],
      })
    );

    // Always include demo shipments for now (demo mode), while keeping
    // service-provided shipments when available. Service items take priority
    // over demo items if they have the same ID.
    if (itemsFromService.length === 0) {
      return DEMO_SHIPMENTS;
    }
    
    // Deduplicate by ID - service shipments take priority over demo shipments
    const result: ShipmentData[] = [];
    
    // First add demo shipments
    DEMO_SHIPMENTS.forEach((shipment) => {
      result.push(shipment);
    });
    
    // Then add service shipments (they override demo shipments with same ID)
    itemsFromService.forEach((shipment) => {
      const id = String(shipment.id);
      const existingIndex = result.findIndex((s) => String(s.id) === id);
      if (existingIndex !== -1) {
        // Replace demo shipment with service shipment if same ID
        result[existingIndex] = shipment;
      } else {
        // Add new service shipment
        result.push(shipment);
      }
    });
    
    return result;
  }, [serviceShipments]);
}

