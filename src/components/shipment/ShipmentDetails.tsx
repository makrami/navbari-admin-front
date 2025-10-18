import { cn } from "../../shared/utils/cn";
import ReactCountryFlag from "react-country-flag";

type ShipmentDetailsProps = {
  className?: string;
  title: string;
  id: string;
  status: "In Origin" | "Delivered" | "In Transit" | "Loading";
  fromCountryCode: string;
  toCountryCode: string;
  progressPercent: number;
  userName: string;
  rating: number;
};

export function ShipmentDetails({
  className,
  title,
  id,
  status,
  fromCountryCode,
  toCountryCode,
  progressPercent,
  userName,
  rating,
}: ShipmentDetailsProps) {
  return (
    <section
      className={cn("w-3/4 p-9", className)}
      data-name="Shipment Details"
    >
      <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
      <p className="text-slate-500">{id}</p>
      <div className="mt-4 flex items-center gap-2 text-slate-700">
        <span className="rounded-md bg-[#CA8A04]/10 px-2.5 py-1 text-sm font-semibold text-yellow-600">
          {status}
        </span>
      </div>

      <div className="mt-6 flex items-center gap-2">
        <ReactCountryFlag
          svg
          countryCode={fromCountryCode}
          style={{ width: 22, height: 16, borderRadius: 2 }}
        />
        <div className="h-2 w-64 rounded-full bg-slate-200">
          <div
            className="h-2 rounded-l-full bg-[#1b54fe]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <ReactCountryFlag
          svg
          countryCode={toCountryCode}
          style={{ width: 22, height: 16, borderRadius: 2 }}
        />
      </div>

      <div className="mt-6 grid gap-2 text-slate-700">
        <div>
          <span className="font-medium">Assignee:</span> {userName}
        </div>
        <div>
          <span className="font-medium">Rating:</span> {rating}
        </div>
      </div>
    </section>
  );
}
