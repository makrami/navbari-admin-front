import { z } from "zod";
import { http } from "../../lib/http";

// Enums matching API
export const SHIPMENT_STATUS = {
  PENDING: "pending",
  IN_TRANSIT: "in_transit",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
} as const;

export const SEGMENT_STATUS = {
  PENDING_ASSIGNMENT: "pending_assignment",
  ASSIGNED: "assigned",
  TO_ORIGIN: "to_origin",
  AT_ORIGIN: "at_origin",
  LOADING: "loading",
  IN_CUSTOMS: "in_customs",
  TO_DESTINATION: "to_destination",
  AT_DESTINATION: "at_destination",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
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

// Zod schemas
const shipmentStatusSchema = z.nativeEnum(SHIPMENT_STATUS);
const segmentStatusSchema = z.nativeEnum(SEGMENT_STATUS);
const activityTypeSchema = z.nativeEnum(ACTIVITY_TYPE);

// Segment Read DTO schema
const segmentReadDtoSchema = z
  .object({
    id: z.string().uuid(),
    shipmentId: z.string().uuid(),
    companyId: z.string().uuid().optional().nullable(),
    driverId: z.string().uuid().optional().nullable(),
    originCountry: z.string().optional().nullable(),
    originCity: z.string().optional().nullable(),
    destinationCountry: z.string().optional().nullable(),
    destinationCity: z.string().optional().nullable(),
    status: segmentStatusSchema,
    eta: z.string().optional().nullable(),
    currentLatitude: z
      .union([z.number(), z.string()])
      .optional()
      .nullable()
      .transform((val) =>
        val === null || val === undefined
          ? null
          : typeof val === "string"
          ? parseFloat(val)
          : val
      ),
    currentLongitude: z
      .union([z.number(), z.string()])
      .optional()
      .nullable()
      .transform((val) =>
        val === null || val === undefined
          ? null
          : typeof val === "string"
          ? parseFloat(val)
          : val
      ),
    lastGpsUpdate: z.string().optional().nullable(),
    startedAt: z.string().optional().nullable(),
    arrivedOriginAt: z.string().optional().nullable(),
    startLoadingAt: z.string().optional().nullable(),
    arrivedDestinationAt: z.string().optional().nullable(),
    deliveredAt: z.string().optional().nullable(),
    etaToOrigin: z.string().optional().nullable(),
    etaToDestination: z.string().optional().nullable(),
    estimatedStartTime: z.string().optional().nullable(),
    estimatedFinishTime: z.string().optional().nullable(),
    baseFee: z
      .union([z.number(), z.string()])
      .optional()
      .nullable()
      .transform((val) =>
        val === null || val === undefined
          ? null
          : typeof val === "string"
          ? parseFloat(val)
          : val
      ),
    distanceKm: z
      .union([z.number(), z.string()])
      .optional()
      .nullable()
      .transform((val) =>
        val === null || val === undefined
          ? null
          : typeof val === "string"
          ? parseFloat(val)
          : val
      ),
    contractAccepted: z.boolean(),
    contractAcceptedAt: z.string().optional().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .passthrough();

export type SegmentReadDto = z.infer<typeof segmentReadDtoSchema>;

// Shipment Read DTO schema
const shipmentReadDtoSchema = z
  .object({
    id: z.string().uuid(),
    title: z.string(),
    originCountry: z.string(),
    originCity: z.string(),
    destinationCountry: z.string(),
    destinationCity: z.string(),
    cargoType: z.string(),
    cargoWeight: z
      .union([z.number(), z.string()])
      .transform((val) => (typeof val === "string" ? parseFloat(val) : val)),
    cargoDescription: z.string().optional().nullable(),
    status: shipmentStatusSchema,
    createdAt: z.string(),
    updatedAt: z.string(),
    segments: z.array(segmentReadDtoSchema).optional(),
  })
  .passthrough();

export type ShipmentReadDto = z.infer<typeof shipmentReadDtoSchema>;

// Activity Log Read DTO schema
const activityLogReadDtoSchema = z
  .object({
    id: z.string().uuid(),
    shipmentId: z.string().uuid().optional().nullable(),
    segmentId: z.string().uuid().optional().nullable(),
    userId: z.string().uuid(),
    activityType: activityTypeSchema,
    description: z.string(),
    metadata: z.record(z.string(), z.unknown()).optional().nullable(),
    createdAt: z.string(),
  })
  .passthrough();

export type ActivityLogReadDto = z.infer<typeof activityLogReadDtoSchema>;

// Create Shipment DTO schema
const createShipmentDtoSchema = z.object({
  title: z.string().min(1).max(200),
  originCountry: z.string().min(1).max(100),
  originCity: z.string().min(1).max(100),
  destinationCountry: z.string().min(1).max(100),
  destinationCity: z.string().min(1).max(100),
  cargoType: z.string().min(1).max(100),
  cargoWeight: z.number().positive(),
  cargoDescription: z.string().max(1000).optional(),
  segmentCount: z.number().int().positive().min(1),
});

export type CreateShipmentDto = z.infer<typeof createShipmentDtoSchema>;

// Update Shipment DTO schema
const updateShipmentDtoSchema = z
  .object({
    title: z.string().min(1).max(200).optional(),
    originCountry: z.string().min(1).max(100).optional(),
    originCity: z.string().min(1).max(100).optional(),
    destinationCountry: z.string().min(1).max(100).optional(),
    destinationCity: z.string().min(1).max(100).optional(),
    cargoType: z.string().min(1).max(100).optional(),
    cargoWeight: z.number().positive().optional(),
    cargoDescription: z.string().max(1000).optional(),
  })
  .partial();

export type UpdateShipmentDto = z.infer<typeof updateShipmentDtoSchema>;

// Shipment filters
export type ShipmentFilters = {
  skip?: number;
  take?: number;
};

/**
 * Create a new shipment
 */
export async function createShipment(
  data: CreateShipmentDto
): Promise<ShipmentReadDto> {
  try {
    // Validate input
    const validatedData = createShipmentDtoSchema.parse(data);

    const response = await http.post<ShipmentReadDto>(
      "/shipments",
      validatedData
    );
    return shipmentReadDtoSchema.parse(response.data);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      throw new Error(firstError?.message || "Invalid input");
    }
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
): Promise<ShipmentReadDto[]> {
  try {
    const params = new URLSearchParams();
    if (filters.skip !== undefined)
      params.append("skip", filters.skip.toString());
    if (filters.take !== undefined)
      params.append("take", filters.take.toString());

    const queryString = params.toString();
    const url = `/shipments${queryString ? `?${queryString}` : ""}`;

    const response = await http.get<ShipmentReadDto[]>(url);

    // Validate response array
    try {
      return z.array(shipmentReadDtoSchema).parse(response.data);
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        const firstIssue = validationError.issues[0];
        throw new Error(
          `Invalid response format: ${firstIssue?.path.join(".")} - ${
            firstIssue?.message
          }`
        );
      }
      throw validationError;
    }
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      throw new Error(
        `Invalid response format: ${error.issues
          .map((e: z.ZodIssue) => `${e.path.join(".")}: ${e.message}`)
          .join(", ")}`
      );
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to fetch shipments");
  }
}

/**
 * Get shipment by ID
 */
export async function getShipment(id: string): Promise<ShipmentReadDto> {
  try {
    const response = await http.get<ShipmentReadDto>(`/shipments/${id}`);
    return shipmentReadDtoSchema.parse(response.data);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      throw new Error("Invalid response format");
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
): Promise<ShipmentReadDto> {
  try {
    // Validate input
    const validatedData = updateShipmentDtoSchema.parse(data);

    const response = await http.put<ShipmentReadDto>(
      `/shipments/${id}`,
      validatedData
    );
    return shipmentReadDtoSchema.parse(response.data);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      throw new Error(firstError?.message || "Invalid input");
    }
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
 * Get shipment segments
 */
export async function getShipmentSegments(
  id: string
): Promise<SegmentReadDto[]> {
  try {
    const response = await http.get<SegmentReadDto[]>(
      `/shipments/${id}/segments`
    );
    return z.array(segmentReadDtoSchema).parse(response.data);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      throw new Error("Invalid response format");
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to fetch shipment segments");
  }
}

/**
 * Get shipment activity log
 */
export async function getShipmentActivityLog(
  id: string
): Promise<ActivityLogReadDto[]> {
  try {
    const response = await http.get<ActivityLogReadDto[]>(
      `/shipments/${id}/activity-log`
    );
    return z.array(activityLogReadDtoSchema).parse(response.data);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      throw new Error("Invalid response format");
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to fetch shipment activity log");
  }
}

// Update Segment DTO schema
const updateSegmentDtoSchema = z
  .object({
    originCountry: z.string().min(1).max(100).optional(),
    originCity: z.string().min(1).max(100).optional(),
    destinationCountry: z.string().min(1).max(100).optional(),
    destinationCity: z.string().min(1).max(100).optional(),
    estimatedStartTime: z
      .string()
      .refine(
        (val) => {
          if (!val) return true; // optional
          // Accept ISO 8601 datetime formats: YYYY-MM-DDTHH:mm:ss or YYYY-MM-DDTHH:mm:ssZ or YYYY-MM-DDTHH:mm:ss+HH:mm
          const iso8601Regex =
            /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?(Z|[+-]\d{2}:\d{2})?$/;
          return iso8601Regex.test(val) || !isNaN(Date.parse(val));
        },
        { message: "Invalid ISO datetime format" }
      )
      .optional(),
    estimatedFinishTime: z
      .string()
      .refine(
        (val) => {
          if (!val) return true; // optional
          // Accept ISO 8601 datetime formats: YYYY-MM-DDTHH:mm:ss or YYYY-MM-DDTHH:mm:ssZ or YYYY-MM-DDTHH:mm:ss+HH:mm
          const iso8601Regex =
            /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?(Z|[+-]\d{2}:\d{2})?$/;
          return iso8601Regex.test(val) || !isNaN(Date.parse(val));
        },
        { message: "Invalid ISO datetime format" }
      )
      .optional(),
    baseFee: z.number().optional(),
  })
  .partial();

export type UpdateSegmentDto = z.infer<typeof updateSegmentDtoSchema>;

/**
 * Update a segment
 */
export async function updateSegment(
  id: string,
  data: UpdateSegmentDto
): Promise<SegmentReadDto> {
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

    console.log("Normalized data before validation:", normalizedData);

    // Validate input
    const validatedData = updateSegmentDtoSchema.parse(normalizedData);

    const response = await http.put<SegmentReadDto>(
      `/segments/${id}`,
      validatedData
    );
    return segmentReadDtoSchema.parse(response.data);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      throw new Error(firstError?.message || "Invalid input");
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to update segment");
  }
}
