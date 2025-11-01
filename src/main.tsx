import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./lib/i18n";
import App from "./App.tsx";
import { QueryProvider, ThemeProvider } from "./app-root";
import { ErrorBoundary } from "./shared/components/ErrorBoundary";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <Suspense fallback={<div>Loading...</div>}>
        <QueryProvider>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </QueryProvider>
      </Suspense>
    </ErrorBoundary>
  </StrictMode>
);
