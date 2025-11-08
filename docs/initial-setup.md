## Reusable Frontend Setup – Initial Configurations and Packages

Use this document to bootstrap a new React + Vite + Tailwind project with batteries included. Copy it into new repos and adapt as needed.

---

### 1. Initial package installation

Install the core packages. Use one of the following:

```bash
# npm
npm i react react-dom react-router-dom zustand zod axios react-country-flag lucide-react

# yarn
yarn add react react-dom react-router-dom zustand zod axios react-country-flag lucide-react
```

Tailwind CSS (with Vite plugin and PostCSS):

```bash
# npm (dev deps)
npm i -D tailwindcss @tailwindcss/vite @tailwindcss/postcss postcss autoprefixer

# yarn (dev deps)
yarn add -D tailwindcss @tailwindcss/vite @tailwindcss/postcss postcss autoprefixer
```

Optional but recommended (if you plan to use them):

```bash
# Charts, dates, i18n, maps (examples)
npm i recharts dayjs i18next react-i18next i18next-browser-languagedetector i18next-http-backend mapbox-gl react-map-gl
```

---

### 2. Tailwind configuration

- Install Tailwind and its Vite/PostCSS plugins (see commands above).
- Enable the Tailwind Vite plugin in `vite.config.ts`:

```ts
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

- Add a `tailwind.config.js` to control theme and content scanning (recommended):

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Example design token
        mainBlue: "#1b54fe",
      },
    },
  },
  plugins: [],
};
```

- Add Tailwind directives to your global stylesheet (e.g., `src/index.css`):

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- Recommended plugins (install and register when needed):

  - Typography: `@tailwindcss/typography`
  - Forms reset: `@tailwindcss/forms`
  - Line clamp: `@tailwindcss/line-clamp`

- Example class usage:

```tsx
export function PrimaryButton({ children }: { children: React.ReactNode }) {
  return (
    <button className="inline-flex items-center gap-2 rounded-md bg-mainBlue px-4 py-2 text-white hover:opacity-90">
      {children}
    </button>
  );
}
```

---

### 3. Zustand configuration

Folder recommendation:

```text
src/
  store/
    auth.store.ts
    profile.store.ts
    ui.store.ts
```

Create a global store with actions and selectors:

```ts
// src/store/auth.store.ts
import { create } from "zustand";

type AuthState = {
  token: string | null;
  setToken: (token: string | null) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  setToken: (token) => set({ token }),
  logout: () => set({ token: null }),
}));

// Selector example (usage: const token = useAuthToken())
export const useAuthToken = () => useAuthStore((s) => s.token);
```

Usage in components:

```tsx
import { useAuthStore } from "@/store/auth.store";

export function LogoutButton() {
  const logout = useAuthStore((s) => s.logout);
  return <button onClick={logout}>Logout</button>;
}
```

When to create new stores:

- Create a new slice when state belongs to a distinct domain (auth, profile, UI flags, cart, etc.).
- Keep slices small and focused; avoid a single mega-store.

---

### 4. Zod configuration

Validate forms and API responses at the boundary using Zod.

Example schema and validation:

```ts
import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 chars"),
});

type LoginInput = z.infer<typeof loginSchema>;

// Parsing with exceptions
export function validateLoginStrict(data: unknown): LoginInput {
  return loginSchema.parse(data);
}

// Safe parsing for UI forms
export function validateLoginSafe(data: unknown) {
  const result = loginSchema.safeParse(data);
  if (!result.success) {
    // Map errors to UI
    const fieldErrors = result.error.flatten().fieldErrors;
    return { ok: false, errors: fieldErrors };
  }
  return { ok: true, data: result.data };
}
```

---

### 5. Axios configuration

Folder recommendation:

```text
src/
  services/
    api.ts        // axios instance
    auth.ts       // auth endpoints
    users.ts      // user endpoints
```

Axios instance with interceptors and token handling:

```ts
// src/services/api.ts
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  timeout: 15000,
});

// Request interceptor: attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token"); // or from Zustand
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor: normalize errors
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    // Example: handle 401 globally
    if (status === 401) {
      // TODO: dispatch logout/refresh flow
    }
    return Promise.reject(error);
  }
);

export default api;
```

Error handling pattern in callers:

```ts
import api from "@/services/api";

export async function fetchProfile() {
  try {
    const { data } = await api.get("/me");
    return data;
  } catch (err: any) {
    const message = err?.response?.data?.message || "Request failed";
    throw new Error(message);
  }
}
```

---

### 6. react-country-flag

Install is covered above. Basic usage:

