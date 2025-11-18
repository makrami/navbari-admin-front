import { useQuery } from "@tanstack/react-query";
import { listDrivers } from "./driver.service";

// Query keys
export const driverKeys = {
  all: ["drivers"] as const,
  lists: () => [...driverKeys.all, "list"] as const,
  list: () => [...driverKeys.lists()] as const,
  details: () => [...driverKeys.all, "detail"] as const,
  detail: (id: string) => [...driverKeys.details(), id] as const,
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
