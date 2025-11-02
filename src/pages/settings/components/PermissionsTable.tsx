import { useTranslation } from "react-i18next";
import type { Permission } from "./RoleDetailsPanel";

type PermissionsTableProps = {
  permissions: Permission[];
  onPermissionsChange: (permissions: Permission[]) => void;
};

export function PermissionsTable({
  permissions,
  onPermissionsChange,
}: PermissionsTableProps) {
  const { t } = useTranslation();

  const handlePermissionToggle = (
    module: string,
    permissionType: keyof Omit<Permission, "module">
  ) => {
    const updated = permissions.map((perm) =>
      perm.module === module
        ? { ...perm, [permissionType]: !perm[permissionType] }
        : perm
    );
    onPermissionsChange(updated);
  };

  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-900 mb-4">
        {t("settings.sections.rolesPermissions.permissions")}
      </h3>
      <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">
                {t("settings.sections.rolesPermissions.modules")}
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700">
                {t("settings.sections.rolesPermissions.view")}
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700">
                {t("settings.sections.rolesPermissions.createEdit")}
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700">
                {t("settings.sections.rolesPermissions.delete")}
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700">
                {t("settings.sections.rolesPermissions.approve")}
              </th>
            </tr>
          </thead>
          <tbody>
            {permissions.map((perm) => (
              <tr
                key={perm.module}
                className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50"
              >
                <td className="px-4 py-3 text-sm text-slate-900">
                  {perm.module}
                </td>
                <td className="px-4 py-3 text-center">
                  <PermissionCheckbox
                    checked={perm.view}
                    onChange={() => handlePermissionToggle(perm.module, "view")}
                  />
                </td>
                <td className="px-4 py-3 text-center">
                  <PermissionCheckbox
                    checked={perm.createEdit}
                    onChange={() =>
                      handlePermissionToggle(perm.module, "createEdit")
                    }
                  />
                </td>
                <td className="px-4 py-3 text-center">
                  <PermissionCheckbox
                    checked={perm.delete}
                    onChange={() =>
                      handlePermissionToggle(perm.module, "delete")
                    }
                  />
                </td>
                <td className="px-4 py-3 text-center">
                  <PermissionCheckbox
                    checked={perm.approve}
                    onChange={() =>
                      handlePermissionToggle(perm.module, "approve")
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

type PermissionCheckboxProps = {
  checked: boolean;
  onChange: () => void;
};

function PermissionCheckbox({ checked, onChange }: PermissionCheckboxProps) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`size-4 rounded border-2 transition-colors flex items-center justify-center ${
        checked ? "bg-[#1B54FE] border-[#1B54FE]" : "bg-white border-slate-300"
      }`}
    >
      {checked && (
        <svg
          className="size-2.5 text-white"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M5 13l4 4L19 7" />
        </svg>
      )}
    </button>
  );
}
