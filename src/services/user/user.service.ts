import { z } from "zod";
import { http } from "../../lib/http";

// User response schema according to API documentation
const userResponseSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  phoneNumber: z.string().nullable(),
  emailVerified: z.boolean(),
  phoneNumberVerified: z.boolean(),
  fullName: z.string().nullable(),
  referralCode: z.string().nullable(),
  appScope: z.string(),
  roleId: z.string().uuid(),
  createdAt: z.string().optional(),
  isActive: z.boolean().optional(),
  permissions: z.array(z.string()).optional(),
  role: z.any().optional(),
}).passthrough(); // Allow additional fields from API

export type UserResponse = z.infer<typeof userResponseSchema>;

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
      const firstError = error.issues[0] as { message: string } | undefined;
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

