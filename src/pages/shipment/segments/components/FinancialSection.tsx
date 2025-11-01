import { useMemo, useState } from "react";
import { Plus, MoreVertical, CoinsIcon } from "lucide-react";

export function FinancialSection() {
  const [additionalCosts, setAdditionalCosts] = useState<
    Array<{ id: number; label: string; amount: number }>
  >([{ id: 1, label: "2 nights stay", amount: 15.8 }]);

  const [currentInput, setCurrentInput] = useState<{
    label: string;
    amount: number;
  }>({ label: "", amount: 0 });

  const baseFee = 34.5;

  const total = useMemo(() => {
    const additionalTotal = additionalCosts.reduce(
      (sum, cost) => sum + (Number.isFinite(cost.amount) ? cost.amount : 0),
      0
    );
    return baseFee + additionalTotal;
  }, [additionalCosts]);

  const handleAddCost = () => {
    if (currentInput.label.trim() && currentInput.amount > 0) {
      const newId = Math.max(...additionalCosts.map((c) => c.id), 0) + 1;
      setAdditionalCosts([
        ...additionalCosts,
        {
          id: newId,
          label: currentInput.label,
          amount: currentInput.amount,
        },
      ]);
      setCurrentInput({ label: "", amount: 0 });
    }
  };

  const handleInputChange = (
    field: "label" | "amount",
    value: string | number
  ) => {
    setCurrentInput((prev) => ({ ...prev, [field]: value }));
  };

  const handleRemoveCost = (id: number) => {
    setAdditionalCosts(additionalCosts.filter((c) => c.id !== id));
  };

  return (
    <section>
      <header className="px-3 pt-3 pb-2 text-xs text-slate-900 font-bold">
        Financial
      </header>
      <div className="px-4 py-2 bg-slate-50 rounded-xl">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Base Fee */}
          <div className="flex flex-1 gap-2">
            <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2">
              <span className="text-xs text-slate-900">Base Fee:</span>
              <span className="text-xs font-bold text-slate-900">$34.5</span>
            </div>

            {/* Additional Costs */}
            {additionalCosts.map((cost) => (
              <div key={cost.id} className="flex items-center gap-2">
                <Plus className="size-4 text-slate-400" />
                <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2">
                  <span className="text-xs text-slate-900">{cost.label}</span>
                  <span className="text-xs font-bold text-slate-900">
                    ${cost.amount.toFixed(1)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCost(cost.id)}
                    className="ml-1"
                  >
                    <MoreVertical className="size-4 text-slate-400 cursor-pointer hover:text-slate-600" />
                  </button>
                </div>
              </div>
            ))}

            {/* Input Card - Always visible */}
            <div className="flex items-center gap-2">
              <Plus className="size-4 text-slate-400" />
              <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2">
                <input
                  type="text"
                  placeholder="Cost label"
                  value={currentInput.label}
                  onChange={(e) => handleInputChange("label", e.target.value)}
                  className="text-xs text-slate-900 bg-transparent outline-none w-16"
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter" &&
                      currentInput.label.trim() &&
                      currentInput.amount > 0
                    ) {
                      handleAddCost();
                    }
                  }}
                />
                <div className="h-4 w-px bg-slate-300 mx-2" />

                <input
                  type="number"
                  placeholder="0"
                  value={currentInput.amount || ""}
                  onChange={(e) =>
                    handleInputChange("amount", parseFloat(e.target.value) || 0)
                  }
                  className="text-xs font-bold text-slate-900 bg-transparent outline-none w-8"
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter" &&
                      currentInput.label.trim() &&
                      currentInput.amount > 0
                    ) {
                      handleAddCost();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddCost}
                  disabled={
                    !currentInput.label.trim() || currentInput.amount <= 0
                  }
                  className="flex items-center justify-center rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="size-4 text-slate-400" />
                </button>
              </div>
            </div>
          </div>

          {/* Vertical Separator */}
          <div className="h-12 w-px bg-slate-300 mx-2" />

          {/* Total Section */}
          <div className="flex w-20 flex-col justify-between items-center gap-1">
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <CoinsIcon className="size-3 text-slate-400" />
              <span className="uppercase">TOTAL</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="text-sm font-bold text-slate-900">
                {total.toFixed(2)}$
              </div>
              <div className="text-xs text-slate-500">USD</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FinancialSection;
