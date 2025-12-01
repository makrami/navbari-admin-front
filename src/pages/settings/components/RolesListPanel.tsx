import { MoreVertical } from "lucide-react";
import { useTranslation } from "react-i18next";

export type Role = {
  id: string;
  name: string;
  description: string;
  userCount: number; // Calculated from users.length
  users: User[]; // Users assigned to this role
  status: "Active" | "Suspended";
  geographicalAccess?: "All Countries" | "Selected Countries";
};

export type User = {
  id?: string; // May not be in API response
  email: string;
  phoneNumber?: string | null;
  country?: string | null;
  fullName?: string | null;
  name: string; // Mapped from fullName
  status: "Active" | "Suspended"; // Mapped from isActive
};

type RolesListPanelProps = {
  roles: Role[];
  selectedRoleId: string | null;
  onRoleSelect: (roleId: string) => void;
  onAddRole: () => void;
};

export function RolesListPanel({
  roles,
  selectedRoleId,
  onRoleSelect,
  isLoading,
  error,
}: RolesListPanelProps & {
  isLoading?: boolean;
  error?: Error | null;
}) {
  const { t } = useTranslation();

  // Show error first if there's an error
  if (error) {
    return (
      <div className="w-[40%] border-r border-slate-200 pr-4">
        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          <div className="p-4 text-sm text-red-600">
            {error instanceof Error
              ? error.message
              : t("settings.sections.rolesPermissions.failedToLoadRoles") ||
                "Failed to load roles"}
          </div>
        </div>
      </div>
    );
  }

  // Show loading only if we're loading AND have no roles to display yet
  if (isLoading && roles.length === 0) {
    return (
      <div className="w-[40%] border-r border-slate-200 pr-4">
        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          <div className="p-4 text-sm text-slate-500">
            {t("common.loading") || "Loading roles..."}
          </div>
        </div>
      </div>
    );
  }

  // Show empty state if we're not loading and have no roles
  if (!isLoading && roles.length === 0) {
    return (
      <div className="w-[40%] border-r border-slate-200 pr-4">
        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          <div className="p-4 text-sm text-slate-500">
            {t("settings.sections.rolesPermissions.noRoles") ||
              "No roles found"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[40%] border-r border-slate-200 pr-4">
      <div className="space-y-2 max-h-[600px] overflow-y-auto">
        {roles.map((role) => (
          <div
            key={role.id}
            onClick={() => onRoleSelect(role.id)}
            className={`p-4 rounded-lg  cursor-pointer transition-colors ${
              selectedRoleId === role.id
                ? "bg-blue-50 border-2 text-[#1B54FE] border-[#1B54FE]/10"
                : "bg-white border-2 border-transparent hover:border-slate-300"
            }`}
          >
            <div className="flex items-start ">
              <div className="flex-1 flex flex-col gap-2 justify-between">
                <div className="flex items-center justify-between gap-2">
                  <h3
                    className={`text-sm font-bold  mb-1 ${
                      selectedRoleId === role.id
                        ? "text-[#1B54FE]"
                        : "text-slate-900"
                    }`}
                  >
                    {role.name}{" "}
                    <span
                      className={`text-xs font-medium ${
                        selectedRoleId === role.id
                          ? "text-[#1B54FE]"
                          : " text-slate-900"
                      }`}
                    >
                      ({role.userCount}{" "}
                      {t("settings.sections.rolesPermissions.user")})
                    </span>
                  </h3>
                  {/* <span
                    className={`text-xs px-2 py-0.5 font-bold rounded-lg ${
                      role.status === "Active"
                        ? "bg-green-100  text-green-500"
                        : "bg-yellow-100 text-yellow-500"
                    }`}
                  >
                    {role.status}
                  </span> */}
                </div>
                <p className="text-sm text-slate-400 ">{role.description}</p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle menu click
                }}
                className="p-1 hover:bg-slate-100 rounded transition-colors"
              >
                <MoreVertical className="size-4 text-slate-400" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
