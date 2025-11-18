import {X, Clock, Calendar, Truck, Building} from "lucide-react";
import {useTranslation} from "react-i18next";
import type {Segment} from "../../../shared/types/segmentData";

type SegmentInfoGridProps = {
  segment: Segment;
};

export function SegmentInfoGrid({segment}: SegmentInfoGridProps) {
  const {t} = useTranslation();
  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="rounded-lg border border-slate-200 p-3">
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
          <Clock className="size-4" />
          <span>{t("segments.infoGrid.startLabel")}</span>
        </div>
        <div className="text-xs text-blue-600 font-bold">
          {segment.startedAt || t("segments.infoGrid.notSet")}
        </div>
      </div>
      <div className="rounded-lg border border-slate-200 p-3">
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
          <Calendar className="size-4" />
          <span>{t("segments.infoGrid.finishLabel")}</span>
        </div>
        <div className="text-xs text-blue-600 font-bold">
          {segment.estimatedFinishTime ?? t("segments.infoGrid.notSet")}
        </div>
      </div>
      <div className="rounded-lg border border-slate-200 p-3">
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
          <Truck className="size-4" />
          <span>{t("segments.infoGrid.vehicleLabel")}</span>
        </div>
        <div className="text-xs text-slate-900">
          {segment.vehicleLabel || t("segments.infoGrid.notAssigned")}
        </div>
      </div>
      <div className="rounded-lg border border-slate-200 p-3">
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
          <Building className="size-4" />
          <span>{t("segments.infoGrid.localCompanyLabel")}</span>
        </div>
        <div className="text-xs text-slate-900 flex items-center gap-1">
          {segment.localCompany || t("segments.infoGrid.notAssigned")}
          {segment.localCompany && (
            <button
              type="button"
              className="size-4 rounded-full bg-blue-600 flex items-center justify-center"
            >
              <X className="size-3 text-white" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
