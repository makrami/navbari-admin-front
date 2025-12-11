import {z} from "zod";
import {http} from "../../lib/http";

// Enums matching API (using const assertions for erasableSyntaxOnly compatibility)
export const DRIVER_DOCUMENT_TYPE = {
  LICENSE: "license",
  VEHICLE_REG: "vehicle_reg",
  INSURANCE: "insurance",
  PHOTO: "photo",
  NATIONAL_OR_PASSPORT_ID: "national_or_passport_id",
  VEHICLE_ID_CARD: "vehicle_id_card",
  DRIVER_LICENSE: "driver_license",
  VEHICLE_PHOTO: "vehicle_photo",

  VEHICLE_TRAILER_PHOTO: "vehicle_trailer_photo",
  OTHER: "other",
} as const;

export const DRIVER_DOCUMENT_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const;

// Type aliases for the const assertions
export type DRIVER_DOCUMENT_TYPE =
  (typeof DRIVER_DOCUMENT_TYPE)[keyof typeof DRIVER_DOCUMENT_TYPE];
export type DRIVER_DOCUMENT_STATUS =
  (typeof DRIVER_DOCUMENT_STATUS)[keyof typeof DRIVER_DOCUMENT_STATUS];

// Zod schemas
const documentTypeSchema = z.nativeEnum(DRIVER_DOCUMENT_TYPE);
const documentStatusSchema = z.nativeEnum(DRIVER_DOCUMENT_STATUS);

// Driver Document Read DTO schema
const driverDocumentReadDtoSchema = z.object({
  id: z.string().uuid(),
  driverId: z.string().uuid(),
  documentType: documentTypeSchema,
  filePath: z.string(),
  status: documentStatusSchema,
  rejectionReason: z.string().optional().nullable(),
  uploadedBy: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type DriverDocumentReadDto = z.infer<typeof driverDocumentReadDtoSchema>;

// Approve/Reject Document DTO schema
const approveRejectDocumentDtoSchema = z.object({
  approvalStatus: z.enum(["approved", "rejected"]),
  rejectionReason: z.string().optional(),
});

export type ApproveRejectDocumentDto = z.infer<
  typeof approveRejectDocumentDtoSchema
>;

/**
 * Upload driver document
 */
export async function uploadDocument(
  driverId: string,
  documentType: DRIVER_DOCUMENT_TYPE,
  file: File
): Promise<DriverDocumentReadDto> {
  try {
    // Create FormData
    const formData = new FormData();
    formData.append("driverId", driverId);
    formData.append("documentType", documentType);
    formData.append("file", file);

    // Don't set Content-Type header - browser will set it with boundary automatically
    const response = await http.post<DriverDocumentReadDto>(
      "/driver-documents",
      formData
    );

    return driverDocumentReadDtoSchema.parse(response.data);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      throw new Error("Invalid response format");
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to upload document");
  }
}

/**
 * List driver documents
 */
export async function listDriverDocuments(
  driverId: string
): Promise<DriverDocumentReadDto[]> {
  try {
    const response = await http.get<DriverDocumentReadDto[]>(
      `/driver-documents/driver/${driverId}`
    );
    return z.array(driverDocumentReadDtoSchema).parse(response.data);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      throw new Error("Invalid response format");
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to fetch documents");
  }
}

/**
 * Approve or reject driver document
 */
export async function approveRejectDocument(
  id: string,
  approvalStatus: "approved" | "rejected",
  rejectionReason?: string
): Promise<DriverDocumentReadDto> {
  try {
    const validatedData = approveRejectDocumentDtoSchema.parse({
      approvalStatus,
      rejectionReason:
        approvalStatus === "rejected" ? rejectionReason : undefined,
    });

    const response = await http.put<DriverDocumentReadDto>(
      `/driver-documents/${id}/approve`,
      validatedData
    );
    return driverDocumentReadDtoSchema.parse(response.data);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      throw new Error(firstError?.message || "Invalid input");
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to update document status");
  }
}

/**
 * Approve a driver document
 */
export async function approveDocument(
  id: string
): Promise<DriverDocumentReadDto> {
  return approveRejectDocument(id, "approved");
}

/**
 * Reject a driver document
 */
export async function rejectDocument(
  id: string,
  rejectionReason: string
): Promise<DriverDocumentReadDto> {
  return approveRejectDocument(id, "rejected", rejectionReason);
}
