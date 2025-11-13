import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";
import {initReactI18next} from "react-i18next";

const languageDetectorOptions = {
  order: ["localStorage", "navigator", "htmlTag"],
  caches: ["localStorage"],
  lookupLocalStorage: "i18nextLng",
};

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    lng: localStorage.getItem("i18nextLng") || "en",
    fallbackLng: "en",
    debug: import.meta.env.DEV,
    interpolation: {escapeValue: false},
    backend: {loadPath: "/locales/{{lng}}/translation.json"},
    detection: languageDetectorOptions,
  });

i18n.on("languageChanged", (lng) => {
  localStorage.setItem("i18nextLng", lng);
  document.documentElement.lang = lng;
  // Set text direction based on language
  const rtlLanguages = ["fa", "ar", "he", "ur"];
  document.documentElement.dir = rtlLanguages.includes(lng) ? "rtl" : "ltr";
});

// Initialize direction on load
const currentLang = localStorage.getItem("i18nextLng") || "en";
document.documentElement.lang = currentLang;
const rtlLanguages = ["fa", "ar", "he", "ur"];
document.documentElement.dir = rtlLanguages.includes(currentLang) ? "rtl" : "ltr";

export default i18n;
