import { useTranslation } from "react-i18next";
import { NumericInputField } from "./NumericInputField";

type SLAConfigurationSectionProps = {
  loadingTime: number;
  onLoadingTimeChange: (value: number) => void;
  transitTime: number;
  onTransitTimeChange: (value: number) => void;
  unloadingTime: number;
  onUnloadingTimeChange: (value: number) => void;
};

export function SLAConfigurationSection({
  loadingTime,
  onLoadingTimeChange,
  transitTime,
  onTransitTimeChange,
  unloadingTime,
  onUnloadingTimeChange,
}: SLAConfigurationSectionProps) {
  const { t } = useTranslation();

  return (
    <div className="bg-slate-100 rounded-lg p-4 ">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-slate-900 mb-1">
          {t("settings.sections.systemParameters.slaConfiguration.title")}
        </h3>
        <p className="text-sm text-slate-400">
          {t("settings.sections.systemParameters.slaConfiguration.description")}
        </p>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <NumericInputField
          label={t(
            "settings.sections.systemParameters.slaConfiguration.loadingTime"
          )}
          value={loadingTime}
          onChange={onLoadingTimeChange}
          unit="HOURS"
        />
        <NumericInputField
          label={t(
            "settings.sections.systemParameters.slaConfiguration.transitTime"
          )}
          value={transitTime}
          onChange={onTransitTimeChange}
          unit="HOURS"
        />
        <NumericInputField
          label={t(
            "settings.sections.systemParameters.slaConfiguration.unloadingTime"
          )}
          value={unloadingTime}
          onChange={onUnloadingTimeChange}
          unit="HOURS"
        />
      </div>
    </div>
  );
}
