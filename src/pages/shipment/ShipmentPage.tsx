import { useState, useEffect, useRef } from "react";
import {
  SearchShipment,
  AddShipment,
  ShipmentItem,
  type ShipmentStatus,
} from "../../components";
import { ListPanel } from "../../shared/components/ui/ListPanel";
import { Segments } from "./segments/Segments";
import NavigatingInfo from "./details/components/NavigatingInfo";
import SegmentDetails from "./segments/components/SegmentDetails";
import ActivitySection from "./Activity/components/ActivitySection";
import type { ActivityItemData } from "./Activity/types";
import { ShipmentPageSkeleton } from "./components/ShipmentSkeleton";
import AddShipmentModal, {
  type AddShipmentInput as AddShipmentFormInput,
} from "./components/AddShipmentModal";
import type { CargoCompany } from "./components/CargoDeclarationModal";
import avatar from "../../assets/images/avatar.png";
import driver1 from "../../assets/images/drivers/driver1.png";
import driver2 from "../../assets/images/drivers/driver2.png";
import driver3 from "../../assets/images/drivers/driver3.png";
import driver4 from "../../assets/images/drivers/driver4.png";

type ShipmentData = {
  title: string;
  id: string;
  status: ShipmentStatus;
  fromCountryCode: string;
  toCountryCode: string;
  progressPercent: number;
  userName: string;
  rating: number;
  vehicle: string;
  weight: string;
  localCompany: string;
  destination: string;
  lastActivity: string;
  lastActivityTime: string;
  currentSegmentIndex: number; // 0-based index of the current segment
  isNew?: boolean; // newly created shipment - suppress progress UI
  segments: Array<{
    step: number;
    place: string;
    datetime: string;
    isCompleted?: boolean;
    isPlaceholder?: boolean;
    nextPlace?: string;
    startAt?: string;
    estFinishAt?: string;
    vehicleLabel?: string;
    localCompany?: string;
    baseFeeUsd?: number;
    driverName: string;
    driverPhoto?: string; // Optional - if not provided, show user icon
    driverRating: number;
    cargoCompanies?: CargoCompany[];
  }>;
  activities: ActivityItemData[];
};

