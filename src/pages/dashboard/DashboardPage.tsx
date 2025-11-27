import { useState, useMemo } from "react";
import CargoMap from "../../components/CargoMap";
import { MAPBOX_TOKEN } from "./constants";
import { KPICards } from "./components/KPICards";
import { StatusFilter } from "./components/StatusFilter";
import { MapLegend } from "./components/MapLegend";
import { DashboardSearch } from "./components/DashboardSearch";
import { SegmentsDrawer } from "./components/SegmentsDrawer";
import { UnreadMessagesModal } from "./components/UnreadMessagesModal";
import { AwaitingRegistrationsModal } from "./components/AwaitingRegistrationsModal";
import { SegmentsAwaitingDriverModal } from "./components/SegmentsAwaitingDriverModal";
import { useActiveSegments } from "../../services/dashboard/hooks";
import { ChartBarBig } from "lucide-react";

type SegmentStatus = "pending" | "normal" | "alert";

export function DashboardPage() {
  const { data: activeSegments, isLoading, error } = useActiveSegments();
  const [isSegmentsOpen, setIsSegmentsOpen] = useState(false);
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(
    null
  );
  const [statusFilter, setStatusFilter] = useState<
    Record<SegmentStatus, boolean>
  >({
    pending: true,
    normal: true,
    alert: true,
  });
  const [openModal, setOpenModal] = useState<string | null>(null);
  const [cardPosition, setCardPosition] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  // Extract segment IDs from active segments
  const segmentIds = useMemo(() => {
    if (!activeSegments) return [];
    return activeSegments
      .map((segment) => segment.id)
      .filter((id): id is string => !!id);
  }, [activeSegments]);

  // Debug: Log active segments (only in development)
  if (import.meta.env.DEV) {
    console.log("Active Segments:", activeSegments);
    console.log("Segment IDs:", segmentIds);
    console.log("Loading:", isLoading);
    console.log("Error:", error);
  }

  const handleSegmentClick = (segmentId: string) => {
    setSelectedSegmentId(segmentId);
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

  const handleCardClick = (
    cardId: string,
    position: { top: number; left: number; width: number }
  ) => {
    setCardPosition(position);
    setOpenModal(cardId);
  };

  const handleShowAllSegments = () => {
    // Enable all filters to show all segments on map
    setStatusFilter({
      pending: true,
      normal: true,
      alert: true,
    });
    // Open drawer with all segments (no specific segment selected)
    setSelectedSegmentId(null);
    setIsSegmentsOpen(true);
  };

  // Check if modal should be open for either "unreadMessages" or "totalAlerts"
  const isModalOpen =
    openModal === "unreadMessages" || openModal === "totalAlerts";

  // Check if awaiting registrations modal should be open
  const isAwaitingRegistrationsModalOpen =
    openModal === "newAwaitingRegistrations";

  // Check if segments awaiting driver modal should be open
  const isSegmentsAwaitingDriverModalOpen =
    openModal === "segmentsAwaitingDriver";

  return (
    <div className="h-screen bg-slate-200 p-5 w-full overflow-hidden min-w-0">
      <div className="h-full w-full max-w-7xl mx-auto p-5 bg-white rounded-xl relative overflow-hidden min-w-0 isolate">
        {/* Error Display */}
        {error && (
          <div className="absolute top-5 left-5 right-5 z-50 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg shadow-lg">
            <p className="font-semibold">Error fetching active segments:</p>
            <p className="text-sm mt-1">
              {error instanceof Error ? error.message : "Unknown error"}
            </p>
          </div>
        )}

        <div className="absolute inset-0 p-5">
          <CargoMap
            segmentIds={segmentIds}
            initialView={{ longitude: 105.0, latitude: 35.0, zoom: 4 }}
            mapboxToken={MAPBOX_TOKEN}
            onSegmentClick={handleSegmentClick}
            onMapClick={handleMapClick}
          />
        </div>

        <KPICards onCardClick={handleCardClick} />

        <StatusFilter
          statusFilter={statusFilter}
          onFilterChange={setStatusFilter}
        />

        <MapLegend />

        <DashboardSearch />

        {/* Show All Segments Button - Bottom Right */}
        <button
          onClick={handleShowAllSegments}
          className="absolute bottom-10 right-10 z-40 flex items-center justify-center size-14 bg-white rounded-lg hover:scale-102 active:scale-95 transition-all duration-200 cursor-pointer"
          title="Show all segments"
        >
          <ChartBarBig className="size-5 text-slate-700" />
        </button>

        <SegmentsDrawer
          open={isSegmentsOpen}
          onClose={handleSegmentsClose}
          selectedSegmentId={selectedSegmentId}
          extraSegments={activeSegments}
        />

        {/* Shared modal for both "Unread Messages" and "Total Alerts" cards */}
        <UnreadMessagesModal
          open={isModalOpen}
          onClose={() => {
            setOpenModal(null);
            setCardPosition(null);
          }}
          cardPosition={cardPosition}
          type={openModal === "totalAlerts" ? "alerts" : "messages"}
        />

        {/* Awaiting Registrations Modal */}
        <AwaitingRegistrationsModal
          open={isAwaitingRegistrationsModalOpen}
          onClose={() => {
            setOpenModal(null);
            setCardPosition(null);
          }}
          cardPosition={cardPosition}
        />

        {/* Segments Awaiting Driver Modal */}
        <SegmentsAwaitingDriverModal
          open={isSegmentsAwaitingDriverModalOpen}
          onClose={() => {
            setOpenModal(null);
            setCardPosition(null);
          }}
          cardPosition={cardPosition}
        />
      </div>
    </div>
  );
}
