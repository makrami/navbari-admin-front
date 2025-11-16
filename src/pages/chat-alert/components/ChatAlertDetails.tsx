import { useMemo } from "react";
import type { ChatAlert } from "../data";
import { ChatSection } from "./ChatSection";
import { ShipmentHeader } from "./ShipmentHeader";
import { DriverAndShipmentInfo } from "./DriverAndShipmentInfo";
import { FinancialCards } from "./FinancialCards";
import { SegmentSection } from "./SegmentSection";
import type { Segment } from "../../../components/CargoMap";

type ChatAlertDetailsProps = {
  chatAlert: ChatAlert;
  onClose?: () => void;
  currentStateIndex?: number; // 0-6, where 0 is the first state and 6 is the last (optional, will be calculated from driver data if not provided)
};

export function ChatAlertDetails({
  chatAlert,
  onClose,
  currentStateIndex,
}: ChatAlertDetailsProps) {
  // TODO: Replace with real API data
  // For now, use default values from chatAlert
  const effectiveStateIndex = currentStateIndex ?? 0;

  // Default financial data - should come from API
  const financialData = {
    estFinish: chatAlert.estFinish || "",
    totalPaid: chatAlert.totalPaid || "$0",
    totalPending: chatAlert.totalPending || "$0",
  };

  // Default segment data - should come from API
  const segmentData = chatAlert.currentSegment || {
    number: 1,
    from: "",
    to: "",
    distance: "",
  };

  // Default messages - should come from API
  const messages: any[] = [];
  const actionableAlerts: any[] = [];
  const mapSegments = useMemo<Segment[]>(
    () => [
      {
        color: "#1b54fe",
        path: chatAlert.segmentPath,
        meta: {
          vehicleId: chatAlert.vehicle,
          driverId: chatAlert.driverId,
        },
      },
    ],
    [chatAlert.segmentPath, chatAlert.vehicle, chatAlert.driverId]
  );

  const initialView = useMemo(() => {
    if (chatAlert.segmentPath.length === 0) {
      return {
        longitude: 0,
        latitude: 0,
        zoom: 2,
      };
    }

    const lons = chatAlert.segmentPath.map((p) => p[0]);
    const lats = chatAlert.segmentPath.map((p) => p[1]);

    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);

    const centerLon = (minLon + maxLon) / 2;
    const centerLat = (minLat + maxLat) / 2;

    // Calculate zoom level based on the span of coordinates
    const lonSpan = maxLon - minLon;
    const latSpan = maxLat - minLat;
    const maxSpan = Math.max(lonSpan, latSpan);

    // Approximate zoom calculation: adjust zoom based on span
    // Smaller spans need higher zoom, larger spans need lower zoom
    let zoom = 5;
    if (maxSpan > 50) {
      zoom = 3;
    } else if (maxSpan > 20) {
      zoom = 4;
    } else if (maxSpan > 10) {
      zoom = 5;
    } else if (maxSpan > 5) {
      zoom = 6;
    } else {
      zoom = 7;
    }

    return {
      longitude: centerLon,
      latitude: centerLat,
      zoom,
    };
  }, [chatAlert.segmentPath]);

  return (
    <div className="flex rounded-xl flex-col gap-6">
      {/* Header Section */}
      <div className="bg-white rounded-xl p-4 space-y-4">
        <ShipmentHeader
          shipmentNumber={chatAlert.shipmentNumber}
          shipmentId={chatAlert.shipmentId}
          onClose={onClose}
        />

        <DriverAndShipmentInfo
          chatAlert={chatAlert}
          mapSegments={mapSegments}
          initialView={initialView}
        />

        <FinancialCards
          estFinish={financialData.estFinish}
          totalPaid={financialData.totalPaid}
          totalPending={financialData.totalPending}
        />

        <SegmentSection
          currentSegment={segmentData}
          currentStateIndex={effectiveStateIndex}
        />
      </div>

      {/* Chat Section */}
      <div className="bg-white rounded-xl overflow-hidden h-[600px]  flex flex-col">
        <ChatSection
          key={chatAlert.driverId}
          messages={messages}
          actionableAlerts={actionableAlerts}
        />
      </div>
    </div>
  );
}
