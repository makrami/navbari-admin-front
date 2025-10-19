export function SummaryCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Paid Card */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200">
        <div className="flex flex-col gap-2">
          <h3 className="text-xs  text-slate-400">Total Paid</h3>
          <p className="text-sm font-semibold text-slate-900">$1,563,263,236</p>
        </div>
      </div>

      {/* Total Pending Card */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200">
        <div className="flex flex-col gap-2">
          <h3 className="text-xs  text-slate-400">Total Pending</h3>
          <p className="text-sm font-semibold text-slate-900">$463,864</p>
        </div>
      </div>

      {/* Total Overdue Card */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200">
        <div className="flex flex-col gap-2">
          <h3 className="text-xs  text-slate-400">Total Overdue</h3>
          <p className="text-sm font-semibold text-slate-900">$51,739</p>
        </div>
      </div>

      {/* Active Countries Card */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200">
        <div className="flex flex-col gap-2">
          <h3 className="text-xs  text-slate-400">Active Countries</h3>
          <p className="text-sm font-semibold text-slate-900">15</p>
        </div>
      </div>
    </div>
  );
}
