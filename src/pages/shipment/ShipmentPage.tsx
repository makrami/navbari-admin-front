import { useState } from "react";
import {
  Shipment,
  SearchShipment,
  AddShipment,
  ShipmentItem,
} from "../../components";
import { DetailsPanel } from "./details/DetailsPanel";
import { Segments } from "./segments/Segments";
import { ShipmentInfoCard } from "./details/components/ShipmentInfoCard";
import NavigatingInfo from "./details/components/NavigatingInfo";
import SegmentDetails from "./segments/components/SegmentDetails";
import ActivitySection from "./Activity/components/ActivitySection";
import type { ActivityItemData } from "./Activity/types";
import avatar from "../../assets/images/avatar.png";

export function ShipmentPage() {
  const [selectedId, setSelectedId] = useState<string | null>("#6c23m68");

  const items = [
    {
      title: "Origin Shipment n.21",
      id: "#6c23m68",
      status: "In Origin" as const,
      fromCountryCode: "CN",
      toCountryCode: "RU",
      progressPercent: 25,
      userName: "Xin Zhao",
      rating: 4.5,
      segments: [
        {
          step: 1,
          place: "Hejiang, China",
          datetime: "06/11 - 17:45",
          isCompleted: true,
        },
        {
          step: 2,
          place: "Ningxia, China",
          datetime: "06/11 - 04:15",
          isCompleted: true,
        },
        { step: 3, place: "Inner Mongolia", datetime: "06/11 - 23:03" },
      ],
    },
    {
      title: "Delivered Shipment n.23",
      id: "#8zb11k2",
      status: "Delivered" as const,
      fromCountryCode: "CN",
      toCountryCode: "RU",
      progressPercent: 100,
      userName: "Amina Li",
      rating: 4.9,
      segments: [
        {
          step: 1,
          place: "Beijing, China",
          datetime: "06/08 - 09:20",
          isCompleted: true,
        },
        {
          step: 2,
          place: "Hohhot, China",
          datetime: "06/09 - 16:05",
          isCompleted: true,
        },
        {
          step: 3,
          place: "Ulaanbaatar, Mongolia",
          datetime: "06/10 - 12:40",
          isCompleted: true,
        },
      ],
    },
    {
      title: "Electronic  n.22",
      id: "#9xa23p1",
      status: "Loading" as const,
      fromCountryCode: "CN",
      toCountryCode: "RU",
      progressPercent: 60,
      userName: "Wei Chen",
      rating: 4.7,
      segments: [
        {
          step: 1,
          place: "Shenzhen, China",
          datetime: "06/09 - 08:12",
          isCompleted: true,
        },
        {
          step: 2,
          place: "Guangzhou, China",
          datetime: "06/10 - 10:20",
          isCompleted: true,
        },
        { step: 3, place: "Urumqi, China", datetime: "06/11 - 14:55" },
      ],
    },
    {
      title: "Electronic Shipment n.23",
      id: "#9xa23p2",
      status: "Loading" as const,
      fromCountryCode: "CN",
      toCountryCode: "RU",
      progressPercent: 60,
      userName: "Wei Chen",
      rating: 4.7,
      segments: [
        {
          step: 1,
          place: "Shenzhen, China",
          datetime: "06/09 - 08:12",
          isCompleted: true,
        },
        {
          step: 2,
          place: "Guangzhou, China",
          datetime: "06/10 - 10:20",
          isCompleted: true,
        },
        { step: 3, place: "Urumqi, China", datetime: "06/11 - 14:55" },
      ],
    },
  ];

  const demoActivities: ActivityItemData[] = [
    {
      id: 1,
      type: "gps_on",
      actorName: "Oni Chan",
      actorAvatarUrl: avatar,
      timestamp: "13 Aug - 13:04",
    },
    {
      id: 2,
      type: "driver_changed",
      actorName: "",
      fromName: "Xin Zhao",
      toName: "Oni Chan",
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
    {
      id: 4,
      type: "arrived",
      actorName: "",
      segmentIndex: 2,
      locationName: "Ningxia",
      timestamp: "12 Aug - 17:45",
    },
    {
      id: 5,
      type: "uploaded",
      actorName: "Xin Zhao",
      actorAvatarUrl: avatar,
      fileName: "photo_616512026.jpg",
      timestamp: "12 Aug - 18:03",
    },
    {
      id: 6,
      type: "gps_off",
      actorName: "Xin Zhao",
      actorAvatarUrl: avatar,
      timestamp: "11 Aug - 05:45",
    },
  ];

  return (
    <div className="flex w-full h-screen overflow-hidden">
      <Shipment title="Shipment">
        <SearchShipment />
        <AddShipment />
        <div className="grid gap-4">
          {items.map((item) => (
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
      </Shipment>

      {/* Right-side details layout container with independent scroll */}
      <div className="flex-1 h-screen  max-w-5xl mx-auto overflow-hidden">
        <div className="h-full overflow-y-auto no-scrollbar">
          <div className="p-9 flex flex-col gap-4">
            <DetailsPanel className="min-h-0 p-0" title="Details">
              <ShipmentInfoCard />
            </DetailsPanel>
            <NavigatingInfo selectedId={selectedId} />
            <Segments
              title="Segments"
              onAddSegment={() => {
                /* hook up create segment flow later */
              }}
            >
              {items
                .find((i) => i.id === selectedId)
                ?.segments.map((seg, idx) => (
                  <SegmentDetails
                    key={seg.step}
                    data={{
                      ...seg,
                      // Mirror the screenshot: first completed, second current with progress & actions
                      isCurrent: idx === 1,
                      isCompleted: idx === 0,
                      assigneeName:
                        idx === 0
                          ? "Xin Zhao"
                          : idx === 1
                          ? "Oni Chan"
                          : "Olaf Khan",
                      assigneeAvatarUrl: undefined,
                      progressStage:
                        idx === 1
                          ? "loading"
                          : idx < 1
                          ? "in_origin"
                          : undefined,
                    }}
                    defaultOpen={idx === 1}
                  />
                ))}
            </Segments>
            <ActivitySection items={demoActivities} />
          </div>
        </div>
      </div>
    </div>
  );
}
