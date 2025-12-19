import {useQuery} from "@tanstack/react-query";
import {getCities} from "./geography.service";

// Query keys
export const geographyKeys = {
  all: ["geography"] as const,
  cities: () => [...geographyKeys.all, "cities"] as const,
};

/**
 * Query hook for fetching cities
 */
export function useCities() {
  return useQuery({
    queryKey: geographyKeys.cities(),
    queryFn: () => getCities(),
    staleTime: Infinity, // Never refetch automatically; cities are very static
    retry: 3, // Only retry once on failure
  });
}
