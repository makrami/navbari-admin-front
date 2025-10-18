import ActivityItem from "../ActivityItem";
import type { ActivityItemData } from "../types";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

type ActivitySectionProps = {
  items: ActivityItemData[];
  className?: string;
  defaultOpen?: boolean;
  onToggle?: (open: boolean) => void;
};

export function ActivitySection({
  items,
  className,
  defaultOpen = true,
  onToggle,
}: ActivitySectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className={`rounded-xl bg-white ${className ?? ""}`}>
      <header className="flex items-center justify-between px-3 py-2">
        <h2 className="font-bold text-slate-900">All Activities</h2>
        <button
          type="button"
          aria-expanded={open}
          aria-controls="activity-content"
          onClick={() =>
            setOpen((prev) => {
              const next = !prev;
              onToggle?.(next);
              return next;
            })
          }
          className="inline-flex items-center justify-center size-7 rounded  border border-slate-200 hover:bg-slate-50 text-slate-500"
        >
          <ChevronDown
            className={`size-4 transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>
      </header>
      <div
        id="activity-content"
        className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
        aria-hidden={!open}
      >
        <div className="overflow-hidden">
          <div className="px-3 pb-3">
            <div className="grid gap-3">
              {items.map((it) => (
                <ActivityItem key={it.id} item={it} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ActivitySection;
