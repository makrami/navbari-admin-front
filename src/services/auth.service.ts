import { z } from "zod";
import { http } from "../lib/http";
import { useAuthStore } from "../store/auth.store";

// Login request schema
const loginRequestSchema = z.object({
  emailOrPhone: z.string().min(1, "Email or phone is required"),
  password: z.string().min(1, "Password is required"),
  appScope: z.literal("head_office"),
});

// Login response schema according to API documentation
const loginResponseSchema = z.object({
  isEmailVerified: z.boolean(),
  isPhoneNumberVerified: z.boolean(),
});

export type LoginResponse = z.infer<typeof loginResponseSchema>;

/**
 * Login function that authenticates user with email/phone and password.
 * Sets HTTP-only cookies automatically via the backend.
 *
 * @param emailOrPhone - User's email address or phone number
 * @param password - User's password
 * @returns Login response with verification status
 * @throws Error with user-friendly message on failure
 */
export async function login(
  emailOrPhone: string,
  password: string
): Promise<LoginResponse> {
  try {
    // Validate input
    const requestData = loginRequestSchema.parse({
      emailOrPhone,
      password,
      appScope: "head_office",
    });

    // Make login request
    // Cookies are automatically set by the server and included in subsequent requests
    const response = await http.post("/auth/login", requestData);

    // Parse and validate response
    const loginData = loginResponseSchema.parse(response.data);

    // Update auth store with authentication status
    useAuthStore.getState().setAuthenticated(true, {
      isEmailVerified: loginData.isEmailVerified,
      isPhoneNumberVerified: loginData.isPhoneNumberVerified,
    });

    return loginData;
  } catch (error: unknown) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0] as { message: string } | undefined;
      throw new Error(firstError?.message || "Invalid input");
    }

    // Handle API errors (already normalized by http interceptor)
    if (error instanceof Error && error.message) {
      throw new Error(error.message);
    }

    // Fallback error
    throw new Error("Login failed. Please try again.");
  }
}

/**
 * Logout function that invalidates the session and clears cookies.
 * Server automatically clears HTTP-only cookies.
 */
export async function logout(): Promise<void> {
  try {
    // Call logout endpoint - server will clear cookies
    await http.post("/auth/logout");
  } catch (error: unknown) {
    // Even if logout fails (e.g., network error), clear client-side state
    // and redirect to login (as per API documentation)
    console.error("Logout error:", error);
  } finally {
    // Always clear client-side auth state
    useAuthStore.getState().logout();
  }
}
