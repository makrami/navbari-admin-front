import { useEffect } from "react";

/**
 * Custom hook to handle scrolling to a specific segment header
 */
export function useSegmentScroll(
  segmentStep: number | undefined,
  selectedShipment: { id: string } | null
) {
  useEffect(() => {
    if (segmentStep !== undefined && selectedShipment) {
      const timeoutId = setTimeout(() => {
        const headerElement = document.getElementById(
          `segment-header-${segmentStep}`
        );
        if (headerElement) {
          headerElement.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [segmentStep, selectedShipment]);
}

