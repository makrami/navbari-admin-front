import type { Shipment, Segment } from "../../shared/types/shipment";
import { SegmentAssignmentStatus, SegmentLogisticsStatus } from "../../shared/types/shipment";

const mkId = (prefix: string = "#demo"): string => `${prefix}-${Math.random().toString(36).slice(2, 8)}`;

const completedSegment = (overrides: Partial<Segment>): Segment => ({
  id: mkId("seg"),
  assignmentStatus: SegmentAssignmentStatus.ASSIGNED,
  logisticsStatus: SegmentLogisticsStatus.DELIVERED,
  source: "demo-static",
  isCompleted: true,
  ...overrides,
});

export const demoStaticShipments: Shipment[] = [
  {
    id: "#8zb11k2",
    title: "Delivered Shipment n.23",
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
    currentSegmentIndex: 3,
    source: "demo-static",
    segments: [
      completedSegment({ step: 1, place: "Beijing, China", datetime: "06/08 - 09:20", driverName: "Zhang Wei", driverRating: 4.8 }),
      completedSegment({ step: 2, place: "Hohhot, China", datetime: "06/09 - 16:05", driverName: "Liu Yang", driverRating: 4.6 }),
      completedSegment({ step: 3, place: "Ulaanbaatar, Mongolia", datetime: "06/10 - 12:40", driverName: "Bataar Khan", driverRating: 4.9 }),
      completedSegment({ step: 4, place: "Moscow, Russia", datetime: "06/12 - 08:15", driverName: "Amina Li", driverRating: 4.9 }),
    ],
  },
  {
    id: "#6c23m68",
    title: "Origin Shipment n.21",
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
    currentSegmentIndex: 0,
    source: "demo-static",
    segments: [
      completedSegment({ step: 1, place: "Hejiang, China", datetime: "06/11 - 17:45", driverName: "Xin Zhao", driverRating: 4.5 }),
      completedSegment({ step: 2, place: "Ningxia, China", datetime: "06/11 - 04:15", driverName: "Li Chen", driverRating: 4.7 }),
      completedSegment({ step: 3, place: "Inner Mongolia", datetime: "06/11 - 23:03", driverName: "Wang Ming", driverRating: 4.3 }),
    ],
  },
];

export const demoSimShipments: Shipment[] = [];
