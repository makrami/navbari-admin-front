import { useTranslation } from "react-i18next";
import { NumericInputField } from "./NumericInputField";

type GPSTrackingSectionProps = {
  gpsAlertDistance: number;
  onGpsAlertDistanceChange: (value: number) => void;
  pingInterval: number;
  onPingIntervalChange: (value: number) => void;
  maxConcurrentShipments: number;
  onMaxConcurrentShipmentsChange: (value: number) => void;
};

export function GPSTrackingSection({
  gpsAlertDistance,
  onGpsAlertDistanceChange,
  pingInterval,
  onPingIntervalChange,
  maxConcurrentShipments,
  onMaxConcurrentShipmentsChange,
}: GPSTrackingSectionProps) {
  const { t } = useTranslation();

  return (
    <div className="bg-slate-100 rounded-lg p-4 ">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-slate-900 mb-1">
          {t("settings.sections.systemParameters.gpsTracking.title")}
        </h3>
        <p className="text-sm text-slate-400">
          {t("settings.sections.systemParameters.gpsTracking.description")}
        </p>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <NumericInputField
          label={t(
            "settings.sections.systemParameters.gpsTracking.gpsAlertDistance"
          )}
          value={gpsAlertDistance}
          onChange={onGpsAlertDistanceChange}
          unit="KM"
        />
        <NumericInputField
          label={t(
            "settings.sections.systemParameters.gpsTracking.pingInterval"
          )}
          value={pingInterval}
          onChange={onPingIntervalChange}
          unit="MINUTES"
        />
        <NumericInputField
          label={t(
            "settings.sections.systemParameters.gpsTracking.maxConcurrentShipments"
          )}
          value={maxConcurrentShipments}
          onChange={onMaxConcurrentShipmentsChange}
        />
      </div>
    </div>
  );
}
