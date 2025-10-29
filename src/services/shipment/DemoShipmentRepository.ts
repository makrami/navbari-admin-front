import type { ShipmentRepository, CreateShipmentDto, AddSegmentDto, UpdateSegmentPatch } from "./ShipmentRepository";
import type { Shipment, Segment } from "../../shared/types/shipment";
import { SegmentAssignmentStatus } from "../../shared/types/shipment";
import { demoStaticShipments, demoSimShipments } from "./demoData";

const mkId = (prefix: string = "id"): string => `${prefix}-${Math.random().toString(36).slice(2, 10)}`;

export class DemoShipmentRepository implements ShipmentRepository {
  private staticShipments: Shipment[] = [...demoStaticShipments];
  private simShipments: Shipment[] = [...demoSimShipments];

  async listShipments(): Promise<Shipment[]> {
    return [...this.simShipments, ...this.staticShipments];
  }

  async getShipment(id: string): Promise<Shipment | undefined> {
    return this.simShipments.find((s) => s.id === id) || this.staticShipments.find((s) => s.id === id);
  }

  async createShipment(dto: CreateShipmentDto): Promise<Shipment> {
    const shipment: Shipment = {
      id: dto.id || mkId("ship"),
      title: dto.title,
      source: "demo-sim",
      status: "In Origin",
      fromCountryCode: "CN",
      toCountryCode: "RU",
      progressPercent: 0,
      userName: "",
      rating: 0,
      currentSegmentIndex: 0,
      isNew: true,
      segments: [],
    };
    this.simShipments.unshift(shipment);
    return shipment;
  }

  async addSegment(dto: AddSegmentDto): Promise<Segment> {
    const target = await this.getShipment(dto.shipmentId);
    if (!target) throw new Error("Shipment not found");
    const segment: Segment = {
      id: dto.segment.id || mkId("seg"),
      assignmentStatus: dto.segment.assignmentStatus ?? SegmentAssignmentStatus.UNASSIGNED,
      logisticsStatus: dto.segment.logisticsStatus,
      source: dto.segment.source ?? target.source,
      step: (target.segments?.length || 0) + 1,
      place: dto.segment.place,
      datetime: dto.segment.datetime,
      isCompleted: dto.segment.isCompleted,
      isPlaceholder: dto.segment.isPlaceholder,
      nextPlace: dto.segment.nextPlace,
      startAt: dto.segment.startAt,
      estFinishAt: dto.segment.estFinishAt,
      vehicleLabel: dto.segment.vehicleLabel,
      localCompany: dto.segment.localCompany,
      documents: dto.segment.documents,
      baseFeeUsd: dto.segment.baseFeeUsd,
      driverName: dto.segment.driverName,
      driverPhoto: dto.segment.driverPhoto,
      driverRating: dto.segment.driverRating,
    };
    target.segments.push(segment);
    return segment;
  }

  async updateSegment(
    shipmentId: string,
    segmentId: string,
    patch: UpdateSegmentPatch
  ): Promise<Segment> {
    const ship = await this.getShipment(shipmentId);
    if (!ship) throw new Error("Shipment not found");
    const idx = ship.segments.findIndex((s) => s.id === segmentId);
    if (idx === -1) throw new Error("Segment not found");
    const updated: Segment = { ...ship.segments[idx], ...patch } as Segment;
    ship.segments[idx] = updated;
    return updated;
  }
}
