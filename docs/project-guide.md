## Navbari Admin Front – Project Guide

A reusable, high-signal guide for onboarding, extending, and maintaining this codebase. Copy and adapt for future projects.

### TL;DR

- Install: `npm i` or `yarn`
- Env: create `.env.local` with required `VITE_*` vars (see Configuration)
- Develop: `npm run dev`
- Build: `npm run build` → preview: `npm run preview`

---

### 1) Project structure

Directory tree (trimmed to key areas):

```text
.
├─ docs/
│  ├─ language-switching.md
│  └─ project-guide.md   ← this file
├─ public/
│  └─ locales/
│     └─ en/translation.json    ← i18n JSON bundles
├─ src/
│  ├─ app-root/
│  │  ├─ index.ts
│  │  ├─ providers/              ← App-level providers (Query, Theme)
│  │  └─ routing/                ← Router, public/protected route guards
│  ├─ assets/                    ← Static images, icons
│  ├─ components/                ← Reusable UI + feature widgets
│  │  ├─ shipment/
│  │  └─ Ui/LanguageSelector.tsx ← Language dropdown control
│  ├─ layouts/                   ← App shell: Sidebar, AppLayout
│  ├─ lib/                       ← Framework-agnostic libraries (i18n, env, http)
│  │  ├─ env.ts                  ← VITE_* env access helper
│  │  └─ i18n.ts                 ← i18next init/config
│  ├─ pages/                     ← Route-level pages by domain
│  │  ├─ auth/                   ← Login/Signup
│  │  ├─ dashboard/
│  │  ├─ Drivers/
│  │  ├─ LocalCompanies/
│  │  ├─ finance/
│  │  ├─ segments/
│  │  ├─ shipment/
│  │  ├─ vehicles/
│  │  └─ misc/NotFoundPage.tsx
│  ├─ services/                  ← Data layer, repositories, API/demo swap
│  │  ├─ auth.service.ts
│  │  └─ shipment/ (Demo + interfaces)
│  ├─ shared/                    ← Cross-cutting components, types, utils
│  ├─ store/                     ← Zustand stores (auth, profile)
│  ├─ styles.css / App.css       ← Global styles
│  └─ main.tsx / App.tsx         ← App bootstrap
├─ tailwind.config.js            ← Tailwind CSS config
├─ tsconfig*.json                ← TypeScript configs
├─ vite.config.ts                ← Vite build/dev config
└─ eslint.config.js              ← ESLint config
```

Responsibilities and usage:

- Components (`src/components`):
  - **Purpose**: Reusable UI and feature-specific building blocks.
  - **Scaling**: Group by feature (`components/featureX/…`) or by type (`components/ui`, `components/forms`). Keep small, testable, prop-driven.

- Pages (`src/pages`):
  - **Purpose**: Route-level views; orchestrate data fetching and compose components.
  - **Scaling**: One folder per domain (e.g., `Drivers`, `shipment`), with `components/`, `hooks/`, `types/`, `data/` under that page if needed.

- Layouts (`src/layouts`):
  - **Purpose**: App-wide shell (sidebar, header), shared navigation and structure.
  - **Scaling**: Introduce more layouts as needed (e.g., auth vs. app).

- Lib (`src/lib`):
  - **Purpose**: Framework-agnostic libs (i18n, env, http). No React components.
  - **Scaling**: Keep side-effects contained; expose small, composable helpers.

- Services (`src/services`):
  - **Purpose**: Data access layer (API calls, repositories). Current implementation supports demo data with a future API swap.
  - **Scaling**: Keep interfaces in `ShipmentRepository.ts`; add API-backed implementations and switch by env/flag.

- Store (`src/store`):
  - **Purpose**: Global state with Zustand. Small slices (auth, profile).
  - **Scaling**: Create focused stores per domain; avoid one giant store.

- Shared (`src/shared`):
  - **Purpose**: Cross-cutting UI, types, and utils used across domains.
  - **Scaling**: Keep generic and dependency-light.

- Assets (`src/assets`):
  - **Purpose**: Static images and icons used by the app.
  - **Scaling**: Organize by feature or type; prefer code-split imports on heavy media.

