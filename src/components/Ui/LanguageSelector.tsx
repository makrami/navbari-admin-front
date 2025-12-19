import {useState, useRef, useEffect} from "react";
import {useTranslation} from "react-i18next";
import {useProfileStore} from "../../store/profileStore";
import i18n from "../../lib/i18n";
import ReactCountryFlag from "react-country-flag";
import {ChevronDown} from "lucide-react";

const languages = [
  {code: "en", name: "English", countryCode: "US"},
  {code: "fa", name: "فارسی", countryCode: "IR"},
  {code: "ar", name: "العربية", countryCode: "SA"},
  {code: "zh", name: "中文", countryCode: "CN"},
  {code: "ru", name: "Русский", countryCode: "RU"},
  {code: "tr", name: "Türkçe", countryCode: "TR"},
];

interface LanguageSelectorProps {
  openUp?: boolean;
}

export const LanguageSelector = ({openUp = false}: LanguageSelectorProps) => {
  const {i18n: i18nInstance} = useTranslation();
  const {language, setLanguage} = useProfileStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    setLanguage(langCode);
    setIsOpen(false);
    // Optionally reload the page to refresh server-fetched, language-dependent content
    // window.location.reload();
  };

  const currentLang = i18nInstance.language || language;
  const currentLanguage =
    languages.find((lang) => lang.code === currentLang) || languages[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-0 py-1 text-xs font-medium text-slate-700 hover:text-slate-900 focus:outline-none focus:ring-0 cursor-pointer"
      >
        <ReactCountryFlag
          svg
          countryCode={currentLanguage.countryCode}
          style={{
            width: "16px",
            height: "12px",
            borderRadius: "2px",
          }}
          title={currentLanguage.name}
        />
        <span className="flex-1 text-left">{currentLanguage.name}</span>
        <ChevronDown
          className={`h-3 w-3 text-slate-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div
          className={`absolute ${
            openUp ? "bottom-full mb-1" : "top-full mt-1"
          } left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-lg z-50 overflow-hidden`}
        >
          {languages.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => handleLanguageChange(lang.code)}
              className={`w-full flex items-center gap-2 px-3 py-2 text-left text-xs font-medium hover:bg-slate-50 transition-colors ${
                lang.code === currentLang ? "bg-slate-100" : ""
              }`}
            >
              <ReactCountryFlag
                svg
                countryCode={lang.countryCode}
                style={{
                  width: "16px",
                  height: "12px",
                  borderRadius: "2px",
                }}
                title={lang.name}
              />
              <span>{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
