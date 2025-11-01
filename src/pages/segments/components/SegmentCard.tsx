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
};

export function SegmentCard({
  segment,
  shipment,
  isExpanded,
  onToggle,
}: SegmentCardProps) {
  return (
    <div className="bg-white border-2 border-slate-200 rounded-2xl overflow-hidden">
      <SegmentCardHeader
        segment={segment}
        shipment={shipment}
        isExpanded={isExpanded}
        onToggle={onToggle}
      />

      {/* Expandable Content */}
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-in-out",
          isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
        aria-hidden={!isExpanded}
      >
        <div className="overflow-hidden">
          <div className="px-4 py-4 space-y-6">
            <SegmentInfoBanner segment={segment} shipment={shipment} />
            <SegmentInfoGrid segment={segment} />
            <FinancialSection />
            <DocumentsSection />
          </div>
        </div>
      </div>
    </div>
  );
}
