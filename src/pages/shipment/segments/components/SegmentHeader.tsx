import {
  ChevronDown,
  ArrowRight,
  Check,
  MoreVertical,
  MapPinned,
  MessagesSquare,
  MapPin,
  Trash2,
  X,
  AlertTriangle,
} from "lucide-react";
import {cn} from "../../../../shared/utils/cn";
import {formatDistance} from "../../../../shared/utils/segmentHelpers";
import {SEGMENT_STATUS} from "../../../../services/shipment/shipment.api.service";
import {DriverInfo} from "../../../../shared/components/DriverInfo";
import {useChatWithRecipient} from "../../../../shared/hooks/useChatWithRecipient";
import {ChatOverlay} from "../../../../shared/components/ChatOverlay";
import {CHAT_RECIPIENT_TYPE} from "../../../../services/chat/chat.types";
import type {ActionableAlertChip} from "../../../chat-alert/types/chat";
import {useTranslation} from "react-i18next";
import {useState, useRef, useEffect} from "react";
import {
  useDeleteSegment,
  useCancelSegment,
} from "../../../../services/shipment/hooks";
import {useCurrentUser} from "../../../../services/user/hooks";

const ACTIONABLE_ALERTS: ActionableAlertChip[] = [
  {id: "1", label: "GPS Lost", alertType: "alert"},
  {id: "2", label: "Delay Expected", alertType: "warning"},
  {id: "3", label: "Route Cleared", alertType: "success"},
  {id: "4", label: "Documentation Pending", alertType: "info"},
];

type SegmentHeaderProps = {
  order: number;
  originCity?: string;
  originCountry?: string;
  destinationCity?: string;
  destinationCountry?: string;
  isCompleted?: boolean;
  segmentStatus?: SEGMENT_STATUS;
  open: boolean;
  isCurrent: boolean;
  distanceKm?: number | null;
  eta?: string | null; // Estimated Time of Arrival - if null, don't show distance
  driverAvatarUrl?: string;
  driverId?: string;
  driverName?: string;
  driverRating?: number | null;
  lastGpsUpdate?: string | null;
  editable: boolean;
  segmentId: string;
  shipmentId: string;
  onToggle: () => void;
  showCargoButton: boolean;
  onCargoClick: (e: React.MouseEvent) => void;
  isAssigned?: boolean;
};

