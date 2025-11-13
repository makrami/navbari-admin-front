import { NavLink, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import imgLogo from "../assets/images/truck.svg";
import imgAvatar from "../assets/images/avatar.png";

import {
  LayoutGridIcon,
  TruckIcon,
  BoxesIcon,
  UsersIcon,
  DollarSignIcon,
  BellIcon,
  LogOutIcon,
  XIcon,
} from "lucide-react";
import { ActiveIndicator } from "../shared/components";
import { logout } from "../services/auth.service";

type MobileSidebarProps = {
  open: boolean;
  onClose: () => void;
};

export function MobileSidebar({ open, onClose }: MobileSidebarProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const handleLogout = async () => {
    await logout();
    onClose();
    navigate("/login");
  };

  return (
    <div
      className={`fixed inset-0 z-50 md:hidden ${
        open ? "" : "pointer-events-none"
      }`}
    >
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
        aria-hidden
      />
      <aside
        className={`absolute left-0 top-0 h-full w-72 max-w-[85%] bg-white shadow-xl transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label={t("sidebar.mobile.navLabel")}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-xl bg-[#1b54fe]">
                <img
                  src={imgLogo}
                  alt={t("sidebar.brandAlt")}
                  className="h-6 w-6"
                />
              </div>
              <span className="text-sm font-semibold text-slate-800">
                {t("sidebar.mobile.brand")}
              </span>
            </div>
            <button
              aria-label={t("sidebar.mobile.closeMenu")}
              onClick={onClose}
              className="grid size-9 place-items-center rounded-md hover:bg-slate-100 active:bg-slate-200"
            >
              <XIcon className="size-5 text-slate-600" />
            </button>
          </div>

          <nav className="flex w-full flex-1 flex-col gap-1 overflow-y-auto px-2 py-4">
            <NavLink
              to="/dashboard"
              onClick={onClose}
              className={({ isActive }) =>
                `relative flex h-12 w-full items-center rounded-md px-4 ${
                  isActive ? "bg-slate-50" : ""
                }`
              }
            >
              {({ isActive }) => (
                <div className="flex items-center gap-3">
                  <ActiveIndicator isActive={isActive} />
                  <LayoutGridIcon
                    className={`size-5 ${
                      isActive ? "text-[#1B54FE]" : "text-slate-400"
                    }`}
                  />
                  <span
                    className={`text-sm font-medium ${
                      isActive ? "text-[#1B54FE]" : "text-slate-600"
                    }`}
                  >
                    {t("sidebar.links.dashboard")}
                  </span>
                </div>
              )}
            </NavLink>

            <NavLink
              to="/shipments"
              onClick={onClose}
              className={({ isActive }) =>
                `relative flex h-12 w-full items-center rounded-md px-4 ${
                  isActive ? "bg-slate-50" : ""
                }`
              }
            >
              {({ isActive }) => (
                <div className="flex items-center gap-3">
                  <ActiveIndicator isActive={isActive} />
                  <TruckIcon
                    className={`size-5 ${
                      isActive ? "text-[#1B54FE]" : "text-slate-400"
                    }`}
                  />
                  <span
                    className={`text-sm font-medium ${
                      isActive ? "text-[#1B54FE]" : "text-slate-600"
                    }`}
                  >
                    {t("sidebar.links.shipment")}
                  </span>
                </div>
              )}
            </NavLink>

            <NavLink
              to="/local-companies"
              onClick={onClose}
              className={({ isActive }) =>
                `relative flex h-12 w-full items-center rounded-md px-4 ${
                  isActive ? "bg-slate-50" : ""
                }`
              }
            >
              {({ isActive }) => (
                <div className="flex items-center gap-3">
                  <ActiveIndicator isActive={isActive} />
                  <BoxesIcon
                    className={`size-5 ${
                      isActive ? "text-[#1B54FE]" : "text-slate-400"
                    }`}
                  />
                  <span
                    className={`text-sm font-medium ${
                      isActive ? "text-[#1B54FE]" : "text-slate-600"
                    }`}
                  >
                    {t("sidebar.links.localCompanies")}
                  </span>
                </div>
              )}
            </NavLink>

            <NavLink
              to="/drivers"
              onClick={onClose}
              className={({ isActive }) =>
                `relative flex h-12 w-full items-center rounded-md px-4 ${
                  isActive ? "bg-slate-50" : ""
                }`
              }
            >
              {({ isActive }) => (
                <div className="flex items-center gap-3">
                  <ActiveIndicator isActive={isActive} />
                  <UsersIcon
                    className={`size-5 ${
                      isActive ? "text-[#1B54FE]" : "text-slate-400"
                    }`}
                  />
                  <span
                    className={`text-sm font-medium ${
                      isActive ? "text-[#1B54FE]" : "text-slate-600"
                    }`}
                  >
                    {t("sidebar.links.drivers")}
                  </span>
                </div>
              )}
            </NavLink>

            <NavLink
              to="/finance"
              onClick={onClose}
              className={({ isActive }) =>
                `relative flex h-12 w-full items-center rounded-md px-4 ${
                  isActive ? "bg-slate-50" : ""
                }`
              }
            >
              {({ isActive }) => (
                <div className="flex items-center gap-3">
                  <ActiveIndicator isActive={isActive} />
                  <DollarSignIcon
                    className={`size-5 ${
                      isActive ? "text-[#1B54FE]" : "text-slate-400"
                    }`}
                  />
                  <span
                    className={`text-sm font-medium ${
                      isActive ? "text-[#1B54FE]" : "text-slate-600"
                    }`}
                  >
                    {t("sidebar.links.finance")}
                  </span>
                </div>
              )}
            </NavLink>

            <div className="mt-4 h-px w-full bg-slate-200" />

            <div className="flex items-center gap-3 px-4 py-3">
              <img
                src={imgAvatar}
                alt={t("sidebar.profileAlt")}
                className="size-8 rounded-full object-cover"
              />
              <span className="text-sm font-medium text-slate-700">
                {t("sidebar.profileName")}
              </span>
            </div>

            <div className="flex items-center gap-2 px-4 py-3">
              <BellIcon className="size-5 text-slate-400" />
              <span className="text-sm font-medium text-slate-500">
                {t("sidebar.notifications")}
              </span>
            </div>

            <button
              className="mx-2 mt-auto mb-2 flex h-11 items-center justify-center gap-2 rounded-md bg-red-50 text-red-600 hover:bg-red-100"
              onClick={handleLogout}
              title={t("sidebar.logout")}
            >
              <LogOutIcon className="size-5" />
              <span className="text-sm font-semibold">
                {t("sidebar.logout")}
              </span>
            </button>
          </nav>
        </div>
      </aside>
    </div>
  );
}
