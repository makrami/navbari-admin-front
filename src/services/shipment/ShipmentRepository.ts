import type { Shipment, Segment } from "../../shared/types/shipment";

export type CreateShipmentDto = {
  title: string;
  id: string;
};

export type AddSegmentDto = {
  shipmentId: string;
  segment: Omit<Segment, "source"> & { source?: Segment["source"] };
};

export type UpdateSegmentPatch = Partial<Pick<Segment,
  | "assignmentStatus"
  | "logisticsStatus"
  | "place"
  | "nextPlace"
  | "startAt"
  | "estFinishAt"
  | "vehicleLabel"
  | "localCompany"
  | "documents"
  | "baseFeeUsd"
>>;

export interface ShipmentRepository {
  listShipments(): Promise<Shipment[]>;
  getShipment(id: string): Promise<Shipment | undefined>;
  createShipment(dto: CreateShipmentDto): Promise<Shipment>;
  addSegment(dto: AddSegmentDto): Promise<Segment>;
  updateSegment(
    shipmentId: string,
    segmentId: string,
    patch: UpdateSegmentPatch
  ): Promise<Segment>;
}
