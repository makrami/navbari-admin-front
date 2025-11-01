import {
  SearchShipment,
  AddShipment,
  SegmentButton,
  ShipmentItem,
} from "../../../components";
import { ListPanel } from "../../../shared/components/ui/ListPanel";
import { Segments } from "../segments/Segments";
import NavigatingInfo from "../details/components/NavigatingInfo";
import SegmentDetails from "../segments/components/SegmentDetails";
import ActivitySection from "../Activity/components/ActivitySection";
import AddShipmentModal, {
  type AddShipmentInput as AddShipmentFormInput,
} from "./AddShipmentModal";
import type { ShipmentData } from "../types/shipmentTypes";
import type { Shipment as DomainShipment } from "../../../shared/types/shipment";
import type { SegmentData } from "../segments/components/SegmentDetails";
import { useEffect } from "react";

type ShipmentDetailsViewProps = {
  shipments: ShipmentData[];
  selectedShipment: ShipmentData;
  selectedId: string;
  segmentStep?: number;
  onShipmentSelect: (id: string) => void;
  onDeselect: () => void;
  onAddShipment: () => void;
  showAddShipment: boolean;
  onCloseAddShipment: () => void;
  onCreateShipment: (shipment: ShipmentData) => void;
  editedSegmentsByShipmentId: Record<string, ShipmentData["segments"]>;
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
};

