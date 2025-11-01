import { Outlet, useLocation } from "react-router-dom";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Sidebar } from "./Sidebar";
import { MobileSidebar } from "./MobileSidebar";
import { MenuIcon } from "lucide-react";

export function AppLayout() {
  const location = useLocation();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const { t } = useTranslation();
  const isAuthRoute =
    location.pathname === "/login" ||
    location.pathname === "/sign-up" ||
    location.pathname === "/";
  return (
    <div
      className={`min-h-screen bg-slate-100 text-slate-900 ${
        !isAuthRoute ? "md:pl-48" : ""
      }`}
    >
      {!isAuthRoute && <Sidebar />}

      {!isAuthRoute && (
        <>
          {/* Mobile header */}
          <div className="sticky top-0 z-40 flex items-center gap-3 border-b border-slate-200 bg-white px-3 py-3 md:hidden">
            <button
              aria-label={t("layout.app.openMenu")}
              onClick={() => setIsMobileNavOpen(true)}
              className="grid size-9 place-items-center rounded-md hover:bg-slate-100 active:bg-slate-200"
            >
              <MenuIcon className="size-5 text-slate-700" />
            </button>
            <span className="text-sm font-semibold text-slate-800">
              {t("layout.app.menuLabel")}
            </span>
          </div>

          <MobileSidebar
            open={isMobileNavOpen}
            onClose={() => setIsMobileNavOpen(false)}
          />
        </>
      )}

      <main className="w-full px-0">
        <Outlet />
      </main>
    </div>
  );
}
