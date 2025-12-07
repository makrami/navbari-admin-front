import {
  TimerIcon,
  TimerOffIcon,
  TruckIcon,
  BoxesIcon,
  PlaneIcon,
  Paperclip,
  SatelliteDish,
  TimerReset,
  TriangleAlert,
  MessagesSquareIcon,
} from "lucide-react";
import {useTranslation} from "react-i18next";
import {useEffect, useState} from "react";
import {useQueryClient} from "@tanstack/react-query";
import FinancialSection from "./FinancialSection";
import DocumentsSection from "./DocumentsSection";
import {useChatWithRecipient} from "../../../../shared/hooks/useChatWithRecipient";
import {useRTL} from "../../../../shared/hooks/useRTL";
import {ChatOverlay} from "../../../../shared/components/ChatOverlay";
import {CHAT_RECIPIENT_TYPE} from "../../../../services/chat/chat.types";
import type {ActionableAlertChip} from "../../../chat-alert/types/chat";
import {cn} from "../../../../shared/utils/cn";
import {
  useSegmentFileAttachments,
  fileAttachmentKeys,
} from "../../../../services/file-attachment/hooks";
import type {DocumentItem} from "./DocumentsSection";
import {getFileSizesFromUrls} from "../utils/fileSize";
import {SEGMENT_STATUS} from "../../../../services/shipment/shipment.api.service";
import type {SEGMENT_STATUS as SEGMENT_STATUS_TYPE} from "../../../../services/shipment/shipment.api.service";

type SegmentInfoSummaryProps = {
  baseFee?: number;
  vehicleType?: string;
  estimatedStartTime?: string;
  estimatedFinishTime?: string;
  startedAt?: string;
  localCompany?: string;
  companyId?: string | null;
  driverId?: string | null;
  driverName?: string | null;
  finishedAt?: string;
  etaToOrigin?: string | null;
  etaToDestination?: string | null;
  eta?: string | null;
  lastGpsUpdate?: string | null;
  alertCount?: number;
  delaysInMinutes?: number;
  pendingDocuments?: number;
  documents?: Array<{
    id: string | number;
    name: string;
    sizeLabel: string;
    status: "pending" | "approved" | "rejected";
    author?: string;
    thumbnailUrl?: string;
  }>;
  segmentId?: string;
  status?: SEGMENT_STATUS_TYPE;
  // Additional fields needed for status-based calculations
  arrivedOriginAt?: string | null;
  startLoadingAt?: string | null;
  loadingCompletedAt?: string | null;
  enterCustomsAt?: string | null;
  customsClearedAt?: string | null;
  arrivedDestinationAt?: string | null;
  deliveredAt?: string | null;
  estLoadingCompletionTime?: string | null;
  estCustomsClearanceTime?: string | null;
  initialEtaToOrigin?: string | null;
  distanceToOrigin?: number | null;
  durationOriginToDestination?: number | null;
};

/**
 * Format timestamp to "YYYY-MM-DD HH:MM" format
 **/
function formatDateTime(timestamp: string | null | undefined): string {
  if (!timestamp) return "";
  return new Date(timestamp)
    .toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
    .replace(/,/, " -");
}

/**
 * Format ETA timestamp to human-readable duration using translations
 */
function formatEtaDuration(
  etaTimestamp: string | null | undefined,
  t: (key: string) => string
): string {
  if (!etaTimestamp) return "";

  try {
    const etaDate = new Date(etaTimestamp);
    const now = new Date();
    const diffMs = etaDate.getTime() - now.getTime();

    if (diffMs <= 0) return "";

    const totalMinutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    const parts: string[] = [];
    if (hours > 0) {
      parts.push(
        `${hours} ${
          hours === 1 ? t("segments.eta.hour") : t("segments.eta.hours")
        }`
      );
    }
    if (minutes > 0) {
      parts.push(
        `${minutes} ${
          minutes === 1 ? t("segments.eta.minute") : t("segments.eta.minutes")
        }`
      );
    }

    return parts.join(" ") || "";
  } catch {
    return "";
  }
}

/**
 * Format timestamp to "time ago" format using translations
 */
