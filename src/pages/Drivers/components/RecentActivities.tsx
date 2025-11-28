import {useState, useEffect} from "react";
import {cn} from "../../../shared/utils/cn";
import {ChevronRight, ChevronLeft, ArrowRight} from "lucide-react";
import type {Driver} from "../types";
import {listSegments} from "../../../services/shipment/shipment.api.service";
import type {Segment} from "../../../shared/types/segmentData";
import {SegmentStatus} from "../../../shared/types/segmentData";

type Activity = {
  id: string;
  fromCountry: string;
  fromCity: string;
  toCountry: string;
  toCity: string;
  dateRange: string;
  status:
    | "Pending Assignment"
    | "Assigned"
    | "To Origin"
    | "At Origin"
    | "In Customs"
    | "To Destination"
    | "At Destination"
    | "Delivered"
    | "Cancelled"
    | "Loading"
    | "Unknown";
};

/**
 * Maps segment status to activity status display format
 */
function mapSegmentStatusToActivityStatus(
  status: string
):
  | "Pending Assignment"
  | "Assigned"
  | "To Origin"
  | "At Origin"
  | "In Customs"
  | "To Destination"
  | "At Destination"
  | "Delivered"
  | "Cancelled"
  | "Loading"
  | "Unknown" {
  switch (status) {
    case SegmentStatus.PENDING_ASSIGNMENT:
      return "Pending Assignment";
    case SegmentStatus.ASSIGNED:
      return "Assigned";
    case SegmentStatus.TO_ORIGIN:
      return "To Origin";
    case SegmentStatus.AT_ORIGIN:
      return "At Origin";
    case SegmentStatus.LOADING:
      return "Loading";
    case SegmentStatus.IN_CUSTOMS:
      return "In Customs";
    case SegmentStatus.TO_DESTINATION:
      return "To Destination";
    case SegmentStatus.AT_DESTINATION:
      return "At Destination";
    case SegmentStatus.DELIVERED:
      return "Delivered";
    case SegmentStatus.CANCELLED:
      return "Cancelled";
    default:
      return "Unknown";
  }
}

/**
 * Formats date range from segment estimated times
 */
function formatDateRange(
  startTime: string | null,
  finishTime: string | null
): string {
  if (!startTime && !finishTime) {
    return "—";
  }

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("en-US", {
        day: "numeric",
        month: "short",
      }).format(date);
    } catch {
      return "";
    }
  };

  const start = formatDate(startTime);
  const end = formatDate(finishTime);

  if (start && end) {
    return `${start} - ${end}`;
  }
  if (start) {
    return `From ${start}`;
  }
  if (end) {
    return `Until ${end}`;
  }
  return "—";
}

/**
 * Extracts the last part of an ID (after last dash, underscore, or last 8 characters)
 */
function getLastPartOfId(id: string): string {
  // Try splitting by common delimiters
  if (id.includes("-")) {
    const parts = id.split("-");
    return parts[parts.length - 1] || id.slice(-8);
  }
  if (id.includes("_")) {
    const parts = id.split("_");
    return parts[parts.length - 1] || id.slice(-8);
  }
  // If no delimiter, return last 8 characters
  return id.slice(-8);
}

/**
 * Maps a segment to an activity for display
 */
function mapSegmentToActivity(segment: Segment): Activity {
  return {
    id: segment.id,
    fromCountry: segment.originCountry || "—",
    fromCity: segment.originCity || "—",
    toCountry: segment.destinationCountry || "—",
    toCity: segment.destinationCity || "—",
    dateRange: formatDateRange(
      segment.estimatedStartTime,
      segment.estimatedFinishTime
    ),
    status: mapSegmentStatusToActivityStatus(segment.status),
  };
}

