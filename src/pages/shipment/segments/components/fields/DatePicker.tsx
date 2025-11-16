import { useRef } from "react";
import { Calendar, ChevronDown } from "lucide-react";
import { cn } from "../../../../../shared/utils/cn";

type DatePickerProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: boolean;
};

export default function DatePicker({
  label,
  value,
  onChange,
  error = false,
}: DatePickerProps) {
  const dateInputRef = useRef<HTMLInputElement>(null);

  const handleFieldClick = () => {
    if (dateInputRef.current) {
      if (typeof dateInputRef.current.showPicker === "function") {
        dateInputRef.current.showPicker();
      } else {
        dateInputRef.current.click();
      }
    }
  };

  const formatDisplayValue = (dateValue: string) => {
    if (!dateValue) return "Select date";
    const date = new Date(dateValue);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="grid gap-1 border-1 border-slate-200 rounded-xl py-5 px-2 relative">
      <label className="text-xs font-medium flex items-center gap-2 text-slate-400">
        {label}
      </label>
      <div className="relative">
        <input
          ref={dateInputRef}
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="sr-only"
          aria-label={label}
        />
        <button
          type="button"
          className={cn(
            "relative text-left w-full rounded-lg bg-[#1B54FE]/10 pl-9 pr-9 py-2 text-sm outline-none cursor-pointer",
            error && "ring-1 ring-red-400"
          )}
          onClick={handleFieldClick}
        >
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#1B54FE] pointer-events-none" />
          <span className={cn(!value && "text-slate-400")}>
            {formatDisplayValue(value)}
          </span>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-4 text-[#1B54FE]" />
        </button>
      </div>
    </div>
  );
}
