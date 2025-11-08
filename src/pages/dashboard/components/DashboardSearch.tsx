import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";

export function DashboardSearch() {
  const { t } = useTranslation();

  return (
    <div className="absolute left-1/2 -translate-x-1/2 bottom-10 z-40 w-[min(720px,90%)]">
      <div className="relative flex items-center">
        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 z-10">
          <Search className="h-4 w-4" aria-hidden="true" />
        </div>
        <input
          type="text"
          placeholder={t("dashboard.search.placeholder")}
          className="w-full rounded-xl bg-white/90 backdrop-blur border border-slate-200 pl-10 pr-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}

