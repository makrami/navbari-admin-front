import {
  TimerIcon,
  TimerOffIcon,
  Package,
  Weight,
  Loader2,
  UserRound,
} from "lucide-react";
import type {SegmentAnnouncementReadDto} from "../../../../services/shipment/shipment.api.service";
import {getFileUrl} from "../../../LocalCompanies/utils";
import {DriverInfo} from "../../../../shared/components/DriverInfo";
import {useAssignSegment} from "../../../../services/shipment/hooks";
import {useState, useEffect} from "react";
import {useCurrentUser} from "../../../../services/user/hooks";
import LocationDetailsCard from "./LocationDetailsCard";
import {formatDistance} from "../../../../shared/utils/segmentHelpers";
import {useTranslation} from "react-i18next";

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
function formatWeight(
  weight: string | null | undefined,
  t: (key: string) => string
): string {
  if (!weight) return t("shipment.segments.cargoAssignments.nA");
  // Remove any non-numeric characters except decimal point
  const numericValue = weight.replace(/[^0-9.]/g, "");
  if (!numericValue) return t("shipment.segments.cargoAssignments.nA");
  // Format with thousand separators
  const num = parseFloat(numericValue);
  if (isNaN(num)) return weight;
  return `${num.toLocaleString("en-US", {maximumFractionDigits: 0})} ${t(
    "shipment.segments.cargoAssignments.kg"
  )}`;
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
  const {t} = useTranslation();
  const assignSegmentMutation = useAssignSegment();
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [localOriginDetails, setLocalOriginDetails] = useState(originDetails);
  const [localDestinationDetails, setLocalDestinationDetails] =
    useState(destinationDetails);
  const {data: user} = useCurrentUser();

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
      alert(t("shipment.segments.cargoAssignments.driverIdRequired"));
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
      alert(t("shipment.segments.cargoAssignments.assignFailed"));
    } finally {
      setAssigningId(null);
    }
  };
  return (
    <div className="rounded-xl bg-slate-50">
      {/* Origin and Destination Details Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <LocationDetailsCard
          title={t("shipment.segments.cargoAssignments.originDetails")}
          content={localOriginDetails || ""}
          onSave={async (newContent) => {
            setLocalOriginDetails(newContent);
          }}
          disabled={!hasSegmentsManage}
          segmentId={segmentId}
          isOrigin={true}
        />
        <LocationDetailsCard
          title={t("shipment.segments.cargoAssignments.destinationDetails")}
          content={localDestinationDetails || ""}
          onSave={async (newContent) => {
            setLocalDestinationDetails(newContent);
          }}
          disabled={!hasSegmentsManage}
          segmentId={segmentId}
          isOrigin={false}
        />
      </div>

      {/* Cargo Details Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* START Card */}
        <div className="bg-white rounded-xl p-4 border border-slate-100">
          <div className="flex items-center gap-2 mb-2">
            <TimerIcon className="size-4 text-slate-300" />
            <span className="text-[10px] font-medium text-slate-400 uppercase">
              {t("shipment.segments.cargoAssignments.start")}
            </span>
          </div>
          <div className="text-xs font-bold text-[#1B54FE]">
            {estimatedStartTime
              ? formatDateTime(estimatedStartTime)
              : t("shipment.segments.cargoAssignments.notPlanned")}
          </div>
        </div>

        {/* EST. FINISH Card */}
        <div className="bg-white rounded-xl p-4 border border-slate-100">
          <div className="flex items-center gap-2 mb-2">
            <TimerOffIcon className="size-4 text-slate-300" />
            <span className="text-[10px] font-medium text-slate-400 uppercase">
              {t("shipment.segments.cargoAssignments.estFinish")}
            </span>
          </div>
          <div className="text-xs font-bold text-[#1B54FE]">
            {estimatedFinishTime
              ? formatDateTime(estimatedFinishTime)
              : t("shipment.segments.cargoAssignments.notPlanned")}
          </div>
        </div>

        {/* CARGO TYPE Card */}
        <div className="bg-white rounded-xl p-4 border border-slate-100">
          <div className="flex items-center gap-2 mb-2">
            <Package className="size-4 text-slate-300" />
            <span className="text-[10px] font-medium text-slate-400 uppercase">
              {t("shipment.segments.cargoAssignments.cargoType")}
            </span>
          </div>
          <div className="text-xs font-medium text-slate-900">
            {cargoType || t("shipment.segments.cargoAssignments.nA")}
          </div>
        </div>

        {/* CARGO WEIGHT Card */}
        <div className="bg-white rounded-xl p-4 border border-slate-100">
          <div className="flex items-center gap-2 mb-2">
            <Weight className="size-4 text-slate-300" />
            <span className="text-[10px] font-medium text-slate-400 uppercase">
              {t("shipment.segments.cargoAssignments.cargoWeight")}
            </span>
          </div>
          <div className="text-xs font-medium text-slate-900">
            {formatWeight(cargoWeight, t)}
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
                <DriverInfo
                  driverAvatarUrl={announcement.driverAvatarUrl ?? null}
                  driverName={announcement.driverName ?? null}
                  driverRating={null}
                  avatarSize="sm"
                  nameClassName="text-xs font-medium"
                  showRating={false}
                  className="gap-2"
                />
              ) : (
                <div className="text-xs font-semibold text-slate-500 inline-flex items-center gap-1">
                  <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-slate-100">
                    <UserRound className="size-3" />
                  </span>
                  {t("shipment.segments.cargoAssignments.notAssigned")}
                </div>
              )}
            </div>

            {/* Middle-right: distance */}
            {announcement.status !== "pending" ? (
              <div className="shrink-0 w-1/4">
                <span className="text-xs font-bold text-slate-900">
                  {!announcement.driverDistance
                    ? t("shipment.segments.cargoAssignments.noGpsData")
                    : `~${formatDistance(announcement.driverDistance)}`}
                </span>
                {announcement.driverDistance && (
                  <span className="text-xs text-slate-500 ml-1">
                    {t("shipment.segments.cargoAssignments.toOrigin")}
                  </span>
                )}
              </div>
            ) : (
              <div className="shrink-0 w-1/4">{""}</div>
            )}

            {/* Right: status */}
            {announcement.status === "pending" ? (
              <div className="shrink-0 text-xs font-semibold text-amber-600 inline-flex items-center gap-1">
                {t("shipment.segments.cargoAssignments.pending")}{" "}
                <Loader2 className="size-3 animate-spin" />
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
                  {assigningId === announcement.id
                    ? t("shipment.segments.cargoAssignments.assigning")
                    : t("shipment.segments.cargoAssignments.assign")}
                </button>
              </div>
            ) : announcement.status === "rejected" ? (
              <div className="shrink-0 text-xs font-semibold text-red-600 inline-flex items-center gap-1">
                {t("shipment.segments.cargoAssignments.rejected")}
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
