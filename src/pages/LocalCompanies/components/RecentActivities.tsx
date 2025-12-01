import { useState, useEffect } from "react";
import { cn } from "../../../shared/utils/cn";
import { ArrowRight } from "lucide-react";
import { listSegments } from "../../../services/shipment/shipment.api.service";
import type { Segment } from "../../../shared/types/segmentData";
import { SegmentStatus } from "../../../shared/types/segmentData";
import { useTranslation } from "react-i18next";

type Activity = {
  id: string;
  fromCountry: string;
  fromCity: string;
  toCountry: string;
  toCity: string;
  dateRange: string;
  status:
    | "pendingAssignment"
    | "assigned"
    | "toOrigin"
    | "atOrigin"
    | "inCustoms"
    | "toDestination"
    | "atDestination"
    | "delivered"
    | "cancelled"
    | "loading"
    | "unknown";
};

/**
 * Maps segment status to activity status key for translation
 */
function mapSegmentStatusToActivityStatusKey(status: string): string {
  switch (status) {
    case SegmentStatus.PENDING_ASSIGNMENT:
      return "pendingAssignment";
    case SegmentStatus.ASSIGNED:
      return "assigned";
    case SegmentStatus.TO_ORIGIN:
      return "toOrigin";
    case SegmentStatus.AT_ORIGIN:
      return "atOrigin";
    case SegmentStatus.LOADING:
      return "loading";
    case SegmentStatus.IN_CUSTOMS:
      return "inCustoms";
    case SegmentStatus.TO_DESTINATION:
      return "toDestination";
    case SegmentStatus.AT_DESTINATION:
      return "atDestination";
    case SegmentStatus.DELIVERED:
      return "delivered";
    case SegmentStatus.CANCELLED:
      return "cancelled";
    default:
      return "unknown";
  }
}

/**
 * Formats date range from segment estimated times
 */
function formatDateRange(
  startTime: string | null,
  finishTime: string | null,
  t: (key: string) => string
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
    return `${t("localCompanies.page.activities.from")} ${start}`;
  }
  if (end) {
    return `${t("localCompanies.page.activities.until")} ${end}`;
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
function mapSegmentToActivity(
  segment: Segment,
  t: (key: string) => string
): Activity {
  return {
    id: segment.id,
    fromCountry: segment.originCountry || "—",
    fromCity: segment.originCity || "—",
    toCountry: segment.destinationCountry || "—",
    toCity: segment.destinationCity || "—",
    dateRange: formatDateRange(
      segment.estimatedStartTime,
      segment.estimatedFinishTime,
      t
    ),
    status: mapSegmentStatusToActivityStatusKey(
      segment.status
    ) as Activity["status"],
  };
}

type Props = {
  companyId: string;
};

export default function RecentActivities({ companyId }: Props) {
  const { t } = useTranslation();
  const [items, setItems] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchSegments() {
      try {
        setIsLoading(true);
        setError(null);
        const segments = await listSegments(undefined, companyId);
        const activities = segments.map((seg) => mapSegmentToActivity(seg, t));
        setItems(activities);
      } catch (err) {
        setError(
          err instanceof Error
            ? err
            : new Error(t("localCompanies.page.activities.fetchFailed"))
        );
        setItems([]);
      } finally {
        setIsLoading(false);
      }
    }

    if (companyId) {
      fetchSegments();
    }
  }, [companyId, t]);

  return (
    <section className={cn("space-y-3")}>
      <h2 className="text-base font-semibold text-slate-900">
        {t("localCompanies.page.activities.title")}
      </h2>

      <div className="rounded-2xl bg-white p-4">
        {/* Header - hidden on small screens, shown on larger screens */}
        {!isLoading && items.length > 0 && (
          <div className="hidden xl:grid grid-cols-[1fr_2fr_1fr_1fr] items-center px-3 py-2 text-xs font-semibold text-slate-900">
            <div>{t("localCompanies.page.activities.headers.id")}</div>
            <div>{t("localCompanies.page.activities.headers.route")}</div>
            <div>{t("localCompanies.page.activities.headers.date")}</div>
            <div>{t("localCompanies.page.activities.headers.status")}</div>
          </div>
        )}
        {isLoading ? (
          <div className="flex items-center justify-center py-8 text-slate-500">
            {t("localCompanies.page.activities.loading")}
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-8 text-red-600">
            {error.message}
          </div>
        ) : items.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-slate-500">
            {t("localCompanies.page.activities.empty")}
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
                        a.status === "delivered" &&
                          "bg-green-50 text-green-600",
                        a.status === "atOrigin" && "bg-amber-50 text-amber-600",
                        a.status === "loading" && "bg-orange-50 text-orange-500"
                      )}
                    >
                      {t(`localCompanies.page.activities.status.${a.status}`)}
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
                      a.status === "delivered" && "text-green-600",
                      a.status === "atOrigin" && "text-amber-600",
                      a.status === "loading" && "text-orange-500"
                    )}
                  >
                    {t(`localCompanies.page.activities.status.${a.status}`)}
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
