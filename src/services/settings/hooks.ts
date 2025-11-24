import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAllSettings,
  getSettingsByCategory,
  updateSettingsByCategory,
  getAvailableOptions,
  uploadLogo,
  type SettingCategory,
  type UpdateGeneralSettings,
  type UpdateNotificationSettings,
  type UpdateSlaSettings,
} from "./settings.service";

// Query keys
export const settingsKeys = {
  all: ["settings"] as const,
  lists: () => [...settingsKeys.all, "list"] as const,
  list: (filters: string) => [...settingsKeys.lists(), { filters }] as const,
  details: () => [...settingsKeys.all, "detail"] as const,
  detail: (category: SettingCategory) => [...settingsKeys.details(), category] as const,
  options: () => [...settingsKeys.all, "options"] as const,
  key: (key: string) => [...settingsKeys.all, "key", key] as const,
};

/**
 * Query hook for fetching all settings
 */
export function useSettings() {
  return useQuery({
    queryKey: settingsKeys.all,
    queryFn: () => getAllSettings(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
}

/**
 * Query hook for fetching settings by category
 */
export function useSettingsByCategory(category: SettingCategory) {
  return useQuery({
    queryKey: settingsKeys.detail(category),
    queryFn: () => getSettingsByCategory(category),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Query hook for fetching available options
 */
export function useSettingsOptions() {
  return useQuery({
    queryKey: settingsKeys.options(),
    queryFn: () => getAvailableOptions(),
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
  });
}

/**
 * Mutation hook for updating general settings
 */
export function useUpdateGeneralSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateGeneralSettings) =>
      updateSettingsByCategory("general", data),
    onSuccess: () => {
      // Invalidate all settings queries
      queryClient.invalidateQueries({ queryKey: settingsKeys.all });
      queryClient.invalidateQueries({ queryKey: settingsKeys.detail("general") });
    },
  });
}

/**
 * Mutation hook for updating notification settings
 */
export function useUpdateNotificationSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateNotificationSettings) =>
      updateSettingsByCategory("notification", data),
    onSuccess: () => {
      // Invalidate all settings queries
      queryClient.invalidateQueries({ queryKey: settingsKeys.all });
      queryClient.invalidateQueries({ queryKey: settingsKeys.detail("notification") });
    },
  });
}

/**
 * Mutation hook for updating SLA settings
 */
export function useUpdateSlaSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateSlaSettings) =>
      updateSettingsByCategory("sla", data),
    onSuccess: () => {
      // Invalidate all settings queries
      queryClient.invalidateQueries({ queryKey: settingsKeys.all });
      queryClient.invalidateQueries({ queryKey: settingsKeys.detail("sla") });
    },
  });
}

/**
 * Mutation hook for uploading logo
 */
export function useUploadLogo() {
  return useMutation({
    mutationFn: (file: File) => uploadLogo(file),
  });
}

