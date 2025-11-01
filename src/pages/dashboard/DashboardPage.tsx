import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import CargoMap, { type Segment } from "../../components/CargoMap";
import { SegmentsPage } from "../segments/SegmentsPage";
import { useShipments } from "../../services/shipment/hooks";
import { useSegmentsData } from "../segments/hooks/useSegmentsData";
import { getSegmentListId } from "../segments/utils/getSegmentListId";
import { cn } from "../../shared/utils/cn";
import {
  getCityCoordinates,
  getIso2FromPlace,
  toFlagEmojiFromIso2,
} from "../../shared/utils/geography";
import {
  IdCard,
  MessageSquareDot,
  TruckIcon,
  UsersRoundIcon,
  Search,
  ChevronDownIcon,
} from "lucide-react";
import type { SegmentWithShipment } from "../segments/components/SegmentCard";
import {
  DEMO_ROUTES,
  type DemoRouteStatus,
} from "../../shared/data/demoRoutes";
import { segmentWithShipmentFromDemoRoute } from "../../shared/utils/demoSegmentConverters";

const MAPBOX_TOKEN =
  "pk.eyJ1IjoibWFrcmFtaSIsImEiOiJjbWhkYXQxM3cwMTN6MmxzZWtqeXN6bGNsIn0.4DbaRR6-26JAWRKRPMvJtg";

type SegmentStatus = DemoRouteStatus;
const STATUS_COLORS: Record<SegmentStatus, string> = {
  normal: "#1b54fe",
  pending: "#f59e0b",
  alert: "#ef4444",
};

function seededCount(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return (h % 5) + 1; // 1..5
}

function renderNumbersBold(
  text: string,
  keyPrefix: string,
  numberClass = "font-bold",
  textClass = "font-medium"
) {
  const parts = text
    // Capture numeric token with an optional short suffix (h, m, k, %, etc.)
    .split(/(\d+(?:[.,]\d+)?[a-zA-Z%]?)/g)
    .filter(Boolean);
  return (
    <>
      {parts.map((part, idx) => {
        const isNumber = /^\d+(?:[.,]\d+)?[a-zA-Z%]?$/.test(part);
        return (
          <span
            key={`${keyPrefix}-${idx}`}
            className={isNumber ? numberClass : textClass}
          >
            {part}
          </span>
        );
      })}
    </>
  );
}

