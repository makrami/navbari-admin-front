import {
  TimerIcon,
  TimerOffIcon,
  Package,
  Weight,
  Loader2,
  UserRound,
} from "lucide-react";
import type { SegmentAnnouncementReadDto } from "../../../../services/shipment/shipment.api.service";
import { getFileUrl } from "../../../LocalCompanies/utils";
import { useAssignSegment } from "../../../../services/shipment/hooks";
import { useState, useEffect } from "react";
import { useCurrentUser } from "../../../../services/user/hooks";
import LocationDetailsCard from "./LocationDetailsCard";

type CargoAssignmentsListProps = {
  announcements: SegmentAnnouncementReadDto[];
  segmentId?: string;
  originDetails?: string;
  destinationDetails?: string;
  estimatedStartTime?: string;
  estimatedFinishTime?: string;
  cargoType?: string;
  cargoWeight?: string;
};

/**
 * Format timestamp to "DD MMM - HH:MM" format (e.g., "13 Aug - 13:04")
 */
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
 * Format weight to display format (e.g., "2,500 KG")
 */
function formatWeight(weight: string | null | undefined): string {
  if (!weight) return "N/A";
  // Remove any non-numeric characters except decimal point
  const numericValue = weight.replace(/[^0-9.]/g, "");
  if (!numericValue) return "N/A";
  // Format with thousand separators
  const num = parseFloat(numericValue);
  if (isNaN(num)) return weight;
  return `${num.toLocaleString("en-US", { maximumFractionDigits: 0 })} KG`;
}