type Props = {
  driver: Driver;
};
export default function RecentActivities({driver}: Props) {
  const [items, setItems] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchSegments() {
      try {
        setIsLoading(true);
        setError(null);
        const segments = await listSegments(driver.id);
        const activities = segments.map(mapSegmentToActivity);
        setItems(activities);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to fetch segments")
        );
        setItems([]);
      } finally {
        setIsLoading(false);
      }
    }

    if (driver.id) {
      fetchSegments();
    }
  }, [driver.id]);
  return (
    <section className={cn("space-y-3")}>
      <h2 className="text-base font-semibold text-slate-900">
        Recent Activities
      </h2>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4  border border-slate-100">
          <h3 className="text-sm font-medium text-slate-400 mb-2">
            Total Shipments Delivered
          </h3>
          <p className="text-2xl font-bold text-slate-900">
            {driver?.totalDeliveries ?? 0}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-4  border border-slate-100">
          <h3 className="text-sm font-medium text-slate-400 mb-2">
            Total Delays
          </h3>
          <p className="text-2xl font-bold text-slate-900">
            {driver?.totalDelays ?? 0}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-4  border border-slate-100">
          <h3 className="text-sm font-medium text-slate-400 mb-2">
            GPS Uptime Percent
          </h3>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold ">
              {driver?.gpsUptimePercent ?? 0}%
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-4">
        {/* Header - hidden on small screens, shown on larger screens */}
        {!isLoading && items.length > 0 && (
          <div className="hidden xl:grid grid-cols-[1fr_2fr_1fr_1fr] items-center px-3 py-2 text-xs font-semibold text-slate-900">
            <div>ID</div>
            <div>Route</div>
            <div>Date</div>
            <div>Status</div>
          </div>
        )}
        {isLoading ? (
          <div className="flex items-center justify-center py-8 text-slate-500">
            Loading segments...
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-8 text-red-600">
            {error.message}
          </div>
        ) : items.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-slate-500">
            No segments found for this driver.
          </div>
        ) : (
          <ul className="space-y-3 divide-slate-100">
            {items.map((a) => (
              <li
                key={a.id}
                className="bg-slate-50 rounded-lg px-3 py-3 text-sm"
              >
                {/* Mobile/Tablet Layout - Stacked */}
                <div className="xl:hidden flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-slate-600 font-medium">
                      {getLastPartOfId(a.id)}
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-2 py-1 text-xs font-medium whitespace-nowrap shrink-0",
                        a.status === "Delivered" &&
                          "bg-green-50 text-green-600",
                        a.status === "At Origin" &&
                          "bg-amber-50 text-amber-600",
                        a.status === "Loading" && "bg-orange-50 text-orange-500"
                      )}
                    >
                      {a.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-900 flex-wrap">
                    <span className="font-semibold truncate">
                      {a.fromCountry}
                    </span>
                    <span className="text-slate-500 truncate">
                      / {a.fromCity}
                    </span>
                    <ArrowRight className="size-4 text-slate-400 shrink-0" />
                    <span className="font-semibold truncate">
                      {a.toCountry}
                    </span>
                    <span className="text-slate-500 truncate">
                      / {a.toCity}
                    </span>
                  </div>
                  <span className="text-slate-600 text-xs">{a.dateRange}</span>
                </div>

                {/* Desktop Layout - Grid (xl and above) */}
                <div className="hidden xl:grid grid-cols-[1fr_2fr_1fr_1fr] items-center gap-3">
                  <span className="text-slate-600 truncate">
                    {getLastPartOfId(a.id)}
                  </span>
                  <span className="flex items-center gap-2 text-slate-900 min-w-0">
                    <span className="font-semibold truncate">
                      {a.fromCountry}
                    </span>
                    <span className="text-slate-500 truncate">
                      / {a.fromCity}
                    </span>
                    <ArrowRight className="size-4 text-slate-400 shrink-0" />
                    <span className="font-semibold truncate">
                      {a.toCountry}
                    </span>
                    <span className="text-slate-500 truncate">
                      / {a.toCity}
                    </span>
                  </span>
                  <span className="text-slate-600 truncate">{a.dateRange}</span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-1 text-xs font-medium whitespace-nowrap",
                      a.status === "Delivered" && "text-green-600",
                      a.status === "At Origin" && "text-amber-600",
                      a.status === "Loading" && "text-orange-500"
                    )}
                  >
                    {a.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Pagination - only show if there are items */}
        {/* {!isLoading && !error && items.length > 0 && (
          <div className="flex items-center justify-center gap-3 pt-4 text-sm text-slate-600">
            <button
              className="grid place-items-center rounded-md bg-slate-100 size-6"
              aria-label="Prev"
            >
              <ChevronLeft className="size-4" />
            </button>
            <div className="inline-flex items-center gap-2">
              <button className="rounded-full bg-blue-600 text-white size-6 grid place-items-center text-xs">
                1
              </button>
              <button className="text-slate-600">2</button>
              <button className="text-slate-600">3</button>
              <span className="text-slate-400">…</span>
              <button className="text-slate-600">43</button>
            </div>
            <button
              className="grid place-items-center rounded-md bg-slate-100 size-6"
              aria-label="Next"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        )} */}
      </div>
    </section>
  );
}
