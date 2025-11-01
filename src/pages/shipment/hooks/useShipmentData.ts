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

    return itemsFromService.length ? itemsFromService : DEMO_SHIPMENTS;
  }, [serviceShipments]);
}

