import { useMemo, useState, useEffect } from "react";
import { Segments } from "../segments/Segments";
import NavigatingInfo from "../details/components/NavigatingInfo";
import ActivitySection from "../Activity/components/ActivitySection";
import AddShipmentModal, {
  type AddShipmentInput as AddShipmentFormInput,
} from "./AddShipmentModal";
import { SegmentItem } from "./SegmentItem";
import { useSegmentScroll } from "../hooks/useSegmentScroll";
import { SegmentDetailsSkeleton } from "./ShipmentSkeleton";
import type { Shipment } from "../../../shared/types/shipment";
import type { Shipment as DomainShipment } from "../../../shared/types/shipment";
import type { SegmentData } from "../../../shared/types/segmentData";
import { SegmentStatus } from "../../../shared/types/segmentData";
import { getFileUrl } from "../../LocalCompanies/utils";

type ShipmentContentAreaProps = {
  selectedShipment: Shipment;
  selectedId: string;
  segmentStep?: number;
  showAddShipment: boolean;
  onCloseAddShipment: () => void;
  onCreateShipment: (data: AddShipmentFormInput) => void;
  onDeselect: () => void;
  editedSegmentsByShipmentId: Record<string, SegmentData[]>;
  onSegmentUpdate: (
    shipmentId: string,
    segmentIndex: number,
    update: Partial<SegmentData>
  ) => void;
  onAddSegment: (shipmentId: string) => void;
  onSegmentSave: (
    shipmentId: string,
    segmentStep: number,
    update: Partial<SegmentData>
  ) => void;
  serviceShipments: DomainShipment[] | undefined;
  timeoutsRef: React.MutableRefObject<number[]>;
  onShipmentIsNewOverride: (shipmentId: string, isNew: boolean) => void;
  onUpdateShipment: (shipmentId: string, update: Partial<Shipment>) => void;
  segmentsLoading?: boolean;
  fetchedSegments?: SegmentData[] | null;
};

