import { http } from "../../lib/http";
import type { Shipment } from "../../shared/types/shipment";
import type { Segment } from "../../shared/types/segmentData";
import { SegmentStatus } from "../../shared/types/segmentData";

// Enums matching API
export const SHIPMENT_STATUS = {
  PENDING: "pending",
  IN_TRANSIT: "in_transit",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
} as const;

// Keep SEGMENT_STATUS for backward compatibility, but use SegmentStatus enum from types
export const SEGMENT_STATUS = {
  PENDING_ASSIGNMENT: SegmentStatus.PENDING_ASSIGNMENT,
  ASSIGNED: SegmentStatus.ASSIGNED,
  TO_ORIGIN: SegmentStatus.TO_ORIGIN,
  AT_ORIGIN: SegmentStatus.AT_ORIGIN,
  LOADING: SegmentStatus.LOADING,
  IN_CUSTOMS: SegmentStatus.IN_CUSTOMS,
  TO_DESTINATION: SegmentStatus.TO_DESTINATION,
  AT_DESTINATION: SegmentStatus.AT_DESTINATION,
  DELIVERED: SegmentStatus.DELIVERED,
  CANCELLED: SegmentStatus.CANCELLED,
} as const;

export const ACTIVITY_TYPE = {
  STATUS_CHANGE: "status_change",
  DOCUMENT_UPLOAD: "document_upload",
  DOCUMENT_APPROVAL: "document_approval",
  DOCUMENT_REJECTION: "document_rejection",
  PAYMENT_REGISTERED: "payment_registered",
  PAYMENT_CREATED: "payment_created",
  PAYMENT_APPROVED: "payment_approved",
  PAYMENT_REJECTED: "payment_rejected",
  PAYMENT_UPDATED: "payment_updated",
  PAYMENT_DELETED: "payment_deleted",
  SEGMENT_ASSIGNED: "segment_assigned",
  CONTRACT_ACCEPTED: "contract_accepted",
  CONTRACT_REJECTED: "contract_rejected",
  GPS_UPDATE: "gps_update",
  ETA_UPDATE: "eta_update",
  SYSTEM_SETTING_UPDATED: "system_setting_updated",
  OTHER: "other",
} as const;

// Type aliases
export type SHIPMENT_STATUS =
  (typeof SHIPMENT_STATUS)[keyof typeof SHIPMENT_STATUS];
export type SEGMENT_STATUS =
  (typeof SEGMENT_STATUS)[keyof typeof SEGMENT_STATUS];
export type ACTIVITY_TYPE = (typeof ACTIVITY_TYPE)[keyof typeof ACTIVITY_TYPE];

// Segment Read DTO type - now using Segment interface
// Keep as type alias for backward compatibility
export type SegmentReadDto = Segment;

// Shipment Read DTO type
export interface ShipmentReadDto {
  id: string;
  title: string;
  originCountry: string;
  originCity: string;
  destinationCountry: string;
  destinationCity: string;
  cargoType: string;
  cargoWeight: number;
  progressPercent: number;
  cargoDescription?: string | null;
  status: SHIPMENT_STATUS;
  createdAt: string;
  updatedAt: string;
  segments?: Segment[];
  [key: string]: unknown;
}

// Activity Log Read DTO type
export interface ActivityLogReadDto {
  id: string;
  shipmentId?: string | null;
  segmentId?: string | null;
  userId: string;
  activityType: ACTIVITY_TYPE;
  description: string;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  [key: string]: unknown;
}

// Activity Log Response type (paginated)
export interface ActivityLogResponse {
  logs: ActivityLogReadDto[];
  total: number;
  skip: number;
  take: number;
}

// Create Shipment DTO type
export interface CreateShipmentDto {
  title: string;
  originCountry: string;
  originCity: string;
  destinationCountry: string;
  destinationCity: string;
  cargoType: string;
  cargoWeight: number;
  cargoDescription?: string;
  segmentCount: number;
}

// Update Shipment DTO type
export interface UpdateShipmentDto {
  title?: string;
  originCountry?: string;
  originCity?: string;
  destinationCountry?: string;
  destinationCity?: string;
  cargoType?: string;
  cargoWeight?: number;
  cargoDescription?: string;
}

