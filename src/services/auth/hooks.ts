import { useMutation } from "@tanstack/react-query";
import { logoutAll } from "../auth.service";

// Query keys
export const authKeys = {
  all: ["auth"] as const,
};

/**
 * Mutation hook for logging out from all devices
 */
export function useLogoutAll() {
  return useMutation({
    mutationFn: () => logoutAll(),
  });
}
