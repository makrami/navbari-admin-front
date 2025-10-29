import { useState } from "react";
import { Calendar, ChevronDown } from "lucide-react";
import { cn } from "../../../../../shared/utils/cn";
import { combineDateTime, splitDateTime } from "../utils/segmentDateTime";

type DateTimePickerFieldProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: boolean;
};

export default function DateTimePickerField({
  label,
  value,
  onChange,
  error = false,
}: DateTimePickerFieldProps) {
  const [open, setOpen] = useState(false);
  const { d, t } = splitDateTime(value);

  return (
    <div className="grid gap-1 border-1 border-slate-200 rounded-xl py-5 px-2 relative">
      <label className="text-xs font-medium flex items-center gap-2 text-slate-400">
        {label}
      </label>
      <button
        type="button"
        className={cn(
          "relative text-left w-full rounded-lg bg-[#1B54FE]/10 pl-9 pr-9 py-2 text-sm outline-none",
          error && "ring-1 ring-red-400"
        )}
        onClick={() => setOpen(true)}
      >
        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#1B54FE]" />
        {value ? value.replace("T", " · ") : "Select"}
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-4 text-[#1B54FE]" />
      </button>
      {open ? (
        <div className="absolute z-50 top-full mt-2 left-2 right-2 rounded-xl border border-slate-200 bg-white p-3 shadow">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="grid gap-1">
              <label className="text-[10px] text-slate-400">Date</label>
              <input
                type="date"
                value={d}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                onChange={(e) => onChange(combineDateTime(e.target.value, t))}
              />
            </div>
            <div className="grid gap-1">
              <label className="text-[10px] text-slate-400">Time</label>
              <input
                type="time"
                value={t}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                onChange={(e) => onChange(combineDateTime(d, e.target.value))}
              />
            </div>
            <div className="sm:col-span-2 flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700"
                onClick={() => setOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
