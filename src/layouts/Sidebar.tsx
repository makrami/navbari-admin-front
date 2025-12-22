import {NavLink, useNavigate} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {useRTL} from "../shared/hooks/useRTL";

// Figma-exported assets (from the currently selected node)
import imgLogo from "../assets/wintime-logo.png";

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
import {ActiveIndicator} from "../shared/components";
import {logout} from "../services/auth.service";
import {LanguageSelector} from "../components/Ui/LanguageSelector";
import {useCurrentUser} from "../services/user/hooks";
import {getFileUrl} from "../pages/Drivers/utils";
import {useUnreadChatCount} from "../services/chat/hooks";
import {useDashboardSummary} from "../services/dashboard/hooks";
import {useChatSocket} from "../services/chat/socket";

export function Sidebar() {
  const navigate = useNavigate();
  const {t} = useTranslation();
  const isRTL = useRTL();
  const {data: user, isLoading: isLoadingUser} = useCurrentUser();
  const {data: unreadCountData} = useUnreadChatCount();
  const unreadCount = unreadCountData?.count ?? 0;
  const {data: dashboardSummary} = useDashboardSummary();

  // Initialize socket connection to receive real-time message updates
  useChatSocket();

  // Get counts for awaiting registrations
  const awaitingCompaniesCount =
    dashboardSummary?.companiesWaitingForApprovalCount ?? 0;
  const awaitingDriversCount =
    dashboardSummary?.driversWaitingForApprovalCount ?? 0;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // Get avatar URL from user data
  const userRecord = user as Record<string, unknown> | undefined;
  const avatarUrl =
    (userRecord?.avatarUrl as string | null | undefined) || null;
  const fullAvatarUrl = avatarUrl ? getFileUrl(avatarUrl) || null : null;

  // Get user display name (firstName + lastName or email)
  const firstName = userRecord?.firstName as string | undefined;
  const lastName = userRecord?.lastName as string | undefined;
  const userDisplayName =
    firstName || lastName
      ? [firstName, lastName].filter(Boolean).join(" ").trim()
      : user?.email || "";

  // Get permissions array from user data
  const permissions = (userRecord?.permissions as string[] | undefined) || [];

  // Helper function to check if user has a specific permission
  const hasPermission = (permission: string) => {
    return permissions.includes(permission);
  };

  return (
    <aside
      className={`fixed top-0 hidden h-screen w-48 shrink-0 bg-white md:block ${
        isRTL
          ? "right-0 border-l border-slate-200"
          : "left-0 border-r border-slate-200"
      }`}
    >
      <div className="flex h-full flex-col items-center gap-4 px-0 py-12">
        {/* Brand icon */}
        <div className="grid  size-42 place-items-center rounded-2xl mt-10">
          <img src={imgLogo} alt={t("sidebar.brandAlt")} className="w-32" />
        </div>

        {/* Nav items */}
        <nav className="flex w-full flex-1 flex-col items-center  gap-1 pt-12">
          {/* Overview */}
          <NavLink
            to="/dashboard"
            className={({isActive}) =>
              `relative flex h-12 w-full items-center px-5 ${
                isActive ? "" : ""
              }`
            }
          >
            {({isActive}) => (
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
          {(hasPermission("shipments:read") ||
            hasPermission("segments:read")) && (
            <NavLink
              to={hasPermission("shipments:read") ? "/shipments" : "/segments"}
              className={({isActive}) =>
                `relative flex h-12 w-full items-center px-5 ${
                  isActive ? "" : ""
                }`
              }
            >
              {({isActive}) => (
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
          )}

          {/* Gear */}
          {hasPermission("companies:read") && (
            <NavLink
              to="/local-companies"
              className={({isActive}) =>
                `relative flex h-12 w-full items-center px-5 ${
                  isActive ? "" : ""
                }`
              }
            >
              {({isActive}) => (
                <>
                  <ActiveIndicator isActive={isActive} />
                  <div className="flex items-center gap-2 relative">
                    <div className="relative">
                      <BoxesIcon
                        className={`size-5 ${
                          isActive ? "text-[#1B54FE]" : "text-slate-400"
                        }`}
                      />
                      {awaitingCompaniesCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white">
                          {awaitingCompaniesCount > 99
                            ? "99+"
                            : awaitingCompaniesCount}
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-xs font-medium uppercase tracking-wide ${
                        isActive ? "text-[#1B54FE]" : "text-slate-400"
                      }`}
                    >
                      {t("sidebar.links.localCompanies")}
                    </span>
                  </div>
                </>
              )}
            </NavLink>
          )}

          {/* Drivers */}
          {hasPermission("drivers:read") && (
            <NavLink
              to="/drivers"
              className={({isActive}) =>
                `relative flex h-12 w-full items-center px-5 ${
                  isActive ? "" : ""
                }`
              }
            >
              {({isActive}) => (
                <>
                  <ActiveIndicator isActive={isActive} />

                  <div className="flex items-center gap-2 relative">
                    <div className="relative">
                      <UsersIcon
                        className={`size-5 ${
                          isActive ? "text-[#1B54FE]" : "text-slate-400"
                        }`}
                      />
                      {awaitingDriversCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white">
                          {awaitingDriversCount > 99
                            ? "99+"
                            : awaitingDriversCount}
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-xs font-medium uppercase tracking-wide ${
                        isActive ? "text-[#1B54FE]" : "text-slate-400"
                      }`}
                    >
                      {t("sidebar.links.drivers")}
                    </span>
                  </div>
                </>
              )}
            </NavLink>
          )}

          {/* Dollar */}
          {hasPermission("finance:read") && (
            <NavLink
              to="/finance"
              className={({isActive}) =>
                `relative flex h-12 w-full items-center px-5 ${
                  isActive ? "" : ""
                }`
              }
            >
              {({isActive}) => (
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
          )}

          {/* Chat & Alert */}
          {hasPermission("chats:read") && (
            <NavLink
              to="/chat-alert"
              className={({isActive}) =>
                `relative flex h-12 w-full items-center px-5 ${
                  isActive ? "" : ""
                }`
              }
            >
              {({isActive}) => (
                <>
                  <ActiveIndicator isActive={isActive} />
                  <div className="flex items-center gap-2 relative">
                    <div className="relative">
                      <MessageSquareDot
                        className={`size-5 ${
                          isActive ? "text-[#1B54FE]" : "text-slate-400"
                        }`}
                      />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white">
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-xs font-medium uppercase tracking-wide ${
                        isActive ? "text-[#1B54FE]" : "text-slate-400"
                      }`}
                    >
                      {t("sidebar.links.chatAlert")}
                    </span>
                  </div>
                </>
              )}
            </NavLink>
          )}

          {/* Settings */}
          {hasPermission("settings:read") && (
            <NavLink
              to="/settings"
              className={({isActive}) =>
                `relative flex h-12 w-full items-center px-5 ${
                  isActive ? "" : ""
                }`
              }
            >
              {({isActive}) => (
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
          )}

          {/* Spacer to push bottom actions */}
          <div className="flex-1" />

          {/* Profile Section */}
          <div className="w-full space-y-2 border-t border-slate-200 pt-4">
            {/* Profile Info */}
            <div className="flex w-full items-center gap-3 px-5">
              {fullAvatarUrl ? (
                <img
                  src={fullAvatarUrl}
                  alt={user?.fullName || user?.email || "User"}
                  className="size-8 rounded-full object-cover ring-2 ring-slate-200"
                />
              ) : (
                <div className="grid size-8 place-items-center rounded-full bg-slate-100 ring-2 ring-slate-200">
                  <UserIcon className="size-4 text-slate-600" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <span
                  onClick={() => navigate("/profile")}
                  className="block text-xs font-semibold uppercase tracking-wide text-slate-700 truncate cursor-pointer hover:text-[#1B54FE] transition-colors"
                >
                  {isLoadingUser
                    ? t("common.loading") || "Loading..."
                    : userDisplayName}
                </span>
                <LanguageSelector openUp={true} />
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
