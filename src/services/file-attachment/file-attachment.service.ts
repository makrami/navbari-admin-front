import {z} from "zod";
import {http} from "../../lib/http";

// Approval status enum
export const FILE_ATTACHMENT_APPROVAL_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  EXPIRED: "expired",
} as const;

export type FILE_ATTACHMENT_APPROVAL_STATUS =
  (typeof FILE_ATTACHMENT_APPROVAL_STATUS)[keyof typeof FILE_ATTACHMENT_APPROVAL_STATUS];

// File Attachment Read DTO schema
const fileAttachmentReadDtoSchema = z.object({
  id: z.string().uuid(),
  segmentId: z.string().uuid(),
  fileName: z.string(),
  filePath: z.string(),
  fileType: z.string(),
  uploadedBy: z.string().uuid(),
  approvalStatus: z.nativeEnum(FILE_ATTACHMENT_APPROVAL_STATUS),
  rejectionComment: z.string().nullable().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type FileAttachmentReadDto = z.infer<typeof fileAttachmentReadDtoSchema>;

/**
 * Fetches all file attachments for a segment
 * @param segmentId The ID of the segment
 * @returns Array of file attachment objects
 * @throws Error with user-friendly message on failure
 */
export async function getSegmentFileAttachments(
  segmentId: string
): Promise<FileAttachmentReadDto[]> {
  try {
    const response = await http.get<FileAttachmentReadDto[]>(
      `/file-attachments/segment/${segmentId}`
    );
    return z.array(fileAttachmentReadDtoSchema).parse(response.data);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      throw new Error("Invalid response format");
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to fetch segment documents. Please try again.");
  }
}

/**
 * Upload a file attachment for a segment
 * @param segmentId The ID of the segment
 * @param file The file to upload
 * @returns The created file attachment object
 * @throws Error with user-friendly message on failure
 */
export async function uploadFileAttachment(
  segmentId: string,
  file: File
): Promise<FileAttachmentReadDto> {
  try {
    const formData = new FormData();
    formData.append("segmentId", segmentId);
    formData.append("fileType", "other");
    formData.append("file", file);

    // Don't set Content-Type header - browser will set it with boundary automatically
    const response = await http.post<FileAttachmentReadDto>(
      "/file-attachments",
      formData
    );

    return fileAttachmentReadDtoSchema.parse(response.data);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      throw new Error("Invalid response format");
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to upload document. Please try again.");
  }
}

/**
 * Approve or reject a file attachment
 * @param id The ID of the file attachment
 * @param approvalStatus The approval status ("approved" or "rejected")
 * @param rejectionComment Optional comment when rejecting
 * @returns The updated file attachment object
 * @throws Error with user-friendly message on failure
 */
export async function updateFileAttachmentStatus(
  id: string,
  approvalStatus: "approved" | "rejected" | "expired",
  rejectionComment?: string
): Promise<FileAttachmentReadDto> {
  try {
    const body: {
      approvalStatus: "approved" | "rejected" | "expired";
      rejectionComment?: string;
    } = {
      approvalStatus,
    };

    if (approvalStatus === "rejected" && rejectionComment) {
      body.rejectionComment = rejectionComment;
    }

    const response = await http.put<FileAttachmentReadDto>(
      `/file-attachments/${id}/approve`,
      body
    );

    return fileAttachmentReadDtoSchema.parse(response.data);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      throw new Error("Invalid response format");
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(
      `Failed to ${
        approvalStatus === "approved" ? "approve" : "reject"
      } document. Please try again.`
    );
  }
}