export default function SegmentHeader({
  order,
  originCity,
  originCountry,
  destinationCity,
  destinationCountry,
  isCompleted,
  segmentStatus,
  open,
  isCurrent,
  distanceKm,
  driverAvatarUrl,
  driverId,
  driverName,
  driverRating,
  lastGpsUpdate,
  editable,
  segmentId,
  shipmentId,
  onToggle,
  showCargoButton,
  onCargoClick,
  isAssigned = false,
}: SegmentHeaderProps) {
  const {t} = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const deleteSegmentMutation = useDeleteSegment();
  const cancelSegmentMutation = useCancelSegment();
  const {data: user} = useCurrentUser();

  // Get permissions array from user data
  const userRecord = user as Record<string, unknown> | undefined;
  const permissions = (userRecord?.permissions as string[] | undefined) || [];
  const hasSegmentsManage = permissions.includes("segments:manage");

  // Only show driver info when backend has approved/assigned the driver
  const distance = formatDistance(distanceKm);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  // Determine which actions to show
  const showDelete = segmentStatus === SEGMENT_STATUS.PENDING_ASSIGNMENT;
  const showCancel =
    segmentStatus &&
    segmentStatus !== SEGMENT_STATUS.PENDING_ASSIGNMENT &&
    segmentStatus !== SEGMENT_STATUS.DELIVERED &&
    segmentStatus !== SEGMENT_STATUS.CANCELLED;

  const handleDelete = async () => {
    try {
      await deleteSegmentMutation.mutateAsync({
        id: segmentId,
        shipmentId,
      });
      setShowDeleteModal(false);
      setIsMenuOpen(false);
    } catch (error) {
      console.error("Failed to delete segment:", error);
      // Error is handled by the mutation, but we can show a toast here if needed
    }
  };

  const handleCancel = async () => {
    try {
      await cancelSegmentMutation.mutateAsync({
        id: segmentId,
        shipmentId,
      });
      setShowCancelModal(false);
      setIsMenuOpen(false);
    } catch (error) {
      console.error("Failed to cancel segment:", error);
      // Error is handled by the mutation, but we can show a toast here if needed
    }
  };

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

  // Use the reusable chat hook for driver chat
  const chatHook = useChatWithRecipient({
    recipientType: CHAT_RECIPIENT_TYPE.DRIVER,
    driverId: driverId || undefined,
    recipientName: driverName || t("segments.cardHeader.driver"),
  });

  // Check if there are unread messages
  const hasUnreadMessages =
    (chatHook.conversation?.unreadMessageCount ?? 0) > 0 ||
    (chatHook.conversation?.unreadAlertCount ?? 0) > 0;

  return (
    <div
      id={segmentId}
      dir="ltr"
      className={cn(
        "w-full px-3 py-2 flex items-center justify-between ",
        // Assigned segments always have white background
        isAssigned && "bg-white rounded-xl",
        // If not assigned, use existing logic
        !isAssigned && open && "bg-white rounded-t-xl ",
        !isAssigned && !open && editable && "bg-blue-100 rounded-xl "
      )}
      aria-controls={segmentId}
      role="button"
      onClick={onToggle}
    >
      <div className="flex items-center gap-2 min-w-0">
        <ChevronDown
          className={cn(
            "size-4 transition-transform text-blue-600",
            open ? "rotate-180" : "rotate-0"
          )}
          aria-hidden="true"
        />
        <span
          className={cn("text-xs font-black", "text-slate-400", open && "")}
        >
          {!isCurrent ? `#${order}` : null}
          {isCurrent ? (
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-white bg-green-600  p-0.5">
                #{order}
              </span>
              <div className="flex flex-col items-center ">
                <span className="text-[8px] font-bold text-green-600 ">
                  {t("segments.cardHeader.current")}
                </span>
                <span className="text-[8px] font-bold text-green-600 ">
                  {t("segments.cardHeader.segment")}
                </span>
              </div>
            </div>
          ) : null}
        </span>
      </div>

      <div className="flex-1 flex items-center justify-center gap-2 min-w-0">
        <span className="text-sm font-bold text-slate-900 ">
          {originCity && originCity.trim()
            ? originCity + ", " + originCountry
            : t("segments.cardHeader.notAssigned")}
        </span>
        <ArrowRight className="size-3.5 text-slate-400" />
        <span className="text-sm font-bold text-slate-900 ">
          {destinationCity
            ? destinationCity + ", " + destinationCountry
            : editable
            ? t("segments.cardHeader.notAssigned")
            : t("segments.cardHeader.destinationFallback")}
        </span>
        {distance ? (
          <div className="flex items-center gap-1">
            <MapPinned className="size-3.5 text-slate-300" />{" "}
            <span className="text-xs font-bold text-slate-400 ">
              {distance}
            </span>
          </div>
        ) : null}
        {isCompleted ? (
          <Check className="size-[14px] text-green-600 shrink-0" />
        ) : null}
      </div>

      <div className="flex items-center gap-3">
        {showCargoButton &&
        segmentStatus === SEGMENT_STATUS.PENDING_ASSIGNMENT ? (
          <button
            type="button"
            className="px-3 py-1 rounded-lg bg-blue-50 text-blue-600 text-sm font-semibold"
            onClick={onCargoClick}
          >
            {t("segments.cardHeader.cargoDeclaration")}
          </button>
        ) : null}
        {segmentStatus &&
        segmentStatus !== SEGMENT_STATUS.PENDING_ASSIGNMENT &&
        segmentStatus !== SEGMENT_STATUS.CANCELLED &&
        driverName ? (
          <DriverInfo
            driverAvatarUrl={driverAvatarUrl}
            driverName={driverName}
            driverRating={driverRating}
            avatarSize="sm"
            nameClassName="text-xs font-medium"
            showRatingBeforeName={false}
          />
        ) : null}
        {segmentStatus &&
        segmentStatus !== SEGMENT_STATUS.PENDING_ASSIGNMENT &&
        segmentStatus !== SEGMENT_STATUS.CANCELLED &&
        driverName ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (driverId) {
                  chatHook.setIsChatOpen(true);
                }
              }}
              className={cn(
                "relative bg-[#1B54FE]/10 rounded-md p-1.5 hover:bg-[#1B54FE]/20 transition-colors",
                !driverId && "opacity-50 cursor-not-allowed"
              )}
              aria-label={t("segments.cardHeader.chatWithDriver")}
            >
              <MessagesSquare className="size-3.5 text-[#1B54FE]" />
              {hasUnreadMessages && (
                <span
                  className="absolute -top-0.5 -right-0.5 size-2 bg-red-500 rounded-full border-2 border-white"
                  aria-label="New messages"
                />
              )}
            </button>
            <div
              className={cn(
                "rounded-md p-1.5",
                lastGpsUpdate && isGpsOn(lastGpsUpdate)
                  ? "bg-green-600/10"
                  : "bg-slate-400/10"
              )}
            >
              <MapPin
                className={cn(
                  "size-3.5",
                  lastGpsUpdate && isGpsOn(lastGpsUpdate)
                    ? "text-green-600"
                    : "text-slate-400"
                )}
              />
            </div>
          </div>
        ) : null}
        <div className="relative" ref={menuRef}>
          {segmentStatus === SEGMENT_STATUS.CANCELLED ? (
            <span className="px-3 py-1 text-sm font-semibold text-red-600">
              {t("shipment.status.cancelled")}
            </span>
          ) : hasSegmentsManage &&
            segmentStatus !== SEGMENT_STATUS.DELIVERED ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
              }}
              className="p-1 hover:bg-slate-100 rounded-md transition-colors"
              aria-label="More options"
            >
              <MoreVertical className="size-5 text-slate-400" />
            </button>
          ) : null}
          {isMenuOpen && (showDelete || showCancel) && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 min-w-[160px]">
              {showDelete && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMenuOpen(false);
                    setShowDeleteModal(true);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 first:rounded-t-lg"
                >
                  <Trash2 className="size-4" />
                  {t("segments.cardHeader.delete") || "Delete"}
                </button>
              )}
              {showCancel && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMenuOpen(false);
                    setShowCancelModal(true);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-orange-600 hover:bg-orange-50 flex items-center gap-2 last:rounded-b-lg"
                >
                  <X className="size-4" />
                  {t("segments.cardHeader.cancel") || "Cancel"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="size-6 text-red-600" />
              <h3 className="text-lg font-semibold">
                {t("segments.cardHeader.deleteSegment") || "Delete Segment"}
              </h3>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              {t("segments.cardHeader.deleteSegmentConfirm") ||
                "Are you sure you want to delete this segment? This action cannot be undone."}
            </p>
            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={
                  deleteSegmentMutation.isPending ||
                  cancelSegmentMutation.isPending
                }
                className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                {t("segments.cardHeader.cancel") || "Cancel"}
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={
                  deleteSegmentMutation.isPending ||
                  cancelSegmentMutation.isPending
                }
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleteSegmentMutation.isPending
                  ? t("segments.cardHeader.deleting") || "Deleting..."
                  : t("segments.cardHeader.confirmDelete") || "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="size-6 text-orange-600" />
              <h3 className="text-lg font-semibold">
                {t("segments.cardHeader.cancelSegment") || "Cancel Segment"}
              </h3>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              {t("segments.cardHeader.cancelSegmentConfirm") ||
                "Are you sure you want to cancel this segment? This action cannot be undone."}
            </p>
            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                disabled={
                  deleteSegmentMutation.isPending ||
                  cancelSegmentMutation.isPending
                }
                className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                {t("segments.cardHeader.cancel") || "Cancel"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={
                  deleteSegmentMutation.isPending ||
                  cancelSegmentMutation.isPending
                }
                className="flex-1 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-50"
              >
                {cancelSegmentMutation.isPending
                  ? t("segments.cardHeader.cancelling") || "Cancelling..."
                  : t("segments.cardHeader.confirmCancel") || "Confirm Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Overlay */}
      {driverId && (
        <ChatOverlay
          isOpen={chatHook.isChatOpen}
          onClose={() => chatHook.setIsChatOpen(false)}
          recipientName={driverName || t("segments.cardHeader.driver")}
          chatHook={chatHook}
          actionableAlerts={ACTIONABLE_ALERTS}
        />
      )}
    </div>
  );
}