export function DashboardPage() {
  const { t } = useTranslation();
  const { data: serviceShipments } = useShipments();
  const { allSegments } = useSegmentsData(serviceShipments ?? null, "all", "");
  const [isSegmentsOpen, setIsSegmentsOpen] = useState(false);
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(
    null
  );
  const [filterOpen, setFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<
    Record<SegmentStatus, boolean>
  >({
    pending: true,
    normal: true,
    alert: true,
  });

  // API segments (default to normal status in demo)
  const apiSegments = useMemo((): Segment[] => {
    return allSegments
      .map((segment): Segment | null => {
        const originCoords = getCityCoordinates(segment.place);
        const destCoords = getCityCoordinates(segment.nextPlace);
        if (!originCoords || !destCoords) return null;
        const segmentKey = getSegmentListId(segment.shipmentId, segment.step);
        const status: SegmentStatus = "normal";
        const originIso2 =
          getIso2FromPlace(segment.place) ||
          segment.shipmentFromCountryCode ||
          null;
        const destIso2 =
          getIso2FromPlace(segment.nextPlace) ||
          segment.shipmentToCountryCode ||
          null;
        const originFlag = toFlagEmojiFromIso2(originIso2);
        const destFlag = toFlagEmojiFromIso2(destIso2);
        return {
          color: STATUS_COLORS[status],
          path: [originCoords, destCoords] as readonly [number, number][],
          meta: {
            segmentKey,
            shipmentId: segment.shipmentId,
            step: segment.step,
            status,
            trucksCount: seededCount(segmentKey),
            originFlag: originFlag ?? "",
            destFlag: destFlag ?? "",
            originIso2: originIso2 ?? "",
            destIso2: destIso2 ?? "",
          },
        };
      })
      .filter((segment): segment is Segment => segment !== null);
  }, [allSegments]);

  // Demo shipments with mixed statuses
  const demoSegments = useMemo((): Segment[] => {
    return DEMO_ROUTES.map(({ id, from, to, status, details }) => {
      const a = getCityCoordinates(from);
      const b = getCityCoordinates(to);
      if (!a || !b) return null;
      const originIso2 = getIso2FromPlace(from);
      const destIso2 = getIso2FromPlace(to);
      const originFlag = toFlagEmojiFromIso2(originIso2);
      const destFlag = toFlagEmojiFromIso2(destIso2);
      return {
        color: STATUS_COLORS[status],
        path: [a, b] as readonly [number, number][],
        meta: {
          segmentKey: getSegmentListId(id, 1),
          status,
          trucksCount: seededCount(id),
          ...details,
          originFlag: originFlag ?? "",
          destFlag: destFlag ?? "",
          originIso2: originIso2 ?? "",
          destIso2: destIso2 ?? "",
        },
      } as Segment;
    }).filter((s): s is Segment => s !== null);
  }, []);

  const demoSegmentEntries = useMemo(
    (): SegmentWithShipment[] =>
      DEMO_ROUTES.map((route) => segmentWithShipmentFromDemoRoute(route)),
    []
  );

  const mapSegments = useMemo((): Segment[] => {
    const combined = [...demoSegments, ...apiSegments];
    return combined.filter((s) => {
      const st = (s.meta?.status as SegmentStatus | undefined) ?? "normal";
      return statusFilter[st];
    });
  }, [demoSegments, apiSegments, statusFilter]);

  const handleSegmentClick = (segment: Segment) => {
    const segmentKey = segment.meta?.segmentKey;
    if (typeof segmentKey !== "string") {
      return;
    }
    setSelectedSegmentId(segmentKey);
    setIsSegmentsOpen(true);
  };

  const handleMapClick = () => {
    // Close overlay when clicking on map background
    setIsSegmentsOpen(false);
    setSelectedSegmentId(null);
  };

  const handleSegmentsClose = () => {
    setIsSegmentsOpen(false);
    setSelectedSegmentId(null);
  };

  return (
    <div className="h-screen bg-slate-200 p-5 w-full overflow-hidden min-w-0">
      <div className="h-full w-full max-w-7xl mx-auto p-5 bg-white rounded-xl relative overflow-hidden min-w-0 isolate">
        <div className="absolute inset-0 p-5">
          <CargoMap
            segments={mapSegments}
            initialView={{ longitude: 7.5, latitude: 49.0, zoom: 4 }}
            mapboxToken={MAPBOX_TOKEN}
            onSegmentClick={handleSegmentClick}
            onMapClick={handleMapClick}
          />
        </div>

        {/* Top KPI cards */}
        <div className="pointer-events-auto absolute top-10 left-10 right-20 z-40 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(
            [
              {
                title: t("dashboard.kpiCards.totalShipments.title"),
                metaTop: t("dashboard.kpiCards.totalShipments.metaTop"),
                metaBottom: t("dashboard.kpiCards.totalShipments.metaBottom"),
                iconBg: "bg-emerald-50",
                renderIcon: () => (
                  <TruckIcon className="size-4 text-emerald-600" />
                ),
              },
              {
                title: t("dashboard.kpiCards.segmentsAwaitingDriver.title"),
                metaTop: t("dashboard.kpiCards.segmentsAwaitingDriver.metaTop"),
                metaBottom: t(
                  "dashboard.kpiCards.segmentsAwaitingDriver.metaBottom"
                ),
                iconBg: "bg-amber-50",
                renderIcon: () => (
                  <UsersRoundIcon className="size-4 text-amber-600" />
                ),
              },
              {
                title: t("dashboard.kpiCards.newAwaitingRegistrations.title"),
                metaTop: t(
                  "dashboard.kpiCards.newAwaitingRegistrations.metaTop"
                ),
                metaBottom: t(
                  "dashboard.kpiCards.newAwaitingRegistrations.metaBottom"
                ),
                iconBg: "bg-orange-50",
                renderIcon: () => <IdCard className="size-4 text-orange-600" />,
              },
              {
                title: t("dashboard.kpiCards.unreadMessages.title"),
                metaTop: t("dashboard.kpiCards.unreadMessages.metaTop"),
                metaBottom: t("dashboard.kpiCards.unreadMessages.metaBottom"),
                iconBg: "bg-violet-50",
                renderIcon: () => (
                  <MessageSquareDot className="size-4 text-violet-600" />
                ),
              },
            ] as Array<{
              title: string;
              metaTop: string;
              metaBottom: string;
              iconBg: string;
              renderIcon: () => React.ReactElement;
            }>
          ).map((card) => (
            <button
              key={card.title}
              type="button"
              className="text-left rounded-lg bg-white/90 backdrop-blur border border-slate-200  p-4 hover:shadow transition"
            >
              <div className="flex flex-col items-start gap-3">
                <div className="flex items-center gap-1">
                  <span
                    className={cn(
                      "inline-flex h-8 w-8 items-center justify-center rounded-lg bg-",
                      card.iconBg
                    )}
                  >
                    {card.renderIcon()}
                  </span>
                  <div className="text-sm font-semibold text-slate-900 truncate">
                    {card.title}
                  </div>
                </div>
                <div className="flex flex-col ">
                  <div className=" text-[11px] text-slate-500 font-medium">
                    {renderNumbersBold(card.metaTop, `${card.title}-top`)}
                  </div>
                  <div className="mt-1.5 text-sm text-slate-900">
                    {renderNumbersBold(card.metaBottom, `${card.title}-bottom`)}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Filter + Legend overlays */}
        <div className="absolute top-45 left-10 z-40 pointer-events-none">
          {/* Filter button */}
          <div className="pointer-events-auto relative">
            <button
              type="button"
              onClick={() => setFilterOpen((v) => !v)}
              className="rounded-lg flex items-center gap-5 bg-white   px-3 py-2 text-sm font-medium text-slate-700 hover:shadow"
            >
              {t("dashboard.filters.allFilters")}
              <ChevronDownIcon className="size-4 text-slate-400" />
            </button>
            {filterOpen && (
              <div className="absolute mt-2 w-48 rounded-lg bg-white border border-slate-200 shadow-md p-3">
                {(["pending", "normal", "alert"] as SegmentStatus[]).map(
                  (s) => (
                    <label
                      key={s}
                      className="flex items-center gap-2 py-1 text-sm text-slate-800"
                    >
                      <input
                        type="checkbox"
                        checked={statusFilter[s]}
                        onChange={() =>
                          setStatusFilter((prev) => ({
                            ...prev,
                            [s]: !prev[s],
                          }))
                        }
                        className="accent-blue-600"
                      />
                      <span className="capitalize">
                        {t(`dashboard.filters.status.${s}`)}
                      </span>
                    </label>
                  )
                )}
              </div>
            )}
          </div>
        </div>

        {/* Legend bottom-left */}
        <div className="absolute left-10 bottom-8 z-40">
          <div className="rounded-lg bg-white p-3 w-36">
            <div className="text-sm font-semibold text-slate-900">
              {t("dashboard.guide.title")}
            </div>
            <div className="my-2 h-px bg-slate-100" />

            <div className="space-y-1.5 text-xs text-slate-700">
              <div className="flex items-center gap-2 px-1 py-1 rounded-md">
                <span
                  className="inline-block h-1.5 w-2.5 rounded-sm"
                  style={{ backgroundColor: STATUS_COLORS.normal }}
                />
                <span className="font-medium">
                  {t("dashboard.guide.shipments")}
                </span>
              </div>

              <div className="flex items-center gap-2 px-1 py-1 rounded-md">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-slate-50">
                  <TruckIcon className="h-3.5 w-3.5 text-slate-800" />
                </span>
                <span className="font-medium">
                  {t("dashboard.guide.driver")}
                </span>
              </div>

              <div className="flex items-center gap-2 px-1 py-1 rounded-md">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-amber-50">
                  <TruckIcon className="h-3.5 w-3.5 text-amber-500" />
                </span>
                <span className="font-medium">
                  {t("dashboard.guide.pending")}
                </span>
              </div>

              <div className="flex items-center gap-2 px-1 py-1 rounded-md">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-rose-50">
                  <TruckIcon className="h-3.5 w-3.5 text-rose-500" />
                </span>
                <span className="font-medium">
                  {t("dashboard.guide.alert")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom search field (visual only) */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-10 z-40 w-[min(720px,90%)]">
          <div className="relative flex items-center">
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 z-10">
              <Search className="h-4 w-4" aria-hidden="true" />
            </div>
            <input
              type="text"
              placeholder={t("dashboard.search.placeholder")}
              className="w-full rounded-xl bg-white/90 backdrop-blur border border-slate-200 pl-10 pr-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <SegmentsDrawer
          open={isSegmentsOpen && selectedSegmentId !== null}
          onClose={handleSegmentsClose}
          selectedSegmentId={selectedSegmentId}
          extraSegments={demoSegmentEntries}
        />
      </div>
    </div>
  );
}

type SegmentsDrawerProps = {
  open: boolean;
  onClose: () => void;
  selectedSegmentId: string | null;
  extraSegments?: SegmentWithShipment[];
};

function SegmentsDrawer({
  open,
  onClose,
  selectedSegmentId,
  extraSegments,
}: SegmentsDrawerProps) {
  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-50 transition-opacity duration-300",
          open
            ? "bg-slate-900/30 pointer-events-auto opacity-100"
            : "bg-transparent pointer-events-none opacity-0"
        )}
        aria-hidden={!open}
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div
        className={cn(
          "fixed right-0 top-0 z-50 h-full w-full max-w-4xl bg-slate-200  shadow-2xl transition-transform duration-500 ease-out overflow-hidden",
          open ? "translate-x-0" : "translate-x-full"
        )}
        style={{ willChange: open ? "transform" : "auto" }}
      >
        {open && (
          <SegmentsPage
            selectedSegmentId={selectedSegmentId ?? undefined}
            onClose={onClose}
            extraSegments={extraSegments}
            className="h-full"
          />
        )}
      </div>
    </>
  );
}
