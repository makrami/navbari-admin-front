import { useMemo, useState } from "react";
import { cn } from "../../../shared/utils/cn";
import { Save as SaveIcon } from "lucide-react";

type InternalNotesProps = {
  className?: string;
  title?: string;
  initialValue?: string;
  onSave?: (note: string) => void;
};

export default function InternalNotes({
  className,
  title = "Internal Notes",
  initialValue = "",
  onSave,
}: InternalNotesProps) {
  const [note, setNote] = useState<string>(initialValue);
  const isDisabled = useMemo(
    () => note.trim().length === 0 || note.trim() === initialValue.trim(),
    [note, initialValue]
  );

  return (
    <section className={cn("space-y-3", className)}>
      <h2 className="text-sm font-semibold text-slate-900">{title}</h2>

      <div className="rounded-2xl bg-white p-4">
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add internal note about the driver..."
          className="w-full min-h-28 rounded-lg bg-slate-100 p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />

        <button
          type="button"
          disabled={isDisabled}
          onClick={() => !isDisabled && onSave?.(note.trim())}
          className={cn(
            "mt-3 inline-flex items-center gap-2 rounded-md bg-blue-600/10 px-3 py-1.5 text-xs font-medium text-blue-600",
            "hover:bg-blue-600/15",
            isDisabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <SaveIcon className="size-4" />
          <span>Save note</span>
        </button>
      </div>
    </section>
  );
}