// Shipment filters
export type ShipmentFilters = {
  skip?: number;
  take?: number;
};

/**
 * Maps backend ShipmentReadDto to frontend Shipment type
 */
function mapShipmentDtoToShipment(dto: ShipmentReadDto): Shipment {
  // Map segments if available - directly use SegmentReadDto, only add step and source
  const segments: Segment[] = dto.segments
    ? dto.segments.map((seg, index) => ({
        ...seg, // All fields from SegmentReadDto (including baseFee and distanceKm)
        step: index + 1,
        source: "api" as const,
      }))
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

  return {
    id: dto.id,
    title: dto.title,
    status,
    fromCountryCode: dto.originCountry, // Using country name as code for now
    toCountryCode: dto.destinationCountry, // Using country name as code for now
    progressPercent: dto.progressPercent,
    source: "api",
    segments,
    // Required fields from DTO
    cargoType: dto.cargoType,
    cargoWeight: dto.cargoWeight?.toString() || "0",
    cargoDescription: dto.cargoDescription ?? null,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
    // Additional fields
    userName: undefined,
    rating: undefined,
    vehicle: undefined,
    weight: dto.cargoWeight?.toString(),
    localCompany: undefined,
    originCountry: dto.originCountry,
    originCity: dto.originCity,
    destination: dto.destinationCity || dto.destinationCountry,
    destinationCountry: dto.destinationCountry,
    destinationCity: dto.destinationCity,
    lastActivity: undefined,
    lastActivityTime: dto.updatedAt,
    currentSegmentIndex: 0,
    isNew: false,
  };
}

/**
 * Maps Segment to SegmentData (adds UI-specific fields)
 */
function mapSegmentDtoToSegmentData(dto: Segment, step?: number): Segment {
  return {
    ...dto,
    step: step,
    source: "api" as const,
  };
}

/**
 * Create a new shipment
 */
export async function createShipment(
  data: CreateShipmentDto
): Promise<Shipment> {
  try {
    const response = await http.post<ShipmentReadDto>("/shipments", data);
    return mapShipmentDtoToShipment(response.data);
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to create shipment");
  }
}

/**
 * List all shipments with optional pagination
 */
export async function listShipments(
  filters: ShipmentFilters = {}
): Promise<Shipment[]> {
  try {
    const params = new URLSearchParams();
    if (filters.skip !== undefined)
      params.append("skip", filters.skip.toString());
    if (filters.take !== undefined)
      params.append("take", filters.take.toString());

    const queryString = params.toString();
    const url = `/shipments${queryString ? `?${queryString}` : ""}`;

    const response = await http.get<ShipmentReadDto[]>(url);

    const shipments = response.data.map((dto) => {
      const shipment = mapShipmentDtoToShipment(dto);
      // Only use segments if they're included in the response
      // Segments will be fetched separately when a shipment is selected
      if (dto.segments && dto.segments.length > 0 && shipment.segments) {
        // Ensure segments have step numbers
        shipment.segments = shipment.segments.map((seg, segIndex) => ({
          ...seg,
          step: seg.step ?? segIndex + 1,
        }));
      } else {
        // Initialize with empty segments - will be fetched when shipment is selected
        shipment.segments = [];
      }
      return shipment;
    });
    return shipments;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to fetch shipments");
  }
}

/**
 * Get shipment by ID
 */
