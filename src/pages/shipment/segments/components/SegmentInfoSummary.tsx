import {
  TimerIcon,
  TimerOffIcon,
  TruckIcon,
  BoxesIcon,
  PlaneIcon,
  Paperclip,
  SatelliteDish,
  TimerReset,
  TriangleAlert,
  MessagesSquareIcon,
} from "lucide-react";
import FinancialSection from "./FinancialSection";
import DocumentsSection from "./DocumentsSection";

type SegmentInfoSummaryProps = {
  vehicleLabel?: string;
  startAt?: string;
  startedAt?: string;
  localCompany?: string;
  estFinishAt?: string;
  finishedAt?: string;
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
  startedAt,
  localCompany,
  estFinishAt,
  finishedAt,
  documents,
}: SegmentInfoSummaryProps) {
  return (
    <div className="bg-white rounded-xl space-y-4 mt-4">
      {/* Estimated Arrival Card */}
      <div className="bg-slate-50 rounded-xl p-4 flex items-center  gap-2">
        {/* Left Section - Text Information */}
        <div className="flex flex-col gap-2">
          <div className="text-sm">
            <span className="text-slate-500  text-xs font-light">
              Estimated arrival in{" "}
            </span>
            <span className="text-slate-500 font-medium">
              2 hours 45 minutes
            </span>
            <span className="text-slate-500 text-xs font-light">
              {" "}
              (based on latest GPS update)
            </span>
          </div>
          <div className="text-sm">
            <span className="text-slate-500 text-xs font-light">
              Last checkpoint:{" "}
            </span>
            <span className="text-slate-500 font-medium">
              Border Control - Inner Mongolia
            </span>
          </div>
        </div>

        {/* Right Section - Status Indicators */}
        <div className="flex  items-center flex-1  gap-5 flex-shrink-0">
          {/* GPS On Indicator */}
          <div className="flex flex-col items-center gap-1">
            <div className="size-12 rounded-full bg-green-50 flex items-center justify-center">
              <SatelliteDish className="size-5 text-green-600" />
            </div>
            <div className="flex items-center gap-1">
              <div className="size-1.5 rounded-full bg-green-600"></div>
              <span className="text-xs flex items-center gap-1 text-green-600">
                GPS <span className="!font-bold text-xs ">On</span>
              </span>
            </div>
          </div>

          {/* Delay Indicator */}
          <div className="flex flex-col items-center gap-1">
            <div className="size-12 rounded-full bg-slate-100 flex items-center justify-center">
              <TimerReset className="size-5 text-slate-700" />
            </div>
            <span className="text-xs flex items-center gap-1 font-bold text-slate-900">
              +1h
              <div className="text-xs !font-normal ">Delay</div>
            </span>
          </div>

          {/* Alerts Indicator */}
          <div className="flex flex-col items-center gap-1">
            <div className="size-12 rounded-full bg-red-50 flex items-center justify-center">
              <TriangleAlert className="size-5 text-red-600" />
            </div>
            <span className="text-xs">
              <span className="font-bold text-red-600">3</span>{" "}
              <span className="font-normal text-red-600 text-xs">Alerts</span>
            </span>
          </div>

          {/* Pending Indicator */}
          <div className="flex flex-col items-center gap-1">
            <div className="size-12 rounded-full bg-orange-50 flex items-center justify-center">
              <Paperclip className="size-5 text-orange-600" />
            </div>
            <span className="text-xs flex items-center gap-1">
              <span className="font-bold text-yellow-600">1</span>{" "}
              <span className="font-normal text-xs text-yellow-600">
                Pending
              </span>
            </span>
          </div>
        </div>
      </div>
      <div className="h-px bg-slate-100 mb-4" />

      <section className="grid grid-cols-3 gap-2">
        {/* Card 1: Start Times */}
        <div className="bg-white rounded-xl p-3  flex flex-col justify-between border border-slate-100">
          {/* Planned Start */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <TimerIcon className="size-4 text-slate-300" />
              <span className="text-xs font-medium text-slate-400 uppercase">
                PLANNED START
              </span>
            </div>
            <div className="text-xs font-bold text-[#1B54FE] ">
              {startAt ?? "13 Aug - 13:04"}
            </div>
          </div>

          {/* Started At */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <TimerIcon className="size-4 text-slate-300" />
              <span className="text-xs font-medium text-slate-400 uppercase">
                STARTED AT
              </span>
            </div>
            <div className="text-xs font-bold text-green-600 ">
              {startedAt ?? "13 Aug - 13:04"}
            </div>
          </div>
        </div>

        {/* Card 2: Finish Times */}
        <div className="bg-white rounded-xl p-3 flex flex-col justify-between border border-slate-100">
          {/* Est. Finish */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <TimerOffIcon className="size-4 text-slate-300" />
              <span className="text-xs font-medium text-slate-400 uppercase">
                EST. FINISH
              </span>
            </div>
            <div className="text-xs font-bold text-[#1B54FE] ">
              {estFinishAt ?? "14 Aug - 03:45"}
            </div>
          </div>

          {/* Finished At */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <TimerOffIcon className="size-4 text-slate-300" />
              <span className="text-xs font-medium text-slate-400 uppercase">
                FINISHED AT
              </span>
            </div>
            <div className="text-xs font-bold text-red-600 ">
              {finishedAt ?? "14 Aug - 03:45"}
            </div>
          </div>
        </div>

        {/* Card 3: Vehicle and Company */}
        <div className="bg-white rounded-xl p-3 flex flex-col gap-5 border border-slate-100 ">
          {/* Driver Vehicle */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <TruckIcon className="size-4 text-slate-300" />
              <span className="text-xs font-medium text-slate-400 uppercase">
                DRIVER VEHICLE
              </span>
            </div>
            <div className="text-xs text-slate-900">
              {vehicleLabel ?? "Cargo Truck HD320"}
            </div>
          </div>

          {/* Local Company */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-col gap-1 flex-1">
              <div className="flex items-center gap-2">
                <BoxesIcon className="size-4 text-slate-300" />
                <span className="text-xs font-medium text-slate-400 uppercase">
                  LOCAL COMPANY
                </span>
              </div>
              <div className="flex items-center gap-1 ">
                <span className="text-xs text-slate-900">
                  {localCompany ?? "Sendm Co."}
                </span>
                <div className=" size-4 bg-[#1B54FE] rounded-full flex items-center justify-center">
                  <PlaneIcon className="size-3 text-white" />
                </div>
              </div>
            </div>
            {/* Chat Button */}
            <button className="size-8 rounded-lg bg-[#1B54FE]/10 flex items-center justify-center flex-shrink-0 hover:bg-blue-300 transition-colors">
              <MessagesSquareIcon className="size-4 text-[#1B54FE]" />
            </button>
          </div>
        </div>
      </section>
      <FinancialSection />
      <div className="h-px bg-slate-100" />
      <DocumentsSection documents={documents ?? []} />
    </div>
  );
}