export function ShipmentPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddShipment, setShowAddShipment] = useState(false);
  const [addedShipments, setAddedShipments] = useState<ShipmentData[]>([]);
  const [editedSegmentsByShipmentId, setEditedSegmentsByShipmentId] = useState<
    Record<string, ShipmentData["segments"]>
  >({});
  const [, setShipmentIsNewOverride] = useState<Record<string, boolean>>({});
  const timeoutsRef = useRef<number[]>([]);

  useEffect(() => {
    // Simulate loading for 2 seconds
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((id) => clearTimeout(id));
      timeoutsRef.current = [];
    };
  }, []);

  if (isLoading) {
    return <ShipmentPageSkeleton />;
  }

  const items: ShipmentData[] = [
    {
      title: "Origin Shipment n.21",
      id: "#6c23m68",
      status: "In Origin",
      fromCountryCode: "CN",
      toCountryCode: "RU",
      progressPercent: 25,
      userName: "Xin Zhao",
      rating: 4.5,
      vehicle: "Cargo Truck HD320",
      weight: "146.5 KG",
      localCompany: "Sendm Co.",
      destination: "Bratsk, Russia",
      lastActivity: "Turned their GPS on.",
      lastActivityTime: "2m ago",
      currentSegmentIndex: 0, // Currently at first segment
      segments: [
        {
          step: 1,
          place: "Hejiang, China",
          datetime: "06/11 - 17:45",
          isCompleted: false,
          driverName: "Xin Zhao",
          driverPhoto: driver1,
          driverRating: 4.5,
        },
        {
          step: 2,
          place: "Ningxia, China",
          datetime: "06/11 - 04:15",
          isCompleted: false,
          driverName: "Li Chen",
          driverPhoto: driver2,
          driverRating: 4.7,
        },
        {
          step: 3,
          place: "Inner Mongolia",
          datetime: "06/11 - 23:03",
          isCompleted: false,
          driverName: "Wang Ming",
          driverRating: 4.3, // No photo - will show user icon
        },
      ],
      activities: [
        {
          id: 1,
          type: "gps_on",
          actorName: "Xin Zhao",
          actorAvatarUrl: avatar,
          timestamp: "13 Aug - 13:04",
        },
        {
          id: 2,
          type: "driver_changed",
          actorName: "",
          fromName: "Li Wei",
          toName: "Xin Zhao",
          actorAvatarUrl: avatar,
          timestamp: "13 Aug - 12:22",
        },
        {
          id: 3,
          type: "uploaded",
          actorName: "Xin Zhao",
          actorAvatarUrl: avatar,
          fileName: "photo_616512026.jpg",
          timestamp: "12 Aug - 18:03",
        },
      ],
    },
    {
      title: "Delivered Shipment n.23",
      id: "#8zb11k2",
      status: "Delivered",
      fromCountryCode: "CN",
      toCountryCode: "RU",
      progressPercent: 100,
      userName: "Amina Li",
      rating: 4.9,
      vehicle: "Mercedes Actros 2545",
      weight: "220.8 KG",
      localCompany: "Trans Express Ltd.",
      destination: "Moscow, Russia",
      lastActivity: "Shipment delivered successfully.",
      lastActivityTime: "3h ago",
      currentSegmentIndex: 3, // All segments completed (at last segment)
      segments: [
        {
          step: 1,
          place: "Beijing, China",
          datetime: "06/08 - 09:20",
          isCompleted: true,
          driverName: "Zhang Wei",
          driverPhoto: driver3,
          driverRating: 4.8,
        },
        {
          step: 2,
          place: "Hohhot, China",
          datetime: "06/09 - 16:05",
          isCompleted: true,
          driverName: "Liu Yang",
          driverPhoto: driver4,
          driverRating: 4.6,
        },
        {
          step: 3,
          place: "Ulaanbaatar, Mongolia",
          datetime: "06/10 - 12:40",
          isCompleted: true,
          driverName: "Bataar Khan",
          driverPhoto: driver1,
          driverRating: 4.9,
        },
        {
          step: 4,
          place: "Moscow, Russia",
          datetime: "06/12 - 08:15",
          isCompleted: true,
          driverName: "Amina Li",
          driverPhoto: driver2,
          driverRating: 4.9,
        },
      ],
      activities: [
        {
          id: 1,
          type: "arrived",
          actorName: "",
          segmentIndex: 4,
          locationName: "Moscow",
          timestamp: "12 Aug - 08:15",
        },
        {
          id: 2,
          type: "gps_off",
          actorName: "Amina Li",
          actorAvatarUrl: avatar,
          timestamp: "12 Aug - 08:10",
        },
        {
          id: 3,
          type: "uploaded",
          actorName: "Amina Li",
          actorAvatarUrl: avatar,
          fileName: "delivery_proof.jpg",
          timestamp: "12 Aug - 08:05",
        },
      ],
    },
    {
      title: "Electronics n.22",
      id: "#9xa23p1",
      status: "Loading",
      fromCountryCode: "CN",
      toCountryCode: "RU",
      progressPercent: 60,
      userName: "Wei Chen",
      rating: 4.7,
      vehicle: "Volvo FH16 750",
      weight: "312.4 KG",
      localCompany: "FastCargo Inc.",
      destination: "Novosibirsk, Russia",
      lastActivity: "Loading cargo at warehouse.",
      lastActivityTime: "15m ago",
      currentSegmentIndex: 1, // Currently at second segment (Guangzhou)
      segments: [
        {
          step: 1,
          place: "Shenzhen, China",
          datetime: "06/09 - 08:12",
          isCompleted: true,
          driverName: "Chen Liang",
          driverPhoto: driver3,
          driverRating: 4.8,
        },
        {
          step: 2,
          place: "Guangzhou, China",
          datetime: "06/10 - 10:20",
          isCompleted: false,
          driverName: "Wei Chen",
          driverPhoto: driver4,
          driverRating: 4.7,
        },
        {
          step: 3,
          place: "Urumqi, China",
          datetime: "06/11 - 14:55",
          isCompleted: false,
          driverName: "Ma Jun",
          driverRating: 4.5, // No photo - will show user icon
        },
      ],
      activities: [
        {
          id: 1,
          type: "uploaded",
          actorName: "Wei Chen",
          actorAvatarUrl: avatar,
          fileName: "loading_doc.pdf",
          timestamp: "11 Aug - 14:55",
        },
        {
          id: 2,
          type: "arrived",
          actorName: "",
          segmentIndex: 2,
          locationName: "Guangzhou",
          timestamp: "10 Aug - 10:20",
        },
      ],
    },
    {
      title: "Textile Goods n.24",
      id: "#7tx45n9",
      status: "In Transit",
      fromCountryCode: "TR",
      toCountryCode: "DE",
      progressPercent: 75,
      userName: "Mehmet Yilmaz",
      rating: 4.8,
      vehicle: "Scania R500",
      weight: "189.3 KG",
      localCompany: "EuroTrans GmbH",
      destination: "Berlin, Germany",
      lastActivity: "Crossed the border.",
      lastActivityTime: "1h ago",
      currentSegmentIndex: 2, // Currently at third segment (Prague)
      segments: [
        {
          step: 1,
          place: "Istanbul, Turkey",
          datetime: "06/10 - 14:30",
          isCompleted: true,
          driverName: "Ahmet Demir",
          driverPhoto: driver1,
          driverRating: 4.7,
        },
        {
          step: 2,
          place: "Sofia, Bulgaria",
          datetime: "06/11 - 08:45",
          isCompleted: true,
          driverName: "Georgi Petrov",
          driverPhoto: driver2,
          driverRating: 4.6,
        },
        {
          step: 3,
          place: "Prague, Czech Republic",
          datetime: "06/12 - 16:20",
          isCompleted: false,
          driverName: "Mehmet Yilmaz",
          driverPhoto: driver3,
          driverRating: 4.8,
        },
        {
          step: 4,
          place: "Berlin, Germany",
          datetime: "06/13 - 11:00",
          isCompleted: false,
          driverName: "Klaus Schmidt",
          driverRating: 4.9, // No photo - will show user icon
        },
      ],
      activities: [
        {
          id: 1,
          type: "arrived",
          actorName: "",
          segmentIndex: 3,
          locationName: "Prague",
          timestamp: "12 Aug - 16:20",
        },
        {
          id: 2,
          type: "gps_on",
          actorName: "Mehmet Yilmaz",
          actorAvatarUrl: avatar,
          timestamp: "12 Aug - 16:15",
        },
      ],
    },
    {
      title: "Food Products n.25",
      id: "#5fp89r3",
      status: "Customs",
      fromCountryCode: "IT",
      toCountryCode: "GB",
      progressPercent: 45,
      userName: "Marco Rossi",
      rating: 4.6,
      vehicle: "DAF XF 480",
      weight: "425.7 KG",
      localCompany: "Channel Logistics",
      destination: "London, UK",
      lastActivity: "Waiting at customs checkpoint.",
      lastActivityTime: "45m ago",
      currentSegmentIndex: 1, // Currently at second segment (Lyon)
      segments: [
        {
          step: 1,
          place: "Milan, Italy",
          datetime: "06/11 - 11:00",
          isCompleted: true,
          driverName: "Giuseppe Ferrari",
          driverPhoto: driver4,
          driverRating: 4.7,
        },
        {
          step: 2,
          place: "Lyon, France",
          datetime: "06/12 - 09:30",
          isCompleted: false,
          driverName: "Marco Rossi",
          driverPhoto: driver1,
          driverRating: 4.6,
        },
        {
          step: 3,
          place: "Calais, France",
          datetime: "06/13 - 07:00",
          isCompleted: false,
          driverName: "Pierre Dubois",
          driverPhoto: driver2,
          driverRating: 4.8,
        },
        {
          step: 4,
          place: "London, UK",
          datetime: "06/13 - 15:30",
          isCompleted: false,
          driverName: "James Wilson",
          driverRating: 4.5, // No photo - will show user icon
        },
      ],
      activities: [
        {
          id: 1,
          type: "uploaded",
          actorName: "Marco Rossi",
          actorAvatarUrl: avatar,
          fileName: "customs_declaration.pdf",
          timestamp: "13 Aug - 07:00",
        },
        {
          id: 2,
          type: "arrived",
          actorName: "",
          segmentIndex: 3,
          locationName: "Calais",
          timestamp: "13 Aug - 07:00",
        },
      ],
    },
    {
      title: "Medical Supplies n.26",
      id: "#3md67k8",
      status: "In Transit",
      fromCountryCode: "US",
      toCountryCode: "CA",
      progressPercent: 90,
      userName: "Sarah Johnson",
      rating: 5.0,
      vehicle: "Freightliner Cascadia",
      weight: "98.2 KG",
      localCompany: "MediTransport Inc.",
      destination: "Toronto, Canada",
      lastActivity: "30 minutes until destination.",
      lastActivityTime: "5m ago",
      currentSegmentIndex: 2, // Currently at third segment (Toronto - final segment)
      segments: [
        {
          step: 1,
          place: "New York, USA",
          datetime: "06/12 - 15:00",
          isCompleted: true,
          driverName: "Michael Brown",
          driverPhoto: driver3,
          driverRating: 4.9,
        },
        {
          step: 2,
          place: "Buffalo, USA",
          datetime: "06/12 - 21:30",
          isCompleted: true,
          driverName: "Robert Smith",
          driverPhoto: driver4,
          driverRating: 4.8,
        },
        {
          step: 3,
          place: "Toronto, Canada",
          datetime: "06/13 - 09:00",
          isCompleted: false,
          driverName: "Sarah Johnson",
          driverPhoto: driver2,
          driverRating: 5.0,
        },
      ],
      activities: [
        {
          id: 1,
          type: "gps_on",
          actorName: "Sarah Johnson",
          actorAvatarUrl: avatar,
          timestamp: "13 Aug - 08:30",
        },
        {
          id: 2,
          type: "arrived",
          actorName: "",
          segmentIndex: 2,
          locationName: "Buffalo",
          timestamp: "12 Aug - 21:30",
        },
      ],
    },
  ];

  const allItems = [...addedShipments, ...items];
  const selectedShipment = allItems.find((i) => i.id === selectedId);
  const renderSegments = selectedShipment
    ? editedSegmentsByShipmentId[selectedShipment.id] ??
      selectedShipment.segments
    : [];

  // Get current segment's driver info
  const currentSegment = selectedShipment
    ? renderSegments[selectedShipment.currentSegmentIndex]
    : undefined;

  // If nothing is selected yet, show a centered, wrapped list of shipments
  if (!selectedId) {
    return (
      <div className="flex w-full h-screen bg-slate-100 overflow-y-auto">
        <div className="max-w-6xl w-full mx-auto p-9">
          <AddShipmentModal
            open={showAddShipment}
            onClose={() => setShowAddShipment(false)}
            onCreate={(data: AddShipmentFormInput) => {
              const newShipment: ShipmentData = {
                title: data.title,
                id: data.id,
                status: "In Origin",
                fromCountryCode: "CN",
                toCountryCode: "RU",
                progressPercent: 0,
                userName: data.driverName,
                rating: data.driverRating || 0,
                vehicle: "Unknown",
                weight: "0 KG",
                localCompany: "N/A",
                destination: data.destination || "",
                lastActivity: "Created",
                lastActivityTime: "Just now",
                currentSegmentIndex: 0,
                segments: [
                  {
                    step: 1,
                    place: data.place,
                    datetime: data.datetime,
                    isCompleted: false,
                    driverName: data.driverName,
                    driverPhoto: data.driverPhoto,
                    driverRating: data.driverRating || 0,
                  },
                ],
                activities: [],
              };
              setAddedShipments((prev) => [...prev, newShipment]);
              setSelectedId(newShipment.id);
            }}
          />
          <div className="mb-4 flex items-center gap-3">
            <div className="flex-1">
              <SearchShipment />
            </div>
            <AddShipment onClick={() => setShowAddShipment(true)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {allItems.map((item) => (
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
                selected={false}
                onClick={() => setSelectedId(item.id)}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Once a shipment is selected, show the existing left-list/right-details layout
  return (
    <div className="flex w-full h-screen overflow-hidden">
      <ListPanel title="Shipment">
        <SearchShipment />
        <AddShipment onClick={() => setShowAddShipment(true)} />
        <div className="grid gap-4">
          {allItems.map((item) => (
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
              onClick={() => setSelectedId(item.id)}
            />
          ))}
        </div>
      </ListPanel>

      {/* Right-side details layout container with independent scroll */}
      {selectedShipment && (
        <div className="flex-1 h-screen bg-slate-100 max-w-4xl mx-auto overflow-hidden">
          <div className="h-full overflow-y-auto no-scrollbar">
            <div className="p-9 flex flex-col gap-4">
              <AddShipmentModal
                open={showAddShipment}
                onClose={() => setShowAddShipment(false)}
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
                  setAddedShipments((prev) => [newShipment, ...prev]);
                  setSelectedId(newShipment.id);
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
                onClose={() => setSelectedId(null)}
              />
              <Segments title="Segments">
                {renderSegments.map((seg, idx) => {
                  const isCurrent =
                    idx === selectedShipment.currentSegmentIndex;
                  const isCompleted = Boolean(seg.isCompleted);
                  const prevCompleted =
                    idx === 0
                      ? true
                      : Boolean(renderSegments[idx - 1]?.isCompleted);
                  // Always enforce ordered unlocking: a segment is locked unless previous is completed
                  const locked = idx === 0 ? false : !prevCompleted;

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
                      defaultOpen={false}
                      editable={Boolean(
                        !seg.isCompleted &&
                          !locked &&
                          // If cargo has been declared, show pending list instead of the editor
                          !(seg.cargoCompanies && seg.cargoCompanies.length)
                      )}
                      locked={locked}
                      onSave={(update) => {
                        setEditedSegmentsByShipmentId((prev) => {
                          const base = prev[selectedShipment.id]
                            ? [...prev[selectedShipment.id]!]
                            : [...selectedShipment.segments];
                          const index = base.findIndex(
                            (s) => s.step === seg.step
                          );
                          if (index >= 0) {
                            base[index] = {
                              ...base[index],
                              place: update.place ?? base[index].place,
                              nextPlace:
                                update.nextPlace ?? base[index].nextPlace,
                              startAt: update.startAt ?? base[index].startAt,
                              estFinishAt:
                                update.estFinishAt ?? base[index].estFinishAt,
                              baseFeeUsd:
                                update.baseFeeUsd ?? base[index].baseFeeUsd,
                              cargoCompanies:
                                update.cargoCompanies ??
                                base[index].cargoCompanies,
                              driverName:
                                update.assigneeName ?? base[index].driverName,
                              driverPhoto:
                                update.assigneeAvatarUrl ??
                                base[index].driverPhoto,
                              isPlaceholder:
                                update.isPlaceholder ??
                                base[index].isPlaceholder,
                              isCompleted:
                                update.isCompleted ?? base[index].isCompleted,
                            } as (typeof base)[number];
                          }
                          const next = { ...prev, [selectedShipment.id]: base };
                          if (
                            update.cargoCompanies &&
                            update.cargoCompanies.length
                          ) {
                            const chosenCompany = update.cargoCompanies[0];
                            const chosenDriver = chosenCompany.drivers?.[0];
                            const timeoutId = window.setTimeout(() => {
                              setEditedSegmentsByShipmentId((prev2) => {
                                const base2 = prev2[selectedShipment.id]
                                  ? [...prev2[selectedShipment.id]!]
                                  : [...selectedShipment.segments];
                                const idx2 = base2.findIndex(
                                  (s) => s.step === seg.step
                                );
                                if (idx2 >= 0) {
                                  base2[idx2] = {
                                    ...base2[idx2],
                                    driverName:
                                      chosenDriver?.name ||
                                      base2[idx2].driverName ||
                                      "Xin Zhao",
                                    driverPhoto:
                                      chosenDriver?.avatarUrl ||
                                      base2[idx2].driverPhoto,
                                    driverRating:
                                      base2[idx2].driverRating || 4.5,
                                    // Resolve pending: assign driver, clear pending companies and mark completed
                                    cargoCompanies: undefined,
                                    isCompleted: true,
                                  } as (typeof base2)[number];
                                }
                                const anyPending = base2.some((s) =>
                                  Boolean(
                                    s.cargoCompanies && s.cargoCompanies.length
                                  )
                                );
                                if (!anyPending) {
                                  setShipmentIsNewOverride((p) => ({
                                    ...p,
                                    [selectedShipment.id]: false,
                                  }));
                                }
                                return {
                                  ...prev2,
                                  [selectedShipment.id]: base2,
                                };
                              });
                            }, 10000);
                            timeoutsRef.current.push(timeoutId);
                          }
                          return next;
                        });
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
      )}
    </div>
  );
}
