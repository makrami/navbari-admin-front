import { SLAConfigurationSection } from "./SLAConfigurationSection";

import { SettingsFooter } from "./SettingsFooter";

type SystemParametersSettingsProps = {
  loadingTime: number;
  onLoadingTimeChange: (value: number) => void;
  transitTime: number;
  onTransitTimeChange: (value: number) => void;
  unloadingTime: number;
  onUnloadingTimeChange: (value: number) => void;
  changeCount: number;
  onRevert: () => void;
  onSave: () => void;
  isLoading?: boolean;
};

export function SystemParametersSettings({
  loadingTime,
  onLoadingTimeChange,
  transitTime,
  onTransitTimeChange,
  unloadingTime,
  onUnloadingTimeChange,

  changeCount,
  onRevert,
  onSave,
  isLoading = false,
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

      {/* <ETACalculationMethodSection
        method={etaMethod}
        onChange={onEtaMethodChange}
      /> */}

      {/* <GPSTrackingSection
        gpsAlertDistance={gpsAlertDistance}
        onGpsAlertDistanceChange={onGpsAlertDistanceChange}
        pingInterval={pingInterval}
        onPingIntervalChange={onPingIntervalChange}
        maxConcurrentShipments={maxConcurrentShipments}
        onMaxConcurrentShipmentsChange={onMaxConcurrentShipmentsChange}
      /> */}

      <SettingsFooter
        changeCount={changeCount}
        onRevert={onRevert}
        onSave={onSave}
        isLoading={isLoading}
      />
    </div>
  );
}
