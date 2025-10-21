import { NavLink, useNavigate } from "react-router-dom";

// Figma-exported assets (from the currently selected node)
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
} from "lucide-react";
import { ActiveIndicator } from "../shared/components";
import { logout } from "../services/auth.service";

export function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="fixed left-0 top-0 hidden h-screen w-48 shrink-0 border-r border-slate-200 bg-white md:block">
      <div className="flex h-full flex-col items-center gap-4 px-0 py-7">
        {/* Brand icon */}
        <div className="grid size-16 place-items-center rounded-2xl bg-[#1b54fe]">
          <img src={imgLogo} alt="Brand" className="h-9 w-9" />
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
                  Dashboard
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
                  Shipment
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
                  Local Companies
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
                  Drivers
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
                  Finance
                </span>
              </div>
            )}
          </NavLink>

          {/* Spacer to push bottom actions */}
          <div className="flex-1" />

          {/* Avatar + name */}
          <div className="flex h-12 w-full items-center gap-3 px-5">
            <img
              src={imgAvatar}
              alt="Profile"
              className="size-7 rounded-full object-cover"
            />
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Xin Zhao
            </span>
          </div>

          {/* Notifs row */}
          <div className="flex h-12 w-full items-center gap-2 px-5">
            <BellIcon className="size-5 text-slate-400" />
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Notif
            </span>
          </div>

          {/* Logout */}
          <button
            className="flex h-12 w-full items-center gap-2 px-5 text-slate-400 hover:text-red-500"
            onClick={handleLogout}
            title="Logout"
          >
            <LogOutIcon className="size-5 " />
            <span className="text-xs font-medium uppercase tracking-wide ">
              Logout
            </span>
          </button>
        </nav>
      </div>
    </aside>
  );
}
