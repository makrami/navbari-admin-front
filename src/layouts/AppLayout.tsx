import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";

export function AppLayout() {
  const location = useLocation();
  const isAuthRoute =
    location.pathname === "/login" || location.pathname === "/sign-up";
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex">
      {!isAuthRoute && <Sidebar />}
      <main
        className={`${
          !isAuthRoute ? "md:ml-16 " : ""
        }w-full px-4 sm:px-6 lg:px-8 `}
      >
        <Outlet />
      </main>
    </div>
  );
}