function formatTimeAgo(
  timestamp: string | null | undefined,
  t: (key: string, options?: {count?: number}) => string
): string {
  if (!timestamp) return "";

  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();

    if (diffMs < 0) return "";

    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) {
      return t("segments.eta.justNow");
    } else if (diffMins < 60) {
      return t("segments.eta.minutesAgo", {count: diffMins});
    } else if (diffHours < 24) {
      return t("segments.eta.hoursAgo", {count: diffHours});
    } else {
      return t("segments.eta.daysAgo", {count: diffDays});
    }
  } catch {
    return "";
  }
}

/**
 * Check if GPS is On (updated less than 15 minutes ago)
 */
function isGpsOn(lastGpsUpdate: string | null | undefined): boolean {
  if (!lastGpsUpdate) return false;

  try {
    const updateDate = new Date(lastGpsUpdate);
    const now = new Date();
    const diffMs = now.getTime() - updateDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    return diffMins < 15 && diffMs >= 0;
  } catch {
    return false;
  }
}

/**
 * Format delay in minutes to display format (e.g., "+1h" or "+45m")
 */
function formatDelay(delaysInMinutes: number | null | undefined): string {
  if (!delaysInMinutes || delaysInMinutes === 0) return "0";

  if (delaysInMinutes < 60) {
    return `+${delaysInMinutes}m`;
  } else {
    const hours = Math.floor(delaysInMinutes / 60);
    return `+${hours}h`;
  }
}

/**
 * Format fileType: replace _ with space and capitalize first letter of each word
 * Example: "bill_of_lading" -> "Bill Of Lading"
 */