export async function getShipment(id: string): Promise<Shipment | undefined> {
  try {
    const response = await http.get<ShipmentReadDto>(`/shipments/${id}`);
    const shipment = mapShipmentDtoToShipment(response.data);
    // Only use segments if they're included in the response
    // Segments will be fetched separately when a shipment is selected
    if (
      response.data.segments &&
      response.data.segments.length > 0 &&
      shipment.segments
    ) {
      // Ensure segments have step numbers
      shipment.segments = shipment.segments.map((seg, segIndex) => ({
        ...seg,
        step: seg.step ?? segIndex + 1,
      }));
    } else {
      // Initialize with empty segments - will be fetched when shipment is selected
      shipment.segments = [];
    }
    return shipment;
  } catch (error: unknown) {
    // If shipment not found (404), return undefined
    if (
      error &&
      typeof error === "object" &&
      "status" in error &&
      error.status === 404
    ) {
      return undefined;
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to fetch shipment");
  }
}

/**
 * Update a shipment
 */
export async function updateShipment(
  id: string,
  data: UpdateShipmentDto
): Promise<Shipment> {
  try {
    const response = await http.put<ShipmentReadDto>(`/shipments/${id}`, data);
    return mapShipmentDtoToShipment(response.data);
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to update shipment");
  }
}

/**
 * Delete a shipment
 */
export async function deleteShipment(id: string): Promise<void> {
  try {
    await http.delete(`/shipments/${id}`);
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to delete shipment");
  }
}

/**
 * Get shipment segments (internal - returns DTOs for use in mapping)
 */
async function getShipmentSegmentsInternal(id: string): Promise<Segment[]> {
  try {
    const response = await http.get<Segment[]>(`/shipments/${id}/segments`);
    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to fetch shipment segments");
  }
}

/**
 * Get shipment segments
 */
export async function getShipmentSegments(id: string): Promise<Segment[]> {
  try {
    const dtos = await getShipmentSegmentsInternal(id);
    return dtos.map((dto, index) => mapSegmentDtoToSegmentData(dto, index + 1));
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to fetch shipment segments");
  }
}

/**
 * List all segments with optional driver filter
 */
export async function listSegments(
  driverId?: string,
  companyId?: string
): Promise<Segment[]> {
  try {
    const params = new URLSearchParams();
    if (driverId) {
      params.append("driverId", driverId);
    }
    if (companyId) {
      params.append("companyId", companyId);
    }

    const queryString = params.toString();
    const url = `/segments${queryString ? `?${queryString}` : ""}`;

    const response = await http.get<Segment[]>(url);
    return response.data.map((dto, index) =>
      mapSegmentDtoToSegmentData(dto, index + 1)
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to fetch segments");
  }
}

/**
 * Get shipment activity log
 */
export async function getShipmentActivityLog(
  id: string
): Promise<ActivityLogReadDto[]> {
  try {
    const response = await http.get<ActivityLogResponse>(
      `/shipments/${id}/activity-log`
    );
    return response.data.logs;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to fetch shipment activity log");
  }
}

// Update Segment DTO type
export interface UpdateSegmentDto {
  originCountry?: string;
  originCity?: string;
  destinationCountry?: string;
  destinationCity?: string;
  estimatedStartTime?: string;
  estimatedFinishTime?: string;
  baseFee?: number;
}

/**
 * Update a segment
 */
export async function updateSegment(
  id: string,
  data: UpdateSegmentDto
): Promise<Segment> {
  try {
    // Normalize datetime strings to ISO 8601 format (ensure seconds are included)
    const normalizedData = { ...data };

    // Helper function to normalize datetime string to ISO 8601 format
    // Backend @IsDateString() requires strict ISO 8601 format (e.g., 2024-01-01T12:00:00.000Z)
    const normalizeDateTime = (
      dateTime: string | undefined
    ): string | undefined => {
      if (!dateTime || dateTime.trim() === "") return undefined;

      const trimmed = dateTime.trim();

      try {
        // Parse the date string and convert to proper ISO 8601 format
        let date: Date;

        // If it's just a date (YYYY-MM-DD), add default time
        if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
          date = new Date(`${trimmed}T00:00:00`);
        }
        // If it's missing seconds (YYYY-MM-DDTHH:mm), add them
        else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(trimmed)) {
          date = new Date(`${trimmed}:00`);
        }
        // If it already has seconds, parse it directly
        else {
          date = new Date(trimmed);
        }

        // Check if date is valid
        if (isNaN(date.getTime())) {
          console.error("Invalid date string:", trimmed);
          return undefined;
        }

        // Return ISO 8601 string (YYYY-MM-DDTHH:mm:ss.sssZ)
        // This format is accepted by @IsDateString() validator
        return date.toISOString();
      } catch (error) {
        console.error("Error normalizing datetime:", trimmed, error);
        return undefined;
      }
    };

    if (normalizedData.estimatedStartTime) {
      const original = normalizedData.estimatedStartTime;
      normalizedData.estimatedStartTime = normalizeDateTime(
        normalizedData.estimatedStartTime
      );
      console.log("Normalized estimatedStartTime:", {
        original,
        normalized: normalizedData.estimatedStartTime,
      });
    }
    if (normalizedData.estimatedFinishTime) {
      const original = normalizedData.estimatedFinishTime;
      normalizedData.estimatedFinishTime = normalizeDateTime(
        normalizedData.estimatedFinishTime
      );
      console.log("Normalized estimatedFinishTime:", {
        original,
        normalized: normalizedData.estimatedFinishTime,
      });
    }

    console.log("Normalized data before sending:", normalizedData);

    const response = await http.put<Segment>(`/segments/${id}`, normalizedData);
    return mapSegmentDtoToSegmentData(response.data);
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to update segment");
  }
}

