import type { HTMLAttributes } from "react";
import { cn } from "../../../shared/utils/cn";
import { ChevronRight, ChevronLeft, ArrowRight } from "lucide-react";

type Activity = {
  id: string;
  fromCountry: string;
  fromCity: string;
  toCountry: string;
  toCity: string;
  dateRange: string;
  status: "Loading" | "In-Origin" | "Delivered";
};

type RecentActivitiesProps = HTMLAttributes<HTMLDivElement> & {
  title?: string;
  items?: Activity[];
};

const DEFAULT_ITEMS: Activity[] = [
  {
    id: "#SHP-61336",
    fromCountry: "China",
    fromCity: "Hejiang",
    toCountry: "Russia",
    toCity: "Bratsk",
    dateRange: "13 Aug - 16 Aug",
    status: "Loading",
  },
  {
    id: "#SHP-78923",
    fromCountry: "France",
    fromCity: "Paris",
    toCountry: "Germany",
    toCity: "Berlin",
    dateRange: "22 Sep - 25 Sep",
    status: "In-Origin",
  },
  {
    id: "#SHP-78924",
    fromCountry: "Italy",
    fromCity: "Rome",
    toCountry: "Spain",
    toCity: "Madrid",
    dateRange: "28 Sep - 02 Oct",
    status: "Delivered",
  },
  {
    id: "#SHP-78925",
    fromCountry: "UK",
    fromCity: "London",
    toCountry: "Netherlands",
    toCity: "Amsterdam",
    dateRange: "05 Oct - 08 Oct",
    status: "Delivered",
  },
  {
    id: "#SHP-78926",
    fromCountry: "Japan",
    fromCity: "Tokyo",
    toCountry: "South Korea",
    toCity: "Seoul",
    dateRange: "Last Year",
    status: "Delivered",
  },
];

export default function RecentActivities({
  title = "Recent Activities",
  items = DEFAULT_ITEMS,
  className,
  ...rest
}: RecentActivitiesProps) {
  return (
    <section className={cn("space-y-3", className)} {...rest}>
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      <div className="rounded-2xl bg-white p-4">
        <div className="grid grid-cols-[1fr_2fr_1fr_1fr] items-center px-3 py-2 text-xs font-semibold text-slate-900">
          <div>ID</div>
          <div>Route</div>
          <div>Date</div>
          <div>Status</div>
        </div>
        <ul className=" space-y-3 divide-slate-100">
          {items.map((a) => (
            <li
              key={a.id}
              className="grid grid-cols-[1fr_2fr_1fr_1fr] bg-slate-50 items-center gap-3 rounded-lg px-3 py-3 text-sm"
            >
              <span className="text-slate-600 ">{a.id}</span>
              <span className="flex items-center gap-2 text-slate-900">
                <span className="font-semibold">{a.fromCountry}</span>
                <span className="text-slate-500">/ {a.fromCity}</span>
                <ArrowRight className="size-4 text-slate-400" />
                <span className="font-semibold">{a.toCountry}</span>
                <span className="text-slate-500">/ {a.toCity}</span>
              </span>
              <span className="text-slate-600">{a.dateRange}</span>
              <span
                className={cn(
                  "rounded-full px-2 py-1 text-xs font-medium",
                  a.status === "Delivered" && "text-green-600",
                  a.status === "In-Origin" && "text-amber-600",
                  a.status === "Loading" && "text-orange-500"
                )}
              >
                {a.status}
              </span>
            </li>
          ))}
        </ul>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-3 pt-4 text-sm text-slate-600">
          <button
            className="grid place-items-center rounded-md bg-slate-100 size-6"
            aria-label="Prev"
          >
            <ChevronLeft className="size-4" />
          </button>
          <div className="inline-flex items-center gap-2">
            <button className="rounded-full bg-blue-600 text-white size-6 grid place-items-center text-xs">
              1
            </button>
            <button className="text-slate-600">2</button>
            <button className="text-slate-600">3</button>
            <span className="text-slate-400">…</span>
            <button className="text-slate-600">43</button>
          </div>
          <button
            className="grid place-items-center rounded-md bg-slate-100 size-6"
            aria-label="Next"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
