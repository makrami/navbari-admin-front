import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";

export function AppLayout() {
  const location = useLocation();
  const isAuthRoute =
    location.pathname === "/login" || location.pathname === "/sign-up";
  return (
    <div
      className={`min-h-screen bg-slate-100 text-slate-900 ${
        !isAuthRoute ? "md:pl-24" : ""
      }`}
    >
      {!isAuthRoute && <Sidebar />}
      <main className="w-full px-0">
        <Outlet />
      </main>
    </div>
  );
}
