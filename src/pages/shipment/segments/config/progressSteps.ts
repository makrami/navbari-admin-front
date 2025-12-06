import {
  Truck,
  Flag,
  CarFront,
  MapPinCheck,
  Loader,
  Stamp,
  MapPinned,
  PackageCheck,
} from "lucide-react";
import type {Segment} from "../../../../shared/types/segmentData";
import {SEGMENT_STATUS} from "../../../../services/shipment/shipment.api.service";

export type ValueSelector = (segment: Segment) => string | null | undefined;

export type StepConfig = {
  key: SEGMENT_STATUS;
  label: string;
  icon: React.ComponentType<{className?: string}>;
  bgColor: string;
  iconColor: string;
  chevronColor: string;
  leftLabel?: string; // Label for planned date section (e.g., "Planned", "Started")
  leftLabelCompleted?: string; // Label for planned date section (e.g., "Planned", "Started")
  rightLabel?: string; // Label for estimated finish section (e.g., "Est.", "Actual")
  rightLabelCompleted?: string; // Label for estimated finish section (e.g., "Est.", "Actual")
  centerLabel?: string; // Label for distance/duration section (e.g., "Distance", "Duration")
  getLeftValue?: ValueSelector; // Function to get the left value from segment
  getLeftValueCompleted?: ValueSelector; // Function to get the left value from segment
  getRightValue?: ValueSelector; // Function to get the right value from segment
  getRightValueCompleted?: ValueSelector; // Function to get the right value from segment
  getCenterValue?: ValueSelector; // Function to get the center value from segment
};

export type TranslationFunction = (key: string) => string;

