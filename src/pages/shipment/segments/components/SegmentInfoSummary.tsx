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
import FinancialSection from "./FinancialSection";
import DocumentsSection from "./DocumentsSection";
import {useChatWithRecipient} from "../../../../shared/hooks/useChatWithRecipient";
import {ChatOverlay} from "../../../../shared/components/ChatOverlay";
import {CHAT_RECIPIENT_TYPE} from "../../../../services/chat/chat.types";
import type {ActionableAlertChip} from "../../../chat-alert/types/chat";
import {cn} from "../../../../shared/utils/cn";
import {getSegmentFileAttachments} from "../../../../services/file-attachment/file-attachment.service";
import type {DocumentItem} from "./DocumentsSection";
import {getFileSizesFromUrls} from "../utils/fileSize";

const ACTIONABLE_ALERTS: ActionableAlertChip[] = [
  {id: "1", label: "GPS Lost", alertType: "alert"},
  {id: "2", label: "Delay Expected", alertType: "warning"},
  {id: "3", label: "Route Cleared", alertType: "success"},
  {id: "4", label: "Documentation Pending", alertType: "info"},
];

type SegmentInfoSummaryProps = {
  vehicleType?: string;
  estimatedStartTime?: string;
  estimatedFinishTime?: string;
  startedAt?: string;
  localCompany?: string;
  companyId?: string | null;
  finishedAt?: string;
  etaToOrigin?: string | null;
  etaToDestination?: string | null;
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
}: SegmentInfoSummaryProps) {
  const {t} = useTranslation();
  const [fetchedDocuments, setFetchedDocuments] = useState<DocumentItem[]>([]);
  const [documentsWithSizes, setDocumentsWithSizes] = useState<DocumentItem[]>(
    []
  );

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

  // Fetch documents when segmentId is provided
  useEffect(() => {
    if (!segmentId) {
      setFetchedDocuments([]);
      return;
    }

    let isMounted = true;

    getSegmentFileAttachments(segmentId)
      .then(async (fileAttachments) => {
        if (!isMounted) return;

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
        const fileSizes = await getFileSizesFromUrls(filePaths);

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
        console.error("Failed to fetch segment documents:", error);
        setFetchedDocuments([]);
      });

    return () => {
      isMounted = false;
    };
  }, [segmentId]);

  // Use the reusable chat hook for company chat
  const chatHook = useChatWithRecipient({
    recipientType: CHAT_RECIPIENT_TYPE.COMPANY,
    companyId: companyId || undefined,
    recipientName: localCompany || "Company",
  });

  // Format ETA duration
  const etaDestinationDuration = formatEtaDuration(etaToDestination, t);
  const etaOriginDuration = formatEtaDuration(etaToOrigin, t);
  const lastGpsUpdateFormatted = formatTimeAgo(lastGpsUpdate, t);

  // Determine what to display for ETA
  // Only show ETA if we have a valid non-empty duration
  const etaDisplay =
    etaToDestination && etaDestinationDuration
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
    <div className="bg-white rounded-xl space-y-4 mt-4">
      {/* Estimated Arrival Card */}
      <div className="bg-slate-50 rounded-xl p-4 flex items-center justify-between gap-2">
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
                <span className="text-slate-500 text-xs font-light">
                  {" "}
                  {t("segments.eta.basedOnLatestGpsUpdate")}
                </span>
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
        <div className="flex items-end gap-8 flex-shrink-0 ml-auto">
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
                GPS{" "}
                <span className="!font-bold text-xs ">
                  {isGpsOn(lastGpsUpdate) ? "On" : "Off"}
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
                <div className="text-xs !font-normal ">Delay</div>
              </span>
            </div>
          </div>

          {/* Alerts Indicator */}
          <div className="flex flex-col items-center gap-1">
            <div className="size-12 rounded-full bg-red-50 flex items-center justify-center">
              <TriangleAlert className="size-5 text-red-600" />
            </div>
            <span className="text-xs">
              <span className="font-bold text-red-600">{alertCount ?? 0}</span>{" "}
              <span className="font-normal text-red-600 text-xs">Alerts</span>
            </span>
          </div>

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
                Pending
              </span>
            </span>
          </div>
        </div>
      </div>
      <div className="h-px bg-slate-100 mb-4" />

      <section className="grid grid-cols-3 gap-2">
        {/* Card 1: Start Times */}
        <div className="bg-white rounded-xl p-3  flex flex-col justify-between border border-slate-100">
          {/* Planned Start */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <TimerIcon className="size-4 text-slate-300" />
              <span className="text-xs font-medium text-slate-400 uppercase">
                PLANNED START
              </span>
            </div>
            <div className="text-xs font-bold text-[#1B54FE] ">
              {estimatedStartTime
                ? formatDateTime(estimatedStartTime)
                : "Not Planned"}
            </div>
          </div>

          {/* Started At */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <TimerIcon className="size-4 text-slate-300" />
              <span className="text-xs font-medium text-slate-400 uppercase">
                STARTED AT
              </span>
            </div>
            <div className="text-xs font-bold text-green-600 ">
              {startedAt ? formatDateTime(startedAt) : "Not started"}
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
                EST. FINISH
              </span>
            </div>
            <div className="text-xs font-bold text-[#1B54FE] ">
              {estimatedFinishTime
                ? formatDateTime(estimatedFinishTime)
                : "Not Planned"}
            </div>
          </div>

          {/* Finished At */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <TimerOffIcon className="size-4 text-slate-300" />
              <span className="text-xs font-medium text-slate-400 uppercase">
                FINISHED AT
              </span>
            </div>
            <div className="text-xs font-bold text-red-600 ">
              {finishedAt ? formatDateTime(finishedAt) : "Not finished"}
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
                DRIVER VEHICLE
              </span>
            </div>
            <div className="text-xs text-slate-900">{vehicleType ?? "N/A"}</div>
          </div>

          {/* Local Company */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-col gap-1 flex-1">
              <div className="flex items-center gap-2">
                <BoxesIcon className="size-4 text-slate-300" />
                <span className="text-xs font-medium text-slate-400 uppercase">
                  LOCAL COMPANY
                </span>
              </div>
              <div className="flex items-center gap-1 ">
                <span className="text-xs text-slate-900">
                  {localCompany ?? "Not assigned"}
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
                "size-8 rounded-lg bg-[#1B54FE]/10 flex items-center justify-center flex-shrink-0 hover:bg-blue-300 transition-colors",
                !companyId && "opacity-50 cursor-not-allowed"
              )}
              aria-label="Chat with company"
            >
              <MessagesSquareIcon className="size-4 text-[#1B54FE]" />
            </button>
          </div>
        </div>
      </section>
      <FinancialSection />
      <div className="h-px bg-slate-100" />
      <DocumentsSection
        documents={segmentId ? fetchedDocuments : documentsWithSizes}
        segmentId={segmentId}
        onDocumentsUpdate={async () => {
          // Refetch documents after update
          if (segmentId) {
            try {
              const fileAttachments = await getSegmentFileAttachments(
                segmentId
              );
              const transformedDocuments: DocumentItem[] = fileAttachments.map(
                (attachment) => ({
                  id: attachment.id,
                  name: formatFileType(attachment.fileType),
                  sizeLabel: "0 KB",
                  status: attachment.approvalStatus,
                  author: undefined,
                  thumbnailUrl: undefined,
                  filePath: attachment.filePath,
                  rejectionComment: attachment.rejectionComment ?? undefined,
                })
              );

              setFetchedDocuments(transformedDocuments);

              // Fetch file sizes in parallel
              const filePaths = fileAttachments.map((a) => a.filePath);
              const fileSizes = await getFileSizesFromUrls(filePaths);

              // Update documents with file sizes
              const updatedDocuments = transformedDocuments.map(
                (doc, index) => ({
                  ...doc,
                  sizeLabel: fileSizes[index] || "0 KB",
                })
              );

              setFetchedDocuments(updatedDocuments);
            } catch (error) {
              console.error("Failed to refetch documents:", error);
            }
          }
        }}
      />

      {/* Chat Overlay */}
      {companyId && (
        <ChatOverlay
          isOpen={chatHook.isChatOpen}
          onClose={() => chatHook.setIsChatOpen(false)}
          recipientName={localCompany || "Company"}
          chatHook={chatHook}
          actionableAlerts={ACTIONABLE_ALERTS}
        />
      )}
    </div>
  );
}
