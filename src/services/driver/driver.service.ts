import { http } from "../../lib/http";
import type { Driver } from "../../pages/Drivers/types";

/**
 * Fetch list of drivers from API
 */
export async function listDrivers(): Promise<Driver[]> {
  const response = await http.get<Driver[]>("/drivers");
  return response.data;
}
