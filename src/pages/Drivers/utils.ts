import type {Driver} from "./types";
import type {EntityCardData} from "../../shared/components/ui/EntityCard";
import {ENV} from "../../lib/env";

/**
 * Get country code from country name
 */
function getCountryCode(countryName: string): string {
  const countryMap: Record<string, string> = {
    "United States": "US",
    "United Kingdom": "GB",
    China: "CN",
    Germany: "DE",
    France: "FR",
    Spain: "ES",
    Italy: "IT",
    Sweden: "SE",
    Netherlands: "NL",
    Switzerland: "CH",
    Canada: "CA",
    Australia: "AU",
    Japan: "JP",
    "South Korea": "KR",
    India: "IN",
    Brazil: "BR",
    Mexico: "MX",
    Russia: "RU",
    Turkey: "TR",
    Iran: "IR",
    "Saudi Arabia": "SA",
    "United Arab Emirates": "AE",
    Egypt: "EG",
    Poland: "PL",
    Norway: "NO",
  };

  return countryMap[countryName] || "US";
}

/**
 * Construct full URL for file (avatar, document, etc.)
 */
export function getFileUrl(
  filePath: string | null | undefined
): string | undefined {
  if (!filePath) return undefined;

  // If already a full URL, return as is
  if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
    return filePath;
  }

  // Construct full URL from relative path
  const cleanPath = filePath.startsWith("/") ? filePath.slice(1) : filePath;
  return `${ENV.FILE_BASE_URL}/${cleanPath}`;
}

/**
 * Format last activity time (humanized)
 */
function formatLastActivity(dateString: string | undefined): string {
  if (!dateString) return "N/A";

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  const diffWeeks = Math.floor(diffDays / 7);

  if (diffMins < 1) return "now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffWeeks < 4) return `${diffWeeks}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}

/**
 * Format API driver data for EntityCard component
 */
export function formatDriverForEntityCard(driver: Driver): EntityCardData {
  const countryCode = getCountryCode(driver.country);

  // Use user's fullName for name, fallback to empty string
  const name = driver.user?.fullName || "Unknown Driver";

  // Use user's phoneNumber for phone
  const phone = driver.user?.phoneNumber || "N/A";

  // Use company's primaryContactFullName for managerName, or company name as fallback
  const managerName =
    driver.company?.primaryContactFullName || driver.company?.name || "N/A";

  // City might not be in Driver type, use country as fallback
  const city = driver.country; // API might not provide city, using country as placeholder

  // Use totalDeliveries for numShipments
  const numShipments = driver.totalDeliveries || 0;

  // numActiveVehicles might not be available, default to 0
  const numActiveVehicles = 0; // API might not provide this

  // Use lastGpsUpdate or updatedAt for lastActivity
  const lastActivity = formatLastActivity(
    driver.lastGpsUpdate || driver.updatedAt
  );

  return {
    id: driver.id,
    name: name,
    logoUrl: getFileUrl(driver.company?.logoUrl),
    avatarUrl: getFileUrl(driver.avatarUrl),
    companyName: driver.company?.name,
    vehicleTypes: driver.company?.vehicleTypes,
    vehicleType: driver.vehicleType,
    vehiclePlate: driver.vehiclePlate,
    vehicleCapacity: driver.vehicleCapacity,
    lostShipments: driver.totalDelays || 0,
    status: driver.status,
    country: driver.country,
    city: city,
    countryCode: countryCode,
    managerName: managerName,
    phone: phone,
    numShipments: numShipments,
    numActiveVehicles: numActiveVehicles,
    lastActivity: lastActivity,
    rating: driver.rating,
  };
}
