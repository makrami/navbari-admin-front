import type {RoleReadDto, UserDto} from "../../../services/roles/roles.service";
import type {Role, User} from "../components/RolesListPanel";

/**
 * Map API UserDto to UI User type
 */
function mapApiUserToUi(apiUser: UserDto): User {
  return {
    id: apiUser.id || undefined, // Use email as unique identifier
    email: apiUser.email || "",
    phoneNumber: apiUser.phoneNumber || undefined,
    country: apiUser.country || undefined,
    fullName: apiUser.fullName || undefined,
    name: apiUser.fullName || apiUser.email || "", // Use fullName or email as fallback
    status: apiUser.isActive ? "Active" : "Suspended",
  };
}

/**
 * Map API RoleReadDto to UI Role type
 */
export function mapApiRoleToUi(apiRole: RoleReadDto): Role {
  const users = (apiRole.users || []).map((user) => mapApiUserToUi(user));

  return {
    id: apiRole.id,
    name: apiRole.title,
    description: apiRole.description || "",
    userCount: users.length, // Calculate from users array
    users: users,
    status: apiRole.isActive ? "Active" : "Suspended",
    geographicalAccess:
      apiRole.country && apiRole.country.trim() !== ""
        ? "Selected Countries"
        : "All Countries",
  };
}

/**
 * Map UI Role to API RoleReadDto (for updates)
 */
export function mapUiRoleToApi(uiRole: Partial<Role>): Partial<RoleReadDto> {
  const apiRole: Partial<RoleReadDto> = {};

  if (uiRole.name !== undefined) {
    apiRole.title = uiRole.name;
  }
  if (uiRole.description !== undefined) {
    apiRole.description = uiRole.description;
  }
  if (uiRole.status !== undefined) {
    apiRole.isActive = uiRole.status === "Active";
  }
  if (uiRole.geographicalAccess !== undefined) {
    // This would need to be handled based on actual API requirements
    // For now, we'll leave country as is
  }

  return apiRole;
}
