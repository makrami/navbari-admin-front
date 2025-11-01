import {
  TimerIcon,
  TimerOffIcon,
  TruckIcon,
  BoxesIcon,
  PlaneIcon,
} from "lucide-react";
import { InfoCard } from "../../../../shared/components/ui/InfoCard";
import FinancialSection from "./FinancialSection";
import DocumentsSection from "./DocumentsSection";

type SegmentInfoSummaryProps = {
  vehicleLabel?: string;
  startAt?: string;
  localCompany?: string;
  estFinishAt?: string;
  documents?: Array<{
    id: string | number;
    name: string;
    sizeLabel: string;
    status: "pending" | "approved" | "rejected";
    author?: string;
    thumbnailUrl?: string;
  }>;
};

export default function SegmentInfoSummary({
  vehicleLabel,
  startAt,
  localCompany,
  estFinishAt,
  documents,
}: SegmentInfoSummaryProps) {
  return (
    <>
      <section className="grid grid-cols-4 gap-4">
        <InfoCard
          icon={<TimerIcon className="size-4 text-slate-400" />}
          title="Start"
          value={startAt ?? "13 Aug · 13:04"}
          valueClassName="text-[#1B54FE] font-bold"
        />
        <InfoCard
          icon={<TimerOffIcon className="size-4 text-slate-400" />}
          title="Est. Finish"
          value={estFinishAt ?? "14 Aug · 03:45"}
          valueClassName="text-[#1B54FE] font-bold"
        />

        <InfoCard
          icon={<TruckIcon className="size-4 text-slate-400" />}
          title="Driver Vehicle"
          value={vehicleLabel ?? "Cargo Truck HD320"}
        />
        <InfoCard
          icon={<BoxesIcon className="size-4 text-slate-400" />}
          title="Local Company"
          value={localCompany ?? "Sendm Co."}
          valueIcon={<PlaneIcon className="size-4 text-white" />}
        />
      </section>
      <FinancialSection />
      <div className="h-px bg-slate-100" />
      <DocumentsSection documents={documents ?? []} />
    </>
  );
}
