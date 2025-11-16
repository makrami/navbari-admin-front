import type { ShipmentStatus } from "../../../components";
import type { ActivityItemData } from "../Activity/types";
import type { CargoCompany } from "../components/CargoDeclarationModal";

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
  lastActivity: string;
  lastActivityTime: string;
  currentSegmentIndex: number; // 0-based index of the current segment
  isNew?: boolean; // newly created shipment - suppress progress UI
  segments: Array<{
    step: number;
    place: string;
    datetime: string;
    isCompleted?: boolean;
    isPlaceholder?: boolean;
    nextPlace?: string;
    startAt?: string;
    estFinishAt?: string;
    distance?: string;
    vehicleLabel?: string;
    localCompany?: string;
    baseFeeUsd?: number;
    driverName: string;
    driverPhoto?: string; // Optional - if not provided, show user icon
    driverRating: number;
    cargoCompanies?: CargoCompany[];
  }>;
  activities: ActivityItemData[];
};
