import {z} from "zod";
import {http} from "../../lib/http";

// Create User DTO
const createUserDtoSchema = z.object({
  email: z.string().email(),
  phoneNumber: z.string().optional().nullable(),
  password: z.string().min(1),
  appScope: z.string().default("head_office"),
  fullName: z.string().optional().nullable(),
  roleId: z.string().uuid(),
  isActive: z.boolean().default(true),
  country: z.string().optional().nullable(),
});

export type CreateUserDto = z.infer<typeof createUserDtoSchema>;

// Update User DTO
const updateUserDtoSchema = z.object({
  fullName: z.string().optional().nullable(),
  password: z.string().optional(),
  isActive: z.boolean().optional(),
  country: z.string().optional().nullable(),
});

export type UpdateUserDto = z.infer<typeof updateUserDtoSchema>;

// User Response DTO (simplified - matches what we need)
const userResponseSchema = z
  .object({
    id: z.string().optional(),
    email: z.string().email().optional().nullable(),
    phoneNumber: z.string().optional().nullable(),
    country: z.string().optional().nullable(),
    fullName: z.string().optional().nullable(),
    isActive: z.boolean().optional().nullable(),
  })
  .passthrough();

export type UserResponse = z.infer<typeof userResponseSchema>;

/**
 * Create a new user
 */
export async function createUser(data: CreateUserDto): Promise<UserResponse> {
  try {
    const validatedData = createUserDtoSchema.parse(data);
    const response = await http.post<UserResponse>(
      "/admin/users",
      validatedData
    );
    return userResponseSchema.parse(response.data);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      throw new Error(firstError?.message || "Invalid input");
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to create user");
  }
}

/**
 * Update a user
 */
export async function updateUser(
  id: string,
  data: UpdateUserDto
): Promise<UserResponse> {
  try {
    const validatedData = updateUserDtoSchema.parse(data);
    const response = await http.put<UserResponse>(
      `/admin/users/${id}`,
      validatedData
    );
    return userResponseSchema.parse(response.data);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      throw new Error(firstError?.message || "Invalid input");
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to update user");
  }
}

/**
 * Delete a user
 */
export async function deleteUser(id: string): Promise<void> {
  try {
    await http.delete(`/admin/users/${id}`);
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to delete user");
  }
}
