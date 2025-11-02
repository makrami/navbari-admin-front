import { ChevronUp, ChevronDown } from "lucide-react";

type NumericInputFieldProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  unit?: string;
};

export function NumericInputField({
  label,
  value,
  onChange,
  unit,
}: NumericInputFieldProps) {
  const handleIncrement = () => {
    onChange(value + 1);
  };

  const handleDecrement = () => {
    if (value > 0) {
      onChange(value - 1);
    }
  };

  return (
    <div>
      <label className="block text-xs  text-slate-900 mb-2">{label}</label>
      <div className="relative w-full">
        <input
          type="number"
          value={value}
          onChange={(e) => {
            const newValue = parseInt(e.target.value) || 0;
            if (newValue >= 0) {
              onChange(newValue);
            }
          }}
          className={`w-full pl-4 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B54FE] focus:border-transparent bg-white text-slate-900 text-sm ${
            unit ? "pr-24" : "pr-10"
          }`}
          min="0"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {unit && (
            <span className="text-xs text-slate-300 font-medium">{unit}</span>
          )}
          <div className="flex flex-col">
            <button
              type="button"
              onClick={handleIncrement}
              className="p-0.5 hover:bg-slate-200 rounded transition-colors"
            >
              <ChevronUp className="size-3 text-slate-400" />
            </button>
            <button
              type="button"
              onClick={handleDecrement}
              className="p-0.5 hover:bg-slate-200 rounded transition-colors"
            >
              <ChevronDown className="size-3 text-slate-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
