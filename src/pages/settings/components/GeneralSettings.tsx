import { CompanyNameField } from "./CompanyNameField";
import { CompanyLogoUpload } from "./CompanyLogoUpload";
import { TimeZoneField } from "./TimeZoneField";
import { MapStyleField } from "./MapStyleField";
import { MeasurementUnitsField } from "./MeasurementUnitsField";
import { SettingsFooter } from "./SettingsFooter";

type GeneralSettingsProps = {
  companyName: string;
  onCompanyNameChange: (value: string) => void;
  logoPreview: string | null;
  onLogoChange: (preview: string) => void;
  timeZone: string;
  onTimeZoneChange: (value: string) => void;
  mapStyle: string;
  onMapStyleChange: (value: string) => void;
  distanceUnit: string;
  onDistanceUnitChange: (value: string) => void;
  weightUnit: string;
  onWeightUnitChange: (value: string) => void;
  changeCount: number;
  onRevert: () => void;
  onSave: () => void;
};

export function GeneralSettings({
  companyName,
  onCompanyNameChange,
  logoPreview,
  onLogoChange,
  timeZone,
  onTimeZoneChange,
  mapStyle,
  onMapStyleChange,
  distanceUnit,
  onDistanceUnitChange,
  weightUnit,
  onWeightUnitChange,
  changeCount,
  onRevert,
  onSave,
}: GeneralSettingsProps) {
  return (
    <div className="space-y-6 pt-4">
      <CompanyNameField value={companyName} onChange={onCompanyNameChange} />
      <CompanyLogoUpload
        logoPreview={logoPreview}
        onLogoChange={onLogoChange}
      />
      <div className="grid grid-cols-2 gap-4">
        <TimeZoneField value={timeZone} onChange={onTimeZoneChange} />
        <MapStyleField value={mapStyle} onChange={onMapStyleChange} />
      </div>
      <MeasurementUnitsField
        distanceUnit={distanceUnit}
        weightUnit={weightUnit}
        onDistanceUnitChange={onDistanceUnitChange}
        onWeightUnitChange={onWeightUnitChange}
      />
      <SettingsFooter
        changeCount={changeCount}
        onRevert={onRevert}
        onSave={onSave}
      />
    </div>
  );
}
