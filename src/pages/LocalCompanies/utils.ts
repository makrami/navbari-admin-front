import {ENV} from "../../lib/env";

/**
 * Construct full URL for file (logo, document, etc.)
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
  // Remove leading slash if present to avoid double slash
  const cleanPath = filePath.startsWith("/") ? filePath.slice(1) : filePath;
  return `${ENV.FILE_BASE_URL}/${cleanPath}`;
}

/**
 * Construct full URL for company logo (alias for getFileUrl)
 */
export function getLogoUrl(
  logoPath: string | null | undefined
): string | undefined {
  return getFileUrl(logoPath);
}
