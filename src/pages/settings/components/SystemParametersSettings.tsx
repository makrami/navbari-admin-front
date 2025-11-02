import { SLAConfigurationSection } from "./SLAConfigurationSection";
import { ETACalculationMethodSection } from "./ETACalculationMethodSection";
import { GPSTrackingSection } from "./GPSTrackingSection";
import { SettingsFooter } from "./SettingsFooter";

type SystemParametersSettingsProps = {
  loadingTime: number;
  onLoadingTimeChange: (value: number) => void;
  transitTime: number;
  onTransitTimeChange: (value: number) => void;
  unloadingTime: number;
  onUnloadingTimeChange: (value: number) => void;
  etaMethod: "gps" | "historical";
  onEtaMethodChange: (method: "gps" | "historical") => void;
  gpsAlertDistance: number;
  onGpsAlertDistanceChange: (value: number) => void;
  pingInterval: number;
  onPingIntervalChange: (value: number) => void;
  maxConcurrentShipments: number;
  onMaxConcurrentShipmentsChange: (value: number) => void;
  changeCount: number;
  onRevert: () => void;
  onSave: () => void;
};

export function SystemParametersSettings({
  loadingTime,
  onLoadingTimeChange,
  transitTime,
  onTransitTimeChange,
  unloadingTime,
  onUnloadingTimeChange,
  etaMethod,
  onEtaMethodChange,
  gpsAlertDistance,
  onGpsAlertDistanceChange,
  pingInterval,
  onPingIntervalChange,
  maxConcurrentShipments,
  onMaxConcurrentShipmentsChange,
  changeCount,
  onRevert,
  onSave,
}: SystemParametersSettingsProps) {
  return (
    <div className="space-y-6 pt-4">
      <SLAConfigurationSection
        loadingTime={loadingTime}
        onLoadingTimeChange={onLoadingTimeChange}
        transitTime={transitTime}
        onTransitTimeChange={onTransitTimeChange}
        unloadingTime={unloadingTime}
        onUnloadingTimeChange={onUnloadingTimeChange}
      />

      <ETACalculationMethodSection
        method={etaMethod}
        onChange={onEtaMethodChange}
      />

      <GPSTrackingSection
        gpsAlertDistance={gpsAlertDistance}
        onGpsAlertDistanceChange={onGpsAlertDistanceChange}
        pingInterval={pingInterval}
        onPingIntervalChange={onPingIntervalChange}
        maxConcurrentShipments={maxConcurrentShipments}
        onMaxConcurrentShipmentsChange={onMaxConcurrentShipmentsChange}
      />

      <SettingsFooter
        changeCount={changeCount}
        onRevert={onRevert}
        onSave={onSave}
      />
    </div>
  );
}
