import {useState, useRef, useEffect} from "react";
import {useTranslation} from "react-i18next";
import {ChevronDown, MoreVertical} from "lucide-react";
import type {Role} from "./RolesListPanel";
import {UsersTable} from "./UsersTable";

export type Permission = {
  module: string;
  view: boolean;
  createEdit: boolean;
  delete: boolean;
  approve: boolean;
};

// Import User type from RolesListPanel to keep them in sync
import type {User} from "./RolesListPanel";

// Re-export for backward compatibility
export type {User};

type RoleDetailsPanelProps = {
  role: Role | null;
  permissions: Permission[];
  users: User[];
  onRoleUpdate: (role: Partial<Role>) => void;
  onPermissionsChange: (permissions: Permission[]) => void;
  onUserAdd: () => void;
  onUserEdit: (userId: string) => void;
  onUserRemove: (userId: string) => void;
  onUserStatusChange: (userId: string, isActive: boolean) => void;
};

export function RoleDetailsPanel({
  role,
  users,
  onRoleUpdate,
  onUserAdd,
  onUserEdit,
  onUserRemove,
  onUserStatusChange,
}: RoleDetailsPanelProps) {
  const {t} = useTranslation();

  if (!role) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-400">
        {t("settings.sections.rolesPermissions.selectRole")}
      </div>
    );
  }

  return (
    <div className="flex-1 pl-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-sm font-bold text-slate-900">
            {t("settings.sections.rolesPermissions.roleDetails")}:{" "}
            <span className="font-normal">
              {" "}
              {role.name} ({role.userCount}{" "}
              {t("settings.sections.rolesPermissions.user")})
            </span>
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="p-1 hover:bg-slate-100 rounded transition-colors"
          >
            <MoreVertical className="size-4 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Role Form Fields */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-xs  text-slate-900 mb-2">
            {t("settings.sections.rolesPermissions.roleName")}
          </label>
          <input
            type="text"
            value={role.name}
            onChange={(e) => onRoleUpdate({name: e.target.value})}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B54FE] focus:border-transparent bg-white text-slate-900"
          />
        </div>

        <div>
          <label className="block text-xs  text-slate-900 mb-2">
            {t("settings.sections.rolesPermissions.roleDescription")}
          </label>
          <input
            type="text"
            value={role.description}
            onChange={(e) => onRoleUpdate({description: e.target.value})}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B54FE] focus:border-transparent bg-white text-slate-900"
          />
        </div>
        {/* <div>
          <label className="block text-xs text-slate-900 mb-2">
            {t("settings.sections.rolesPermissions.geographicalAccess")}
          </label>
          <DropdownField
            label=""
            value={role.geographicalAccess || "All Countries"}
            options={["All Countries", "Selected Countries"]}
            onChange={(value) =>
              onRoleUpdate({
                geographicalAccess: value as
                  | "All Countries"
                  | "Selected Countries",
              })
            }
          />
        </div> */}
      </div>

      {/* Users Table */}
      <UsersTable
        users={users}
        onUserAdd={() => onUserAdd()}
        onUserEdit={onUserEdit}
        onUserRemove={onUserRemove}
        onUserStatusChange={onUserStatusChange}
      />
    </div>
  );
}

type DropdownFieldProps = {
  label?: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
};

function DropdownField({label, value, options, onChange}: DropdownFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div>
      {label && (
        <label className="block text-xs text-slate-900 mb-2">{label}</label>
      )}
      <div ref={dropdownRef} className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B54FE] focus:border-transparent bg-white text-slate-900 flex items-center justify-between"
        >
          <span>{value}</span>
          <ChevronDown
            className={`size-4 text-slate-400 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10">
            {options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-50 first:rounded-t-lg last:rounded-b-lg ${
                  value === option ? "bg-slate-100 font-medium" : ""
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
