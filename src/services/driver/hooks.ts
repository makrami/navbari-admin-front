import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query";
import {getDriverDetails, listDrivers} from "./driver.service";
import {
  listDriverDocuments,
  uploadDocument,
  approveDocument,
  rejectDocument,
  DRIVER_DOCUMENT_TYPE,
} from "./document.service";

// Query keys
export const driverKeys = {
  all: ["drivers"] as const,
  lists: () => [...driverKeys.all, "list"] as const,
  list: () => [...driverKeys.lists()] as const,
  details: () => [...driverKeys.all, "detail"] as const,
  detail: (id: string) => [...driverKeys.details(), id] as const,
  documents: (driverId: string) =>
    [...driverKeys.all, "documents", driverId] as const,
};

/**
 * Query hook for listing drivers
 */
export function useDrivers() {
  const query = useQuery({
    queryKey: driverKeys.list(),
    queryFn: () => listDrivers(),
  });

  // Maintain backward compatibility with existing code
  return {
    ...query,
    loading: query.isLoading,
    refresh: query.refetch,
  };
}

/**
 * Query hook for driver details
 */
export function useDriverDetails(driverId: string | null) {
  return useQuery({
    queryKey: driverKeys.detail(driverId!),
    queryFn: () => getDriverDetails(driverId!),
    enabled: !!driverId,
  });
}

/**
 * Query hook for driver documents
 */
export function useDriverDocuments(driverId: string | null) {
  return useQuery({
    queryKey: driverKeys.documents(driverId!),
    queryFn: () => listDriverDocuments(driverId!),
    enabled: !!driverId,
  });
}

/**
 * Mutation hook for uploading document
 */
export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      driverId,
      documentType,
      file,
    }: {
      driverId: string;
      documentType: DRIVER_DOCUMENT_TYPE;
      file: File;
    }) => uploadDocument(driverId, documentType, file),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: driverKeys.documents(data.driverId),
      });
    },
  });
}

/**
 * Mutation hook for approving document
 */
export function useApproveDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => approveDocument(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: driverKeys.documents(data.driverId),
      });
    },
  });
}

/**
 * Mutation hook for rejecting document
 */
export function useRejectDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      rejectionReason,
    }: {
      id: string;
      rejectionReason: string;
    }) => rejectDocument(id, rejectionReason),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: driverKeys.documents(data.driverId),
      });
    },
  });
}
