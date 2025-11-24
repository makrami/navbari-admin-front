import * as countries from "i18n-iso-countries";
import * as enLocale from "i18n-iso-countries/langs/en.json";

// Register English locale for country name translations
countries.registerLocale(enLocale as any);

/**
 * Converts a country name or code to ISO 3166-1 alpha-2 country code
 * @param countryNameOrCode - Country name (e.g., "China") or country code (e.g., "CN")
 * @param fallback - Fallback code if conversion fails (default: "CN")
 * @returns ISO 3166-1 alpha-2 country code
 */
export function getCountryCode(
  countryNameOrCode: string | undefined | null,
  fallback: string = "CN"
): string {
  if (!countryNameOrCode) {
    return fallback;
  }

  // Check if it's already a valid 2-letter country code
  const upperCase = countryNameOrCode.toUpperCase();
  const alpha2Codes = countries.getAlpha2Codes();
  if (
    upperCase.length === 2 &&
    Object.values(alpha2Codes).includes(upperCase)
  ) {
    return upperCase;
  }

  // Try to convert from country name to code
  const code = countries.getAlpha2Code(countryNameOrCode, "en");
  return code || fallback;
}
