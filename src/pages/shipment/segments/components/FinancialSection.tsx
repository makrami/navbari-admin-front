import { useMemo, useState } from "react";
import { Button } from "../../../../shared/components/ui/Button";
import { DollarSign, Minus, Plus, Clock } from "lucide-react";

export function FinancialSection() {
  const [costRows, setCostRows] = useState<
    Array<{ id: number; label: string; amount: number }>
  >([{ id: 1, label: "", amount: 0 }]);

  const total = useMemo(() => {
    const add = costRows.reduce(
      (sum, row) => sum + (Number.isFinite(row.amount) ? row.amount : 0),
      0
    );
    return add + 34.5;
  }, [costRows]);

  return (
    <section>
      <header className="px-3 pt-3 pb-2 text-xs  text-slate-900">
        Financial
      </header>
      <div className="p-4 grid gap-3 bg-slate-100 rounded-xl">
        <div className="rounded-xl">
          <div className=" font-medium  text-xs text-slate-900  ">Base Fee</div>
          <div className="px-3 py-2">
            <div className="flex items-center gap-2 bg-white text-slate-900 rounded-lg p-2">
              <DollarSign className="size-5 text-slate-500" /> 34.50 $
            </div>
          </div>
        </div>

        <div className="">
          <div className="font-medium  text-xs text-slate-900 ">
            Additional Costs
          </div>
          <div className="px-3 py-2 grid gap-2">
            {costRows.map((row, idx) => (
              <div key={row.id} className="flex items-center gap-2">
                <input
                  aria-label={`Cost for interval ${idx + 1}`}
                  placeholder="Cost for..."
                  className="h-8 flex-1 rounded px-2 text-xs font-normal text-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
                  value={row.label}
                  onChange={(e) =>
                    setCostRows((rows) =>
                      rows.map((r) =>
                        r.id === row.id ? { ...r, label: e.target.value } : r
                      )
                    )
                  }
                />
                <input
                  aria-label={`Amount for interval ${idx + 1}`}
                  type="number"
                  className="h-8 flex-1 rounded px-2 text-xs font-normal text-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
                  value={row.amount}
                  onChange={(e) =>
                    setCostRows((rows) =>
                      rows.map((r) =>
                        r.id === row.id
                          ? { ...r, amount: parseFloat(e.target.value) || 0 }
                          : r
                      )
                    )
                  }
                />
                <button
                  type="button"
                  aria-label="Remove interval"
                  className="inline-flex items-center bg-white justify-center size-8 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
                >
                  <Minus className="size-4" />
                </button>
              </div>
            ))}
            <div className=" flex itmes-start  mt-2 gap-2 text-xs text-slate-900 ">
              <Plus className="size-4" /> Add Interval
            </div>
          </div>
        </div>
        <div className="h-px bg-slate-100" />

        <div className="flex items-center justify-between px-1">
          <div className="text-xs flex flex-col items-center gap-2">
            <div className="text-slate-500 flex items-center gap-2">
              <Clock className="size-3" /> Total
            </div>
            <div className="text-slate-900  font-semibold">
              {total.toFixed(2)} USD
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" className="h-8 px-3 text-[12px]">
              Reset
            </Button>
            <Button
              variant="ghost"
              className=" rounded-lg bg-white  text-slate-900 border border-slate-300"
            >
              Apply
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FinancialSection;
