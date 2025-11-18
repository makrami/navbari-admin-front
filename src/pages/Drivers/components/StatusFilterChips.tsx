import { Button } from "../../../shared/components/ui/Button";
import { useEffect, useRef, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import type { DriverStatus } from "../types";

export type FilterKey = "all" | DriverStatus;

type Props = {
  active: FilterKey;
  onChange: (next: FilterKey) => void;
  counts: Record<FilterKey, number>;
  isListPanel: boolean;
};

const FILTER_META: Record<
  FilterKey,
  { label: string; className: string; activeRing: string }
> = {
  all: {
    label: "All",
    className:
      "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
    activeRing: "ring-2 ring-slate-300",
  },
  pending: {
    label: "Pending",
    className: "bg-amber-50 text-amber-700 hover:bg-amber-100",
    activeRing: "ring-2 ring-amber-200",
  },
  approved: {
    label: "Approved",
    className: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
    activeRing: "ring-2 ring-emerald-200",
  },
  rejected: {
    label: "Rejected",
    className: "bg-rose-50 text-rose-700 hover:bg-rose-100",
    activeRing: "ring-2 ring-rose-200",
  },
  inactive: {
    label: "Inactive",
    className: "bg-slate-200 text-slate-700 hover:bg-slate-200",
    activeRing: "ring-2 ring-slate-300",
  },
};

export function StatusFilterChips({
  active,
  onChange,
  counts,
  isListPanel,
}: Props) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const updateCanScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 0);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  useEffect(() => {
    updateCanScroll();
  }, [counts]);

  const scrollBy = (dx: number) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dx, behavior: "smooth" });
    // give time for smooth scroll then update
    window.setTimeout(updateCanScroll, 220);
  };
  const keys: FilterKey[] = [
    "all",
    "pending",
    "approved",
    "rejected",
    "inactive",
  ];
  return (
    <div
      className={
        isListPanel
          ? "relative bg-red pl-8 pr-8 w-full max-w-[376px] h-9"
          : undefined
      }
    >
      {isListPanel && (
        <>
          <button
            type="button"
            aria-label="Scroll left"
            className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 grid place-items-center size-7 rounded-full bg-white/90 shadow border border-slate-200 hover:bg-white ${
              canLeft ? "opacity-100" : "opacity-40 cursor-default"
            }`}
            onClick={() => canLeft && scrollBy(-180)}
          >
            <ChevronLeftIcon className="h-4 w-4 text-slate-600" />
          </button>
          <button
            type="button"
            aria-label="Scroll right"
            className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 grid place-items-center size-7 rounded-full bg-white/90 shadow border border-slate-200 hover:bg-white ${
              canRight ? "opacity-100" : "opacity-40 cursor-default"
            }`}
            onClick={() => canRight && scrollBy(180)}
          >
            <ChevronRightIcon className="h-4 w-4 text-slate-600" />
          </button>
        </>
      )}
      <div
        ref={scrollRef}
        onScroll={isListPanel ? updateCanScroll : undefined}
        className={`flex flex-nowrap items-center gap-2 overflow-x-auto no-scrollbar ${
          isListPanel ? "h-full py-0" : "py-1"
        } w-full max-w-[376px] snap-x snap-mandatory scroll-smooth ${
          isListPanel ? "max-w-[376px]" : "max-w-full"
        }`}
      >
        {keys.map((key) => {
          const meta = FILTER_META[key];
          const count = counts[key];
          return (
            <Button
              key={key}
              variant="ghost"
              aria-pressed={active === key}
              onClick={() => onChange(key)}
              className={`${meta.className} ${
                active === key ? meta.activeRing : ""
              } h-8 rounded-full px-4 text-[13px] font-medium min-w-[120px] whitespace-nowrap snap-start`}
            >
              {meta.label} ({count})
            </Button>
          );
        })}
      </div>
    </div>
  );
}
