import type {
  DistanceUnit,
  WeightUnit,
  NotificationChannel,
} from "../../services/settings/settings.service";

/**
 * Convert UI distance unit string to API value
 */
export function uiDistanceUnitToApi(uiValue: string): DistanceUnit | undefined {
  if (uiValue.includes("Kilometers") || uiValue.includes("KM")) {
    return "km";
  }
  if (uiValue.includes("Miles") || uiValue.includes("MI")) {
    return "mile";
  }
  return undefined;
}

/**
 * Convert API distance unit to UI string
 */
export function apiDistanceUnitToUi(apiValue?: DistanceUnit): string {
  if (apiValue === "km") {
    return "Kilometers (KM)";
  }
  if (apiValue === "mile") {
    return "Miles (MI)";
  }
  return "Kilometers (KM)"; // default
}

/**
 * Convert UI weight unit string to API value
 */
export function uiWeightUnitToApi(uiValue: string): WeightUnit | undefined {
  if (uiValue.includes("Kilograms") || uiValue.includes("KG")) {
    return "kg";
  }
  if (uiValue.includes("Pounds") || uiValue.includes("LB")) {
    return "lb";
  }
  return undefined;
}

/**
 * Convert API weight unit to UI string
 */
export function apiWeightUnitToUi(apiValue?: WeightUnit): string {
  if (apiValue === "kg") {
    return "Kilograms (KG)";
  }
  if (apiValue === "lb") {
    return "Pounds (LB)";
  }
  return "Kilograms (KG)"; // default
}

/**
 * Convert UI notification channel booleans to API array
 */
export function uiNotificationChannelsToApi(
  inApp: boolean,
  email: boolean,
  sms: boolean,
  mobilePush: boolean
): NotificationChannel[] {
  const channels: NotificationChannel[] = [];
  if (inApp) channels.push("system");
  if (email) channels.push("email");
  if (sms) channels.push("sms");
  if (mobilePush) channels.push("mobile_push");
  return channels;
}

/**
 * Convert API notification channels array to UI booleans
 */
export function apiNotificationChannelsToUi(
  channels?: NotificationChannel[]
): {
  inApp: boolean;
  email: boolean;
  sms: boolean;
  mobilePush: boolean;
} {
  if (!channels || channels.length === 0) {
    return {
      inApp: false,
      email: false,
      sms: false,
      mobilePush: false,
    };
  }

  return {
    inApp: channels.includes("system"),
    email: channels.includes("email"),
    sms: channels.includes("sms"),
    mobilePush: channels.includes("mobile_push"),
  };
}

