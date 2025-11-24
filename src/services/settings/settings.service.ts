import { z } from "zod";
import { http } from "../../lib/http";

// Type definitions matching server DTOs
export type NotificationChannel = "system" | "email" | "sms" | "mobile_push";
export type DistanceUnit = "km" | "mile";
export type WeightUnit = "kg" | "lb";
export type SettingCategory = "general" | "notification" | "sla" | "roles";

// General Settings
export interface GeneralSettings {
  companyName?: string;
  companyLogoUrl?: string;
  distanceUnit?: DistanceUnit;
  weightUnit?: WeightUnit;
}

export interface UpdateGeneralSettings {
  companyName?: string;
  companyLogoUrl?: string;
  distanceUnit?: DistanceUnit;
  weightUnit?: WeightUnit;
}

// Notification Settings
export interface NotificationSettings {
  gpsOfflineThresholdMin?: number; // 1-1440 minutes
  delayThresholdHr?: number; // 1-168 hours
  notificationChannels?: NotificationChannel[];
}

export interface UpdateNotificationSettings {
  gpsOfflineThresholdMin?: number;
  delayThresholdHr?: number;
  notificationChannels?: NotificationChannel[];
}

// SLA Settings
export interface SlaSettings {
  loadingTimeHours?: number; // 1-720 hours
  transitTimeHours?: number; // 1-720 hours
  unloadingTimeHours?: number; // 1-720 hours
  arrivalRadiusKm?: number; // 1-100 km
}

export interface UpdateSlaSettings {
  loadingTimeHours?: number;
  transitTimeHours?: number;
  unloadingTimeHours?: number;
  arrivalRadiusKm?: number;
}

// Complete Settings Response
export interface SettingsReadDto {
  general: GeneralSettings;
  notification: NotificationSettings;
  sla: SlaSettings;
}

// Available Options
export interface SettingsOptions {
  distanceUnits: DistanceUnit[];
  weightUnits: WeightUnit[];
  notificationChannels: NotificationChannel[];
  categories: SettingCategory[];
}

// Zod schemas for validation
const distanceUnitSchema = z.enum(["km", "mile"]);
const weightUnitSchema = z.enum(["kg", "lb"]);
const notificationChannelSchema = z.enum(["system", "email", "sms", "mobile_push"]);

const generalSettingsSchema = z.object({
  companyName: z.string().optional(),
  companyLogoUrl: z.string().url().optional(),
  distanceUnit: distanceUnitSchema.optional(),
  weightUnit: weightUnitSchema.optional(),
});

const notificationSettingsSchema = z.object({
  gpsOfflineThresholdMin: z.number().int().min(1).max(1440).optional(),
  delayThresholdHr: z.number().int().min(1).max(168).optional(),
  notificationChannels: z.array(notificationChannelSchema).optional(),
});

const slaSettingsSchema = z.object({
  loadingTimeHours: z.number().int().min(1).max(720).optional(),
  transitTimeHours: z.number().int().min(1).max(720).optional(),
  unloadingTimeHours: z.number().int().min(1).max(720).optional(),
  arrivalRadiusKm: z.number().int().min(1).max(100).optional(),
});

const settingsReadDtoSchema = z.object({
  general: generalSettingsSchema,
  notification: notificationSettingsSchema,
  sla: slaSettingsSchema,
});

const settingsOptionsSchema = z.object({
  distanceUnits: z.array(distanceUnitSchema),
  weightUnits: z.array(weightUnitSchema),
  notificationChannels: z.array(notificationChannelSchema),
  categories: z.array(z.enum(["general", "notification", "sla", "roles"])),
});

/**
 * Get all settings
 */
export async function getAllSettings(): Promise<SettingsReadDto> {
  try {
    const response = await http.get<SettingsReadDto>("/settings");
    return settingsReadDtoSchema.parse(response.data);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      throw new Error("Invalid response format");
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to fetch settings");
  }
}

/**
 * Get settings by category
 */
export async function getSettingsByCategory(
  category: SettingCategory
): Promise<GeneralSettings | NotificationSettings | SlaSettings> {
  try {
    const response = await http.get(`/settings/${category}`);
    
    switch (category) {
      case "general":
        return generalSettingsSchema.parse(response.data);
      case "notification":
        return notificationSettingsSchema.parse(response.data);
      case "sla":
        return slaSettingsSchema.parse(response.data);
      default:
        throw new Error(`Invalid category: ${category}`);
    }
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      throw new Error("Invalid response format");
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to fetch ${category} settings`);
  }
}

/**
 * Update settings by category
 */
export async function updateSettingsByCategory(
  category: SettingCategory,
  data: UpdateGeneralSettings | UpdateNotificationSettings | UpdateSlaSettings
): Promise<GeneralSettings | NotificationSettings | SlaSettings> {
  try {
    // Validate input based on category
    let validatedData;
    switch (category) {
      case "general":
        validatedData = generalSettingsSchema.partial().parse(data);
        break;
      case "notification":
        validatedData = notificationSettingsSchema.partial().parse(data);
        break;
      case "sla":
        validatedData = slaSettingsSchema.partial().parse(data);
        break;
      default:
        throw new Error(`Invalid category: ${category}`);
    }

    const response = await http.put(`/settings/${category}`, validatedData);
    
    switch (category) {
      case "general":
        return generalSettingsSchema.parse(response.data);
      case "notification":
        return notificationSettingsSchema.parse(response.data);
      case "sla":
        return slaSettingsSchema.parse(response.data);
      default:
        throw new Error(`Invalid category: ${category}`);
    }
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      throw new Error(firstError?.message || "Invalid input");
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to update ${category} settings`);
  }
}

/**
 * Get available options
 */
export async function getAvailableOptions(): Promise<SettingsOptions> {
  try {
    const response = await http.get<SettingsOptions>("/settings/options");
    return settingsOptionsSchema.parse(response.data);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      throw new Error("Invalid response format");
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to fetch settings options");
  }
}

/**
 * Get single setting by key
 */
export async function getSettingByKey(key: string): Promise<{ key: string; value: any }> {
  try {
    const response = await http.get<{ key: string; value: any }>(`/settings/key/${key}`);
    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to fetch setting with key: ${key}`);
  }
}

/**
 * Upload logo file
 */
export async function uploadLogo(file: File): Promise<{ url: string }> {
  try {
    const formData = new FormData();
    formData.append("file", file);
    
    const response = await http.post<{ url: string }>("/settings/logo", formData);
    
    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to upload logo");
  }
}