- Translations (`public/locales`):
  - **Purpose**: i18n JSON bundles per language.
  - **Scaling**: One `translation.json` per language; consider splitting modules later with additional namespaces.

---

### 2) Basic technologies used (and why)

- **React 19**: Component-based UI with modern features.
- **Vite (rolldown-vite)**: Fast dev server and build tooling.
- **TypeScript**: Type-safety and better DX.
- **Tailwind CSS v4**: Utility-first styling; rapid iteration.
- **React Router v7**: Client-side routing with route guards.
- **Zustand**: Minimal, ergonomic global state management.
- **TanStack Query**: Declarative server-state cache and fetching.
- **Axios**: HTTP client with interceptors and typed responses.
- **i18next + react-i18next**: Production-ready i18n with React bindings.
- **i18next-browser-languagedetector + http-backend**: Auto-detect language and load JSON bundles from `public/locales`.
- **Mapbox GL + react-map-gl**: High-performance mapping with React bindings.
- **Recharts**: Composable charts for dashboards.
- **Zod**: Schema validation and parsing.
- **Dayjs**: Lightweight date/time utilities.
- **Lucide-react**: Icon set.
- **clsx**: Conditional class utilities.

---

### 3) Configuration setup

Environment variables (Vite-style):

- Location: `.env`, `.env.local`, `.env.development`, `.env.production`
- Access pattern: `import.meta.env.VITE_*`

Required/recognized variables in this project:

- **VITE_API_BASE_URL**: Base URL for API calls (default `/api`).
- **VITE_DATA_MODE**: `demo` or `api` to choose repository implementation.
- **VITE_MAPBOX_TOKEN**: Mapbox access token for `mapbox-gl` and `react-map-gl`.

Example `.env.local`:

```bash
VITE_API_BASE_URL=https://api.example.com
VITE_DATA_MODE=demo
VITE_MAPBOX_TOKEN=pk.YourMapboxTokenHere
```

Where they live in code:

- `src/lib/env.ts`: Safe helpers to read `VITE_*` vars.
- `src/services/config.ts`: Data mode switch (`demo` vs `api`) and repository selection.

Core config files and what they control:

- `vite.config.ts`: Plugins (React, Tailwind), dev server/build config.
- `tailwind.config.js`: Content scanning paths and theme extensions (e.g., `mainBlue`).
- `tsconfig.json` → `tsconfig.app.json`: TypeScript project references; app compiler options.
- `eslint.config.js`: ESLint rules for TS/React and dev ergonomics.
- Optional (not present): Prettier config. Add if you want opinionated formatting.

Mapbox usage and token wiring:

- `react-map-gl` accepts a `mapboxAccessToken` prop or uses `mapboxgl.accessToken`.
- Recommended pattern:

```tsx
import { Map } from 'react-map-gl';

<Map
  mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
  mapStyle="mapbox://styles/mapbox/streets-v12"
  initialViewState={{ latitude: 0, longitude: 0, zoom: 2 }}
/>
```

---

### 4) Installed packages (by category)

- **UI**: `tailwindcss`, `lucide-react`, `recharts`, `react-country-flag`, `clsx`
- **Routing**: `react-router-dom`
- **State**: `zustand`
- **Server state / Data fetching**: `@tanstack/react-query`, `axios`
- **i18n**: `i18next`, `react-i18next`, `i18next-browser-languagedetector`, `i18next-http-backend`
- **Maps**: `mapbox-gl`, `react-map-gl`, `@types/geojson`
- **Validation**: `zod`
- **Dates**: `dayjs`
- **React core**: `react`, `react-dom`, `react-is`
- **Build/Dev (devDependencies)**: `vite`, `@vitejs/plugin-react`, `@tailwindcss/vite`, `tailwindcss`, `postcss`, `autoprefixer`, `typescript`, `eslint` (+ plugins)

Each package’s role is reflected in the sections above; prefer keeping these categories when adding new dependencies.

---

### 5) Language switch (i18n) system

How it works:

- `src/lib/i18n.ts` initializes i18next with:
  - `http-backend` to load JSON from `/locales/{{lng}}/translation.json`
  - `browser-languagedetector` with `localStorage` cache key `i18nextLng`
  - `fallbackLng: "en"` and `debug` in dev
  - Persists changes to `localStorage` and updates `document.documentElement.lang`

