import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { useShipments } from "../../services/shipment/hooks";
import type { FilterType } from "./components/SegmentsFilters";
import { SegmentsFilters } from "./components/SegmentsFilters";
import { SegmentCard } from "./components/SegmentCard";
import { useSegmentsData } from "./hooks/useSegmentsData";

export function SegmentsPage() {
  const navigate = useNavigate();
  const { data: serviceShipments, loading } = useShipments();
  const [filter, setFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSegments, setExpandedSegments] = useState<Set<string>>(
    new Set()
  );
  const { t } = useTranslation();

  const { filteredSegments, needActionCount, alertCount, allSegments } =
    useSegmentsData(serviceShipments ?? null, filter, searchQuery);

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

  const getSegmentId = (segmentId: string, step: number) =>
    `${segmentId}-${step}`;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-slate-500">{t("segments.page.loading")}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-w-5xl mx-auto overflow-hidden">
      {/* Header */}
      <div className="py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate("/shipments")}
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
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="max-w-6xl mx-auto space-y-4 pb-6">
          {filteredSegments.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              {t("segments.page.empty")}
            </div>
          ) : (
            filteredSegments.map((segment) => {
              const segmentId = getSegmentId(segment.shipmentId, segment.step);
              const isExpanded = expandedSegments.has(segmentId);
              const shipment = serviceShipments?.find(
                (s) => s.id === segment.shipmentId
              );

              return (
                <SegmentCard
                  key={segmentId}
                  segment={segment}
                  shipment={shipment}
                  isExpanded={isExpanded}
                  onToggle={() => toggleSegment(segmentId)}
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
