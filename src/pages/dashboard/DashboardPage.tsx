import { useState, useMemo } from "react";
import CargoMap, { type Segment } from "../../components/CargoMap";
import { useShipments } from "../../services/shipment/hooks";
import {
  DEMO_ROUTES,
  type DemoRouteStatus,
} from "../../shared/data/demoRoutes";
import { segmentWithShipmentFromDemoRoute } from "../../shared/utils/demoSegmentConverters";
import type { SegmentWithShipment } from "../segments/components/SegmentCard";
import { MAPBOX_TOKEN } from "./constants";
import { KPICards } from "./components/KPICards";
import { StatusFilter } from "./components/StatusFilter";
import { MapLegend } from "./components/MapLegend";
import { DashboardSearch } from "./components/DashboardSearch";
import { SegmentsDrawer } from "./components/SegmentsDrawer";
import { UnreadMessagesModal } from "./components/UnreadMessagesModal";
import { AwaitingRegistrationsModal } from "./components/AwaitingRegistrationsModal";
import { SegmentsAwaitingDriverModal } from "./components/SegmentsAwaitingDriverModal";
import { useMapSegments } from "./hooks/useMapSegments";

type SegmentStatus = DemoRouteStatus;

export function DashboardPage() {
  const { data: serviceShipments } = useShipments();
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

  const mapSegments = useMapSegments(serviceShipments, statusFilter);

  const demoSegmentEntries = useMemo(
    (): SegmentWithShipment[] =>
      DEMO_ROUTES.map((route) => segmentWithShipmentFromDemoRoute(route)),
    []
  );

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

  const handleCardClick = (cardId: string) => {
    setOpenModal(cardId);
    console.log("cardId", cardId);
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
        <div className="absolute inset-0 p-5">
          <CargoMap
            segments={mapSegments}
            initialView={{ longitude: 7.5, latitude: 49.0, zoom: 4 }}
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

        <SegmentsDrawer
          open={isSegmentsOpen && selectedSegmentId !== null}
          onClose={handleSegmentsClose}
          selectedSegmentId={selectedSegmentId}
          extraSegments={demoSegmentEntries}
        />

        {/* Shared modal for both "Unread Messages" and "Total Alerts" cards */}
        <UnreadMessagesModal
          open={isModalOpen}
          onClose={() => setOpenModal(null)}
        />

        {/* Awaiting Registrations Modal */}
        <AwaitingRegistrationsModal
          open={isAwaitingRegistrationsModalOpen}
          onClose={() => setOpenModal(null)}
        />

        {/* Segments Awaiting Driver Modal */}
        <SegmentsAwaitingDriverModal
          open={isSegmentsAwaitingDriverModalOpen}
          onClose={() => setOpenModal(null)}
        />
      </div>
    </div>
  );
}