Folder layout:

```text
public/
  locales/
    en/
      translation.json
    {new-lng}/
      translation.json
```

Example `translation.json` (excerpt):

```json
{
  "common": { "welcome": "Welcome" },
  "auth": {
    "login": {
      "title": "Welcome",
      "submit": { "label": "Log In" }
    }
  }
}
```

Using translations in components:

```tsx
import { useTranslation } from 'react-i18next';

export function LoginHeader() {
  const { t } = useTranslation();
  return <h1>{t('auth.login.title')}</h1>;
}
```

Language selector and persistence:

- `src/components/Ui/LanguageSelector.tsx` renders a `<select>` of supported languages.
- Changing language calls `i18n.changeLanguage(lang)` and updates `useProfileStore`.
- i18next persists the language in `localStorage` under `i18nextLng`.

Adding a new language:

1) Create `public/locales/{lng}/translation.json` by copying `en/translation.json`.
2) Add `{ code: '{lng}', name: '...', flag: '...' }` to the `languages` array in `LanguageSelector.tsx`.
3) Use translation keys as usual; i18next will load the new bundle automatically.

Adding new translation keys:

1) Add the key/value in `public/locales/en/translation.json` (and other languages).
2) Reference via `t('path.to.key')` in components.

---

### 6) Usage guide

- **Add a page**
  1) Create a file under `src/pages/{feature}/{PageName}.tsx`.
  2) Register the route in `src/app-root/routing/Router.tsx`.
  3) Use layout wrappers from `src/layouts` as needed.

- **Add new translation keys**
  1) Edit `public/locales/en/translation.json` with the new key(s).
  2) Update other language files for parity when available.
  3) Use `useTranslation()` and call `t('your.key')` in components.

- **Add a new language**
  1) Duplicate `public/locales/en/translation.json` → `public/locales/{lng}/translation.json`.
  2) Update `languages` array in `LanguageSelector.tsx`.
  3) Verify UI by switching language in the selector.

- **Add new cards/sections**
  1) Implement a component in `src/components/{feature}/`.
  2) Plug it into a page under `src/pages/{feature}/`.
  3) Add translation keys for titles/labels.
  4) If data-driven, add a service/repository method and, if applicable, a TanStack Query hook.

---

### 7) Reusable notes (best practices)

- **Structure by feature**: Prefer feature folders over global buckets as the app grows.
- **Small stores**: Keep Zustand slices focused; colocate selectors and actions.
- **Server vs client state**: Use TanStack Query for server state; Zustand for UI/global session state.
- **Typed APIs**: Validate external data with `zod` at the boundary.
- **Styling**: Favor Tailwind utilities; extract components for repeated patterns.
- **Naming**: Use clear, descriptive component and variable names (no abbreviations).
- **i18n discipline**: Avoid hard-coded strings in components; always use keys.
- **Repository pattern**: Keep interfaces stable; swap implementations via env flags.

---

### 8) TODO markers (integration points)

- [TODO] API integration
  - Replace `DemoShipmentRepository` with an API-backed repository.
  - Wire `VITE_API_BASE_URL` and auth headers in a shared `http.ts` client.

- [TODO] Auth flows
  - Persist tokens securely (httpOnly cookies or secure storage).
  - Guard routes via `ProtectedRoute` and refresh-token handling.

- [TODO] Map configuration
  - Centralize Mapbox style(s) and use `VITE_MAPBOX_TOKEN` from env.
  - Add offline/low-bandwidth fallbacks if needed.

- [TODO] Observability
  - Add error boundaries, logging, and monitoring where appropriate.

- [TODO] Accessibility & i18n
  - Audit for aria-labels, keyboard nav, and RTL support when adding new languages.

---

### Appendix: File references

- i18n init and language persistence: `src/lib/i18n.ts`
- Language selector: `src/components/Ui/LanguageSelector.tsx`
- Env access helpers: `src/lib/env.ts`
- Data mode switch (demo/api): `src/services/config.ts`
- Router: `src/app-root/routing/Router.tsx`


