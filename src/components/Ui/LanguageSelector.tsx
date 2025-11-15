import { useTranslation } from "react-i18next";
import { useProfileStore } from "../../store/profileStore";
import i18n from "../../lib/i18n";
import ReactCountryFlag from "react-country-flag";

const languages = [
  { code: "en", name: "English", countryCode: "US" },
  { code: "fa", name: "فارسی", countryCode: "IR" },
  { code: "ar", name: "العربية", countryCode: "SA" },
  { code: "zh", name: "中文", countryCode: "CN" },
  { code: "ru", name: "Русский", countryCode: "RU" },
];

export const LanguageSelector = () => {
  const { i18n: i18nInstance } = useTranslation();
  const { language, setLanguage } = useProfileStore();

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    setLanguage(langCode);
    // Optionally reload the page to refresh server-fetched, language-dependent content
    // window.location.reload();
  };

  const currentLang = i18nInstance.language || language;
  const currentLanguage =
    languages.find((lang) => lang.code === currentLang) || languages[0];

  return (
    <div className="relative w-full flex items-center gap-2">
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
      <select
        value={currentLang}
        onChange={(e) => handleLanguageChange(e.target.value)}
        className="flex-1 appearance-none bg-transparent border-0 px-0 py-1 text-xs font-medium text-slate-700 focus:outline-none focus:ring-0 cursor-pointer"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center">
        <svg
          className="h-3 w-3 text-slate-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
  );
};
