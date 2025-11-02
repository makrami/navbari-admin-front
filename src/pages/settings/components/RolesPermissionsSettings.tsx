import { RolesListPanel, type Role } from "./RolesListPanel";
import {
  RoleDetailsPanel,
  type Permission,
  type User,
} from "./RoleDetailsPanel";
import { SettingsFooter } from "./SettingsFooter";
import { useMemo, useState } from "react";
import { AddEditUserModal } from "./AddEditUserModal";

type RolesPermissionsSettingsProps = {
  roles: Role[];
  selectedRoleId: string | null;
  onRoleSelect: (roleId: string) => void;
  selectedRole: Role | null;
  permissions: Permission[];
  users: User[];
  onRoleUpdate: (role: Partial<Role>) => void;
  onPermissionsChange: (permissions: Permission[]) => void;
  onUserAdd: (user: { name: string; email: string }) => void;
  onUserUpdate: (user: { id: string; name: string; email: string }) => void;
  onUserRemove: (userId: string) => void;
  changeCount: number;
  onRevert: () => void;
  onSave: () => void;
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
  changeCount,
  onRevert,
  onSave,
}: RolesPermissionsSettingsProps) {
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editUserId, setEditUserId] = useState<string | null>(null);

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
  }) => {
    if (data.id) {
      onUserUpdate({ id: data.id, name: data.name, email: data.email });
    } else {
      onUserAdd({ name: data.name, email: data.email });
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
        />
        <RoleDetailsPanel
          role={selectedRole}
          permissions={permissions}
          users={users}
          onRoleUpdate={onRoleUpdate}
          onPermissionsChange={onPermissionsChange}
          onUserEdit={handleOpenEditUser}
          onUserRemove={onUserRemove}
        />
      </div>

      <SettingsFooter
        changeCount={changeCount}
        onRevert={onRevert}
        onSave={onSave}
      />

      <AddEditUserModal
        open={isUserModalOpen}
        mode={editUserId ? "edit" : "add"}
        roleName={roleName}
        initialUser={
          editUser
            ? { id: editUser.id, name: editUser.name, email: editUser.email }
            : null
        }
        onClose={() => setIsUserModalOpen(false)}
        onSubmit={handleSubmitUser}
      />
    </div>
  );
}
