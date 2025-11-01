import { useLayoutEffect, useRef, useState } from "react";
import { cn } from "../../../shared/utils/cn";
import type { Shipment as DomainShipment } from "../../../shared/types/shipment";
import { SegmentCardHeader } from "./SegmentCardHeader";
import { SegmentInfoBanner } from "./SegmentInfoBanner";
import { SegmentInfoGrid } from "./SegmentInfoGrid";
import { type SegmentProgressStage } from "../../shipment/segments/components/SegmentProgress";
import { FinancialSection } from "../../shipment/segments/components/FinancialSection";
import { DocumentsSection } from "../../shipment/segments/components/DocumentsSection";

export type SegmentWithShipment = {
  step: number;
  place: string;
  datetime?: string;
  isCompleted?: boolean;
  progressStage?: SegmentProgressStage;
  nextPlace?: string;
  startAt?: string;
  estFinishAt?: string;
  vehicleLabel?: string;
  localCompany?: string;
  baseFeeUsd?: number;
  assigneeName?: string;
  assigneeAvatarUrl?: string;
  driverRating?: number;
  assignmentStatus?: string;
  logisticsStatus?: string;
  documents?: Array<{
    id: string | number;
    name: string;
    sizeLabel: string;
    status: "pending" | "approved" | "rejected";
    author?: string;
  }>;
  shipmentId: string;
  shipmentTitle: string;
  shipmentStatus?: string;
  shipmentFromCountryCode?: string;
  shipmentToCountryCode?: string;
};

type SegmentCardProps = {
  segment: SegmentWithShipment;
  shipment?: DomainShipment;
  isExpanded: boolean;
  onToggle: () => void;
  isHighlighted?: boolean;
};

export function SegmentCard({
  segment,
  shipment,
  isExpanded,
  onToggle,
  isHighlighted = false,
}: SegmentCardProps) {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [measuredHeight, setMeasuredHeight] = useState<number>(0);

  // Measure content height to drive a smooth height transition without grid-template hacks
  useLayoutEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const measure = () => {
      // Use scrollHeight to capture full content height
      setMeasuredHeight(el.scrollHeight);
    };

    // Measure now
    measure();

    // When expanded, keep height in sync if inner content resizes
    let ro: ResizeObserver | null = null;
    if (isExpanded && typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(measure);
      ro.observe(el);
    }

    // Also react to viewport resizes
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("resize", measure);
      if (ro) ro.disconnect();
    };
  }, [isExpanded]);

  return (
    <div
      className={cn(
        "bg-white border-2  border-slate-200 rounded-2xl overflow-hidden transition-shadow"
      )}
    >
      <SegmentCardHeader
        segment={segment}
        shipment={shipment}
        isExpanded={isExpanded}
        onToggle={onToggle}
        isHighlighted={isHighlighted}
      />

      {/* Expandable Content - height driven, transform/opacity for paint-only animation */}
      <div
        className={cn(
          "overflow-hidden transition-[height] duration-300 ease-in-out"
        )}
        style={{ height: isExpanded ? measuredHeight : 0 }}
        aria-hidden={!isExpanded && measuredHeight === 0}
      >
        <div
          ref={contentRef}
          className={cn(
            "px-4 py-4 space-y-6 transition-opacity duration-300",
            isExpanded ? "opacity-100" : "opacity-0"
          )}
          style={{
            transform: isExpanded ? "translateY(0)" : "translateY(-4px)",
            transitionProperty: "opacity, transform",
          }}
        >
          <SegmentInfoBanner segment={segment} shipment={shipment} />
          <SegmentInfoGrid segment={segment} />
          <FinancialSection />
          <DocumentsSection />
        </div>
      </div>
    </div>
  );
}
