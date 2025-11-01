## Language Switching and i18n (React + i18next)

This guide documents a production-ready language switching setup used in this
app. You can copy the same structure into another React project.

### Tech Stack

- **i18next**: core internationalization engine
- **react-i18next**: React bindings (hooks like `useTranslation`)
- **i18next-http-backend**: loads translations over HTTP from `/public/locales`
- **i18next-browser-languagedetector**: detects the user’s language and persists
  it
- **Zustand (optional)**: store the selected language in app state
  (`selectedLanguage`)
- **react-country-flag (optional)**: flag icons in the language selector UI

### Directory Structure

```
public/
  locales/
    en/translation.json
    fa/translation.json
    ru/translation.json
    ar/translation.json
src/
  lib/
    i18n.ts                 # i18n initialization and configuration
  store/
    profileStore.ts         # holds `selectedLanguage` in localStorage (optional)
  components/
    Ui/
      LanguageSelector.tsx  # dropdown to switch languages at runtime
```

### Installation

```bash
pnpm add i18next react-i18next i18next-http-backend i18next-browser-languagedetector
# Optional UI/state helpers
pnpm add zustand react-country-flag
```

### i18n Initialization (`src/lib/i18n.ts`)

Key points implemented in this app:

- Translation files are loaded from `/locales/{{lng}}/translation.json`.
- Selected language is detected and persisted via `localStorage` under the key
  `i18nextLng`.
- When the language changes, we update `<html lang="...">` for accessibility and
  font switching.

Example (simplified):

```ts
import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";
import { initReactI18next } from "react-i18next";

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
    debug: process.env.NODE_ENV === "development",
    interpolation: { escapeValue: false },
    backend: { loadPath: "/locales/{{lng}}/translation.json" },
    detection: languageDetectorOptions,
  });

i18n.on("languageChanged", (lng) => {
  localStorage.setItem("i18nextLng", lng);
  document.documentElement.lang = lng;
});

document.documentElement.lang = localStorage.getItem("i18nextLng") || "en";

export default i18n;
```

### Translation Files (`public/locales/.../translation.json`)

Each language has a `translation.json` with flat keys. Example
`en/translation.json` snippet:

```json
{
  "welcome": "Welcome",
  "loading": "Loading...",
  "language": "Language"
}
```

### App Usage

- Import `useTranslation` anywhere to read strings:
  `const { t } = useTranslation();`
- The app uses `Suspense` to handle async loading of translation files.
- Ensure i18n is initialized before any component calls `useTranslation`. The
  safest approach is to import `src/lib/i18n` once in your app entry (e.g.,
  `main.tsx`) or very early in your component tree.

Recommended entry import:

```ts
// main.tsx
import "./lib/i18n";
```

### Language Selector (`src/components/Ui/LanguageSelector.tsx`)

The selector:

- Reads current language from a store (Zustand) that mirrors `localStorage`
  (`selectedLanguage`).
- Calls `i18n.changeLanguage(lang)` on selection.
- Optionally reloads the page to refresh any server-fetched, language-dependent
  content.

Behavioral notes:

- i18next persists language in `localStorage` under `i18nextLng`.
- The app store also persists a `selectedLanguage` key for UI convenience. These
  can be unified, but both work.

### Optional State Store (`src/store/profileStore.ts`)

This app keeps a `language` field and persists it under `selectedLanguage` of
`localStorage`:

- `language: localStorage.getItem('selectedLanguage') || 'en'`
- `setLanguage(lang)` updates both Zustand state and `localStorage`.

If you want a minimal setup in another project, you can skip the Zustand layer
and rely solely on `i18nextLng`.

### How to Transfer to Another Project

1. Install dependencies (see Installation).
2. Copy these files/folders:
   - `src/lib/i18n.ts`
   - `public/locales/**` (add/remove languages as needed)
   - `src/components/Ui/LanguageSelector.tsx` (optional UI)
   - `src/store/profileStore.ts` (optional state)
3. Ensure your bundler serves `public/` as the web root so `/locales/...` paths
   resolve.
4. Import `src/lib/i18n` once in your app entry (e.g., `main.tsx`).
5. Use `useTranslation` in components: `const { t } = useTranslation();` then
   render `t('key')`.
6. Place the `LanguageSelector` in your header or settings page.

### RTL and Fonts (Optional)

- For languages like Arabic (`ar`) or Persian (`fa`), set fonts that support
  those scripts.
- Consider toggling direction if you move to full RTL layouts:
  ```ts
  const isRtl = ["ar", "fa"].includes(currentLang);
  document.documentElement.dir = isRtl ? "rtl" : "ltr";
  ```

### Troubleshooting

- If translations don’t load, verify `backend.loadPath` and that files exist
  under `public/locales/{lng}/translation.json`.
- If `useTranslation` throws, ensure `src/lib/i18n` is imported before
  components render.
- If the selected language isn’t remembered, check `localStorage` keys:
  `i18nextLng` (i18next) and/or `selectedLanguage` (store).
