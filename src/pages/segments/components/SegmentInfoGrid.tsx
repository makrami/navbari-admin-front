import { X, Clock, Calendar, Truck, Building } from "lucide-react";
import type { SegmentWithShipment } from "./SegmentCard";

type SegmentInfoGridProps = {
  segment: SegmentWithShipment;
};

export function SegmentInfoGrid({ segment }: SegmentInfoGridProps) {
  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="rounded-lg border border-slate-200 p-3">
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
          <Clock className="size-4" />
          <span>START</span>
        </div>
        <div className="text-xs text-blue-600 font-bold">
          {segment.startAt || "Not set"}
        </div>
      </div>
      <div className="rounded-lg border border-slate-200 p-3">
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
          <Calendar className="size-4" />
          <span>EST. FINISH</span>
        </div>
        <div className="text-xs text-blue-600 font-bold">
          {segment.estFinishAt || "Not set"}
        </div>
      </div>
      <div className="rounded-lg border border-slate-200 p-3">
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
          <Truck className="size-4" />
          <span>DRIVER VEHICLE</span>
        </div>
        <div className="text-xs text-slate-900">
          {segment.vehicleLabel || "Not assigned"}
        </div>
      </div>
      <div className="rounded-lg border border-slate-200 p-3">
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
          <Building className="size-4" />
          <span>LOCAL COMPANY</span>
        </div>
        <div className="text-xs text-slate-900 flex items-center gap-1">
          {segment.localCompany || "Not assigned"}
          {segment.localCompany && (
            <button
              type="button"
              className="size-4 rounded-full bg-blue-600 flex items-center justify-center"
            >
              <X className="size-3 text-white" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
