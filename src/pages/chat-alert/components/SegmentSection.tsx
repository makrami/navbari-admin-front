import { ArrowRight, MapPinned, MapPin } from "lucide-react";
import { CargoWorkflow } from "./CargoWorkflow";
import type { ChatAlert } from "../data";

interface SegmentSectionProps {
  currentSegment: ChatAlert["currentSegment"];
  currentStateIndex?: number;
}

export function SegmentSection({
  currentSegment,
  currentStateIndex = 5,
}: SegmentSectionProps) {
  return (
    <div className="bg-white rounded-xl relative">
      <h4 className="text-sm font-bold text-slate-900 mb-4">Segment</h4>

      {/* Current Segment Indicator */}
      <div className="relative">
        <div className="flex flex-col p-4 rounded-xl border-2 gap-4 border-slate-200">
          <div className="absolute top-0 left-0 w-2 h-2 bg-red-500 rounded-full"></div>

          <div className="flex items-center gap-2 justify-between">
            <div className="flex items-center gap-1">
              <span className="bg-green-600 p-1 text-xs font-black text-white">
                #{currentSegment.number}
              </span>
              <div className="flex flex-col items-start">
                <span className="text-green-600 text-[10px] font-black">
                  Current
                </span>
                <span className="text-green-600 text-[10px] font-black">
                  Segment
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900">
                {currentSegment.from}
              </span>
              <ArrowRight className="size-4 text-slate-300" />
              <span className="text-sm font-bold text-slate-900">
                {currentSegment.to}
              </span>
              <MapPinned className="size-4 text-slate-300 ml-4" />
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                {currentSegment.distance}
              </span>
            </div>
            <MapPin className="size-4 text-green-500" />
          </div>

          <div className="w-full h-px bg-slate-100"></div>

          <CargoWorkflow
            currentStateIndex={currentStateIndex}
            currentDistance={currentSegment.distance}
          />
        </div>
      </div>
    </div>
  );
}

