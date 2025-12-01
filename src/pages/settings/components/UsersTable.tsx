import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import {
  ChevronDown,
  PenLineIcon,
  PlusIcon,
  X,
  AlertTriangleIcon,
} from "lucide-react";
import type { User } from "./RoleDetailsPanel";
import { useDeleteUser } from "../../../services/admin/hooks";

type UsersTableProps = {
  users: User[];
  onUserEdit: (userId: string) => void;
  onUserRemove: (userId: string) => void;
  onUserAdd: () => void;
  onUserStatusChange: (userId: string, isActive: boolean) => void;
};

export function UsersTable({
  users,
  onUserEdit,
  onUserRemove,
  onUserAdd,
  onUserStatusChange,
}: UsersTableProps) {
  const { t } = useTranslation();
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [deleteDialogUserId, setDeleteDialogUserId] = useState<string | null>(
    null
  );
  const dropdownRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const buttonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const dropdownPositionRef = useRef<{ top: number; left: number } | null>(
    null
  );
  const deleteUserMutation = useDeleteUser();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedOutsideDropdown = Array.from(
        dropdownRefs.current.values()
      ).every((ref) => ref && !ref.contains(target));
      const clickedOutsideButton = Array.from(
        buttonRefs.current.values()
      ).every((ref) => ref && !ref.contains(target));
      if (clickedOutsideDropdown && clickedOutsideButton) {
        setOpenDropdownId(null);
        dropdownPositionRef.current = null;
      }
    };

    const handleScroll = () => {
      // Close dropdown on scroll to avoid positioning issues
      if (openDropdownId) {
        setOpenDropdownId(null);
        dropdownPositionRef.current = null;
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll, true);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [openDropdownId]);

  const handleStatusChange = (
    userId: string,
    newStatus: "Active" | "Suspended"
  ) => {
    onUserStatusChange(userId, newStatus === "Active");
    setOpenDropdownId(null);
  };

  const handleDeleteClick = (userId: string) => {
    setDeleteDialogUserId(userId);
  };

  const handleConfirmDelete = async () => {
    if (!deleteDialogUserId) return;

    try {
      await deleteUserMutation.mutateAsync(deleteDialogUserId);
      onUserRemove(deleteDialogUserId);
      setDeleteDialogUserId(null);
    } catch (error) {
      console.error("Failed to delete user:", error);
      // Error handling - you might want to show a toast notification here
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogUserId(null);
  };

  const userToDelete = deleteDialogUserId
    ? users.find((u) => u.id === deleteDialogUserId)
    : null;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm font-medium text-slate-900 ">
          {t("settings.sections.rolesPermissions.users")}
        </div>
        <button
          type="button"
          onClick={onUserAdd}
          className="inline-flex items-center gap-2 rounded-lg bg-[#1B54FE]/10 px-4 py-2 text-sm font-bold text-[#1B54FE] hover:bg-[#1B54FE]/15 transition-colors"
        >
          {t("settings.sections.rolesPermissions.addUser")}
          <PlusIcon className="size-4" />
        </button>
      </div>
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
                  <div className="relative">
                    <button
                      ref={(el) => {
                        if (el && user.id) buttonRefs.current.set(user.id, el);
                      }}
                      type="button"
                      onClick={() => {
                        if (!user.id) return;
                        if (openDropdownId === user.id) {
                          setOpenDropdownId(null);
                          dropdownPositionRef.current = null;
                        } else {
                          const button = buttonRefs.current.get(user.id);
                          if (button) {
                            const rect = button.getBoundingClientRect();
                            dropdownPositionRef.current = {
                              top: rect.bottom + 4,
                              left: rect.left,
                            };
                          }
                          setOpenDropdownId(user.id);
                        }
                      }}
                      className={`text-xs max-w-25 mx-auto border font-bold border-slate-200 bg-white px-2 py-1 flex items-center gap-1 justify-between rounded-md ${
                        user.status === "Active"
                          ? " text-green-500"
                          : " text-yellow-500"
                      }`}
                    >
                      {user.status === "Active"
                        ? t("settings.sections.rolesPermissions.statusActive")
                        : t(
                            "settings.sections.rolesPermissions.statusSuspended"
                          )}
                      <ChevronDown className="size-4 text-slate-400" />
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => user.id && onUserEdit(user.id)}
                      className="p-1 bg-white border border-slate-200 rounded-lg hover:bg-slate-100  transition-colors"
                    >
                      <PenLineIcon className="size-4 text-slate-400" />
                    </button>
                    <button
                      type="button"
                      onClick={() => user.id && handleDeleteClick(user.id)}
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

      {/* Dropdown Portal - renders outside table to avoid overflow clipping */}
      {openDropdownId &&
        dropdownPositionRef.current &&
        createPortal(
          <div
            ref={(el) => {
              if (el && openDropdownId)
                dropdownRefs.current.set(openDropdownId, el);
            }}
            className="fixed bg-white border border-slate-200 rounded-lg shadow-lg z-50 min-w-[120px]"
            style={{
              top: `${dropdownPositionRef.current.top}px`,
              left: `${dropdownPositionRef.current.left}px`,
            }}
          >
            <button
              type="button"
              onClick={() => {
                if (openDropdownId)
                  handleStatusChange(openDropdownId, "Active");
              }}
              className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-50 first:rounded-t-lg ${
                users.find((u) => u.id === openDropdownId)?.status === "Active"
                  ? "bg-slate-100 font-medium text-green-500"
                  : ""
              }`}
            >
              {t("settings.sections.rolesPermissions.statusActive")}
            </button>
            <button
              type="button"
              onClick={() => {
                if (openDropdownId)
                  handleStatusChange(openDropdownId, "Suspended");
              }}
              className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-50 last:rounded-b-lg ${
                users.find((u) => u.id === openDropdownId)?.status ===
                "Suspended"
                  ? "bg-slate-100 font-medium text-yellow-500"
                  : ""
              }`}
            >
              {t("settings.sections.rolesPermissions.statusSuspended")}
            </button>
          </div>,
          document.body
        )}

      {/* Delete Confirmation Dialog */}
      {deleteDialogUserId && userToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangleIcon className="size-6 text-red-600" />
              <h3 className="text-lg font-semibold">
                {t("settings.sections.rolesPermissions.deleteUser") ||
                  "Delete User"}
              </h3>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              {t("settings.sections.rolesPermissions.deleteUserConfirm", {
                name: userToDelete.name,
                defaultValue: `Are you sure you want to delete "${userToDelete.name}"? This action cannot be undone.`,
              })}
            </p>
            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={handleCancelDelete}
                disabled={deleteUserMutation.isPending}
                className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                {t("settings.sections.rolesPermissions.cancel") || "Cancel"}
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleteUserMutation.isPending}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleteUserMutation.isPending
                  ? t("settings.sections.rolesPermissions.deleting") ||
                    "Deleting..."
                  : t("settings.sections.rolesPermissions.confirmDelete") ||
                    "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
