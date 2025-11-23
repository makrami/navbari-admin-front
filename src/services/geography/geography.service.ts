import { http } from "../../lib/http";

export type City = {
  city: string;
  country: string;
  countryCode: string;
};

/**
 * Fetches all cities from the geography API
 * @returns Array of city objects with city, country, and countryCode
 * @throws Error with user-friendly message on failure
 */
export async function getCities(): Promise<City[]> {
  try {
    const response = await http.get<City[]>("/geography/cities");
    return response.data;
  } catch (error: unknown) {
    // Handle API errors (already normalized by http interceptor)
    if (error instanceof Error && error.message) {
      throw new Error(error.message);
    }

    // Fallback error
    throw new Error("Failed to fetch cities. Please try again.");
  }
}

