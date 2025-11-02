import { ToggleSwitch } from "./ToggleSwitch";
import { ChevronUp, ChevronDown } from "lucide-react";

type AlertConfigCardProps = {
  label: string;
  description?: string;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  value: number;
  onValueChange: (value: number) => void;
  unit: string;
  disabled?: boolean;
};

export function AlertConfigCard({
  label,
  description,
  enabled,
  onToggle,
  value,
  onValueChange,
  unit,
  disabled = false,
}: AlertConfigCardProps) {
  const handleIncrement = () => {
    if (!disabled && enabled) {
      onValueChange(value + 1);
    }
  };

  const handleDecrement = () => {
    if (!disabled && enabled && value > 0) {
      onValueChange(value - 1);
    }
  };

  return (
    <div className="bg-slate-100 rounded-lg p-4 ">
      <div className="flex items-center justify-between mb-3">
        {description ? (
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-slate-900 mb-1">
              {label}
            </h3>
            <p className="text-xs text-slate-500">{description}</p>
          </div>
        ) : (
          <label className="text-xs  text-slate-900 flex-1">{label}</label>
        )}
        <ToggleSwitch
          checked={enabled}
          onChange={onToggle}
          disabled={disabled}
        />
      </div>
      {enabled && !disabled && (
        <div className="relative w-full">
          <input
            type="number"
            value={value}
            onChange={(e) => {
              const newValue = parseInt(e.target.value) || 0;
              if (newValue >= 0) {
                onValueChange(newValue);
              }
            }}
            className="w-full pl-4 pr-24 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B54FE] focus:border-transparent bg-white text-slate-900 text-sm"
            min="0"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <span className="text-xs text-slate-300 font-medium">{unit}</span>
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
      )}
      {(!enabled || disabled) && (
        <div className="relative w-full">
          <input
            type="number"
            value={value}
            disabled
            className="w-full pl-4 pr-16 py-1.5 border border-slate-200 rounded-lg bg-slate-100 text-slate-400 text-sm cursor-not-allowed"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <span className="text-xs text-slate-400 font-medium">{unit}</span>
          </div>
        </div>
      )}
    </div>
  );
}
