import {z} from "zod";
import {http} from "../../lib/http";

// User response schema according to API documentation
const userResponseSchema = z
  .object({
    id: z.string().uuid(),
    email: z.string().email(),
    phoneNumber: z.string().nullable(),
    emailVerified: z.boolean(),
    phoneNumberVerified: z.boolean(),
    fullName: z.string().nullable(),
    firstName: z.string().optional().nullable(),
    lastName: z.string().optional().nullable(),
    referralCode: z.string().nullable(),
    appScope: z.string(),
    roleId: z.string().uuid(),
    createdAt: z.string().optional(),
    isActive: z.boolean().optional(),
    permissions: z.array(z.string()).optional(),
    role: z.any().optional(),
  })
  .passthrough(); // Allow additional fields from API

export type UserResponse = z.infer<typeof userResponseSchema>;

// Password validation regex pattern
// Requires: at least one lowercase, one uppercase, one digit, and one special character (@$!%*?&)
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;

// Reset password request schema
const resetPasswordRequestSchema = z.object({
  oldPassword: z.string().min(1, "Old password is required"),
  newPassword: z
    .string()
    .min(8, "New password must be at least 8 characters")
    .regex(
      passwordRegex,
      "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character (@$!%*?&)"
    ),
});

export type ResetPasswordRequest = z.infer<typeof resetPasswordRequestSchema>;

// Update profile request schema
export type UpdateProfileRequest = {
  firstName: string;
  lastName: string;
  avatar?: File | null;
};

/**
 * Fetches the current authenticated user's details
 * @returns User details including fullName, email, etc.
 * @throws Error with user-friendly message on failure
 */
export async function getCurrentUser(): Promise<UserResponse> {
  try {
    const response = await http.get("/users/me");
    const userData = userResponseSchema.parse(response.data);
    console.log("User data in getCurrentUser:", userData);
    return userData;
  } catch (error: unknown) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0] as {message: string} | undefined;
      throw new Error(firstError?.message || "Invalid user data");
    }

    // Handle API errors (already normalized by http interceptor)
    if (error instanceof Error && error.message) {
      throw new Error(error.message);
    }

    // Fallback error
    throw new Error("Failed to fetch user details. Please try again.");
  }
}

/**
 * Resets the user's password
 * @param data Password reset data (oldPassword and newPassword)
 * @throws Error with user-friendly message on failure
 */
export async function resetPassword(data: ResetPasswordRequest): Promise<void> {
  try {
    const validatedData = resetPasswordRequestSchema.parse(data);
    await http.post("/users/reset-password", validatedData);
  } catch (error: unknown) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0] as {message: string} | undefined;
      throw new Error(firstError?.message || "Invalid password data");
    }

    // Handle API errors (already normalized by http interceptor)
    if (error instanceof Error && error.message) {
      throw new Error(error.message);
    }

    // Fallback error
    throw new Error("Failed to reset password. Please try again.");
  }
}

/**
 * Updates the user's profile
 * @param data Profile update data (firstName, lastName, avatar)
 * @returns Updated user details
 * @throws Error with user-friendly message on failure
 */
export async function updateProfile(
  data: UpdateProfileRequest
): Promise<UserResponse> {
  try {
    // Create FormData for multipart/form-data request
    const formData = new FormData();
    formData.append("firstName", data.firstName);
    formData.append("lastName", data.lastName);

    // Only append avatar if it exists
    if (data.avatar) {
      formData.append("avatar", data.avatar);
    }

    const response = await http.put("/users/update-profile", formData);
    const userData = userResponseSchema.parse(response.data);
    return userData;
  } catch (error: unknown) {
    // Handle API errors (already normalized by http interceptor)
    if (error instanceof Error && error.message) {
      throw new Error(error.message);
    }

    // Fallback error
    throw new Error("Failed to update profile. Please try again.");
  }
}
