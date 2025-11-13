import type { CompanyReadDto } from "../../services/company/company.service";
import type { EntityCardData } from "../../shared/components/ui/EntityCard";
import { apiStatusToUiStatus } from "./types";
import { ENV } from "../../lib/env";

/**
 * Get country code from country name
 * This is a simple lookup - in production, you might want a more comprehensive mapping
 */
export function getCountryCode(countryName: string): string {
  // Common country name to ISO code mapping
  const countryMap: Record<string, string> = {
    "United States": "US",
    "United Kingdom": "GB",
    "China": "CN",
    "Germany": "DE",
    "France": "FR",
    "Spain": "ES",
    "Italy": "IT",
    "Sweden": "SE",
    "Netherlands": "NL",
    "Switzerland": "CH",
    "Canada": "CA",
    "Australia": "AU",
    "Japan": "JP",
    "South Korea": "KR",
    "India": "IN",
    "Brazil": "BR",
    "Mexico": "MX",
    "Russia": "RU",
    "Turkey": "TR",
    "Iran": "IR",
    "Saudi Arabia": "SA",
    "United Arab Emirates": "AE",
  };

  return countryMap[countryName] || "US"; // Default to US if not found
}

/**
 * Construct full URL for file (logo, document, etc.)
 */
export function getFileUrl(filePath: string | null | undefined): string | undefined {
  if (!filePath) return undefined;
  
  // If already a full URL, return as is
  if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
    return filePath;
  }
  
  // Construct full URL from relative path
  // Remove leading slash if present to avoid double slash
  const cleanPath = filePath.startsWith("/") ? filePath.slice(1) : filePath;
  return `${ENV.FILE_BASE_URL}/${cleanPath}`;
}

/**
 * Construct full URL for company logo (alias for getFileUrl)
 */
export function getLogoUrl(logoPath: string | null | undefined): string | undefined {
  return getFileUrl(logoPath);
}

/**
 * Format API company data for EntityCard component
 */
export function formatCompanyForEntityCard(company: CompanyReadDto): EntityCardData {
  const uiStatus = apiStatusToUiStatus(company.status);
  const countryCode = getCountryCode(company.country);
  
  // Extract city from address if available, otherwise use country as fallback
  const city = company.address?.split(",")[0]?.trim() || company.country;

  return {
    id: company.id,
    name: company.name,
    logoUrl: getLogoUrl(company.logoUrl),
    status: uiStatus,
    country: company.country,
    city: city,
    countryCode: countryCode,
    managerName: company.primaryContactFullName,
    phone: company.phone,
    numDrivers: company.totalDrivers,
    numActiveVehicles: company.totalSegments || 0,
    lastActivity: formatLastActivity(company.updatedAt),
  };
}

/**
 * Format last activity time (humanized)
 */
function formatLastActivity(dateString: string): string {
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

