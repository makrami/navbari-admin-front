import {z} from "zod";
import {http} from "../../lib/http";

// Enums matching API (using const assertions for erasableSyntaxOnly compatibility)
export const COMPANY_DOCUMENT_TYPE = {
  LICENSE: "license",
  INSURANCE: "insurance",
  MANAGER_ID: "manager_id",
  PRIMARY_CONTACT_ID: "primary_contact_id",
  OTHER: "other",
} as const;

export const COMPANY_DOCUMENT_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const;

// Type aliases for the const assertions
export type COMPANY_DOCUMENT_TYPE =
  (typeof COMPANY_DOCUMENT_TYPE)[keyof typeof COMPANY_DOCUMENT_TYPE];
export type COMPANY_DOCUMENT_STATUS =
  (typeof COMPANY_DOCUMENT_STATUS)[keyof typeof COMPANY_DOCUMENT_STATUS];

// Zod schemas
const documentTypeSchema = z.nativeEnum(COMPANY_DOCUMENT_TYPE);
const documentStatusSchema = z.nativeEnum(COMPANY_DOCUMENT_STATUS);

// Company Document Read DTO schema
const companyDocumentReadDtoSchema = z.object({
  id: z.string().uuid(),
  companyId: z.string().uuid(),
  documentType: documentTypeSchema,
  filePath: z.string(),
  status: documentStatusSchema,
  rejectionReason: z.string().optional().nullable(),
  uploadedBy: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type CompanyDocumentReadDto = z.infer<
  typeof companyDocumentReadDtoSchema
>;

// Reject Document DTO schema
const rejectDocumentDtoSchema = z.object({
  rejectionReason: z.string().min(1).max(500),
  approvalStatus: z.nativeEnum(COMPANY_DOCUMENT_STATUS),
});

export type RejectDocumentDto = z.infer<typeof rejectDocumentDtoSchema>;

/**
 * Upload company document
 */
export async function uploadDocument(
  companyId: string,
  documentType: COMPANY_DOCUMENT_TYPE,
  file: File
): Promise<CompanyDocumentReadDto> {
  try {
    // Create FormData
    const formData = new FormData();
    formData.append("companyId", companyId);
    formData.append("documentType", documentType);
    formData.append("file", file);

    // Don't set Content-Type header - browser will set it with boundary automatically
    const response = await http.post<CompanyDocumentReadDto>(
      "/company-documents",
      formData
    );

    return companyDocumentReadDtoSchema.parse(response.data);
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
 * List company documents
 */
export async function listCompanyDocuments(
  companyId: string
): Promise<CompanyDocumentReadDto[]> {
  try {
    const response = await http.get<CompanyDocumentReadDto[]>(
      `/company-documents/company/${companyId}`
    );
    return z.array(companyDocumentReadDtoSchema).parse(response.data);
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
 * Approve company document
 */
export async function approveDocument(
  id: string
): Promise<CompanyDocumentReadDto> {
  try {
    const response = await http.put<CompanyDocumentReadDto>(
      `/company-documents/${id}/approve`
    );
    return companyDocumentReadDtoSchema.parse(response.data);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      throw new Error("Invalid response format");
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to approve document");
  }
}

/**
 * Reject company document
 */
export async function rejectDocument(
  id: string,
  rejectionReason: string
): Promise<CompanyDocumentReadDto> {
  try {
    const validatedData = rejectDocumentDtoSchema.parse({
      rejectionReason,
      approvalStatus: "rejected",
    });

    const response = await http.put<CompanyDocumentReadDto>(
      `/company-documents/${id}/reject`,
      validatedData
    );
    return companyDocumentReadDtoSchema.parse(response.data);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      throw new Error(firstError?.message || "Invalid input");
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to reject document");
  }
}
