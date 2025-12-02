import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listShipments,
  getShipment,
  getShipmentSegments,
  createShipment,
  updateShipment,
  deleteShipment,
  updateSegment,
  createSegment,
  announceSegment,
  getShipmentActivityLog,
  getSegmentAnnouncements,
  assignSegment,
  getSegmentRoute,
  type ShipmentFilters,
  type CreateShipmentDto,
  type UpdateShipmentDto,
  type UpdateSegmentDto,
  type CreateSegmentDto,
  type AssignSegmentDto,
} from "./shipment.api.service";

// Query keys
export const shipmentKeys = {
  all: ["shipments"] as const,
  lists: () => [...shipmentKeys.all, "list"] as const,
  list: (filters?: ShipmentFilters) =>
    [...shipmentKeys.lists(), filters] as const,
  details: () => [...shipmentKeys.all, "detail"] as const,
  detail: (id: string) => [...shipmentKeys.details(), id] as const,
  segments: (shipmentId: string) =>
    [...shipmentKeys.detail(shipmentId), "segments"] as const,
  activityLog: (shipmentId: string) =>
    [...shipmentKeys.detail(shipmentId), "activity-log"] as const,
  segmentAnnouncements: (segmentId: string) =>
    [...shipmentKeys.all, "segment", segmentId, "announcements"] as const,
  segmentRoute: (segmentId: string) =>
    [...shipmentKeys.all, "segment", segmentId, "route"] as const,
};

/**
 * Query hook for listing shipments
 */
export function useShipments(filters: ShipmentFilters = {}) {
  const query = useQuery({
    queryKey: shipmentKeys.list(filters),
    queryFn: () => listShipments(filters),
  });

  // Maintain backward compatibility with existing code
  return {
    ...query,
    loading: query.isLoading,
    refresh: query.refetch,
  };
}

/**
 * Query hook for single shipment
 */
export function useShipment(id: string | null) {
  const query = useQuery({
    queryKey: shipmentKeys.detail(id!),
    queryFn: () => getShipment(id!),
    enabled: !!id,
  });

  // Maintain backward compatibility with existing code
  return {
    ...query,
    loading: query.isLoading,
  };
}

/**
 * Query hook for shipment segments
 */
export function useShipmentSegments(shipmentId: string | null) {
  const query = useQuery({
    queryKey: shipmentKeys.segments(shipmentId!),
    queryFn: () => getShipmentSegments(shipmentId!),
    enabled: !!shipmentId,
  });

  // Maintain backward compatibility with existing code
  return {
    ...query,
    loading: query.isLoading,
  };
}

/**
 * Query hook for shipment activity log
 */
export function useShipmentActivityLog(shipmentId: string | null) {
  return useQuery({
    queryKey: shipmentKeys.activityLog(shipmentId!),
    queryFn: () => getShipmentActivityLog(shipmentId!),
    enabled: !!shipmentId,
  });
}

/**
 * Mutation hook for creating shipment
 */
export function useCreateShipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateShipmentDto) => createShipment(data),
    onSuccess: () => {
      // Invalidate and refetch shipments list
      queryClient.invalidateQueries({ queryKey: shipmentKeys.lists() });
    },
  });
}

/**
 * Mutation hook for updating shipment
 */
export function useUpdateShipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateShipmentDto }) =>
      updateShipment(id, data),
    onSuccess: (data) => {
      // Invalidate and refetch shipment queries
      queryClient.invalidateQueries({ queryKey: shipmentKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: shipmentKeys.lists() });
    },
  });
}

/**
 * Mutation hook for deleting shipment
 */
export function useDeleteShipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteShipment(id),
    onSuccess: () => {
      // Invalidate and refetch shipments list
      queryClient.invalidateQueries({ queryKey: shipmentKeys.lists() });
    },
  });
}

/**
 * Mutation hook for creating segment
 */
export function useCreateSegment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSegmentDto) => createSegment(data),
    onSuccess: (data) => {
      // Invalidate shipment and segments queries
      queryClient.invalidateQueries({
        queryKey: shipmentKeys.segments(data.shipmentId),
      });
      queryClient.invalidateQueries({
        queryKey: shipmentKeys.detail(data.shipmentId),
      });
      queryClient.invalidateQueries({ queryKey: shipmentKeys.lists() });
    },
  });
}

/**
 * Mutation hook for updating segment
 */
export function useUpdateSegment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSegmentDto }) =>
      updateSegment(id, data),
    onSuccess: (data) => {
      // Invalidate shipment and segments queries
      queryClient.invalidateQueries({
        queryKey: shipmentKeys.segments(data.shipmentId),
      });
      queryClient.invalidateQueries({
        queryKey: shipmentKeys.detail(data.shipmentId),
      });
      queryClient.invalidateQueries({ queryKey: shipmentKeys.lists() });
    },
  });
}

/**
 * Mutation hook for announcing segment to companies
 */
export function useAnnounceSegment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, companyIds }: { id: string; companyIds: string[] }) =>
      announceSegment(id, companyIds),
    onSuccess: (data) => {
      // Invalidate shipment and segments queries
      queryClient.invalidateQueries({
        queryKey: shipmentKeys.segments(data.shipmentId),
      });
      queryClient.invalidateQueries({
        queryKey: shipmentKeys.detail(data.shipmentId),
      });
      queryClient.invalidateQueries({ queryKey: shipmentKeys.lists() });
      // Invalidate announcements query for this segment
      queryClient.invalidateQueries({
        queryKey: shipmentKeys.segmentAnnouncements(data.id),
      });
    },
  });
}

/**
 * Query hook for segment announcements
 */
export function useSegmentAnnouncements(segmentId: string | null) {
  return useQuery({
    queryKey: shipmentKeys.segmentAnnouncements(segmentId!),
    queryFn: () => getSegmentAnnouncements(segmentId!),
    enabled: !!segmentId,
  });
}

/**
 * Mutation hook for assigning segment to company and driver
 */
export function useAssignSegment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AssignSegmentDto }) =>
      assignSegment(id, data),
    onSuccess: (data) => {
      // Invalidate shipment and segments queries
      queryClient.invalidateQueries({
        queryKey: shipmentKeys.segments(data.shipmentId),
      });
      queryClient.invalidateQueries({
        queryKey: shipmentKeys.detail(data.shipmentId),
      });
      queryClient.invalidateQueries({ queryKey: shipmentKeys.lists() });
      // Invalidate announcements query for this segment
      queryClient.invalidateQueries({
        queryKey: shipmentKeys.segmentAnnouncements(data.id),
      });
    },
  });
}

/**
 * Query hook for segment route
 */
export function useSegmentRoute(segmentId: string | null) {
  return useQuery({
    queryKey: shipmentKeys.segmentRoute(segmentId!),
    queryFn: () => getSegmentRoute(segmentId!),
    enabled: !!segmentId,
  });
}