/**
 * Announce segment to companies
 */
export async function announceSegment(
  id: string,
  companyIds: string[]
): Promise<Segment> {
  try {
    const response = await http.post<Segment>(`/segments/${id}/announce`, {
      companyIds,
    });
    return mapSegmentDtoToSegmentData(response.data);
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to announce segment");
  }
}

// Segment Announcement Read DTO type
export interface SegmentAnnouncementReadDto {
  id: string;
  segmentId: string;
  companyId: string;
  companyName: string;
  companyLogoUrl: string | null;
  status: "pending" | "accepted" | "rejected";
  announcedBy: string;
  announcerName: string;
  respondedBy?: string | null;
  responderName?: string | null;
  driverId?: string | null;
  driverName?: string | null;
  driverAvatarUrl?: string | null;
  rejectionComment?: string | null;
  respondedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Get segment announcements
 */
export async function getSegmentAnnouncements(
  id: string
): Promise<SegmentAnnouncementReadDto[]> {
  try {
    const response = await http.get<SegmentAnnouncementReadDto[]>(
      `/segments/${id}/announcements`
    );
    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to fetch segment announcements");
  }
}

// Assign Segment DTO type
export interface AssignSegmentDto {
  companyId: string;
  driverId: string;
}

/**
 * Assign a segment to a company and driver
 */
export async function assignSegment(
  id: string,
  data: AssignSegmentDto
): Promise<Segment> {
  try {
    const response = await http.post<Segment>(`/segments/${id}/assign`, data);
    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to assign segment");
  }
}

// Segment Route Response DTO type
export interface SegmentRouteDto {
  id: string;
  originLatitude: number;
  originLongitude: number;
  destinationLatitude: number;
  destinationLongitude: number;
  geometry: string[];
  distance: number;
  distanceKm: number;
  duration: number;
  routeData: Record<string, unknown>;
}

/**
 * Get segment route
 */
export async function getSegmentRoute(id: string): Promise<SegmentRouteDto> {
  try {
    const response = await http.get<SegmentRouteDto>(`/segments/${id}/route`);
    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to fetch segment route");
  }
}

// Create Segment DTO type
export interface CreateSegmentDto {
  shipmentId: string;
}

/**
 * Create a new segment
 */
export async function createSegment(data: CreateSegmentDto): Promise<Segment> {
  try {
    const response = await http.post<Segment>("/segments", data);
    return mapSegmentDtoToSegmentData(response.data);
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to create segment");
  }
}

/**
 * Delete a segment
 */
export async function deleteSegment(id: string): Promise<void> {
  try {
    await http.delete(`/segments/${id}`);
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to delete segment");
  }
}

/**
 * Cancel a segment
 */
export async function cancelSegment(id: string): Promise<Segment> {
  try {
    const response = await http.post<Segment>(`/segments/${id}/cancel`);
    return mapSegmentDtoToSegmentData(response.data);
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to cancel segment");
  }
}

// Update Segment Details DTO type
export interface UpdateSegmentDetailsDto {
  originDetails?: string;
  destinationDetails?: string;
}

/**
 * Update segment location details
 */
export async function updateSegmentDetails(
  id: string,
  data: UpdateSegmentDetailsDto
): Promise<Segment> {
  try {
    const response = await http.put<Segment>(`/segments/${id}/details`, data);
    return mapSegmentDtoToSegmentData(response.data);
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to update segment details");
  }
}
