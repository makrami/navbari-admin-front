import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllRoles, updateRole, type UpdateRoleDto } from "./roles.service";

// Query keys
export const rolesKeys = {
  all: ["roles"] as const,
  lists: () => [...rolesKeys.all, "list"] as const,
  list: (filters?: string) => [...rolesKeys.lists(), { filters }] as const,
  details: () => [...rolesKeys.all, "detail"] as const,
  detail: (id: string) => [...rolesKeys.details(), id] as const,
};

/**
 * Query hook for fetching all roles
 */
export function useRoles() {
  return useQuery({
    queryKey: rolesKeys.list(),
    queryFn: () => getAllRoles(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Mutation hook for updating a role
 */
export function useUpdateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRoleDto }) =>
      updateRole(id, data),
    onSuccess: () => {
      // Invalidate and refetch roles list
      queryClient.invalidateQueries({ queryKey: rolesKeys.list() });
    },
  });
}

