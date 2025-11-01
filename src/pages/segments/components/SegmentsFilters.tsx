import { Search } from "lucide-react";
import { cn } from "../../../shared/utils/cn";

export type FilterType = "all" | "need-action" | "alert";

type SegmentsFiltersProps = {
  filter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  allCount: number;
  needActionCount: number;
  alertCount: number;
};

export function SegmentsFilters({
  filter,
  onFilterChange,
  searchQuery,
  onSearchChange,
  allCount,
  needActionCount,
  alertCount,
}: SegmentsFiltersProps) {
  return (
    <>
      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <button
          type="button"
          onClick={() => onFilterChange("all")}
          className={cn(
            "px-4 py-1 bg-white rounded-3xl text-sm font-medium transition-colors",
            filter === "all"
              ? " border-2 border-slate-400 text-slate-900"
              : " border-none text-slate-600 hover:bg-slate-200"
          )}
        >
          All ({allCount})
        </button>
        <button
          type="button"
          onClick={() => onFilterChange("need-action")}
          className={cn(
            "px-4 py-1 bg-yellow-50 rounded-3xl text-sm font-medium transition-colors",
            filter === "need-action"
              ? " border-2 border-yellow-700 text-yellow-700"
              : " border-none text-yellow-700 hover:bg-yellow-100"
          )}
        >
          Need to Action ({needActionCount})
        </button>
        <button
          type="button"
          onClick={() => onFilterChange("alert")}
          className={cn(
            "px-4 py-1 bg-red-50 rounded-3xl text-sm font-medium transition-colors",
            filter === "alert"
              ? " border-2 border-red-700 text-red-700"
              : " border-none text-red-700 hover:bg-red-100"
          )}
        >
          Alert ({alertCount})
        </button>
        <div className="flex-1" />
        <button
          type="button"
          className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          Filter
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center w-1/3 gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-lg bg-white px-3 py-3">
          <Search className="h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="flex-1 outline-none text-sm text-slate-900 placeholder:text-slate-300"
          />
        </div>
      </div>
    </>
  );
}
