import { DemoShipmentRepository } from "./shipment/DemoShipmentRepository";
import type { ShipmentRepository } from "./shipment/ShipmentRepository";

const getDataMode = (): "demo" | "api" => {
  const mode = (import.meta as any).env?.VITE_DATA_MODE ?? (globalThis as any).process?.env?.VITE_DATA_MODE;
  return mode === "api" ? "api" : "demo";
};

let singletonRepo: ShipmentRepository | null = null;

export function getShipmentRepository(): ShipmentRepository {
  if (singletonRepo) return singletonRepo;
  const mode = getDataMode();
  if (mode === "api") {
    // Lazy import or swap to API repository here when available
    // For now, fallback to demo
    singletonRepo = new DemoShipmentRepository();
  } else {
    singletonRepo = new DemoShipmentRepository();
  }
  return singletonRepo;
}
