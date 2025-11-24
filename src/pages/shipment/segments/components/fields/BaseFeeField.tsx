import {DollarSign} from "lucide-react";
import {cn} from "../../../../../shared/utils/cn";

type BaseFeeFieldProps = {
  value: string;
  onChange: (v: string) => void;
  error?: boolean;
};

export default function BaseFeeField({
  value,
  onChange,
  error = false,
}: BaseFeeFieldProps) {
  return (
    <div className="grid gap-1 md:col-span-1 border-1 border-slate-200 rounded-xl py-5 px-2">
      <label className="text-xs font-medium text-slate-400">BASE FEE</label>
      <div className="relative">
        <input
          type="number"
          min="0"
          step="0.1"
          className={cn(
            "w-full rounded-lg  bg-[#1B54FE]/10 pr-8 px-3 py-2 text-sm outline-none placeholder:text-[#1B54FE]",
            error && "ring-1 ring-red-400"
          )}
          placeholder="0.0"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <DollarSign className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-4 text-[#1B54FE]" />
      </div>
    </div>
  );
}
