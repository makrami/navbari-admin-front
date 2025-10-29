import { Car, CalendarRange, Building2, Clock3 } from "lucide-react";
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
    status: "ok" | "error" | "info";
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
      <div className="h-px bg-slate-100" />
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <InfoCard
          icon={<Car className="size-4 text-slate-400" />}
          title="Driver Vehicle"
          value={vehicleLabel ?? "Cargo Truck HD320"}
        />
        <InfoCard
          icon={<CalendarRange className="size-4 text-slate-400" />}
          title="Start"
          value={startAt ?? "13 Aug · 13:04"}
        />
        <InfoCard
          icon={<Building2 className="size-4 text-slate-400" />}
          title="Local Company"
          value={localCompany ?? "Sendm Co."}
        />
        <InfoCard
          icon={<Clock3 className="size-4 text-slate-400" />}
          title="Est. Finish"
          value={estFinishAt ?? "14 Aug · 03:45"}
        />
      </section>
      <div className="h-px bg-slate-100" />
      <FinancialSection />
      <div className="h-px bg-slate-100" />
      {documents && documents.length ? (
        <DocumentsSection documents={documents} />
      ) : null}
    </>
  );
}