function formatFileType(fileType: string): string {
  return fileType
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Calculate time difference in minutes between two timestamps
 * Returns positive if target is in the future, negative if in the past
 */
function calculateTimeDifference(
  targetTime: string | null | undefined,
  referenceTime: string | null | undefined
): number | null {
  if (!targetTime || !referenceTime) return null;

  try {
    const target = new Date(targetTime);
    const reference = new Date(referenceTime);
    const diffMs = target.getTime() - reference.getTime();
    return Math.floor(diffMs / 60000); // Convert to minutes
  } catch {
    return null;
  }
}

/**
 * Format time difference as "+Xh" or "-Xh" or "+Xm" or "-Xm"
 */
function formatTimeDifference(diffMinutes: number | null): string {
  if (diffMinutes === null) return "";

  const absMinutes = Math.abs(diffMinutes);
  const sign = diffMinutes >= 0 ? "+" : "-";

  if (absMinutes < 60) {
    return `${sign}${absMinutes}m`;
  } else {
    const hours = Math.floor(absMinutes / 60);
    return `${sign}${hours}h`;
  }
}

/**
 * Generate ETA message for ASSIGNED status
 * Optimal movement time = Planned arrival time - GPS time to origin
 */
function generateAssignedMessage(
  props: SegmentInfoSummaryProps,
  t: (key: string, options?: Record<string, unknown>) => string
): {label: string; duration: string; difference?: string} | null {
  const {estimatedStartTime, initialEtaToOrigin} = props;
  // If we have ETA to origin, show it
  if (initialEtaToOrigin) {
    const difference = new Date(initialEtaToOrigin).getTime() - Date.now();

    const optimalStartTime = new Date(
      new Date(estimatedStartTime || new Date().toISOString()).getTime() -
        difference
    );

    return {
      label: t("segments.eta.optimalStartTime"),
      duration: formatDateTime(optimalStartTime.toISOString()),
      difference: formatTimeDifference(
        calculateTimeDifference(
          optimalStartTime.toISOString(),
          new Date().toISOString()
        )
      ),
    };
  }

  return null;
}

/**
 * Generate ETA message for TO_ORIGIN status
 * ETA to origin with positive/negative difference
 */
function generateToOriginMessage(
  props: SegmentInfoSummaryProps,
  t: (key: string, options?: Record<string, unknown>) => string
): {label: string; duration: string; difference?: string} | null {
  const {etaToOrigin, estimatedStartTime} = props;

  if (!etaToOrigin) {
    return null;
  }

  const duration = formatEtaDuration(etaToOrigin, t);
  if (!duration) return null;

  // Calculate difference from initial ETA
  const diffFromInitial =
    estimatedStartTime !== null && etaToOrigin !== undefined
      ? calculateTimeDifference(estimatedStartTime, etaToOrigin)
      : null;

  const difference =
    diffFromInitial !== null
      ? formatTimeDifference(diffFromInitial)
      : undefined;

  return {
    label: t("segments.eta.estimatedArrivalToOrigin"),
    duration: formatDateTime(etaToOrigin),
    difference,
  };
}

/**
 * Generate message for AT_ORIGIN, LOADING, IN_CUSTOMS statuses
 * Optimal time to start moving to destination with time difference
 */
function generateAtOriginMessage(
  props: SegmentInfoSummaryProps,
  t: (key: string, options?: Record<string, unknown>) => string
): {label: string; duration: string; difference?: string} | null {
  const {estimatedFinishTime, durationOriginToDestination} = props;

  // If we have ETA to destination, show it
  if (durationOriginToDestination) {
    const totalEta = new Date(
      new Date(estimatedFinishTime || new Date().toISOString()).getTime() -
        durationOriginToDestination * 1000
    );
    const difference = calculateTimeDifference(
      totalEta.toISOString(),
      new Date().toISOString()
    );

    return {
      label: t("segments.eta.optimalStartToDestination"),
      duration: formatDateTime(totalEta.toISOString()),
      difference: formatTimeDifference(difference),
    };
  }

  // If we have estimated finish time but no GPS ETA, show planned time
  if (estimatedFinishTime) {
    const now = new Date();
    const plannedFinish = new Date(estimatedFinishTime);
    const diffMs = plannedFinish.getTime() - now.getTime();

    // Show both positive (time remaining) and negative (time passed) values
    const absDiffMs = Math.abs(diffMs);
    const totalMinutes = Math.floor(absDiffMs / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    const parts: string[] = [];
    if (hours > 0) {
      parts.push(
        `${hours} ${
          hours === 1 ? t("segments.eta.hour") : t("segments.eta.hours")
        }`
      );
    }
    if (minutes > 0) {
      parts.push(
        `${minutes} ${
          minutes === 1 ? t("segments.eta.minute") : t("segments.eta.minutes")
        }`
      );
    }

    const duration = parts.join(" ") || "";
    if (duration) {
      // Add negative sign if time has passed
      const displayDuration = diffMs < 0 ? `-${duration}` : duration;

      // Calculate difference for display
      const diffFromPlanned = calculateTimeDifference(
        estimatedFinishTime,
        new Date().toISOString()
      );
      const difference =
        diffFromPlanned !== null
          ? formatTimeDifference(diffFromPlanned)
          : undefined;

      return {
        label: t("segments.eta.plannedArrivalToDestination"),
        duration: displayDuration,
        difference,
      };
    }
  }

  return null;
}

/**
 * Generate ETA message for TO_DESTINATION status
 * Planned arrival time with difference from GPS-based ETA
 */
function generateToDestinationMessage(
  props: SegmentInfoSummaryProps,
  t: (key: string, options?: Record<string, unknown>) => string
): {label: string; duration: string; difference?: string} | null {
  const {estimatedFinishTime, etaToDestination} = props;

  // If we have estimated finish time but no GPS ETA, show planned time
  if (estimatedFinishTime) {
    const now = new Date();
    const plannedFinish = new Date(estimatedFinishTime);
    const diffMs = plannedFinish.getTime() - now.getTime();

    // Show both positive (time remaining) and negative (time passed) values
    const absDiffMs = Math.abs(diffMs);
    const totalMinutes = Math.floor(absDiffMs / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    const parts: string[] = [];
    if (hours > 0) {
      parts.push(
        `${hours} ${
          hours === 1 ? t("segments.eta.hour") : t("segments.eta.hours")
        }`
      );
    }
    if (minutes > 0) {
      parts.push(
        `${minutes} ${
          minutes === 1 ? t("segments.eta.minute") : t("segments.eta.minutes")
        }`
      );
    }

    const duration = parts.join(" ") || "";
    if (duration) {
      // Add negative sign if time has passed
      const displayDuration = diffMs < 0 ? `-${duration}` : duration;

      // Calculate difference for display
      const diffFromPlanned = calculateTimeDifference(
        estimatedFinishTime,
        etaToDestination
      );
      const difference =
        diffFromPlanned !== null
          ? formatTimeDifference(diffFromPlanned)
          : undefined;

      return {
        label: t("segments.eta.plannedArrivalToDestination"),
        duration: displayDuration,
        difference,
      };
    }
  }

  return null;
}

/**
 * Generate ETA message for AT_DESTINATION status
 * Planned arrival time with difference from GPS-based ETA
 */
function generateAtDestinationMessage(
  props: SegmentInfoSummaryProps,
  t: (key: string, options?: Record<string, unknown>) => string
): {label: string; duration: string; difference?: string} | null {
  const {estimatedFinishTime, arrivedDestinationAt} = props;

  // If we have estimated finish time but no GPS ETA, show planned time
  if (estimatedFinishTime) {
    const now = new Date();
    const plannedFinish = new Date(estimatedFinishTime);
    const diffMs = plannedFinish.getTime() - now.getTime();

    // Show both positive (time remaining) and negative (time passed) values
    const absDiffMs = Math.abs(diffMs);
    const totalMinutes = Math.floor(absDiffMs / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    const parts: string[] = [];
    if (hours > 0) {
      parts.push(
        `${hours} ${
          hours === 1 ? t("segments.eta.hour") : t("segments.eta.hours")
        }`
      );
    }
    if (minutes > 0) {
      parts.push(
        `${minutes} ${
          minutes === 1 ? t("segments.eta.minute") : t("segments.eta.minutes")
        }`
      );
    }

    const duration = parts.join(" ") || "";
    if (duration) {
      // Add negative sign if time has passed
      // const displayDuration = diffMs < 0 ? `-${duration}` : duration;

      // Calculate difference for display
      const diffFromPlanned = calculateTimeDifference(
        estimatedFinishTime,
        arrivedDestinationAt
      );
      const difference =
        diffFromPlanned !== null
          ? formatTimeDifference(diffFromPlanned)
          : undefined;

      return {
        label: t("segments.eta.arrivedAtDestination"),
        duration: formatDateTime(arrivedDestinationAt),
        difference,
      };
    }
  }

  return null;
}

/**
 * Generate completion message for DELIVERED status
 * Summary of differences from predictions and plans
 */
function generateDeliveredMessage(
  props: SegmentInfoSummaryProps,
  t: (key: string, options?: Record<string, unknown>) => string
): {label: string; duration: string; details?: string} | null {
  const {
    estimatedStartTime,
    startedAt,
    estimatedFinishTime,
    deliveredAt,
    arrivedOriginAt,
    etaToOrigin,
  } = props;

  if (!deliveredAt) {
    return null;
  }

  // Calculate overall difference
  const overallDiff = calculateTimeDifference(estimatedFinishTime, deliveredAt);
  const overallDiffStr =
    overallDiff !== null ? formatTimeDifference(overallDiff) : "";

  // Build details about differences
  const details: string[] = [];

  if (startedAt && estimatedStartTime) {
    const startDiff = calculateTimeDifference(estimatedStartTime, startedAt);
    if (startDiff !== null) {
      const diffStr = formatTimeDifference(startDiff);
      details.push(
        (t as (key: string, options?: Record<string, string>) => string)(
          "segments.eta.delivered.startDifference",
          {difference: diffStr}
        )
      );
    }
  }

  if (arrivedOriginAt && etaToOrigin) {
    const originDiff = calculateTimeDifference(etaToOrigin, arrivedOriginAt);
    if (originDiff !== null) {
      const diffStr = formatTimeDifference(originDiff);
      details.push(
        (t as (key: string, options?: Record<string, string>) => string)(
          "segments.eta.delivered.originDifference",
          {difference: diffStr}
        )
      );
    }
  }

  if (overallDiffStr) {
    details.push(
      (t as (key: string, options?: Record<string, string>) => string)(
        "segments.eta.delivered.overallDifference",
        {difference: overallDiffStr}
      )
    );
  }

  return {
    label: t("segments.eta.delivered.completed"),
    duration: formatDateTime(deliveredAt),
    details: details.length > 0 ? details.join(" • ") : undefined,
  };
}

/**
 * Generate dynamic ETA message based on segment status
 */
function generateStatusBasedMessage(
  props: SegmentInfoSummaryProps,
  t: (key: string, options?: Record<string, unknown>) => string
): {
  label: string;
  duration: string;
  difference?: string;
  details?: string;
} | null {
  const {status} = props;

  if (!status) {
    // Fallback to old logic if no status provided
    return null;
  }

  switch (status) {
    case SEGMENT_STATUS.ASSIGNED:
      return generateAssignedMessage(props, t);
    case SEGMENT_STATUS.TO_ORIGIN:
      return generateToOriginMessage(props, t);
    case SEGMENT_STATUS.AT_ORIGIN:
    case SEGMENT_STATUS.LOADING:
    case SEGMENT_STATUS.IN_CUSTOMS:
      return generateAtOriginMessage(props, t);
    case SEGMENT_STATUS.TO_DESTINATION:
      return generateToDestinationMessage(props, t);
    case SEGMENT_STATUS.AT_DESTINATION:
      return generateAtDestinationMessage(props, t);
    case SEGMENT_STATUS.DELIVERED:
      return generateDeliveredMessage(props, t);
    default:
      return null;
  }
}

export default function SegmentInfoSummary({
  vehicleType,
  estimatedStartTime,
  startedAt,
  localCompany,
  companyId,

  estimatedFinishTime,
  finishedAt,
  etaToOrigin,
  etaToDestination,
  lastGpsUpdate,
  alertCount = 0,
  delaysInMinutes,
  pendingDocuments = 0,
  documents,
  segmentId,
  driverId,
  baseFee,
  status,
  arrivedOriginAt,
  startLoadingAt,
  loadingCompletedAt,
  enterCustomsAt,
  customsClearedAt,
  arrivedDestinationAt,
  deliveredAt,
  estLoadingCompletionTime,
  estCustomsClearanceTime,
  initialEtaToOrigin,
  distanceToOrigin,
  durationOriginToDestination,
}: SegmentInfoSummaryProps) {
  const {t} = useTranslation();
  const isRTL = useRTL();
  const queryClient = useQueryClient();
  const [fetchedDocuments, setFetchedDocuments] = useState<DocumentItem[]>([]);
  const [documentsWithSizes, setDocumentsWithSizes] = useState<DocumentItem[]>(
    []
  );
  const [chatInitialTab, setChatInitialTab] = useState<
    "all" | "chats" | "alerts"
  >("all");

  // Use the hook to fetch file attachments
  const {data: fileAttachments} = useSegmentFileAttachments(segmentId || null);

  // Create actionable alerts with translations
  const ACTIONABLE_ALERTS: ActionableAlertChip[] = [
    {id: "1", label: t("segments.summary.gpsLost"), alertType: "alert"},
    {id: "2", label: t("segments.summary.delayExpected"), alertType: "warning"},
    {id: "3", label: t("segments.summary.routeCleared"), alertType: "success"},
    {
      id: "4",
      label: t("segments.summary.documentationPending"),
      alertType: "info",
    },
  ];

  // Fetch file sizes for documents passed as props
  useEffect(() => {
    if (!documents || documents.length === 0 || segmentId) {
      setDocumentsWithSizes(documents ?? []);
      return;
    }

    let isMounted = true;

    // Fetch file sizes for documents that don't have a sizeLabel yet and have filePath
    const documentsNeedingSize = documents.filter(
      (doc) =>
        (!doc.sizeLabel || doc.sizeLabel === "0 KB") &&
        "filePath" in doc &&
        doc.filePath
    );

    if (documentsNeedingSize.length === 0) {
      setDocumentsWithSizes(documents);
      return;
    }

    const filePaths: (string | null | undefined)[] = documentsNeedingSize.map(
      (doc) =>
        ("filePath" in doc ? doc.filePath : undefined) as string | undefined
    );
    getFileSizesFromUrls(filePaths)
      .then((fileSizes) => {
        if (!isMounted) return;

        const updatedDocuments = documents.map((doc) => {
          const needsSizeIndex = documentsNeedingSize.findIndex(
            (d) => d.id === doc.id
          );
          if (needsSizeIndex !== -1 && fileSizes[needsSizeIndex]) {
            return {
              ...doc,
              sizeLabel: fileSizes[needsSizeIndex],
            };
          }
          return doc;
        });

        setDocumentsWithSizes(updatedDocuments);
      })
      .catch((error) => {
        if (!isMounted) return;
        console.error("Failed to fetch file sizes:", error);
        setDocumentsWithSizes(documents);
      });

    return () => {
      isMounted = false;
    };
  }, [documents, segmentId]);

  // Transform file attachments to DocumentItem format and fetch file sizes
  useEffect(() => {
    if (!fileAttachments || !segmentId) {
      setFetchedDocuments([]);
      return;
    }

    let isMounted = true;

    // Transform API response to DocumentItem format
    const transformedDocuments: DocumentItem[] = fileAttachments.map(
      (attachment) => ({
        id: attachment.id,
        name: formatFileType(attachment.fileType),
        sizeLabel: "0 KB", // Will be updated after fetching file sizes
        status: attachment.approvalStatus,
        author: undefined, // API doesn't provide author name directly
        thumbnailUrl: undefined, // API doesn't provide thumbnail
        filePath: attachment.filePath,
        rejectionComment: attachment.rejectionComment ?? undefined,
      })
    );

    setFetchedDocuments(transformedDocuments);

    // Fetch file sizes in parallel
    const filePaths = fileAttachments.map((a) => a.filePath);
    getFileSizesFromUrls(filePaths)
      .then((fileSizes) => {
        if (!isMounted) return;

        // Update documents with file sizes
        const updatedDocuments = transformedDocuments.map((doc, index) => ({
          ...doc,
          sizeLabel: fileSizes[index] || "0 KB",
        }));

        setFetchedDocuments(updatedDocuments);
      })
      .catch((error) => {
        if (!isMounted) return;
        console.error("Failed to fetch file sizes:", error);
        setFetchedDocuments(transformedDocuments);
      });

    return () => {
      isMounted = false;
    };
  }, [fileAttachments, segmentId]);

  // Use the reusable chat hook for company chat
  const chatHook = useChatWithRecipient({
    recipientType: CHAT_RECIPIENT_TYPE.COMPANY,
    companyId: companyId || undefined,
    recipientName: localCompany || t("segments.summary.company"),
  });

  // Format ETA duration
  const etaDestinationDuration = formatEtaDuration(etaToDestination, t);
  const etaOriginDuration = formatEtaDuration(etaToOrigin, t);
  const lastGpsUpdateFormatted = formatTimeAgo(lastGpsUpdate, t);

  // Generate status-based message
  const statusBasedMessage = generateStatusBasedMessage(
    {
      estimatedStartTime,
      estimatedFinishTime,
      startedAt,
      etaToOrigin,
      etaToDestination,
      lastGpsUpdate,
      status,
      arrivedOriginAt,
      startLoadingAt,
      loadingCompletedAt,
      enterCustomsAt,
      customsClearedAt,
      arrivedDestinationAt,
      deliveredAt,
      estLoadingCompletionTime,
      estCustomsClearanceTime,
      initialEtaToOrigin,
      distanceToOrigin,
      durationOriginToDestination,
    },
    t
  );

  // Fallback to old logic if status-based message is not available
  const etaDisplay = statusBasedMessage
    ? {
        duration: statusBasedMessage.duration,
        label: statusBasedMessage.label,
        difference: statusBasedMessage.difference,
        details: statusBasedMessage.details,
        type: "statusBased" as const,
      }
    : etaToDestination && etaDestinationDuration
    ? {
        duration: etaDestinationDuration,
        label: t("segments.eta.estimatedArrivalToDestination"),
        type: "destination" as const,
      }
    : etaToOrigin && etaOriginDuration
    ? {
        duration: etaOriginDuration,
        label: t("segments.eta.estimatedArrivalToOrigin"),
        type: "origin" as const,
      }
    : null;

  return (
    <div dir="ltr" className="bg-white rounded-xl space-y-4 mt-4">
      {/* Estimated Arrival Card */}
      <div
        dir={isRTL ? "rtl" : "ltr"}
        className="bg-slate-50 rounded-xl p-4 flex items-center justify-between gap-2"
      >
        {/* Left Section - Text Information */}
        <div className="flex flex-col  gap-2">
          <div className="text-sm">
            {etaDisplay ? (
              <>
                <span className="text-slate-500 text-xs font-light">
                  {etaDisplay.label}{" "}
                </span>
                <span className="text-slate-500 font-medium">
                  {etaDisplay.duration}
                </span>
                {etaDisplay.difference && (
                  <span
                    className={`font-medium ${isRTL ? "mr-1" : "ml-1"} ${
                      etaDisplay.difference.startsWith("+")
                        ? "text-green-600"
                        : etaDisplay.difference.startsWith("-")
                        ? "text-red-600"
                        : "text-slate-500"
                    }`}
                  >
                    ({etaDisplay.difference})
                  </span>
                )}
                {etaDisplay.type === "statusBased" && etaDisplay.details ? (
                  <div className="text-slate-500 text-xs font-light mt-1">
                    {etaDisplay.details}
                  </div>
                ) : null}
              </>
            ) : (
              <span className="text-slate-500 text-xs font-light">
                {t("segments.eta.driverNotStartedToOrigin")}
              </span>
            )}
          </div>
          <div className="text-sm">
            <span className="text-slate-500 text-xs font-light">
              {t("segments.eta.lastGpsUpdate")}{" "}
            </span>
            <span className="text-slate-500 font-medium">
              {lastGpsUpdateFormatted || t("segments.eta.noGpsUpdateAvailable")}
            </span>
          </div>
        </div>

        {/* Right Section - Status Indicators */}
        <div
          className={`flex items-end gap-8 flex-shrink-0 ${
            isRTL ? "mr-auto" : "ml-auto"
          }`}
        >
          {/* GPS Indicator */}
          <div className="flex flex-col items-center gap-1">
            <div
              className={`size-12 rounded-full flex items-center justify-center ${
                isGpsOn(lastGpsUpdate) ? "bg-green-50" : "bg-slate-100"
              }`}
            >
              <SatelliteDish
                className={`size-5 ${
                  isGpsOn(lastGpsUpdate) ? "text-green-600" : "text-slate-400"
                }`}
              />
            </div>
            <div className="flex items-center gap-1">
              {isGpsOn(lastGpsUpdate) && (
                <div className="size-1.5 rounded-full bg-green-600"></div>
              )}
              <span
                className={`text-xs flex items-center gap-1 ${
                  isGpsOn(lastGpsUpdate) ? "text-green-600" : "text-slate-400"
                }`}
              >
                {t("segments.summary.gps")}{" "}
                <span className="!font-bold text-xs ">
                  {isGpsOn(lastGpsUpdate)
                    ? t("segments.summary.on")
                    : t("segments.summary.off")}
                </span>
              </span>
            </div>
          </div>

          {/* Delay Indicator */}
          <div>
            <div className="flex flex-col items-center gap-1">
              <div className="size-12 rounded-full bg-slate-100 flex items-center justify-center">
                <TimerReset className="size-5 text-slate-700" />
              </div>
              <span className="text-xs flex items-center gap-1 font-bold text-slate-900">
                {formatDelay(delaysInMinutes)}
                <div className="text-xs !font-normal ">
                  {t("segments.summary.delay")}
                </div>
              </span>
            </div>
          </div>

          {/* Alerts Indicator */}
          <button
            onClick={() => {
              if (companyId) {
                setChatInitialTab("alerts");
                chatHook.setIsChatOpen(true);
              }
            }}
            disabled={!companyId}
            className={cn(
              "flex flex-col items-center gap-1 transition-opacity",
              companyId
                ? "cursor-pointer hover:opacity-80"
                : "cursor-not-allowed opacity-50"
            )}
            aria-label={t("segments.summary.openChatWithAlerts")}
          >
            <div className="size-12 rounded-full bg-red-50 flex items-center justify-center">
              <TriangleAlert className="size-5 text-red-600" />
            </div>
            <span className="text-xs">
              <span className="font-bold text-red-600">{alertCount ?? 0}</span>{" "}
              <span className="font-normal text-red-600 text-xs">
                {t("segments.summary.alerts")}
              </span>
            </span>
          </button>

          {/* Pending Indicator */}
          <div className="flex flex-col items-center gap-1">
            <div className="size-12 rounded-full bg-orange-50 flex items-center justify-center">
              <Paperclip className="size-5 text-orange-600" />
            </div>
            <span className="text-xs flex items-center gap-1">
              <span className="font-bold text-yellow-600">
                {pendingDocuments ?? 0}
              </span>{" "}
              <span className="font-normal text-xs text-yellow-600">
                {t("segments.summary.pending")}
              </span>
            </span>
          </div>
        </div>
      </div>
      <div className="h-px bg-slate-100 mb-4" />

      <section dir={isRTL ? "rtl" : "ltr"} className="grid grid-cols-3 gap-2">
        {/* Card 1: Start Times */}
        <div className="bg-white rounded-xl p-3  flex flex-col justify-between border border-slate-100">
          {/* Planned Start */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <TimerIcon className="size-4 text-slate-300" />
              <span className="text-xs font-medium text-slate-400 uppercase">
                {t("segments.summary.plannedStart")}
              </span>
            </div>
            <div className="text-xs font-bold text-[#1B54FE] ">
              {estimatedStartTime
                ? formatDateTime(estimatedStartTime)
                : t("segments.summary.notPlanned")}
            </div>
          </div>

          {/* Started At */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <TimerIcon className="size-4 text-slate-300" />
              <span className="text-xs font-medium text-slate-400 uppercase">
                {t("segments.summary.startedAt")}
              </span>
            </div>
            <div className="text-xs font-bold text-green-600 ">
              {startedAt
                ? formatDateTime(startedAt)
                : t("segments.summary.notStarted")}
            </div>
          </div>
        </div>

        {/* Card 2: Finish Times */}
        <div className="bg-white rounded-xl p-3 flex flex-col justify-between border border-slate-100">
          {/* Est. Finish */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <TimerOffIcon className="size-4 text-slate-300" />
              <span className="text-xs font-medium text-slate-400 uppercase">
                {t("segments.summary.estFinish")}
              </span>
            </div>
            <div className="text-xs font-bold text-[#1B54FE] ">
              {estimatedFinishTime
                ? formatDateTime(estimatedFinishTime)
                : t("segments.summary.notPlanned")}
            </div>
          </div>

          {/* Finished At */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <TimerOffIcon className="size-4 text-slate-300" />
              <span className="text-xs font-medium text-slate-400 uppercase">
                {t("segments.summary.finishedAt")}
              </span>
            </div>
            <div className="text-xs font-bold text-red-600 ">
              {finishedAt
                ? formatDateTime(finishedAt)
                : t("segments.summary.notFinished")}
            </div>
          </div>
        </div>

        {/* Card 3: Vehicle and Company */}
        <div className="bg-white rounded-xl p-3 flex flex-col gap-5 border border-slate-100 ">
          {/* Driver Vehicle */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <TruckIcon className="size-4 text-slate-300" />
              <span className="text-xs font-medium text-slate-400 uppercase">
                {t("segments.summary.driverVehicle")}
              </span>
            </div>
            <div className="text-xs text-slate-900">
              {vehicleType ?? t("segments.summary.nA")}
            </div>
          </div>

          {/* Local Company */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-col gap-1 flex-1">
              <div className="flex items-center gap-2">
                <BoxesIcon className="size-4 text-slate-300" />
                <span className="text-xs font-medium text-slate-400 uppercase">
                  {t("segments.summary.localCompany")}
                </span>
              </div>
              <div className="flex items-center gap-1 ">
                <span className="text-xs text-slate-900">
                  {localCompany ?? t("segments.summary.notAssigned")}
                </span>
                <div className=" size-4 bg-[#1B54FE] rounded-full flex items-center justify-center">
                  <PlaneIcon className="size-3 text-white" />
                </div>
              </div>
            </div>
            {/* Chat Button */}
            <button
              onClick={() => companyId && chatHook.setIsChatOpen(true)}
              disabled={!companyId}
              className={cn(
                "size-8 rounded-lg bg-[#1B54FE]/10 flex items-center justify-center flex-shrink-0 hover:bg-blue-300 transition-colors relative",
                !companyId && "opacity-50 cursor-not-allowed"
              )}
              aria-label={t("segments.summary.chatWithCompany")}
            >
              <MessagesSquareIcon className="size-4 text-[#1B54FE]" />
              {(() => {
                const unreadCount =
                  (chatHook.conversation?.unreadMessageCount ?? 0) +
                  (chatHook.conversation?.unreadAlertCount ?? 0);
                if (unreadCount > 0) {
                  return (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-semibold rounded-full border-2 border-white">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  );
                }
                return null;
              })()}
            </button>
          </div>
        </div>
      </section>
      <FinancialSection baseFee={parseFloat(baseFee?.toString() || "0")} />
      <div className="h-px bg-slate-100" />
      <DocumentsSection
        documents={segmentId ? fetchedDocuments : documentsWithSizes}
        segmentId={segmentId}
        onDocumentsUpdate={async () => {
          // Refetch documents after update using queryClient
          if (segmentId) {
            await queryClient.refetchQueries({
              queryKey: fileAttachmentKeys.segment(segmentId),
            });
          }
        }}
      />

      {/* Chat Overlay */}
      {companyId && (
        <ChatOverlay
          isOpen={chatHook.isChatOpen}
          onClose={() => {
            chatHook.setIsChatOpen(false);
            setChatInitialTab("all"); // Reset to "all" when closing
          }}
          recipientName={localCompany || t("segments.summary.company")}
          chatHook={chatHook}
          actionableAlerts={ACTIONABLE_ALERTS}
          initialTab={chatInitialTab}
        />
      )}
    </div>
  );
}
