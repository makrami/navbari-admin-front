import { useQuery } from "@tanstack/react-query";
import {
  getDashboardSummary,
  getSegmentSummaries,
  getRegistrationSummaries,
  getConversationsSummaries,
  getActiveSegments,
} from "./dashboard.service";

// Query keys
export const dashboardKeys = {
  all: ["dashboard"] as const,
  summary: () => [...dashboardKeys.all, "summary"] as const,
  segmentSummaries: () => [...dashboardKeys.all, "segment-summaries"] as const,
  registrationSummaries: () =>
    [...dashboardKeys.all, "registration-summaries"] as const,
  conversationsSummaries: () =>
    [...dashboardKeys.all, "conversations-summaries"] as const,
  activeSegments: () => [...dashboardKeys.all, "active-segments"] as const,
};

/**
 * Query hook for dashboard summary
 */
export function useDashboardSummary() {
  return useQuery({
    queryKey: dashboardKeys.summary(),
    queryFn: () => getDashboardSummary(),
  });
}

/**
 * Query hook for segment summaries
 */
export function useSegmentSummaries() {
  return useQuery({
    queryKey: dashboardKeys.segmentSummaries(),
    queryFn: () => getSegmentSummaries(),
  });
}

/**
 * Query hook for registration summaries
 */
export function useRegistrationSummaries() {
  return useQuery({
    queryKey: dashboardKeys.registrationSummaries(),
    queryFn: () => getRegistrationSummaries(),
  });
}

/**
 * Query hook for conversation summaries
 */
export function useConversationsSummaries() {
  return useQuery({
    queryKey: dashboardKeys.conversationsSummaries(),
    queryFn: () => getConversationsSummaries(),
  });
}

/**
 * Query hook for active segments
 */
export function useActiveSegments() {
  return useQuery({
    queryKey: dashboardKeys.activeSegments(),
    queryFn: () => getActiveSegments(),
    refetchInterval: 30000, // Refetch every 30 seconds to keep segments updated
    staleTime: 10000, // Consider data fresh for 10 seconds
  });
}
