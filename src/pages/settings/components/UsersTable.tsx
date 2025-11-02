import { useTranslation } from "react-i18next";
import { ChevronDown, PenLineIcon, X } from "lucide-react";
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
      <h3 className="text-xs text-slate-900 mb-4">
        {t("settings.sections.rolesPermissions.users")}
      </h3>
      <div className=" rounded-lg overflow-hidden bg-white">
        <table className="w-full">
          <thead className="bg-slate-200 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">
                {t("settings.sections.rolesPermissions.nameEmail")}
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700">
                {t("settings.sections.rolesPermissions.status")}
              </th>
              <th className="px-4 py-3  text-xs font-semibold text-slate-700">
                {t("settings.sections.rolesPermissions.actions")}
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-b bg-slate-100 border-slate-200 last:border-b-0 hover:bg-slate-200"
              >
                <td className="px-4 py-3">
                  <div>
                    <div className="text-xs font-semibold text-slate-900">
                      {user.name}
                    </div>
                    <div className="text-xs text-slate-400">{user.email}</div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs max-w-25 mx-auto border font-bold border-slate-200 bg-white px-2 py-1 flex items-center gap-1 justify-between rounded-md ${
                      user.status === "Active"
                        ? " text-green-500"
                        : " text-yellow-500"
                    }`}
                  >
                    {user.status}
                    <ChevronDown className="size-4 text-slate-400" />
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => onUserEdit(user.id)}
                      className="p-1 bg-white border border-slate-200 rounded-lg hover:bg-slate-100  transition-colors"
                    >
                      <PenLineIcon className="size-4 text-slate-400" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onUserRemove(user.id)}
                      className="p-1 bg-red-100 border border-red-200 hover:bg-red-200  rounded-lg transition-colors"
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
