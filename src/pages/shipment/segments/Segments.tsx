import type { PropsWithChildren, ReactNode } from "react";
import { cn } from "../../../shared/utils/cn";
import { PlusIcon } from "lucide-react";

type SegmentsProps = PropsWithChildren<{
  className?: string;
  title?: ReactNode;
  onAddSegment?: () => void;
  readOnly?: boolean;
}>;

export function Segments({
  className,
  title = "Segments",
  children,
  onAddSegment,
  readOnly = false,
}: SegmentsProps) {
  return (
    <section className={cn(className)} data-name="Segments Section">
      <header className="flex items-center justify-between">
        <h2 className="font-bold text-slate-900">{title}</h2>
        {readOnly ? (
          <span className="inline-flex items-center gap-2 rounded-[8px] px-2.5 py-1.5 text-[11px] font-medium text-slate-600 bg-slate-100">
            Read-only
          </span>
        ) : (
          onAddSegment && (
          <button
            type="button"
            onClick={onAddSegment}
            aria-label="Add Segment"
            className="inline-flex items-center gap-2 rounded-[8px] px-3 py-2 text-[12px] font-medium text-blue-600 bg-blue-100 hover:scale-[1.02] active:scale-[0.99] transition-transform"
          >
            <PlusIcon className="size-4" />
            <span>Add Segment</span>
          </button>
          )
        )}
      </header>
      <div className="mt-4 relative rounded-xl bg-white p-5">
        {/* Vertical spine linking the segment cards visually */}
        <div
          aria-hidden="true"
          className="absolute left-8 top-5 bottom-5 w-3 bg-slate-200 rounded-full z-0"
        />
        <div className="grid gap-4 relative z-10">{children}</div>
      </div>
    </section>
  );
}
