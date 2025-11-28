import {useEffect, useRef, useState} from "react";
import {useTranslation} from "react-i18next";
import {useNavigate} from "react-router-dom";
import {X} from "lucide-react";
import {useShipments} from "../../services/shipment/hooks";
import type {FilterType} from "./components/SegmentsFilters";
import {SegmentsFilters} from "./components/SegmentsFilters";
import type {Segment} from "../../shared/types/segmentData";
import {useSegmentsData} from "./hooks/useSegmentsData";
import {cn} from "../../shared/utils/cn";
import {getSegmentListId} from "./utils/getSegmentListId";
import SegmentDetails from "../shipment/segments/components/SegmentDetails";
import type {Shipment} from "../../shared/types/shipment";
import {SEGMENT_STATUS} from "../../services/shipment/shipment.api.service";

type SegmentsPageProps = {
  selectedSegmentId?: string | null;
  onClose?: () => void;
  className?: string;
  extraSegments?: Segment[];
};

export function SegmentsPage({
  selectedSegmentId = null,
  onClose,
  className,
  extraSegments,
}: SegmentsPageProps = {}) {
  const navigate = useNavigate();
  const {data: serviceShipments, loading} = useShipments();
  const [filter, setFilter] = useState<FilterType>("need-action");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSegments, setExpandedSegments] = useState<Set<string>>(
    () => new Set(selectedSegmentId ? [selectedSegmentId] : [])
  );
  const {t} = useTranslation();
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const {needActionCount, alertCount, allSegments, filteredSegments} =
    useSegmentsData(
      serviceShipments ?? null,
      filter,
      searchQuery,
      extraSegments ?? []
    );

  const toggleSegment = (segmentId: string) => {
    setExpandedSegments((prev) => {
      const next = new Set(prev);
      if (next.has(segmentId)) {
        next.delete(segmentId);
      } else {
        next.add(segmentId);
      }
      return next;
    });
  };

  useEffect(() => {
    if (!selectedSegmentId) return;
    setExpandedSegments((prev) => {
      if (prev.has(selectedSegmentId)) {
        return prev;
      }
      const next = new Set(prev);
      next.add(selectedSegmentId);
      return next;
    });
  }, [selectedSegmentId]);

  useEffect(() => {
    if (!selectedSegmentId) return;
    const node = itemRefs.current.get(selectedSegmentId);
    if (!node) return;
    node.scrollIntoView({behavior: "smooth", block: "center"});
  }, [selectedSegmentId, filteredSegments]);

  const handleClose = () => {
    if (onClose) {
      onClose();
      return;
    }
    navigate("/shipments");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-slate-500">{t("segments.page.loading")}</div>
      </div>
    );
  }

  const hasCustomHeight =
    typeof className === "string" && /(^|\s)h-/.test(className);

  return (
    <div
      className={cn(
        "flex flex-col max-w-5xl p-5 mx-auto overflow-hidden",
        hasCustomHeight ? null : "h-screen",
        className
      )}
    >
      {/* Header */}
      <div className="py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label={t("segments.page.closeLabel")}
            >
              <X className="h-5 w-5 text-slate-600" />
            </button>
            <h1 className="text-2xl font-bold text-slate-900">
              {t("segments.page.title")}
            </h1>
          </div>
        </div>

        <SegmentsFilters
          filter={filter}
          onFilterChange={setFilter}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          allCount={allSegments.length}
          needActionCount={needActionCount}
          alertCount={alertCount}
        />
      </div>

      {/* Segments List */}
      <div
        className="flex-1 overflow-y-auto no-scrollbar"
        style={{scrollbarGutter: "stable"}}
      >
        <div className="max-w-6xl mx-auto pb-6">
          {filteredSegments.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              {t("segments.page.empty")}
            </div>
          ) : (
            <div className="relative rounded-xl bg-white p-3">
              {/* Vertical spine linking the segment cards visually */}
              <div
                aria-hidden="true"
                className="absolute left-8 top-5 bottom-5 w-3 bg-slate-200 rounded-full z-0"
              />
              <div className="grid gap-4 relative z-10">
                {filteredSegments.map((segment) => {
                  const segmentId = getSegmentListId(
                    segment.shipmentId,
                    segment.step ?? 0
                  );
                  const isExpanded = expandedSegments.has(segmentId);

                  // Find current segment index for this shipment
                  const shipmentSegments = filteredSegments.filter(
                    (s) => s.shipmentId === segment.shipmentId
                  );
                  const currentSegmentIndex = shipmentSegments.findIndex(
                    (s) =>
                      s.status !== SEGMENT_STATUS.DELIVERED && !s.isCompleted
                  );

                  // segment is already Segment, just ensure it has computed fields
                  const segmentData = {
                    ...segment,
                    isCurrent:
                      currentSegmentIndex >= 0 &&
                      shipmentSegments.findIndex((s) => s.id === segment.id) ===
                        currentSegmentIndex,
                  };

                  // Get shipment destination - prefer from service shipment, otherwise use last segment's nextPlace
                  const shipment = serviceShipments?.find(
                    (s) => s.id === segment.shipmentId
                  );
                  // const destination =
                  //   shipment?.destination ||
                  //   shipmentSegments[shipmentSegments.length - 1]?.nextPlace ||
                  //   segment.nextPlace;

                  return (
                    <div
                      key={segmentId}
                      ref={(node) => {
                        if (!node) {
                          itemRefs.current.delete(segmentId);
                        } else {
                          itemRefs.current.set(segmentId, node);
                        }
                      }}
                    >
                      <SegmentDetails
                        data={segmentData}
                        open={isExpanded}
                        onToggle={() => toggleSegment(segmentId)}
                        editable={false}
                        locked={false}
                        shipment={shipment as Shipment}
                        segmentId={segment.id}
                        linkShipment={true}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
