import type { ShipmentRepository, CreateShipmentDto, AddSegmentDto, UpdateSegmentPatch } from "./ShipmentRepository";
import type { Shipment, Segment } from "../../shared/types/shipment";
import { SegmentAssignmentStatus, SegmentLogisticsStatus } from "../../shared/types/shipment";
import {
  createShipment as apiCreateShipment,
  listShipments as apiListShipments,
  getShipment as apiGetShipment,
  getShipmentSegments as apiGetShipmentSegments,
  type ShipmentReadDto,
  type SegmentReadDto,
  SEGMENT_STATUS,
  SHIPMENT_STATUS,
} from "./shipment.api.service";

/**
 * Maps backend SegmentReadDto to frontend Segment type
 */
function mapSegmentDtoToSegment(dto: SegmentReadDto): Segment {
  // Map SEGMENT_STATUS to frontend assignment and logistics statuses
  let assignmentStatus: SegmentAssignmentStatus = SegmentAssignmentStatus.UNASSIGNED;
  let logisticsStatus: SegmentLogisticsStatus | undefined;

  // Map backend status to frontend statuses
  switch (dto.status) {
    case SEGMENT_STATUS.PENDING_ASSIGNMENT:
      assignmentStatus = SegmentAssignmentStatus.PENDING_ASSIGNMENT;
      break;
    case SEGMENT_STATUS.ASSIGNED:
      assignmentStatus = SegmentAssignmentStatus.ASSIGNED;
      break;
    case SEGMENT_STATUS.TO_ORIGIN:
    case SEGMENT_STATUS.AT_ORIGIN:
    case SEGMENT_STATUS.LOADING:
      assignmentStatus = SegmentAssignmentStatus.ASSIGNED;
      logisticsStatus = SegmentLogisticsStatus.AT_ORIGIN;
      break;
    case SEGMENT_STATUS.IN_CUSTOMS:
    case SEGMENT_STATUS.TO_DESTINATION:
      assignmentStatus = SegmentAssignmentStatus.ASSIGNED;
      logisticsStatus = SegmentLogisticsStatus.IN_TRANSIT;
      break;
    case SEGMENT_STATUS.AT_DESTINATION:
    case SEGMENT_STATUS.DELIVERED:
      assignmentStatus = SegmentAssignmentStatus.ASSIGNED;
      logisticsStatus = SegmentLogisticsStatus.DELIVERED;
      break;
    case SEGMENT_STATUS.CANCELLED:
      logisticsStatus = SegmentLogisticsStatus.CANCELLED;
      break;
  }

  // Map specific logistics statuses
  if (dto.status === SEGMENT_STATUS.LOADING) {
    logisticsStatus = SegmentLogisticsStatus.LOADING;
  }

  return {
    id: dto.id,
    assignmentStatus,
    logisticsStatus,
    source: "api",
    step: undefined, // Will be set based on segment order if needed
    place: dto.originCity || dto.originCountry || undefined,
    nextPlace: dto.destinationCity || dto.destinationCountry || undefined,
    startAt: dto.startedAt || dto.arrivedOriginAt || undefined,
    estFinishAt: dto.eta || dto.etaToDestination || undefined,
    isCompleted: dto.status === SEGMENT_STATUS.DELIVERED,
    isPlaceholder: false,
    datetime: dto.deliveredAt || dto.arrivedDestinationAt || dto.startedAt || undefined,
    // Additional fields that might be available from backend
    vehicleLabel: undefined, // Not in DTO, but can be added if available
    localCompany: undefined, // Not in DTO, but can be added if available
    documents: undefined, // Not in DTO, but can be added if available
    baseFeeUsd: undefined, // Not in DTO, but can be added if available
    driverName: undefined, // Not in DTO, but can be added if available
    driverPhoto: undefined, // Not in DTO, but can be added if available
    driverRating: undefined, // Not in DTO, but can be added if available
  };
}

/**
 * Maps backend ShipmentReadDto to frontend Shipment type
 */
