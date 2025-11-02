import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown } from "lucide-react";
import ReactCountryFlag from "react-country-flag";

type LanguageFieldProps = {
  value: string;
  onChange: (value: string) => void;
};

const languageOptions = [
  { code: "en", name: "English", countryCode: "GB" },
  { code: "es", name: "Spanish", countryCode: "ES" },
  { code: "fr", name: "French", countryCode: "FR" },
  { code: "de", name: "German", countryCode: "DE" },
];

export function LanguageField({ value, onChange }: LanguageFieldProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLanguage =
    languageOptions.find((lang) => lang.code === value) || languageOptions[0];

  return (
    <div>
      <label className="block text-sm font-medium text-slate-900 mb-2">
        {t("settings.sections.localization.language")}
      </label>
      <div ref={dropdownRef} className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B54FE] focus:border-transparent bg-white text-slate-900 flex items-center justify-between"
        >
          <span className="flex items-center gap-2">
            <ReactCountryFlag
              svg
              countryCode={selectedLanguage.countryCode}
              style={{ width: 20, height: 15, borderRadius: 2 }}
            />
            <span>{selectedLanguage.name}</span>
          </span>
          <ChevronDown
            className={`size-4 text-slate-400 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10">
            {languageOptions.map((option) => (
              <button
                key={option.code}
                type="button"
                onClick={() => {
                  onChange(option.code);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-50 first:rounded-t-lg last:rounded-b-lg flex items-center gap-2 ${
                  value === option.code ? "bg-slate-100 font-medium" : ""
                }`}
              >
                <ReactCountryFlag
                  svg
                  countryCode={option.countryCode}
                  style={{ width: 20, height: 15, borderRadius: 2 }}
                />
                <span>{option.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