export function ShipmentContentArea({
  selectedShipment,
  selectedId,
  segmentStep,
  showAddShipment,
  onCloseAddShipment,
  onCreateShipment,
  onDeselect,
  editedSegmentsByShipmentId,
  onSegmentUpdate,
  onAddSegment,
  onSegmentSave,
  serviceShipments,
  timeoutsRef,
  onShipmentIsNewOverride,
  onUpdateShipment,
  segmentsLoading = false,
  fetchedSegments = null,
}: ShipmentContentAreaProps) {
  // Use fetched segments only - never use segments from initial shipment data
  // Segments are fetched on-demand when a shipment is selected
  const segmentsToRender = useMemo(() => {
    // If loading, return empty array (skeleton will be shown)
    if (segmentsLoading) {
      return [];
    }
    // If we have fetched segments, use them (even if empty array)
    if (fetchedSegments !== null) {
      return fetchedSegments;
    }
    // If no fetched segments yet and not loading, check for edited segments
    // Otherwise return empty array (segments will be fetched)
    return editedSegmentsByShipmentId[selectedShipment.id] ?? [];
  }, [
    fetchedSegments,
    segmentsLoading,
    editedSegmentsByShipmentId,
    selectedShipment.id,
  ]);

  const renderSegments = segmentsToRender;

  // Find first in-progress segment (not completed, not cancelled, not pending_assignment)
  const inProgressSegment = useMemo(() => {
    return renderSegments.find(
      (seg) =>
        seg.status !== SegmentStatus.DELIVERED &&
        seg.status !== SegmentStatus.CANCELLED &&
        seg.status !== SegmentStatus.PENDING_ASSIGNMENT &&
        !seg.isCompleted
    );
  }, [renderSegments]);

  // Extract driver info from first in-progress segment
  const driverName =
    inProgressSegment?.driverName || inProgressSegment?.assigneeName || "";
  const driverPhoto =
    inProgressSegment?.driverAvatarUrl ||
    inProgressSegment?.assigneeAvatarUrl ||
    inProgressSegment?.driverPhoto ||
    "";

  // Extract vehicle info from segment
  const vehicle =
    inProgressSegment?.vehicleLabel || inProgressSegment?.vehicleType || "";

  // Extract local company info from segment
  const localCompany =
    inProgressSegment?.localCompany || inProgressSegment?.companyName || "";

  // Extract destination from shipment (prioritize shipment over segment)
  const destination = useMemo(() => {
    // Prioritize shipment destination
    if (
      selectedShipment.destinationCity &&
      selectedShipment.destinationCountry
    ) {
      return `${selectedShipment.destinationCity}, ${selectedShipment.destinationCountry}`;
    }
    if (selectedShipment.destinationCity) {
      return selectedShipment.destinationCity;
    }
    // Fall back to segment destination only if shipment doesn't have it
    if (
      inProgressSegment?.destinationCity &&
      inProgressSegment?.destinationCountry
    ) {
      return `${inProgressSegment.destinationCity}, ${inProgressSegment.destinationCountry}`;
    }
    if (inProgressSegment?.destinationCity) {
      return inProgressSegment.destinationCity;
    }
    return "";
  }, [inProgressSegment, selectedShipment]);

  // Extract last activity info
  const { lastActivity, lastActivityTime } = useMemo(() => {
    // Try to get GPS update time first
    const gpsUpdate = inProgressSegment?.lastGpsUpdate;
    const updatedAt =
      inProgressSegment?.updatedAt || selectedShipment.updatedAt;

    // Determine activity status based on segment status
    let activity = "";
    if (inProgressSegment) {
      const status = inProgressSegment.status;
      if (status === SegmentStatus.TO_DESTINATION) {
        activity = "In Transit";
      } else if (
        status === SegmentStatus.AT_ORIGIN ||
        status === SegmentStatus.TO_ORIGIN
      ) {
        activity = "At Origin";
      } else if (status === SegmentStatus.AT_DESTINATION) {
        activity = "At Destination";
      } else if (status === SegmentStatus.LOADING) {
        activity = "Loading";
      } else if (status === SegmentStatus.IN_CUSTOMS) {
        activity = "In Customs";
      } else if (status === SegmentStatus.DELIVERED) {
        activity = "Delivered";
      } else if (status === SegmentStatus.ASSIGNED) {
        activity = "Assigned";
      } else {
        activity = "Active";
      }
    } else {
      activity = selectedShipment.status || "Pending";
    }

    // Format time
    let timeStr = "";
    if (gpsUpdate) {
      try {
        const date = new Date(gpsUpdate);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) {
          timeStr = "Just now";
        } else if (diffMins < 60) {
          timeStr = `${diffMins}m ago`;
        } else if (diffHours < 24) {
          timeStr = `${diffHours}h ago`;
        } else if (diffDays < 7) {
          timeStr = `${diffDays}d ago`;
        } else {
          timeStr = date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });
        }
      } catch {
        timeStr = "";
      }
    } else if (updatedAt) {
      try {
        const date = new Date(updatedAt);
        timeStr = date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
      } catch {
        timeStr = "";
      }
    }

    return { lastActivity: activity, lastActivityTime: timeStr };
  }, [inProgressSegment, selectedShipment]);

  // Manage which segment is open (accordion behavior - only one at a time)
  const [openSegmentStep, setOpenSegmentStep] = useState<number | undefined>(
    segmentStep
  );

  // Update openSegmentStep when segmentStep prop changes (e.g., from URL)
  useEffect(() => {
    if (segmentStep !== undefined) {
      setOpenSegmentStep(segmentStep);
    }
  }, [segmentStep]);

  const handleSegmentToggle = (step: number) => {
    setOpenSegmentStep((current) => (current === step ? undefined : step));
  };

  const isReadOnlySelected = false;

  useSegmentScroll(segmentStep, selectedShipment);

  return (
    <div className="flex-1 h-screen bg-slate-100 max-w-4xl mx-auto overflow-hidden">
      <div className="h-full overflow-y-auto no-scrollbar">
        <div className="p-7 flex flex-col gap-4">
          <AddShipmentModal
            open={showAddShipment}
            onClose={onCloseAddShipment}
            onCreate={onCreateShipment}
          />
          <NavigatingInfo
            vehicle={vehicle}
            weight={
              selectedShipment.cargoWeight
                ? `${selectedShipment.cargoWeight} KG`
                : ""
            }
            localCompany={localCompany}
            destination={destination}
            lastActivity={lastActivity}
            lastActivityTime={lastActivityTime}
            title={selectedShipment.title}
            shipmentId={selectedShipment.id}
            driverName={driverName}
            driverPhoto={driverPhoto ? getFileUrl(driverPhoto) : undefined}
            onClose={onDeselect}
          />

          <Segments
            readOnly={isReadOnlySelected}
            title="Segments"
            onAddSegment={
              !isReadOnlySelected && selectedShipment.status !== "Delivered"
                ? () => onAddSegment(selectedShipment.id)
                : undefined
            }
          >
            {segmentsLoading
              ? // Show skeleton loading state while fetching segments
                Array.from({ length: 3 }).map((_, index) => (
                  <SegmentDetailsSkeleton key={`skeleton-${index}`} />
                ))
              : renderSegments.map((seg: SegmentData, idx: number) => {
                  const domainSelected = serviceShipments?.find(
                    (s) => s.id === selectedId
                  );

                  if (idx == 0) {
                    seg.originCity = selectedShipment.originCity;
                  }

                  if (idx == renderSegments.length - 1) {
                    seg.destinationCity = selectedShipment.destinationCity;
                  }
                  return (
                    <SegmentItem
                      key={seg.step}
                      segment={seg}
                      index={idx}
                      shipment={selectedShipment}
                      selectedId={selectedId}
                      domainShipment={domainSelected}
                      renderSegments={renderSegments}
                      isReadOnly={isReadOnlySelected}
                      segmentStep={segmentStep}
                      editedSegmentsByShipmentId={editedSegmentsByShipmentId}
                      onSegmentSave={onSegmentSave}
                      onSegmentUpdate={onSegmentUpdate}
                      onShipmentIsNewOverride={onShipmentIsNewOverride}
                      onUpdateShipment={onUpdateShipment}
                      timeoutsRef={timeoutsRef}
                      open={openSegmentStep === seg.step}
                      onToggle={() => handleSegmentToggle(seg.step ?? 0)}
                    />
                  );
                })}
          </Segments>
          <ActivitySection items={[]} defaultOpen={false} />
        </div>
      </div>
    </div>
  );
}
