import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, Minus } from "lucide-react";

type CurrencyOverride = {
  id: string;
  country: string;
  currency: string;
};

type CurrencyOverrideSectionProps = {
  overrides: CurrencyOverride[];
  onOverridesChange: (overrides: CurrencyOverride[]) => void;
};

const countryOptions = [
  "United Kingdom",
  "United States",
  "Germany",
  "France",
  "Japan",
  "China",
];

const currencyOptions = ["USD ($)", "EUR (€)", "GBP (£)", "JPY (¥)", "CNY (¥)"];

export function CurrencyOverrideSection({
  overrides,
  onOverridesChange,
}: CurrencyOverrideSectionProps) {
  const { t } = useTranslation();

  const handleAddOverride = () => {
    const newOverride: CurrencyOverride = {
      id: Date.now().toString(),
      country: countryOptions[0],
      currency: currencyOptions[0],
    };
    onOverridesChange([...overrides, newOverride]);
  };

  const handleRemoveOverride = (id: string) => {
    onOverridesChange(overrides.filter((override) => override.id !== id));
  };

  const handleCountryChange = (id: string, country: string) => {
    onOverridesChange(
      overrides.map((override) =>
        override.id === id ? { ...override, country } : override
      )
    );
  };

  const handleCurrencyChange = (id: string, currency: string) => {
    onOverridesChange(
      overrides.map((override) =>
        override.id === id ? { ...override, currency } : override
      )
    );
  };

  return (
    <div className="grid bg-slate-100 rounded-lg p-4 grid-cols-2 gap-4 space-y-4">
      <div>
        <h3 className="text-sm font-bold text-slate-900 mb-1">
          {t("settings.sections.localization.perCountryCurrencyOverride.title")}
        </h3>
        <p className="text-xs text-slate-500">
          {t(
            "settings.sections.localization.perCountryCurrencyOverride.description"
          )}
        </p>
      </div>

      <div className="space-y-4">
        {overrides.map((override) => (
          <CurrencyOverrideRow
            key={override.id}
            override={override}
            onCountryChange={(country) =>
              handleCountryChange(override.id, country)
            }
            onCurrencyChange={(currency) =>
              handleCurrencyChange(override.id, currency)
            }
            onRemove={() => handleRemoveOverride(override.id)}
          />
        ))}
        <button
          type="button"
          onClick={handleAddOverride}
          className="w-full px-4 py-2.5 bg-[#1B54FE]/10 text-[#1B54FE] rounded-lg hover:bg-[#1545d4]/15 transition-colors text-xs font-bold  flex items-center justify-center gap-2"
        >
          <span>
            {t(
              "settings.sections.localization.perCountryCurrencyOverride.addOverride"
            )}{" "}
            +
          </span>
        </button>
      </div>
    </div>
  );
}

type CurrencyOverrideRowProps = {
  override: CurrencyOverride;
  onCountryChange: (country: string) => void;
  onCurrencyChange: (currency: string) => void;
  onRemove: () => void;
};

function CurrencyOverrideRow({
  override,
  onCountryChange,
  onCurrencyChange,
  onRemove,
}: CurrencyOverrideRowProps) {
  const [countryOpen, setCountryOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const countryRef = useRef<HTMLDivElement>(null);
  const currencyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        countryRef.current &&
        !countryRef.current.contains(event.target as Node) &&
        currencyRef.current &&
        !currencyRef.current.contains(event.target as Node)
      ) {
        setCountryOpen(false);
        setCurrencyOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex items-center gap-2">
      <div ref={countryRef} className="relative flex-1">
        <button
          type="button"
          onClick={() => {
            setCountryOpen(!countryOpen);
            setCurrencyOpen(false);
          }}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B54FE] focus:border-transparent bg-white text-slate-900 flex items-center justify-between"
        >
          <span>{override.country}</span>
          <ChevronDown
            className={`size-4 text-slate-400 transition-transform ${
              countryOpen ? "rotate-180" : ""
            }`}
          />
        </button>
        {countryOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10">
            {countryOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  onCountryChange(option);
                  setCountryOpen(false);
                }}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-50 first:rounded-t-lg last:rounded-b-lg ${
                  override.country === option ? "bg-slate-100 font-medium" : ""
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>

      <div ref={currencyRef} className="relative flex-1">
        <button
          type="button"
          onClick={() => {
            setCurrencyOpen(!currencyOpen);
            setCountryOpen(false);
          }}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B54FE] focus:border-transparent bg-white text-slate-900 flex items-center justify-between"
        >
          <span>{override.currency}</span>
          <ChevronDown
            className={`size-4 text-slate-400 transition-transform ${
              currencyOpen ? "rotate-180" : ""
            }`}
          />
        </button>
        {currencyOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10">
            {currencyOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  onCurrencyChange(option);
                  setCurrencyOpen(false);
                }}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-50 first:rounded-t-lg last:rounded-b-lg ${
                  override.currency === option ? "bg-slate-100 font-medium" : ""
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onRemove}
        className="size-9 bg-red-500/10 hover:bg-red-500/15 border border-red-500/10 text-red-500 rounded-lg flex items-center justify-center transition-colors"
      >
        <Minus className="size-4" />
      </button>
    </div>
  );
}
