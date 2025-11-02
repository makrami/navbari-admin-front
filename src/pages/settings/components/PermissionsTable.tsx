import { useTranslation } from "react-i18next";
import type { Permission } from "./RoleDetailsPanel";
import { CheckCheck } from "lucide-react";

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
      <h3 className="text-xs  text-slate-900 mb-4">
        {t("settings.sections.rolesPermissions.permissions")}
      </h3>
      <div className=" rounded-lg overflow-hidden bg-white">
        <table className="w-full">
          <thead className="bg-slate-200 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">
                {t("settings.sections.rolesPermissions.modules")}
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700">
                <div className="flex items-center justify-center gap-2">
                  {t("settings.sections.rolesPermissions.view")}
                  <CheckCheck className="size-4 text-[#1B54FE]" />
                </div>
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700">
                <div className="flex items-center justify-center gap-2">
                  {t("settings.sections.rolesPermissions.createEdit")}
                  <CheckCheck className="size-4 text-[#1B54FE]" />
                </div>
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700">
                <div className="flex items-center justify-center gap-2">
                  {t("settings.sections.rolesPermissions.delete")}
                  <CheckCheck className="size-4 text-[#1B54FE]" />
                </div>
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700">
                <div className="flex items-center justify-center gap-2">
                  {t("settings.sections.rolesPermissions.approve")}
                  <CheckCheck className="size-4 text-[#1B54FE]" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="border border-slate-100">
            {permissions.map((perm) => (
              <tr
                key={perm.module}
                className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50"
              >
                <td className="px-4 py-3 text-sm text-slate-900">
                  {perm.module}
                </td>
                <td className=" text-center align-middle">
                  <button
                    type="button"
                    onClick={() => handlePermissionToggle(perm.module, "view")}
                    className="inline-flex items-center justify-center leading-none align-middle"
                  >
                    <div
                      className={`size-4 rounded border-2 transition-colors flex items-center justify-center ${
                        perm.view
                          ? "bg-white border-[#1B54FE] p-[1px]"
                          : "bg-white border-slate-300 p-[1px]"
                      }`}
                    >
                      {perm.view && (
                        <div className="w-full h-full bg-[#1B54FE] " />
                      )}
                    </div>
                  </button>
                </td>
                <td className="px-4 py-3 text-center align-middle">
                  <button
                    type="button"
                    onClick={() =>
                      handlePermissionToggle(perm.module, "createEdit")
                    }
                    className="inline-flex items-center justify-center leading-none align-middle"
                  >
                    <div
                      className={`size-4 rounded border-2 transition-colors flex items-center justify-center ${
                        perm.createEdit
                          ? "bg-white border-[#1B54FE] p-[1px]"
                          : "bg-white border-slate-300 p-[1px]"
                      }`}
                    >
                      {perm.createEdit && (
                        <div className="w-full h-full bg-[#1B54FE] " />
                      )}
                    </div>
                  </button>
                </td>
                <td className="px-4 py-3 text-center align-middle">
                  <button
                    type="button"
                    onClick={() =>
                      handlePermissionToggle(perm.module, "delete")
                    }
                    className="inline-flex items-center justify-center leading-none align-middle"
                  >
                    <div
                      className={`size-4 rounded border-2 transition-colors flex items-center justify-center ${
                        perm.delete
                          ? "bg-white border-[#1B54FE] p-[1px]"
                          : "bg-white border-slate-300 p-[1px]"
                      }`}
                    >
                      {perm.delete && (
                        <div className="w-full h-full bg-[#1B54FE] " />
                      )}
                    </div>
                  </button>
                </td>
                <td className="px-4 py-3 justify-center text-center align-middle">
                  <button
                    type="button"
                    onClick={() =>
                      handlePermissionToggle(perm.module, "approve")
                    }
                    className="inline-flex items-center justify-center leading-none align-middle"
                  >
                    <div
                      className={`size-4 rounded border-2 transition-colors flex items-center justify-center ${
                        perm.approve
                          ? "bg-white border-[#1B54FE] p-[1px]"
                          : "bg-white border-slate-300 p-[1px]"
                      }`}
                    >
                      {perm.approve && (
                        <div className="w-full h-full bg-[#1B54FE] " />
                      )}
                    </div>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
