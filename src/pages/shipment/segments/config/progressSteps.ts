import {
  Truck,
  Flag,
  CarFront,
  MapPinCheck,
  Loader,
  Stamp,
  MapPinned,
} from "lucide-react";
import { SEGMENT_STATUS } from "../../../../services/shipment/shipment.api.service";

export type StepConfig = {
  key: SEGMENT_STATUS;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  bgColor: string;
  iconColor: string;
  chevronColor: string;
};

export const PROGRESS_STEPS_CONFIG: StepConfig[] = [
  {
    key: SEGMENT_STATUS.ASSIGNED,
    label: "Start",
    icon: Truck,
    bgColor: "bg-yellow-50",
    iconColor: "text-yellow-600",
    chevronColor: "text-yellow-600",
  },
  {
    key: SEGMENT_STATUS.TO_ORIGIN,
    label: "To Orig.",
    icon: CarFront,
    bgColor: "bg-yellow-50",
    iconColor: "text-yellow-600",
    chevronColor: "text-yellow-600",
  },
  {
    key: SEGMENT_STATUS.AT_ORIGIN,
    label: "In Orig.",
    icon: MapPinCheck,
    bgColor: "bg-orange-50",
    iconColor: "text-orange-600",
    chevronColor: "text-orange-600",
  },
  {
    key: SEGMENT_STATUS.LOADING,
    label: "Loading",
    icon: Loader,
    bgColor: "bg-yellow-50",
    iconColor: "text-yellow-600",
    chevronColor: "text-yellow-600",
  },
  {
    key: SEGMENT_STATUS.IN_CUSTOMS,
    label: "In Customs",
    icon: Stamp,
    bgColor: "bg-yellow-50",
    iconColor: "text-yellow-600",
    chevronColor: "text-yellow-600",
  },
  {
    key: SEGMENT_STATUS.TO_DESTINATION,
    label: "To Dest.",
    icon: MapPinned,
    bgColor: "bg-yellow-50",
    iconColor: "text-yellow-600",
    chevronColor: "text-yellow-600",
  },
  {
    key: SEGMENT_STATUS.DELIVERED,
    label: "Delivered",
    icon: Flag,
    bgColor: "bg-green-50",
    iconColor: "text-green-600",
    chevronColor: "text-green-600",
  },
];
