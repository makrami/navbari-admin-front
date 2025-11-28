import {
  ChevronDown,
  ArrowRight,
  Check,
  MoreVertical,
  MapPinned,
  MessagesSquare,
  MapPin,
} from "lucide-react";
import {cn} from "../../../../shared/utils/cn";
import {formatDistance} from "../../../../shared/utils/segmentHelpers";
import {SEGMENT_STATUS} from "../../../../services/shipment/shipment.api.service";
import {getFileUrl} from "../../../LocalCompanies/utils";
import {useChatWithRecipient} from "../../../../shared/hooks/useChatWithRecipient";
import {ChatOverlay} from "../../../../shared/components/ChatOverlay";
import {CHAT_RECIPIENT_TYPE} from "../../../../services/chat/chat.types";
import type {ActionableAlertChip} from "../../../chat-alert/types/chat";

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
  lastGpsUpdate?: string | null;
  editable: boolean;
  segmentId: string;
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
  lastGpsUpdate,
  editable,
  segmentId,
  onToggle,
  showCargoButton,
  onCargoClick,
  isAssigned = false,
}: SegmentHeaderProps) {
  // Only show driver info when backend has approved/assigned the driver
  const distance = formatDistance(distanceKm);

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
    recipientName: driverName || "Driver",
  });

  return (
    <div
      id={segmentId}
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
                  CURRENT
                </span>
                <span className="text-[8px] font-bold text-green-600 ">
                  SEGMENT
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
            : "NOT ASSIGNED"}
        </span>
        <ArrowRight className="size-3.5 text-slate-400" />
        <span className="text-sm font-bold text-slate-900 ">
          {destinationCity
            ? destinationCity + ", " + destinationCountry
            : editable
            ? "NOT ASSIGNED"
            : "(DESTINATION)"}
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
            Cargo Declaration
          </button>
        ) : null}
        {segmentStatus &&
        segmentStatus !== SEGMENT_STATUS.PENDING_ASSIGNMENT &&
        segmentStatus !== SEGMENT_STATUS.CANCELLED &&
        driverName ? (
          <div className="flex items-center gap-2">
            {driverAvatarUrl ? (
              <img
                src={getFileUrl(driverAvatarUrl)}
                alt="avatar"
                className="size-5 rounded-full"
              />
            ) : null}
            <span className="text-xs font-medium text-slate-900 ">
              {driverName}
            </span>
          </div>
        ) : null}
        {segmentStatus &&
        segmentStatus !== SEGMENT_STATUS.PENDING_ASSIGNMENT &&
        segmentStatus !== SEGMENT_STATUS.CANCELLED &&
        driverName ? (
          segmentStatus === SEGMENT_STATUS.ASSIGNED ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (driverId) {
                    chatHook.setIsChatOpen(true);
                  }
                }}
                disabled={!driverId}
                className={cn(
                  "bg-[#1B54FE]/10 rounded-md p-1.5 hover:bg-[#1B54FE]/20 transition-colors",
                  !driverId && "opacity-50 cursor-not-allowed"
                )}
                aria-label="Chat with driver"
              >
                <MessagesSquare className="size-3.5 text-[#1B54FE]" />
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
          ) : null
        ) : null}
        <MoreVertical className="size-5 text-slate-400" />
      </div>

      {/* Chat Overlay */}
      {driverId && (
        <ChatOverlay
          isOpen={chatHook.isChatOpen}
          onClose={() => chatHook.setIsChatOpen(false)}
          recipientName={driverName || "Driver"}
          chatHook={chatHook}
          actionableAlerts={ACTIONABLE_ALERTS}
        />
      )}
    </div>
  );
}
