import { useRef } from "react";
import { Search, ChevronDown } from "lucide-react";
import { cn } from "../../../../../shared/utils/cn";

type FieldBoxSelectProps = {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  options?: string[];
  placeholder?: string;
};

export default function FieldBoxSelect({
  label,
  value,
  onChange,
  options,
  placeholder = "Search...",
}: FieldBoxSelectProps) {
  const hasValue = Boolean(value && value.trim());
  const selectRef = useRef<HTMLSelectElement | null>(null);
  const isEditable = Boolean(options && onChange);

  return (
    <div className="grid gap-1 border-1 border-slate-200 rounded-xl py-5 px-2">
      <label className="text-xs font-medium text-slate-400">{label}</label>
      {isEditable ? (
        <div
          className="relative cursor-pointer"
          onClick={() => {
            selectRef.current?.focus();
            selectRef.current?.click();
          }}
        >
          {!hasValue ? (
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-blue-600" />
          ) : null}
          <select
            ref={selectRef}
            className={cn(
              "w-full appearance-none rounded-lg pl-9 pr-9 py-2 text-sm outline-none",
              hasValue
                ? "bg-white border border-slate-200 text-slate-900"
                : "bg-[#1B54FE]/10 border border-slate-200 text-slate-700",
              !hasValue && "placeholder:text-[#1B54FE]"
            )}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
          >
            <option value="" disabled hidden>
              {placeholder}
            </option>
            {(options ?? []).map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-4 text-blue-600" />
        </div>
      ) : (
        <div className="rounded-xl  bg-white px-3 py-3 text-sm">{value}</div>
      )}
    </div>
  );
}
