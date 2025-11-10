import { TimerOffIcon } from "lucide-react";

interface FinancialCardsProps {
  estFinish: string;
  totalPaid: string;
  totalPending: string;
}

export function FinancialCards({
  estFinish,
  totalPaid,
  totalPending,
}: FinancialCardsProps) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col justify-center gap-2 flex-1/3 rounded-xl p-4 border border-slate-200">
        <div className="flex items-start gap-2">
          <TimerOffIcon className="size-5 text-slate-400 flex-shrink-0" />
          <p className="text-xs text-slate-400 uppercase mb-1">EST. FINISH</p>
        </div>
        <p className="text-sm font-bold text-[#1B54FE]">{estFinish}</p>
      </div>
      <div className="flex gap-4 flex-2/3 bg-white rounded-xl p-4 border border-slate-200">
        <div className="bg-white flex-1 rounded-xl">
          <p className="text-xs text-slate-400 mb-2">Total Paid</p>
          <p className="text-lg font-bold text-slate-900">{totalPaid}</p>
        </div>
        <div className="bg-white flex-1 rounded-xl">
          <p className="text-xs text-slate-400 mb-2">Total Pending</p>
          <p className="text-lg font-semibold text-slate-900">{totalPending}</p>
        </div>
      </div>
    </div>
  );
}