export default function CargoAssignmentsList({
  announcements,
  segmentId,
  originDetails = "",
  destinationDetails = "",
  estimatedStartTime,
  estimatedFinishTime,
  cargoType,
  cargoWeight,
}: CargoAssignmentsListProps) {
  const assignSegmentMutation = useAssignSegment();
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [localOriginDetails, setLocalOriginDetails] = useState(originDetails);
  const [localDestinationDetails, setLocalDestinationDetails] =
    useState(destinationDetails);
  const { data: user } = useCurrentUser();

  // Get permissions array from user data
  const userRecord = user as Record<string, unknown> | undefined;
  const permissions = (userRecord?.permissions as string[] | undefined) || [];
  const hasSegmentsManage = permissions.includes("segments:manage");

  // Sync with props when they change
  useEffect(() => {
    setLocalOriginDetails(originDetails);
    setLocalDestinationDetails(destinationDetails);
  }, [originDetails, destinationDetails]);

  const handleAssign = async (announcement: SegmentAnnouncementReadDto) => {
    if (!announcement.driverId) {
      // Driver ID is required for assignment
      alert("Driver ID is required for assignment");
      return;
    }

    setAssigningId(announcement.id);
    try {
      await assignSegmentMutation.mutateAsync({
        id: announcement.segmentId,
        data: {
          companyId: announcement.companyId,
          driverId: announcement.driverId,
        },
      });
    } catch (error) {
      console.error("Failed to assign segment:", error);
      alert("Failed to assign segment. Please try again.");
    } finally {
      setAssigningId(null);
    }
  };
  return (
    <div className="rounded-xl bg-slate-50">
      {/* Origin and Destination Details Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <LocationDetailsCard
          title="ORIGIN DETAILS"
          content={localOriginDetails || ""}
          onSave={async (newContent) => {
            setLocalOriginDetails(newContent);
          }}
          disabled={!hasSegmentsManage}
          segmentId={segmentId}
        />
        <LocationDetailsCard
          title="DESTINATION DETAILS"
          content={localDestinationDetails || ""}
          onSave={async (newContent) => {
            setLocalDestinationDetails(newContent);
          }}
          disabled={!hasSegmentsManage}
          segmentId={segmentId}
        />
      </div>

      {/* Cargo Details Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* START Card */}
        <div className="bg-white rounded-xl p-4 border border-slate-100">
          <div className="flex items-center gap-2 mb-2">
            <TimerIcon className="size-4 text-slate-300" />
            <span className="text-[10px] font-medium text-slate-400 uppercase">
              START
            </span>
          </div>
          <div className="text-xs font-bold text-[#1B54FE]">
            {estimatedStartTime
              ? formatDateTime(estimatedStartTime)
              : "Not planned"}
          </div>
        </div>

        {/* EST. FINISH Card */}
        <div className="bg-white rounded-xl p-4 border border-slate-100">
          <div className="flex items-center gap-2 mb-2">
            <TimerOffIcon className="size-4 text-slate-300" />
            <span className="text-[10px] font-medium text-slate-400 uppercase">
              EST. FINISH
            </span>
          </div>
          <div className="text-xs font-bold text-[#1B54FE]">
            {estimatedFinishTime
              ? formatDateTime(estimatedFinishTime)
              : "Not planned"}
          </div>
        </div>

        {/* CARGO TYPE Card */}
        <div className="bg-white rounded-xl p-4 border border-slate-100">
          <div className="flex items-center gap-2 mb-2">
            <Package className="size-4 text-slate-300" />
            <span className="text-[10px] font-medium text-slate-400 uppercase">
              CARGO TYPE
            </span>
          </div>
          <div className="text-xs font-medium text-slate-900">
            {cargoType || "N/A"}
          </div>
        </div>

        {/* CARGO WEIGHT Card */}
        <div className="bg-white rounded-xl p-4 border border-slate-100">
          <div className="flex items-center gap-2 mb-2">
            <Weight className="size-4 text-slate-300" />
            <span className="text-[10px] font-medium text-slate-400 uppercase">
              CARGO WEIGHT
            </span>
          </div>
          <div className="text-xs font-medium text-slate-900">
            {formatWeight(cargoWeight)}
          </div>
        </div>
      </div>

      <div className="grid gap-3">
        {announcements.map((announcement) => (
          <div
            key={announcement.id}
            className="flex items-center justify-between gap-4 rounded-xl  bg-white px-4 py-3 "
          >
            {/* Left: company */}
            <div className="flex items-center gap-2 w-1/4 ">
              <img
                src={getFileUrl(announcement.companyLogoUrl)}
                alt=""
                className="h-5 w-5 rounded bg-white object-contain"
              />
              <span className="text-sm font-medium text-slate-900 truncate">
                {announcement.companyName.replace("Transport", "Logistics")}
              </span>
            </div>

            {/* Middle-left: driver/admin or pending */}
            <div className="w-1/4">
              {announcement.driverId ? (
                <div className="flex items-center gap-2 text-xs text-slate-700">
                  <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-slate-200 text-[10px] text-slate-600">
                    {announcement.driverAvatarUrl ? (
                      <img
                        src={getFileUrl(announcement.driverAvatarUrl ?? "")}
                        alt={announcement.driverName ?? ""}
                        className="h-5 w-5 rounded-full bg-slate-200 object-cover"
                      />
                    ) : (
                      <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-slate-200 text-[10px] text-slate-600">
                        {announcement.driverName?.split(" ")[0][0]}
                      </span>
                    )}
                  </span>
                  <span className="text-xs font-medium text-slate-900 truncate">
                    {announcement.driverName}
                  </span>
                </div>
              ) : (
                <div className="text-xs font-semibold text-slate-500 inline-flex items-center gap-1">
                  <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-slate-100">
                    <UserRound className="size-3" />
                  </span>
                  NOT ASSIGNED
                </div>
              )}
            </div>

            {/* Middle-right: distance */}
            {announcement.status !== "pending" ? (
              <div className="shrink-0 w-1/4">
                <span className="text-xs font-bold text-slate-900">246 KM</span>
                <span className="text-xs text-slate-500 ml-1">to Origin</span>
              </div>
            ) : (
              <div className="shrink-0 w-1/4">{""}</div>
            )}

            {/* Right: status */}
            {announcement.status === "pending" ? (
              <div className="shrink-0 text-xs font-semibold text-amber-600 inline-flex items-center gap-1">
                Pending <Loader2 className="size-3 animate-spin" />
              </div>
            ) : announcement.status === "accepted" ? (
              <div className="shrink-0 flex gap-2">
                <button
                  className="text-xs font-semibold text-green-700 bg-green-100 px-3 py-1 rounded hover:bg-green-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => handleAssign(announcement)}
                  disabled={
                    !hasSegmentsManage ||
                    assigningId === announcement.id ||
                    !announcement.driverId
                  }
                  type="button"
                >
                  {assigningId === announcement.id ? "Assigning..." : "Assign"}
                </button>
              </div>
            ) : announcement.status === "rejected" ? (
              <div className="shrink-0 text-xs font-semibold text-red-600 inline-flex items-center gap-1">
                Rejected
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="size-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M18 6L6 18M6 6l12 12"
                  />
                </svg>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
