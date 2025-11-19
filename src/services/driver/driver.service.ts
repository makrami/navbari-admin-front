import { http } from "../../lib/http";
import type { Driver } from "../../pages/Drivers/types";

/**
 * Fetch list of drivers from API
 */
export async function listDrivers(): Promise<Driver[]> {
  const response = await http.get<Driver[]>("/drivers");
  return response.data;
}

/**
 * Update driver status (approve or reject)
 */
export type UpdateDriverStatusRequest = {
  status: "approved" | "rejected";
  rejectionReason?: string;
};

export async function updateDriverStatus(
  id: string,
  data: UpdateDriverStatusRequest
): Promise<Driver> {
  const response = await http.patch<Driver>(`/drivers/${id}/status`, data);
  return response.data;
}

/**
 * Approve a driver
 */
export async function approveDriver(id: string): Promise<Driver> {
  return updateDriverStatus(id, { status: "approved" });
}

/**
 * Reject a driver
 */
export async function rejectDriver(
  id: string,
  rejectionReason: string
): Promise<Driver> {
  return updateDriverStatus(id, {
    status: "rejected",
    rejectionReason,
  });
}
