import type { ShipmentStatus } from "../../../components";
import type { ActivityItemData } from "../Activity/types";
import type { SegmentData } from "../../../shared/types/segmentData";

export type ShipmentData = {
  title: string;
  id: string;
  status: ShipmentStatus;
  fromCountryCode: string;
  toCountryCode: string;
  progressPercent: number;
  userName: string;
  rating: number;
  vehicle: string;
  weight: string;
  localCompany: string;
  destination: string;
  originCountry: string;
  originCity: string;
  destinationCountry: string;
  destinationCity: string;
  lastActivity: string;
  lastActivityTime: string;
  currentSegmentIndex: number; // 0-based index of the current segment
  isNew?: boolean; // newly created shipment - suppress progress UI
  segments: SegmentData[];
  activities: ActivityItemData[];
};
