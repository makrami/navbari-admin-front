import {RolesListPanel, type Role} from "./RolesListPanel";
import {RoleDetailsPanel, type Permission, type User} from "./RoleDetailsPanel";
import {SettingsFooter} from "./SettingsFooter";
import {useMemo, useState} from "react";
import {AddEditUserModal} from "./AddEditUserModal";
import {useCreateUser, useUpdateUser} from "../../../services/admin/hooks";

type RolesPermissionsSettingsProps = {
  roles: Role[];
  selectedRoleId: string | null;
  onRoleSelect: (roleId: string) => void;
  selectedRole: Role | null;
  permissions: Permission[];
  users: User[];
  onRoleUpdate: (role: Partial<Role>) => void;
  onPermissionsChange: (permissions: Permission[]) => void;
  onUserAdd: (user: {
    name: string;
    email: string;
    password: string;
    country?: string;
  }) => void;
  onUserUpdate: (user: {
    id: string;
    name: string;
    email: string;
    password?: string;
    country?: string;
  }) => void;
  onUserRemove: (userId: string) => void;
  onUserStatusChange: (userId: string, isActive: boolean) => void;
  changeCount: number;
  onRevert: () => void;
  onSave: () => void;
  isLoadingRoles?: boolean;
  rolesError?: Error | null;
  isSavingRole?: boolean;
};

export function RolesPermissionsSettings({
  roles,
  selectedRoleId,
  onRoleSelect,
  selectedRole,
  permissions,
  users,
  onRoleUpdate,
  onPermissionsChange,
  onUserAdd,
  onUserUpdate,
  onUserRemove,
  onUserStatusChange,
  changeCount,
  onRevert,
  onSave,
  isLoadingRoles = false,
  rolesError = null,
  isSavingRole = false,
}: RolesPermissionsSettingsProps) {
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editUserId, setEditUserId] = useState<string | null>(null);

  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();

  const roleName = useMemo(() => selectedRole?.name ?? "", [selectedRole]);
  const editUser = useMemo(
    () => users.find((u) => u.id === editUserId) || null,
    [users, editUserId]
  );

  const handleOpenAddUser = () => {
    setEditUserId(null);
    setIsUserModalOpen(true);
  };

  const handleOpenEditUser = (userId: string) => {
    setEditUserId(userId);
    setIsUserModalOpen(true);
  };

  const handleSubmitUser = (data: {
    id?: string;
    name: string;
    email: string;
    password?: string;
    country?: string;
  }) => {
    if (data.id) {
      onUserUpdate({
        id: data.id,
        name: data.name,
        email: data.email,
        password: data.password,
        country: data.country,
      });
    } else {
      onUserAdd({
        name: data.name,
        email: data.email,
        password: data.password || "",
        country: data.country,
      });
    }
    setIsUserModalOpen(false);
  };

  return (
    <div className="space-y-6 pt-4">
      <div className="flex gap-4">
        <RolesListPanel
          roles={roles}
          selectedRoleId={selectedRoleId}
          onRoleSelect={onRoleSelect}
          onAddRole={handleOpenAddUser}
          isLoading={isLoadingRoles}
          error={rolesError}
        />
        <RoleDetailsPanel
          role={selectedRole}
          permissions={permissions}
          users={users}
          onRoleUpdate={onRoleUpdate}
          onPermissionsChange={onPermissionsChange}
          onUserEdit={handleOpenEditUser}
          onUserRemove={onUserRemove}
          onUserAdd={handleOpenAddUser}
          onUserStatusChange={onUserStatusChange}
        />
      </div>

      {changeCount > 0 && (
        <SettingsFooter
          changeCount={changeCount}
          onRevert={onRevert}
          onSave={onSave}
          isLoading={isSavingRole}
        />
      )}

      <AddEditUserModal
        open={isUserModalOpen}
        mode={editUserId ? "edit" : "add"}
        roleName={roleName}
        roleId={selectedRoleId}
        initialUser={
          editUser
            ? {
                id: editUser.id,
                name: editUser.name,
                email: editUser.email,
                country: editUser.country || undefined,
              }
            : null
        }
        onClose={() => setIsUserModalOpen(false)}
        onSubmit={handleSubmitUser}
        isLoading={createUserMutation.isPending || updateUserMutation.isPending}
      />
    </div>
  );
}
