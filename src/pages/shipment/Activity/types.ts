export type ActivityType =
  | "gps_on"
  | "gps_off"
  | "driver_changed"
  | "uploaded"
  | "arrived";

export type ActivityItemData = {
  id: string | number;
  type: ActivityType;
  actorName: string;
  actorAvatarUrl?: string;
  fromName?: string;
  toName?: string;
  fileName?: string;
  locationName?: string;
  segmentIndex?: number;
  timestamp: string;
};


