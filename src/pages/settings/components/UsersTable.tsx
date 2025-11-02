import { useTranslation } from "react-i18next";
import { Edit, X } from "lucide-react";
import type { User } from "./RoleDetailsPanel";

type UsersTableProps = {
  users: User[];
  onUserEdit: (userId: string) => void;
  onUserRemove: (userId: string) => void;
};

export function UsersTable({
  users,
  onUserEdit,
  onUserRemove,
}: UsersTableProps) {
  const { t } = useTranslation();

  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-900 mb-4">
        {t("settings.sections.rolesPermissions.users")}
      </h3>
      <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">
                {t("settings.sections.rolesPermissions.nameEmail")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">
                {t("settings.sections.rolesPermissions.status")}
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700">
                {t("settings.sections.rolesPermissions.actions")}
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50"
              >
                <td className="px-4 py-3">
                  <div>
                    <div className="text-sm font-medium text-slate-900">
                      {user.name}
                    </div>
                    <div className="text-xs text-slate-500">{user.email}</div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      user.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {user.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onUserEdit(user.id)}
                      className="p-1 hover:bg-slate-100 rounded transition-colors"
                    >
                      <Edit className="size-4 text-slate-400" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onUserRemove(user.id)}
                      className="p-1 hover:bg-red-50 rounded transition-colors"
                    >
                      <X className="size-4 text-red-500" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
