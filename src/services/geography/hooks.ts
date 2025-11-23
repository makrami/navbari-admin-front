import { useQuery } from "@tanstack/react-query";
import { getCities } from "./geography.service";

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
    staleTime: 10 * 60 * 1000, // Consider data fresh for 10 minutes (cities don't change often)
    retry: 1, // Only retry once on failure
  });
}

