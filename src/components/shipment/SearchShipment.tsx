import { Search, SlidersHorizontal } from "lucide-react";
import type { PropsWithChildren } from "react";
import { cn } from "../../shared/utils/cn";

type SearchShipmentProps = PropsWithChildren<{
  className?: string;
}>;

export function SearchShipment({ className }: SearchShipmentProps) {
  return (
    <div
      className={cn(
        "flex w-full items-start gap-2",
        // wrapper styles
        className
      )}
      data-name="Search Shipment"
    >
      {/* Search input mock matching Figma */}
      <div className="flex h-11 flex-1 items-center gap-2 rounded-lg bg-white px-2.5">
        <Search className="h-5 w-5 text-slate-400" />
        <p className="text-sm text-slate-300">Search...</p>
      </div>

      {/* Icon button */}
      <button
        type="button"
        className="flex h-11 items-center justify-center rounded-lg border border-slate-200 bg-white p-3"
        aria-label="Filters"
      >
        <SlidersHorizontal className="h-5 w-5 text-slate-400" />
      </button>
    </div>
  );
}
