import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCurrentUser,
  resetPassword,
  updateProfile,
  type ResetPasswordRequest,
  type UpdateProfileRequest,
} from "./user.service";

// Query keys
export const userKeys = {
  all: ["users"] as const,
  me: () => [...userKeys.all, "me"] as const,
};

/**
 * Query hook for fetching current user details
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: userKeys.me(),
    queryFn: () => getCurrentUser(),
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    retry: 1, // Only retry once on failure
  });
}

/**
 * Mutation hook for resetting user password
 */
export function useResetPassword() {
  return useMutation({
    mutationFn: (data: ResetPasswordRequest) => resetPassword(data),
  });
}

/**
 * Mutation hook for updating user profile
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => updateProfile(data),
    onSuccess: () => {
      // Invalidate and refetch user data after successful update
      queryClient.invalidateQueries({ queryKey: userKeys.me() });
    },
  });
}
