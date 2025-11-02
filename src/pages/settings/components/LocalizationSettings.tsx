import { LanguageField } from "./LanguageField";
import { CurrencyField } from "./CurrencyField";
import { CurrencyOverrideSection } from "./CurrencyOverrideSection";
import { DateFormatField } from "./DateFormatField";
import { TimeFormatField } from "./TimeFormatField";
import { NumericSeparatorField } from "./NumericSeparatorField";
import { DecimalSeparatorField } from "./DecimalSeparatorField";
import { SettingsFooter } from "./SettingsFooter";

type CurrencyOverride = {
  id: string;
  country: string;
  currency: string;
};

type LocalizationSettingsProps = {
  language: string;
  onLanguageChange: (value: string) => void;
  baseCurrency: string;
  onBaseCurrencyChange: (value: string) => void;
  currencyOverrides: CurrencyOverride[];
  onCurrencyOverridesChange: (overrides: CurrencyOverride[]) => void;
  dateFormat: string;
  onDateFormatChange: (value: string) => void;
  timeFormat: string;
  onTimeFormatChange: (value: string) => void;
  numericSeparator: string;
  onNumericSeparatorChange: (value: string) => void;
  decimalSeparator: string;
  onDecimalSeparatorChange: (value: string) => void;
  changeCount: number;
  onRevert: () => void;
  onSave: () => void;
};

export function LocalizationSettings({
  language,
  onLanguageChange,
  baseCurrency,
  onBaseCurrencyChange,
  currencyOverrides,
  onCurrencyOverridesChange,
  dateFormat,
  onDateFormatChange,
  timeFormat,
  onTimeFormatChange,
  numericSeparator,
  onNumericSeparatorChange,
  decimalSeparator,
  onDecimalSeparatorChange,
  changeCount,
  onRevert,
  onSave,
}: LocalizationSettingsProps) {
  return (
    <div className="space-y-6 pt-4">
      {/* Top Row - Language and Base Currency */}
      <div className="grid grid-cols-2 gap-4">
        <LanguageField value={language} onChange={onLanguageChange} />
        <CurrencyField value={baseCurrency} onChange={onBaseCurrencyChange} />
      </div>

      {/* Currency Override Section */}
      <CurrencyOverrideSection
        overrides={currencyOverrides}
        onOverridesChange={onCurrencyOverridesChange}
      />

      {/* Middle Row - Date and Time Format */}
      <div className="grid grid-cols-2 gap-4">
        <DateFormatField value={dateFormat} onChange={onDateFormatChange} />
        <TimeFormatField value={timeFormat} onChange={onTimeFormatChange} />
      </div>

      {/* Bottom Row - Numeric and Decimal Separators */}
      <div className="grid grid-cols-2 gap-4">
        <NumericSeparatorField
          value={numericSeparator}
          onChange={onNumericSeparatorChange}
        />
        <DecimalSeparatorField
          value={decimalSeparator}
          onChange={onDecimalSeparatorChange}
        />
      </div>

      {/* Footer */}
      <SettingsFooter
        changeCount={changeCount}
        onRevert={onRevert}
        onSave={onSave}
      />
    </div>
  );
}
