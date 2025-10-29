import type { ShipmentRepository, CreateShipmentDto, AddSegmentDto, UpdateSegmentPatch } from "./ShipmentRepository";
import type { Shipment, Segment } from "../../shared/types/shipment";
import { getShipmentRepository } from "../config";

export class ShipmentService {
  private repo: ShipmentRepository;

  constructor(repo: ShipmentRepository = getShipmentRepository()) {
    this.repo = repo;
  }

  async list(): Promise<Shipment[]> {
    return this.repo.listShipments();
  }

  async get(id: string): Promise<Shipment | undefined> {
    return this.repo.getShipment(id);
  }

  async create(dto: CreateShipmentDto): Promise<Shipment> {
    return this.repo.createShipment(dto);
  }

  async addSegment(dto: AddSegmentDto): Promise<Segment> {
    const shipment = await this.repo.getShipment(dto.shipmentId);
    if (!shipment) throw new Error("Shipment not found");
    if (shipment.source === "demo-static") {
      throw new Error("Cannot add segment to read-only static shipment");
    }
    return this.repo.addSegment(dto);
  }

  async updateSegment(
    shipmentId: string,
    segmentId: string,
    patch: UpdateSegmentPatch
  ): Promise<Segment> {
    const shipment = await this.repo.getShipment(shipmentId);
    if (!shipment) throw new Error("Shipment not found");
    const seg = shipment.segments.find((s) => s.id === segmentId);
    if (!seg) throw new Error("Segment not found");
    if (seg.source === "demo-static" || shipment.source === "demo-static") {
      throw new Error("Cannot modify read-only static segment");
    }
    return this.repo.updateSegment(shipmentId, segmentId, patch);
  }
}