export function ShipmentDetailsView({
  shipments,
  selectedShipment,
  selectedId,
  segmentStep,
  onShipmentSelect,
  onDeselect,
  onAddShipment,
  showAddShipment,
  onCloseAddShipment,
  onCreateShipment,
  editedSegmentsByShipmentId,
  onSegmentUpdate,
  onAddSegment,
  onSegmentSave,
  serviceShipments,
  timeoutsRef,
  onShipmentIsNewOverride,
}: ShipmentDetailsViewProps) {
  const renderSegments =
    editedSegmentsByShipmentId[selectedShipment.id] ??
    selectedShipment.segments;

  const isReadOnlySelected = Boolean(
    (serviceShipments || []).find((s) => s.id === selectedId)?.source ===
      "demo-static"
  );

  // Get current segment's driver info
  const currentSegment = renderSegments[selectedShipment.currentSegmentIndex];

  // Scroll to segment when segmentStep is provided
  useEffect(() => {
    if (segmentStep !== undefined) {
      // Wait for segments to render and expand
      const timeoutId = setTimeout(() => {
        const headerId = `segment-header-${segmentStep}`;
        const headerElement = document.getElementById(headerId);
        if (headerElement) {
          headerElement.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [segmentStep, renderSegments.length]);

  return (
    <div className="flex w-full h-screen overflow-hidden">
      <ListPanel title="Shipment">
        <SearchShipment />
        <div className="flex items-center gap-2">
          <AddShipment onClick={onAddShipment} />
          <SegmentButton />
        </div>
        <div className="grid gap-4">
          {shipments.map((item) => (
            <ShipmentItem
              key={item.id}
              title={item.title}
              id={item.id}
              status={item.status}
              fromCountryCode={item.fromCountryCode}
              toCountryCode={item.toCountryCode}
              progressPercent={item.progressPercent}
              userName={item.userName}
              rating={item.rating}
              segments={item.segments}
              selected={selectedId === item.id}
              onClick={() => onShipmentSelect(item.id)}
            />
          ))}
        </div>
      </ListPanel>

      {/* Right-side details layout container with independent scroll */}
      <div className="flex-1 h-screen bg-slate-100 max-w-4xl mx-auto overflow-hidden">
        <div className="h-full overflow-y-auto no-scrollbar">
          <div className="p-9 flex flex-col gap-4">
            <AddShipmentModal
              open={showAddShipment}
              onClose={onCloseAddShipment}
              onCreate={(data: AddShipmentFormInput) => {
                const newShipment: ShipmentData = {
                  title: data.title,
                  id: data.id,
                  status: "In Origin",
                  fromCountryCode: "CN",
                  toCountryCode: "RU",
                  progressPercent: 0,
                  userName: data.driverName || "",
                  rating: data.driverRating || 0,
                  vehicle: "Unknown",
                  weight: `${data.cargoWeight ?? 0} KG`,
                  localCompany: "N/A",
                  destination: data.to || data.destination || "",
                  lastActivity: "Created",
                  lastActivityTime: "Just now",
                  currentSegmentIndex: 0,
                  isNew: true,
                  segments: Array.from({
                    length: Math.max(0, Number(data.segmentsAmount ?? 0)),
                  }).map((_, i) => ({
                    step: i + 1,
                    place:
                      i === 0
                        ? data.from || ""
                        : "Assign Previous Segment First",
                    datetime: "",
                    isCompleted: false,
                    isPlaceholder: i > 0,
                    driverName: "",
                    driverRating: 0,
                  })),
                  activities: [],
                };
                onCreateShipment(newShipment);
              }}
            />
            <NavigatingInfo
              title={selectedShipment.title}
              shipmentId={selectedShipment.id}
              driverName={currentSegment?.driverName || ""}
              driverPhoto={currentSegment?.driverPhoto}
              rating={currentSegment?.driverRating || 0}
              vehicle={selectedShipment.vehicle}
              weight={selectedShipment.weight}
              localCompany={selectedShipment.localCompany}
              destination={selectedShipment.destination}
              lastActivity={selectedShipment.lastActivity}
              lastActivityTime={selectedShipment.lastActivityTime}
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
              {renderSegments.map((seg, idx) => {
                const domainSelected = (serviceShipments || []).find(
                  (s) => s.id === selectedId
                );
                const isCurrent = idx === selectedShipment.currentSegmentIndex;
                const isCompleted = Boolean(seg.isCompleted);
                const prevCompleted =
                  idx > 0
                    ? Boolean(renderSegments[idx - 1]?.isCompleted)
                    : false;
                // Lock only for newly created shipments: a segment is locked unless previous is completed
                const isNewShipment = selectedShipment.isNew === true;
                const locked = isReadOnlySelected
                  ? false
                  : isNewShipment
                  ? idx > 0 && !prevCompleted
                  : false;

                // Determine progress stage based on shipment status and position
                let progressStage:
                  | "to_origin"
                  | "in_origin"
                  | "loading"
                  | "to_dest"
                  | "delivered"
                  | undefined;
                if (!selectedShipment.isNew) {
                  if (idx < selectedShipment.currentSegmentIndex) {
                    // All previous segments are fully delivered
                    progressStage = "delivered";
                  } else if (isCurrent) {
                    // Current segment progress depends on shipment status
                    if (selectedShipment.status === "Loading") {
                      progressStage = "loading";
                    } else if (selectedShipment.status === "In Origin") {
                      progressStage = "in_origin";
                    } else if (selectedShipment.status === "Delivered") {
                      progressStage = "delivered";
                    } else if (selectedShipment.status === "In Transit") {
                      progressStage = "to_dest";
                    } else if (selectedShipment.status === "Customs") {
                      progressStage = "to_dest";
                    }
                  }
                }
                // Future segments have no progressStage (will be undefined)

                // Determine title helper: next segment start or destination
                const nextPlace =
                  seg.nextPlace !== undefined &&
                  seg.nextPlace !== null &&
                  seg.nextPlace !== ""
                    ? seg.nextPlace
                    : idx < selectedShipment.segments.length - 1
                    ? selectedShipment.segments[idx + 1]?.place
                    : undefined; // undefined => Destination

                return (
                  <SegmentDetails
                    key={seg.step}
                    data={{
                      ...seg,
                      assignmentStatus:
                        domainSelected?.segments?.[idx]?.assignmentStatus,
                      logisticsStatus:
                        domainSelected?.segments?.[idx]?.logisticsStatus,
                      // Only force placeholder for newly created shipments
                      isPlaceholder: selectedShipment.isNew
                        ? locked || seg.isPlaceholder
                        : seg.isPlaceholder,
                      isCurrent,
                      isCompleted,
                      assigneeName: seg.driverName,
                      assigneeAvatarUrl: seg.driverPhoto,
                      progressStage,
                      nextPlace,
                    }}
                    defaultOpen={segmentStep === seg.step}
                    editable={Boolean(
                      !isReadOnlySelected &&
                        !seg.isCompleted &&
                        !locked &&
                        // If cargo has been declared, show pending list instead of the editor
                        !(seg.cargoCompanies && seg.cargoCompanies.length)
                    )}
                    locked={locked}
                    showStatuses={!isReadOnlySelected}
                    onSave={(update) => {
                      onSegmentSave(selectedShipment.id, seg.step, update);

                      if (
                        update.cargoCompanies &&
                        update.cargoCompanies.length
                      ) {
                        const chosenCompany = update.cargoCompanies[0];
                        const chosenDriver = chosenCompany.drivers?.[0];
                        const timeoutId = window.setTimeout(() => {
                          onSegmentUpdate(selectedShipment.id, idx, {
                            assigneeName:
                              chosenDriver?.name ||
                              renderSegments[idx]?.driverName ||
                              "Xin Zhao",
                            assigneeAvatarUrl:
                              chosenDriver?.avatarUrl ||
                              renderSegments[idx]?.driverPhoto,
                            cargoCompanies: undefined,
                            isCompleted: true,
                          });

                          // Check if any pending segments remain
                          const updatedSegments =
                            editedSegmentsByShipmentId[selectedShipment.id] ??
                            selectedShipment.segments;
                          const anyPending = updatedSegments.some((s) =>
                            Boolean(s.cargoCompanies && s.cargoCompanies.length)
                          );
                          if (!anyPending) {
                            onShipmentIsNewOverride(selectedShipment.id, false);
                          }
                        }, 10000);
                        timeoutsRef.current.push(timeoutId);
                      }
                    }}
                  />
                );
              })}
            </Segments>
            <ActivitySection
              items={selectedShipment.activities}
              defaultOpen={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
