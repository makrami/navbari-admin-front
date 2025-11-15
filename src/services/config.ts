import { DemoShipmentRepository } from "./shipment/DemoShipmentRepository";
import { ApiShipmentRepository } from "./shipment/ApiShipmentRepository";
import type { ShipmentRepository } from "./shipment/ShipmentRepository";

const getDataMode = (): "demo" | "api" => {
  const mode = (import.meta as any).env?.VITE_DATA_MODE ?? (globalThis as any).process?.env?.VITE_DATA_MODE;
  return mode === "api" ? "api" : "demo";
};

export function isApiMode(): boolean {
  return getDataMode() === "api";
}

let singletonRepo: ShipmentRepository | null = null;

export function getShipmentRepository(): ShipmentRepository {
  if (singletonRepo) return singletonRepo;
  const mode = getDataMode();
  if (mode === "api") {
    singletonRepo = new ApiShipmentRepository();
  } else {
    singletonRepo = new DemoShipmentRepository();
  }
  return singletonRepo;
}
