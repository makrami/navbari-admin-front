import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "./user.service";

// Query keys
export const userKeys = {
  all: ["users"] as const,
  me: () => [...userKeys.all, "me"] as const,
};

/**
 * Query hook for fetching current user details
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: userKeys.me(),
    queryFn: () => getCurrentUser(),
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    retry: 1, // Only retry once on failure
  });
}

