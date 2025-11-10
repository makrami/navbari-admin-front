import {
  Truck,

  Flag,
  CarFront,
  MapPinCheck,
  Loader,
  Stamp,
  MapPinned,
} from "lucide-react";
import type { SegmentProgressStage } from "../components/SegmentProgress";

export type StepConfig = {
  key: SegmentProgressStage;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  bgColor: string;
  iconColor: string;
  chevronColor: string;
  distance: string;
  plannedDate: string;
  estFinishAt: string;
};

export const PROGRESS_STEPS_CONFIG: StepConfig[] = [
  {
    key: "start",
    label: "Start",
    icon: Truck,
    bgColor: "bg-yellow-50",
    iconColor: "text-yellow-600",
    chevronColor: "text-yellow-600",
    plannedDate: "14 Aug - 03:45",
    estFinishAt: "14 Aug - 03:45",
    distance: "24 KM",
  },
  {
    key: "to_origin",
    label: "To Orig.",
    icon: CarFront,
    bgColor: "bg-yellow-50",
    iconColor: "text-yellow-600",
    chevronColor: "text-yellow-600",
    plannedDate: "14 Aug - 03:45",
    estFinishAt: "14 Aug - 03:45",
    distance: "24 KM",
  },
  {
    key: "in_origin",
    label: "In Orig.",
    icon: MapPinCheck,
    bgColor: "bg-orange-50",
    iconColor: "text-orange-600",
    chevronColor: "text-orange-600",
    plannedDate: "14 Aug - 03:45",
    estFinishAt: "14 Aug - 03:45",
    distance: "24 KM",
  },
  {
    key: "loading",
    label: "Loading",
    icon: Loader,
    bgColor: "bg-yellow-50",
    iconColor: "text-yellow-600",
    chevronColor: "text-yellow-600",
    plannedDate: "14 Aug - 03:45",
    estFinishAt: "14 Aug - 03:45",
    distance: "24 KM",
  },
  {
    key: "in_customs",
    label: "In Customs",
    icon: Stamp,
    bgColor: "bg-yellow-50",
    iconColor: "text-yellow-600",
    chevronColor: "text-yellow-600",
    plannedDate: "14 Aug - 03:45",
    estFinishAt: "14 Aug - 03:45",
    distance: "24 KM",
  },
  {
    key: "to_dest",
    label: "To Dest.",
    icon: MapPinned,
    bgColor: "bg-yellow-50",
    iconColor: "text-yellow-600",
    chevronColor: "text-yellow-600",
    plannedDate: "14 Aug - 03:45",
    estFinishAt: "14 Aug - 03:45",
    distance: "24 KM",
  },
  {
    key: "delivered",
    label: "Delivered",
    icon: Flag,
    bgColor: "bg-green-50",
    iconColor: "text-green-600",
    chevronColor: "text-green-600",
    plannedDate: "14 Aug - 03:45",
    estFinishAt: "14 Aug - 03:45",
    distance: "24 KM",
  },
];

