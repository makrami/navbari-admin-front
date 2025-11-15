import { NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useRTL } from "../shared/hooks/useRTL";

// Figma-exported assets (from the currently selected node)
import imgLogo from "../assets/images/truck.svg";

import {
  LayoutGridIcon,
  TruckIcon,
  BoxesIcon,
  UsersIcon,
  DollarSignIcon,
  MessageSquareDot,
  SettingsIcon,
  LogOutIcon,
  UserIcon,
} from "lucide-react";
import { ActiveIndicator } from "../shared/components";
import { logout } from "../services/auth.service";
import { LanguageSelector } from "../components/Ui/LanguageSelector";
import { useCurrentUser } from "../services/user/hooks";

export function Sidebar() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isRTL = useRTL();
  const {
    data: user,
    isLoading: isLoadingUser,
    error: userError,
  } = useCurrentUser();

  // Debug: Log user data to console
  if (user) {
    console.log("User data in Sidebar:", user);
    console.log("fullName:", user.fullName);
    console.log("email:", user.email);
  }
  if (userError) {
    console.error("Error fetching user:", userError);
  }

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <aside
      className={`fixed top-0 hidden h-screen w-48 shrink-0 bg-white md:block ${
        isRTL
          ? "right-0 border-l border-slate-200"
          : "left-0 border-r border-slate-200"
      }`}
    >
      <div className="flex h-full flex-col items-center gap-4 px-0 py-7">
        {/* Brand icon */}
        <div className="grid size-16 place-items-center rounded-2xl bg-[#1b54fe]">
          <img src={imgLogo} alt={t("sidebar.brandAlt")} className="h-9 w-9" />
        </div>

        {/* Nav items */}
        <nav className="flex w-full flex-1 flex-col items-center  gap-1 pt-12">
          {/* Overview */}
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `relative flex h-12 w-full items-center px-5 ${
                isActive ? "" : ""
              }`
            }
          >
            {({ isActive }) => (
              <div className="flex items-center gap-2">
                <ActiveIndicator isActive={isActive} />
                <LayoutGridIcon
                  className={`size-5 ${
                    isActive ? "text-[#1B54FE]" : "text-slate-400"
                  }`}
                />
                <span
                  className={`text-xs font-medium uppercase tracking-wide ${
                    isActive ? "text-[#1B54FE]" : "text-slate-400"
                  }`}
                >
                  {t("sidebar.links.dashboard")}
                </span>
              </div>
            )}
          </NavLink>

          {/* Active indicator + Truck */}
          <NavLink
            to="/shipments"
            className={({ isActive }) =>
              `relative flex h-12 w-full items-center px-5 ${
                isActive ? "" : ""
              }`
            }
          >
            {({ isActive }) => (
              <div className="flex items-center gap-2">
                <ActiveIndicator isActive={isActive} />
                <TruckIcon
                  className={`size-5 ${
                    isActive ? "text-[#1B54FE]" : "text-slate-400"
                  }`}
                />
                <span
                  className={`text-xs font-medium uppercase tracking-wide ${
                    isActive ? "text-[#1B54FE]" : "text-slate-400"
                  }`}
                >
                  {t("sidebar.links.shipment")}
                </span>
              </div>
            )}
          </NavLink>

          {/* Gear */}
          <NavLink
            to="/local-companies"
            className={({ isActive }) =>
              `relative flex h-12 w-full items-center px-5 ${
                isActive ? "" : ""
              }`
            }
          >
            {({ isActive }) => (
              <div className="flex items-center gap-2">
                <ActiveIndicator isActive={isActive} />
                <BoxesIcon
                  className={`size-5 ${
                    isActive ? "text-[#1B54FE]" : "text-slate-400"
                  }`}
                />
                <span
                  className={`text-xs font-medium uppercase tracking-wide ${
                    isActive ? "text-[#1B54FE]" : "text-slate-400"
                  }`}
                >
                  {t("sidebar.links.localCompanies")}
                </span>
              </div>
            )}
          </NavLink>

          {/* Drivers */}
          <NavLink
            to="/drivers"
            className={({ isActive }) =>
              `relative flex h-12 w-full items-center px-5 ${
                isActive ? "" : ""
              }`
            }
          >
            {({ isActive }) => (
              <div className="flex items-center gap-2">
                <ActiveIndicator isActive={isActive} />
                <UsersIcon
                  className={`size-5 ${
                    isActive ? "text-[#1B54FE]" : "text-slate-400"
                  }`}
                />
                <span
                  className={`text-xs font-medium uppercase tracking-wide ${
                    isActive ? "text-[#1B54FE]" : "text-slate-400"
                  }`}
                >
                  {t("sidebar.links.drivers")}
                </span>
              </div>
            )}
          </NavLink>

          {/* Dollar */}
          <NavLink
            to="/finance"
            className={({ isActive }) =>
              `relative flex h-12 w-full items-center px-5 ${
                isActive ? "" : ""
              }`
            }
          >
            {({ isActive }) => (
              <div className="flex items-center gap-2">
                <ActiveIndicator isActive={isActive} />
                <DollarSignIcon
                  className={`size-5 ${
                    isActive ? "text-[#1B54FE]" : "text-slate-400"
                  }`}
                />
                <span
                  className={`text-sm font-medium uppercase tracking-wide ${
                    isActive ? "text-[#1B54FE]" : "text-slate-400"
                  }`}
                >
                  {t("sidebar.links.finance")}
                </span>
              </div>
            )}
          </NavLink>

          {/* Chat & Alert */}
          <NavLink
            to="/chat-alert"
            className={({ isActive }) =>
              `relative flex h-12 w-full items-center px-5 ${
                isActive ? "" : ""
              }`
            }
          >
            {({ isActive }) => (
              <div className="flex items-center gap-2">
                <ActiveIndicator isActive={isActive} />
                <MessageSquareDot
                  className={`size-5 ${
                    isActive ? "text-[#1B54FE]" : "text-slate-400"
                  }`}
                />
                <span
                  className={`text-xs font-medium uppercase tracking-wide ${
                    isActive ? "text-[#1B54FE]" : "text-slate-400"
                  }`}
                >
                  {t("sidebar.links.chatAlert")}
                </span>
              </div>
            )}
          </NavLink>

          {/* Settings */}
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `relative flex h-12 w-full items-center px-5 ${
                isActive ? "" : ""
              }`
            }
          >
            {({ isActive }) => (
              <div className="flex items-center gap-2">
                <ActiveIndicator isActive={isActive} />
                <SettingsIcon
                  className={`size-5 ${
                    isActive ? "text-[#1B54FE]" : "text-slate-400"
                  }`}
                />
                <span
                  className={`text-xs font-medium uppercase tracking-wide ${
                    isActive ? "text-[#1B54FE]" : "text-slate-400"
                  }`}
                >
                  {t("sidebar.links.settings")}
                </span>
              </div>
            )}
          </NavLink>

          {/* Spacer to push bottom actions */}
          <div className="flex-1" />

          {/* Profile Section */}
          <div className="w-full space-y-2 border-t border-slate-200 pt-4">
            {/* Profile Info */}
            <div className="flex w-full items-center gap-3 px-5">
              <div className="grid size-8 place-items-center rounded-full bg-slate-100 ring-2 ring-slate-200">
                <UserIcon className="size-4 text-slate-600" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="block text-xs font-semibold uppercase tracking-wide text-slate-700 truncate">
                  {isLoadingUser
                    ? t("common.loading") || "Loading..."
                    : user
                    ? String(user.fullName || user.email)
                    : ""}
                </span>
                <LanguageSelector />
              </div>
            </div>

            {/* Logout */}
            <button
              className="flex h-12 w-full items-center gap-2 px-5 text-slate-400 transition-colors hover:text-red-500"
              onClick={handleLogout}
              title={t("sidebar.logout")}
            >
              <LogOutIcon className="size-5" />
              <span className="text-xs font-medium uppercase tracking-wide">
                {t("sidebar.logout")}
              </span>
            </button>
          </div>
        </nav>
      </div>
    </aside>
  );
}
