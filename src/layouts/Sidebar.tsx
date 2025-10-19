import { NavLink } from "react-router-dom";

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
} from "lucide-react";
import { ActiveIndicator } from "../shared/components";

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 hidden h-screen w-24 shrink-0 border-r border-slate-200 bg-white md:block">
      <div className="flex h-full flex-col items-center gap-4 px-0 py-7">
        {/* Brand icon */}
        <div className="grid size-16 place-items-center rounded-2xl bg-[#1b54fe]">
          <img src={imgLogo} alt="Brand" className="h-9 w-9" />
        </div>

        {/* Nav icons */}
        <nav className="flex w-full flex-1 flex-col items-center gap-4 pt-12">
          {/* Overview */}
          <NavLink
            to="/overview"
            className={({ isActive }) =>
              `relative grid h-12 w-full place-items-center ${
                isActive ? "" : ""
              }`
            }
          >
            {({ isActive }) => (
              <>
                <ActiveIndicator isActive={isActive} />
                <LayoutGridIcon
                  className={`h-6 w-6 ${
                    isActive ? "text-[#1B54FE]" : "text-slate-400"
                  }`}
                />
              </>
            )}
          </NavLink>

          {/* Active indicator + Truck */}
          <NavLink
            to="/shipments"
            className={({ isActive }) =>
              `relative grid h-12 w-full place-items-center ${
                isActive ? "" : ""
              }`
            }
          >
            {({ isActive }) => (
              <>
                <ActiveIndicator isActive={isActive} />
                <TruckIcon
                  className={`h-6 w-6 ${
                    isActive ? "text-[#1B54FE]" : "text-slate-400"
                  }`}
                />
              </>
            )}
          </NavLink>

          {/* Gear */}
          <NavLink
            to="/local-companies"
            className={({ isActive }) =>
              `relative grid h-12 w-full place-items-center ${
                isActive ? "" : ""
              }`
            }
          >
            {({ isActive }) => (
              <>
                <ActiveIndicator isActive={isActive} />
                <BoxesIcon
                  className={`h-6 w-6 ${
                    isActive ? "text-[#1B54FE]" : "text-slate-400"
                  }`}
                />
              </>
            )}
          </NavLink>

          {/* Drivers */}
          <NavLink
            to="/drivers"
            className={({ isActive }) =>
              `relative grid h-12 w-full place-items-center ${
                isActive ? "" : ""
              }`
            }
          >
            {({ isActive }) => (
              <>
                <ActiveIndicator isActive={isActive} />
                <UsersIcon
                  className={`h-6 w-6 ${
                    isActive ? "text-[#1B54FE]" : "text-slate-400"
                  }`}
                />
              </>
            )}
          </NavLink>

          {/* Dollar */}
          <NavLink
            to="/finance"
            className={({ isActive }) =>
              `relative grid h-12 w-full place-items-center ${
                isActive ? "" : ""
              }`
            }
          >
            {({ isActive }) => (
              <>
                <ActiveIndicator isActive={isActive} />
                <DollarSignIcon
                  className={`h-6 w-6 ${
                    isActive ? "text-[#1B54FE]" : "text-slate-400"
                  }`}
                />
              </>
            )}
          </NavLink>

          {/* Spacer to push bottom actions */}
          <div className="flex-1" />

          {/* Avatar */}
          <div className="grid h-12 w-full place-items-center">
            <img
              src={imgAvatar}
              alt="Profile"
              className="size-9 rounded-full object-cover"
            />
          </div>

          {/* Bell */}
          <div className="grid h-12 w-full place-items-center">
            <BellIcon className="h-6 w-6 text-slate-400" />
          </div>
        </nav>
      </div>
    </aside>
  );
}
