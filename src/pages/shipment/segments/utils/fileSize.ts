import { ENV } from "../../../../lib/env";

/**
 * Format bytes to human-readable file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 KB";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Get file size from URL by making a HEAD request
 * Returns formatted file size string or fallback if failed
 */
export async function getFileSizeFromUrl(
  filePath: string | null | undefined,
  fallback: string = "0 KB"
): Promise<string> {
  if (!filePath) return fallback;

  try {
    // Construct full URL
    let fileUrl: string;
    if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
      fileUrl = filePath;
    } else {
      const cleanPath = filePath.startsWith("/") ? filePath.slice(1) : filePath;
      fileUrl = `${ENV.FILE_BASE_URL}/${cleanPath}`;
    }

    // Make HEAD request to get file size
    const response = await fetch(fileUrl, {
      method: "HEAD",
      credentials: "include", // Include cookies for authenticated requests
    });

    if (!response.ok) {
      return fallback;
    }

    const contentLength = response.headers.get("Content-Length");
    if (!contentLength) {
      return fallback;
    }

    const bytes = parseInt(contentLength, 10);
    if (isNaN(bytes)) {
      return fallback;
    }

    return formatFileSize(bytes);
  } catch (error) {
    console.error("Failed to fetch file size:", error);
    return fallback;
  }
}

/**
 * Get file sizes for multiple files in parallel
 */
export async function getFileSizesFromUrls(
  filePaths: (string | null | undefined)[],
  fallback: string = "0 KB"
): Promise<string[]> {
  const promises = filePaths.map((path) =>
    getFileSizeFromUrl(path, fallback)
  );
  return Promise.all(promises);
}

