import {CompanyNameField} from "./CompanyNameField";
import {CompanyLogoUpload} from "./CompanyLogoUpload";
import {SettingsFooter} from "./SettingsFooter";
import {MeasurementUnitsField} from "./MeasurementUnitsField";

type GeneralSettingsProps = {
  companyName: string;
  onCompanyNameChange: (value: string) => void;
  logoPreview: string | null;
  onLogoChange: (preview: string) => void;
  distanceUnit: string;
  onDistanceUnitChange: (value: string) => void;
  weightUnit: string;
  onWeightUnitChange: (value: string) => void;
  changeCount: number;
  onRevert: () => void;
  onSave: () => void;
  isLoading?: boolean;
};

export function GeneralSettings({
  companyName,
  onCompanyNameChange,
  logoPreview,
  onLogoChange,
  distanceUnit,
  onDistanceUnitChange,
  weightUnit,
  onWeightUnitChange,
  changeCount,
  onRevert,
  onSave,
  isLoading = false,
}: GeneralSettingsProps) {
  return (
    <div className="space-y-6 pt-4">
      <CompanyNameField value={companyName} onChange={onCompanyNameChange} />
      <CompanyLogoUpload
        logoPreview={logoPreview}
        onLogoChange={onLogoChange}
      />
      {/* <div className="grid grid-cols-2 gap-4">
        <TimeZoneField value={timeZone} onChange={onTimeZoneChange} />
        <MapStyleField value={mapStyle} onChange={onMapStyleChange} />
      </div> */}
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
        isLoading={isLoading}
      />
    </div>
  );
}