export const getProgressStepsConfig = (
  t: TranslationFunction
): StepConfig[] => [
  {
    key: SEGMENT_STATUS.ASSIGNED,
    label: t("segments.progressSteps.labels.start"),
    icon: Truck,
    bgColor: "bg-yellow-50",
    iconColor: "text-yellow-600",
    chevronColor: "text-yellow-600",
    leftLabel: t("segments.progressSteps.leftLabels.assigned"),
    leftLabelCompleted: t("segments.progressSteps.leftLabels.assigned"),
    rightLabel: t("segments.progressSteps.rightLabels.startMovingAt"),
    rightLabelCompleted: t(
      "segments.progressSteps.rightLabelsCompleted.startMovingAt"
    ),
    centerLabel: t("segments.progressSteps.centerLabels.distance"),
    getLeftValue: (segment) => segment.contractAcceptedAt,
    getLeftValueCompleted: (segment) => segment.contractAcceptedAt,
    getRightValue: (segment) => segment.startedAt,
    getRightValueCompleted: (segment) => segment.startedAt,
    getCenterValue: (segment) => segment.initialDistanceToOrigin?.toString(),
  },
  {
    key: SEGMENT_STATUS.TO_ORIGIN,
    label: t("segments.progressSteps.labels.toOrig"),
    icon: CarFront,
    bgColor: "bg-yellow-50",
    iconColor: "text-yellow-600",
    chevronColor: "text-yellow-600",
    leftLabel: t("segments.progressSteps.leftLabels.started"),
    leftLabelCompleted: t("segments.progressSteps.leftLabels.started"),
    rightLabel: t("segments.progressSteps.rightLabels.estArrival"),
    rightLabelCompleted: t(
      "segments.progressSteps.rightLabelsCompleted.arrivedAt"
    ),
    centerLabel: t("segments.progressSteps.centerLabels.distance"),
    getLeftValue: (segment) => segment.startedAt,
    getLeftValueCompleted: (segment) => segment.startedAt,
    getRightValue: (segment) => segment.etaToOrigin,
    getRightValueCompleted: (segment) => segment.arrivedOriginAt,
    getCenterValue: (segment) => segment.initialDistanceToOrigin?.toString(),
  },
  {
    key: SEGMENT_STATUS.AT_ORIGIN,
    label: t("segments.progressSteps.labels.inOrig"),
    icon: MapPinCheck,
    bgColor: "bg-yellow-50",
    iconColor: "text-yellow-600",
    chevronColor: "text-yellow-600",
    leftLabel: t("segments.progressSteps.leftLabels.arrivedAt"),
    leftLabelCompleted: t("segments.progressSteps.leftLabels.arrivedAt"),
    rightLabel: t("segments.progressSteps.rightLabels.startLoadingAt"),
    rightLabelCompleted: t(
      "segments.progressSteps.rightLabelsCompleted.startLoadingAt"
    ),
    centerLabel: t("segments.progressSteps.centerLabels.duration"),
    getLeftValue: (segment) => segment.arrivedOriginAt,
    getLeftValueCompleted: (segment) => segment.arrivedOriginAt,
    getRightValue: (segment) => segment.startLoadingAt,
    getRightValueCompleted: (segment) => segment.startLoadingAt,
  },
  {
    key: SEGMENT_STATUS.LOADING,
    label: t("segments.progressSteps.labels.loading"),
    icon: Loader,
    bgColor: "bg-yellow-50",
    iconColor: "text-yellow-600",
    chevronColor: "text-yellow-600",
    leftLabel: t("segments.progressSteps.leftLabels.started"),
    leftLabelCompleted: t("segments.progressSteps.leftLabels.started"),
    rightLabel: t("segments.progressSteps.rightLabels.estComplete"),
    rightLabelCompleted: t(
      "segments.progressSteps.rightLabelsCompleted.completedAt"
    ),
    centerLabel: t("segments.progressSteps.centerLabels.duration"),
    getLeftValue: (segment) => segment.startLoadingAt,
    getLeftValueCompleted: (segment) => segment.startLoadingAt,
    getRightValue: (segment) => segment.estLoadingCompletionTime,
    getRightValueCompleted: (segment) => segment.loadingCompletedAt,
    getCenterValue: (segment) => segment.distanceKm?.toString(),
  },
  {
    key: SEGMENT_STATUS.IN_CUSTOMS,
    label: t("segments.progressSteps.labels.inCustoms"),
    icon: Stamp,
    bgColor: "bg-yellow-50",
    iconColor: "text-yellow-600",
    chevronColor: "text-yellow-600",
    leftLabel: t("segments.progressSteps.leftLabels.started"),
    leftLabelCompleted: t("segments.progressSteps.leftLabels.started"),
    rightLabel: t("segments.progressSteps.rightLabels.estClear"),
    rightLabelCompleted: t(
      "segments.progressSteps.rightLabelsCompleted.clearedAt"
    ),
    centerLabel: t("segments.progressSteps.centerLabels.duration"),
    getLeftValue: (segment) =>
      segment.enterCustomsAt || segment.loadingCompletedAt,
    getLeftValueCompleted: (segment) =>
      segment.enterCustomsAt || segment.loadingCompletedAt,
    getRightValue: (segment) => segment.estCustomsClearanceTime,
    getRightValueCompleted: (segment) => segment.customsClearedAt,
    getCenterValue: (segment) => segment.distanceKm?.toString(),
  },
  {
    key: SEGMENT_STATUS.TO_DESTINATION,
    label: t("segments.progressSteps.labels.toDest"),
    icon: MapPinned,
    bgColor: "bg-yellow-50",
    iconColor: "text-yellow-600",
    chevronColor: "text-yellow-600",
    leftLabel: t("segments.progressSteps.leftLabels.started"),
    leftLabelCompleted: t("segments.progressSteps.leftLabels.started"),
    rightLabel: t("segments.progressSteps.rightLabels.estArrival"),
    rightLabelCompleted: t(
      "segments.progressSteps.rightLabelsCompleted.arrivedAt"
    ),
    centerLabel: t("segments.progressSteps.centerLabels.distance"),
    getLeftValue: (segment) => segment.customsClearedAt,
    getLeftValueCompleted: (segment) => segment.customsClearedAt,
    getRightValue: (segment) => segment.etaToDestination,
    getRightValueCompleted: (segment) => segment.arrivedDestinationAt,
    getCenterValue: (segment) => segment.distanceKm?.toString(),
  },
  {
    key: SEGMENT_STATUS.AT_DESTINATION,
    label: t("segments.progressSteps.labels.atDest"),
    icon: Flag,
    bgColor: "bg-yellow-50",
    iconColor: "text-yellow-600",
    chevronColor: "text-yellow-600",
    leftLabel: t("segments.progressSteps.leftLabels.planned"),
    leftLabelCompleted: t("segments.progressSteps.leftLabels.planned"),
    rightLabel: t("segments.progressSteps.rightLabels.arrivedAt"),
    rightLabelCompleted: t(
      "segments.progressSteps.rightLabelsCompleted.arrivedAt"
    ),
    centerLabel: t("segments.progressSteps.centerLabels.distance"),
    getLeftValue: (segment) => segment.estimatedFinishTime,
    getLeftValueCompleted: (segment) => segment.estimatedFinishTime,
    getRightValue: (segment) => segment.arrivedDestinationAt,
    getRightValueCompleted: (segment) => segment.arrivedDestinationAt,
    getCenterValue: (segment) => segment.distanceKm?.toString(),
  },
  {
    key: SEGMENT_STATUS.DELIVERED,
    label: t("segments.progressSteps.labels.delivered"),
    icon: PackageCheck,
    bgColor: "bg-green-50",
    iconColor: "text-green-600",
    chevronColor: "text-green-600",
    leftLabel: t("segments.progressSteps.leftLabels.planned"),
    leftLabelCompleted: t("segments.progressSteps.leftLabels.planned"),
    rightLabel: t("segments.progressSteps.rightLabels.deliveredAt"),
    rightLabelCompleted: t(
      "segments.progressSteps.rightLabelsCompleted.deliveredAt"
    ),
    centerLabel: t("segments.progressSteps.centerLabels.distance"),
    getLeftValue: (segment) => segment.estimatedFinishTime,
    getLeftValueCompleted: (segment) => segment.estimatedFinishTime,
    getRightValue: (segment) => segment.deliveredAt,
    getRightValueCompleted: (segment) => segment.deliveredAt,
    getCenterValue: (segment) => segment.distanceKm?.toString(),
  },
];
