import { RolesListPanel, type Role } from "./RolesListPanel";
import {
  RoleDetailsPanel,
  type Permission,
  type User,
} from "./RoleDetailsPanel";
import { SettingsFooter } from "./SettingsFooter";

type RolesPermissionsSettingsProps = {
  roles: Role[];
  selectedRoleId: string | null;
  onRoleSelect: (roleId: string) => void;
  onAddRole: () => void;
  selectedRole: Role | null;
  permissions: Permission[];
  users: User[];
  onRoleUpdate: (role: Partial<Role>) => void;
  onPermissionsChange: (permissions: Permission[]) => void;
  onUserEdit: (userId: string) => void;
  onUserRemove: (userId: string) => void;
  changeCount: number;
  onRevert: () => void;
  onSave: () => void;
};

export function RolesPermissionsSettings({
  roles,
  selectedRoleId,
  onRoleSelect,
  onAddRole,
  selectedRole,
  permissions,
  users,
  onRoleUpdate,
  onPermissionsChange,
  onUserEdit,
  onUserRemove,
  changeCount,
  onRevert,
  onSave,
}: RolesPermissionsSettingsProps) {
  return (
    <div className="space-y-6 pt-4">
      <div className="flex gap-4">
        <RolesListPanel
          roles={roles}
          selectedRoleId={selectedRoleId}
          onRoleSelect={onRoleSelect}
          onAddRole={onAddRole}
        />
        <RoleDetailsPanel
          role={selectedRole}
          permissions={permissions}
          users={users}
          onRoleUpdate={onRoleUpdate}
          onPermissionsChange={onPermissionsChange}
          onUserEdit={onUserEdit}
          onUserRemove={onUserRemove}
        />
      </div>

      <SettingsFooter
        changeCount={changeCount}
        onRevert={onRevert}
        onSave={onSave}
      />
    </div>
  );
}