```tsx
import ReactCountryFlag from "react-country-flag";

export function CountryCell({ code }: { code: string }) {
  return (
    <ReactCountryFlag
      countryCode={code}
      svg
      style={{ width: "1.25rem", height: "1.25rem" }}
      title={code}
      aria-label={code}
    />
  );
}
```

Recommendations:

- Use `svg` for crisp rendering.
- Wrap with a tooltip for accessibility if needed.

---

### 7. lucide-react

Import icons directly or wrap in a shared component.

```tsx
import { ArrowRight, Search } from "lucide-react";

export function IconDemo() {
  return (
    <div className="flex items-center gap-2">
      <Search className="h-4 w-4" />
      <ArrowRight className="h-4 w-4" />
    </div>
  );
}
```

Shared icon component (centralize sizes/classes):

```tsx
// src/components/ui/Icon.tsx
import * as Icons from "lucide-react";

type IconName = keyof typeof Icons;

export function Icon({
  name,
  className,
}: {
  name: IconName;
  className?: string;
}) {
  const LucideIcon = Icons[name];
  return LucideIcon ? <LucideIcon className={className ?? "h-4 w-4"} /> : null;
}
```

---

### 8. react-router-dom

Basic router setup:

```tsx
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
```

Protected route example:

```tsx
// src/routes/ProtectedRoute.tsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  const location = useLocation();
  if (!token)
    return <Navigate to="/login" replace state={{ from: location }} />;
  return <>{children}</>;
}
```

Folder structure recommendations:

```text
src/
  pages/
    HomePage.tsx
    LoginPage.tsx
    DashboardPage.tsx
  routes/
    ProtectedRoute.tsx
    Router.tsx
```

---

### 9. Directory structure (recommended)

```text
src/
  components/
  pages/
  routes/
  store/
  services/
  assets/
  hooks/
  utils/
```

Notes:

- Co-locate feature components under `pages/{feature}/components` when complex.
- Keep `components/` for reusable, feature-agnostic UI.

---

### 10. Environment variables

Location:

- Place `.env` files at project root: `.env`, `.env.local`, `.env.development`, `.env.production`.
- With Vite, only variables prefixed with `VITE_` are exposed to the client.

Examples:

```bash
# .env.local (do NOT commit)
VITE_API_BASE_URL=https://api.example.com
VITE_MAPBOX_TOKEN=pk.your-mapbox-token
```

Access in code:

```ts
const baseUrl = import.meta.env.VITE_API_BASE_URL;
```

Important:

- NEVER commit `.env` files to version control.
- Provide `.env.example` with placeholders for collaborators.

---

### 11. Example usage (quick snippets)

- Zustand + Axios token wiring:

```ts
import api from "@/services/api";
import { useAuthStore } from "@/store/auth.store";

export async function getSecret() {
  const token = useAuthStore.getState().token;
  // Optionally set per-request header
  const { data } = await api.get("/secret", {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return data;
}
```

- Zod + form submit handler:

```ts
import { loginSchema } from "@/schemas/login";

async function onSubmit(form: unknown) {
  const result = loginSchema.safeParse(form);
  if (!result.success) {
    // Show result.error.flatten().fieldErrors
    return;
  }
  // Proceed with API
}
```

- Router + protected page layout:

```tsx
<Route
  path="/app"
  element={
    <ProtectedRoute>
      <AppLayout />
    </ProtectedRoute>
  }
>
  <Route index element={<DashboardPage />} />
  <Route path="drivers" element={<DriversPage />} />
</Route>
```

---

### 12. Reusability notes (best practices)

- Naming conventions:

  - Components: `PascalCase` (`UserCard.tsx`) with clear intent.
  - Files/folders: `kebab-case` or `camelCase` consistently per repo.
  - Hooks: `useVerbNoun` (`useAuthToken`).

- Folder communication rules:

  - `pages/` orchestrate; avoid business logic.
  - `services/` talk to network; return parsed/validated data.
  - `store/` holds global UI/session state; keep slices small.
  - `components/` are dumb/presentational when possible.

- When to create new Zustand stores:

  - New domain with cross-page state or UI state shared across components.
  - Avoid coupling unrelated concerns in one slice.

- Error boundaries:
  - Add a shared error boundary around `Routes` to catch render errors.
  - Log to your monitoring tool and show a friendly fallback.

```tsx
// src/components/system/AppErrorBoundary.tsx
import { ErrorBoundary } from "react-error-boundary";

export function AppErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary fallback={<div>Something went wrong.</div>}>
      {children}
    </ErrorBoundary>
  );
}
```

---

<!-- Insert project-specific notes, API domains, auth flows, and build steps here. -->
