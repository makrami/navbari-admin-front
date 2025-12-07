import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {
  getSegmentFileAttachments,
  uploadFileAttachment,
  updateFileAttachmentStatus,
} from "./file-attachment.service";
import {shipmentKeys} from "../shipment/hooks";

// Query keys for file attachments
export const fileAttachmentKeys = {
  all: ["file-attachments"] as const,
  segments: () => [...fileAttachmentKeys.all, "segment"] as const,
  segment: (segmentId: string) =>
    [...fileAttachmentKeys.segments(), segmentId] as const,
};

/**
 * Query hook for fetching file attachments for a segment
 */
export function useSegmentFileAttachments(segmentId: string | null) {
  return useQuery({
    queryKey: fileAttachmentKeys.segment(segmentId!),
    queryFn: () => getSegmentFileAttachments(segmentId!),
    enabled: !!segmentId,
  });
}

/**
 * Mutation hook for uploading a file attachment
 */
export function useUploadFileAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({segmentId, file}: {segmentId: string; file: File}) =>
      uploadFileAttachment(segmentId, file),
    onSuccess: (data) => {
      // Invalidate file attachments query for this segment
      queryClient.invalidateQueries({
        queryKey: fileAttachmentKeys.segment(data.segmentId),
      });
      // Invalidate all segments queries to refetch segment data
      queryClient.invalidateQueries({
        queryKey: shipmentKeys.all,
      });
    },
  });
}

/**
 * Mutation hook for approving or rejecting a file attachment
 */
export function useUpdateFileAttachmentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      approvalStatus,
      rejectionComment,
    }: {
      id: string;
      approvalStatus: "approved" | "rejected";
      rejectionComment?: string;
    }) => updateFileAttachmentStatus(id, approvalStatus, rejectionComment),
    onSuccess: (data) => {
      // Invalidate file attachments query for this segment
      queryClient.invalidateQueries({
        queryKey: fileAttachmentKeys.segment(data.segmentId),
      });
      // Invalidate all segments queries to refetch segment data
      queryClient.invalidateQueries({
        queryKey: shipmentKeys.all,
      });
    },
  });
}
