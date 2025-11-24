import {z} from "zod";
import {http} from "../../lib/http";

// User DTO schema
const userDtoSchema = z
  .object({
    id: z.string().uuid().optional().nullable(),
    email: z.string().email().optional().nullable(),
    phoneNumber: z.string().optional().nullable(),
    country: z.string().optional().nullable(),
    fullName: z.string().optional().nullable(),
    isActive: z.boolean().optional().nullable(),
  })
  .passthrough();

export type UserDto = z.infer<typeof userDtoSchema>;

// API Response DTO - using passthrough() to ignore additional fields
const roleReadDtoSchema = z
  .object({
    id: z.string().uuid(),
    title: z.string(),
    description: z.string().optional().nullable(),
    country: z.string().optional().nullable(),
    isActive: z.boolean(),
    createdAt: z.string().datetime().optional(),
    updatedAt: z.string().datetime().optional(),
    users: z.array(userDtoSchema).optional().default([]),
  })
  .passthrough(); // Ignore additional fields

export type RoleReadDto = z.infer<typeof roleReadDtoSchema>;

// Update Role DTO schema
const updateRoleDtoSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().nullable(),
});

export type UpdateRoleDto = z.infer<typeof updateRoleDtoSchema>;

/**
 * Get all roles
 */
export async function getAllRoles(): Promise<RoleReadDto[]> {
  try {
    const response = await http.get<RoleReadDto[]>("/roles");
    return z.array(roleReadDtoSchema).parse(response.data);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      // Log validation errors for debugging but don't expose details to user
      console.error("Role validation error:", error.issues);
      throw new Error("Invalid response format from server");
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to fetch roles");
  }
}

/**
 * Update a role
 */
export async function updateRole(
  id: string,
  data: UpdateRoleDto
): Promise<RoleReadDto> {
  try {
    // Validate input
    const validatedData = updateRoleDtoSchema.parse(data);

    const response = await http.put<RoleReadDto>(`/roles/${id}`, validatedData);
    return roleReadDtoSchema.parse(response.data);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      throw new Error(firstError?.message || "Invalid input");
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to update role");
  }
}
