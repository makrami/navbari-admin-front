import { useTranslation } from "react-i18next";
import { useProfileStore } from "../../store/profileStore";
import i18n from "../../lib/i18n";

const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  // Add more languages here when available
  // { code: "fa", name: "فارسی", flag: "🇮🇷" },
  // { code: "ru", name: "Русский", flag: "🇷🇺" },
  // { code: "ar", name: "العربية", flag: "🇸🇦" },
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

  return (
    <div className="relative">
      <select
        value={currentLang}
        onChange={(e) => handleLanguageChange(e.target.value)}
        className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 pr-8 text-sm font-medium text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.name}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
        <svg
          className="h-4 w-4 text-gray-400"
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