function mapShipmentDtoToShipment(dto: ShipmentReadDto): Shipment {
  // Map segments if available
  const segments: Segment[] = dto.segments
    ? dto.segments.map((seg) => mapSegmentDtoToSegment(seg))
    : [];

  // Map shipment status
  let status: string = "Pending";
  switch (dto.status) {
    case SHIPMENT_STATUS.PENDING:
      status = "Pending";
      break;
    case SHIPMENT_STATUS.IN_TRANSIT:
      status = "In Transit";
      break;
    case SHIPMENT_STATUS.DELIVERED:
      status = "Delivered";
      break;
    case SHIPMENT_STATUS.CANCELLED:
      status = "Cancelled";
      break;
  }

  // Calculate progress based on segments
  const totalSegments = segments.length;
  const completedSegments = segments.filter(
    (s) => s.logisticsStatus === SegmentLogisticsStatus.DELIVERED
  ).length;
  const progressPercent = totalSegments > 0 ? (completedSegments / totalSegments) * 100 : 0;

  return {
    id: dto.id,
    title: dto.title,
    status,
    fromCountryCode: dto.originCountry, // Using country name as code for now
    toCountryCode: dto.destinationCountry, // Using country name as code for now
    progressPercent,
    source: "api",
    segments,
    // Additional fields
    userName: undefined,
    rating: undefined,
    vehicle: undefined,
    weight: dto.cargoWeight?.toString(),
    localCompany: undefined,
    destination: dto.destinationCity || dto.destinationCountry,
    lastActivity: undefined,
    lastActivityTime: dto.updatedAt,
    currentSegmentIndex: 0,
    isNew: false,
  };
}

export class ApiShipmentRepository implements ShipmentRepository {
  async listShipments(): Promise<Shipment[]> {
    const dtos = await apiListShipments();
    
    const shipments = await Promise.all(
      dtos.map(async (dto) => {
        const shipment = mapShipmentDtoToShipment(dto);
        // If segments are not included in the response, fetch them separately
        if (!dto.segments || dto.segments.length === 0) {
          try {
            const segments = await apiGetShipmentSegments(dto.id);
            shipment.segments = segments.map((seg, segIndex) => {
              const mapped = mapSegmentDtoToSegment(seg);
              // Add step number if not present
              if (mapped.step === undefined) {
                mapped.step = segIndex + 1;
              }
              return mapped;
            });
          } catch {
            // If segments endpoint fails, just use empty array
          }
        } else {
          // Ensure segments have step numbers
          shipment.segments = shipment.segments.map((seg, segIndex) => ({
            ...seg,
            step: seg.step ?? segIndex + 1,
          }));
        }
        return shipment;
      })
    );
    return shipments;
  }

  async getShipment(id: string): Promise<Shipment | undefined> {
    try {
      const dto = await apiGetShipment(id);
      const shipment = mapShipmentDtoToShipment(dto);
      // If segments are not included in the response, fetch them separately
      if (!dto.segments || dto.segments.length === 0) {
        try {
          const segments = await apiGetShipmentSegments(id);
          shipment.segments = segments.map((seg) => mapSegmentDtoToSegment(seg));
        } catch {
          // If segments endpoint fails, just use empty array
        }
      }
      return shipment;
    } catch (error: unknown) {
      // If shipment not found (404), return undefined
      if (error && typeof error === "object" && "status" in error && error.status === 404) {
        return undefined;
      }
      throw error;
    }
  }

  async createShipment(dto: CreateShipmentDto): Promise<Shipment> {
    // Map frontend CreateShipmentDto to API CreateShipmentDto
    // Note: The frontend DTO only has title and id, but the API requires more fields
    // We'll use reasonable defaults for required fields that aren't in the frontend DTO
    const apiDto = {
      title: dto.title,
      originCountry: "Unknown", // Default since not in frontend DTO
      originCity: "Unknown", // Default since not in frontend DTO
      destinationCountry: "Unknown", // Default since not in frontend DTO
      destinationCity: "Unknown", // Default since not in frontend DTO
      cargoType: "General", // Default since not in frontend DTO
      cargoWeight: 0, // Default since not in frontend DTO
      segmentCount: 1, // Default since not in frontend DTO
    };

    const created = await apiCreateShipment(apiDto);
    return mapShipmentDtoToShipment(created);
  }

  async addSegment(_dto: AddSegmentDto): Promise<Segment> {
    // Note: The backend API doesn't have a direct "add segment" endpoint in the controller
    // This would need to be implemented in the backend or handled differently
    // For now, we'll throw an error indicating this needs backend support
    void _dto; // Mark as intentionally unused
    throw new Error("Adding segments via API is not yet supported. Please use the backend API directly.");
  }

  async updateSegment(
    _shipmentId: string,
    _segmentId: string,
    _patch: UpdateSegmentPatch
  ): Promise<Segment> {
    // Note: The backend API doesn't have a direct "update segment" endpoint in the controller
    // This would need to be implemented in the backend or handled differently
    // For now, we'll throw an error indicating this needs backend support
    void _shipmentId;
    void _segmentId;
    void _patch;
    throw new Error("Updating segments via API is not yet supported. Please use the backend API directly.");
  }
}

