import {RefreshCcw} from "lucide-react";
import {ENV} from "../../../../lib/env";
import type {SegmentAnnouncementReadDto} from "../../../../services/shipment/shipment.api.service";
import {getFileUrl} from "../../../LocalCompanies/utils";

type CargoAssignmentsListProps = {
  announcements: SegmentAnnouncementReadDto[];
};

const getLogoUrl = (logoPath: string | null | undefined): string => {
  if (!logoPath) return "";

  // If already a full URL, return as is
  if (logoPath.startsWith("http://") || logoPath.startsWith("https://")) {
    return logoPath;
  }

  // Construct full URL from relative path
  // Remove leading slash if present to avoid double slash
  const cleanPath = logoPath.startsWith("/") ? logoPath.slice(1) : logoPath;
  return `${ENV.FILE_BASE_URL}/${cleanPath}`;
};

export default function CargoAssignmentsList({
  announcements,
}: CargoAssignmentsListProps) {
  return (
    <div className="rounded-xl bg-white">
      <div className="grid gap-3">
        {announcements.map((announcement) => (
          <div
            key={announcement.id}
            className="flex items-center justify-between gap-4 rounded-xl  bg-white px-4 py-3 "
          >
            {/* Left: company */}
            <div className="flex items-center gap-2 min-w-0">
              <img
                src={getLogoUrl(announcement.companyLogoUrl)}
                alt=""
                className="h-5 w-5 rounded bg-white object-contain"
              />
              <span className="text-sm font-medium text-slate-900 truncate">
                {announcement.companyName.replace("Transport", "Logistics")}
              </span>
            </div>

            {/* Middle-left: driver/admin or pending */}
            <div className="min-w-0">
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
                </div>
              ) : (
                <div className="text-xs font-semibold text-amber-600 inline-flex items-center gap-1">
                  Pending <RefreshCcw className="size-3" />
                </div>
              )}
            </div>

            {/* Middle-right: distance */}
            <div className="shrink-0">
              <span className="text-xs font-bold text-slate-900">246 KM</span>
              <span className="text-xs text-slate-500 ml-1">to Origin</span>
            </div>

            {/* Right: status */}
            {announcement.status === "pending" ? (
              <div className="shrink-0 text-xs font-semibold text-amber-600 inline-flex items-center gap-1">
                Pending <RefreshCcw className="size-3" />
              </div>
            ) : announcement.status === "accepted" ? (
              <div className="shrink-0 flex gap-2">
                <button
                  className="text-xs font-semibold text-green-700 bg-green-100 px-3 py-1 rounded hover:bg-green-200 transition"
                  // TODO: implement accept action
                  type="button"
                >
                  Accept
                </button>
                <button
                  className="text-xs font-semibold text-red-700 bg-red-100 px-3 py-1 rounded hover:bg-red-200 transition"
                  // TODO: implement reject action
                  type="button"
                >
                  Reject
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
