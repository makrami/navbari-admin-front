import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDownIcon } from "lucide-react";

type SegmentStatus = "pending" | "normal" | "alert";

type StatusFilterProps = {
  statusFilter: Record<SegmentStatus, boolean>;
  onFilterChange: (filter: Record<SegmentStatus, boolean>) => void;
};

export function StatusFilter({
  statusFilter,
  onFilterChange,
}: StatusFilterProps) {
  const { t } = useTranslation();
  const [filterOpen, setFilterOpen] = useState(false);

  const handleStatusToggle = (status: SegmentStatus) => {
    onFilterChange({
      ...statusFilter,
      [status]: !statusFilter[status],
    });
  };

  return (
    <div className="absolute top-45 left-10 z-40 pointer-events-none">
      <div className="pointer-events-auto relative">
        <button
          type="button"
          onClick={() => setFilterOpen((v) => !v)}
          className="rounded-lg flex items-center gap-5 bg-white   px-3 py-2 text-sm font-medium text-slate-700 hover:shadow"
        >
          {t("dashboard.filters.allFilters")}
          <ChevronDownIcon className="size-4 text-slate-400" />
        </button>
        {filterOpen && (
          <div className="absolute mt-2 w-48 rounded-lg bg-white border border-slate-200 shadow-md p-3">
            {(["pending", "normal", "alert"] as SegmentStatus[]).map((s) => (
              <label
                key={s}
                className="flex items-center gap-2 py-1 text-sm text-slate-800"
              >
                <input
                  type="checkbox"
                  checked={statusFilter[s]}
                  onChange={() => handleStatusToggle(s)}
                  className="accent-blue-600"
                />
                <span className="capitalize">
                  {t(`dashboard.filters.status.${s}`)}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

