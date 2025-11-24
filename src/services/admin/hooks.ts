import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createUser, updateUser, deleteUser, type CreateUserDto, type UpdateUserDto } from "./users.service";
import { rolesKeys } from "../roles/hooks";

/**
 * Mutation hook for creating a user
 */
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserDto) => createUser(data),
    onSuccess: () => {
      // Invalidate roles query to refetch with updated user counts
      queryClient.invalidateQueries({ queryKey: rolesKeys.all });
    },
  });
}

/**
 * Mutation hook for updating a user
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserDto }) =>
      updateUser(id, data),
    onSuccess: () => {
      // Invalidate roles query to refetch with updated user data
      queryClient.invalidateQueries({ queryKey: rolesKeys.all });
    },
  });
}

/**
 * Mutation hook for deleting a user
 */
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => {
      // Invalidate roles query to refetch with updated user data
      queryClient.invalidateQueries({ queryKey: rolesKeys.all });
    },
  });
}

