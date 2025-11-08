import { useTranslation } from "react-i18next";
import { TruckIcon } from "lucide-react";
import { STATUS_COLORS } from "../constants";

export function MapLegend() {
  const { t } = useTranslation();

  return (
    <div className="absolute left-10 bottom-8 z-40">
      <div className="rounded-lg bg-white p-3 w-36">
        <div className="text-sm font-semibold text-slate-900">
          {t("dashboard.guide.title")}
        </div>
        <div className="my-2 h-px bg-slate-100" />

        <div className="space-y-1.5 text-xs text-slate-700">
          <div className="flex items-center gap-2 px-1 py-1 rounded-md">
            <span
              className="inline-block h-1.5 w-2.5 rounded-sm"
              style={{ backgroundColor: STATUS_COLORS.normal }}
            />
            <span className="font-medium">
              {t("dashboard.guide.shipments")}
            </span>
          </div>

          <div className="flex items-center gap-2 px-1 py-1 rounded-md">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-slate-50">
              <TruckIcon className="h-3.5 w-3.5 text-slate-800" />
            </span>
            <span className="font-medium">{t("dashboard.guide.driver")}</span>
          </div>

          <div className="flex items-center gap-2 px-1 py-1 rounded-md">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-amber-50">
              <TruckIcon className="h-3.5 w-3.5 text-amber-500" />
            </span>
            <span className="font-medium">{t("dashboard.guide.pending")}</span>
          </div>

          <div className="flex items-center gap-2 px-1 py-1 rounded-md">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-rose-50">
              <TruckIcon className="h-3.5 w-3.5 text-rose-500" />
            </span>
            <span className="font-medium">{t("dashboard.guide.alert")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

