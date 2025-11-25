import imgAvatar from "../../assets/images/avatar.png";
import driver1 from "../../assets/images/drivers/driver1.png";
import driver2 from "../../assets/images/drivers/driver2.png";
import driver3 from "../../assets/images/drivers/driver3.png";
import {
  CHAT_RECIPIENT_TYPE,
  type ChatRecipientType,
} from "../../services/chat/chat.types";

export type ChatAlert = {
  id: string;
  name: string;
  avatarUrl?: string;
  messagePreview?: string;
  alerts: number;
  messages: number;
  timestamp?: string;
  lastMessageAt?: string;
  shipmentId?: string;
  shipmentNumber?: string;
  driverId?: string;
  companyId?: string;
  recipientType?: ChatRecipientType;
  rating?: number;
  status?: string;
  statusTime?: string;
  vehicle?: string;
  weight?: string;
  estFinish?: string;
  localCompany?: string;
  localCompanyLogo?: string;
  destination?: string;
  totalPaid?: string;
  totalPending?: string;
  currentSegment?: {
    number: number;
    from: string;
    to: string;
    distance: string;
  };
  segmentPath?: readonly [number, number][];
};

export const CHAT_ALERTS: ChatAlert[] = [
  {
    id: "1",
    name: "Amita Sing",
    avatarUrl: driver1,
    messagePreview: "I'm trying to turn on m...",
    alerts: 2,
    messages: 7,
    timestamp: "14:35",
    shipmentId: "#6c23m68",
    shipmentNumber: "Electronic Shipment n.21",
    driverId: "d1",
    companyId: "company-1",
    recipientType: CHAT_RECIPIENT_TYPE.DRIVER,
    rating: 4.5,
    status: "Turned their GPS on.",
    statusTime: "2m ago",
    vehicle: "Cargo Truck HD320",
    weight: "146.5 KG",
    estFinish: "14 Aug - 03:45",
    localCompany: "DHL Logistics",
    destination: "Bratsk, Russia",
    totalPaid: "$1,563,263,236",
    totalPending: "$463,864",
    currentSegment: {
      number: 2,
      from: "Hejiang, China",
      to: "Inner Mongolia, Mongolia",
      distance: "34 KM",
    },
    segmentPath: [
      [104.0668, 30.5728],
      [111.6521, 40.8419],
    ] as const,
  },
  {
    id: "2",
    name: "Xin Zhao",
    avatarUrl: imgAvatar,
    messagePreview: "I'm trying to turn on m...",
    alerts: 2,
    messages: 7,
    timestamp: "14:35",
    shipmentId: "#6c23m68",
    shipmentNumber: "Electronic Shipment n.21",
    driverId: "d2",
    companyId: "company-2",
    recipientType: CHAT_RECIPIENT_TYPE.DRIVER,
    rating: 4.5,
    status: "Turned their GPS on.",
    statusTime: "2m ago",
    vehicle: "Cargo Truck HD320",
    weight: "146.5 KG",
    estFinish: "14 Aug - 03:45",
    localCompany: "DHL Logistics",
    destination: "Bratsk, Russia",
    totalPaid: "$1,563,263,236",
    totalPending: "$463,864",
    currentSegment: {
      number: 2,
      from: "Hejiang, China",
      to: "Inner Mongolia, Mongolia",
      distance: "34 KM",
    },
    segmentPath: [
      [104.0668, 30.5728],
      [111.6521, 40.8419],
    ] as const,
  },
  {
    id: "3",
    name: "Olaf Khan",
    avatarUrl: driver2,
    messagePreview: "I'm trying to turn on m...",
    alerts: 1,
    messages: 3,
    timestamp: "12:20",
    shipmentId: "#7d34n79",
    shipmentNumber: "Electronics Shipment n.15",
    driverId: "d3",
    companyId: "company-3",
    recipientType: CHAT_RECIPIENT_TYPE.DRIVER,
    rating: 4.8,
    status: "Arrived at checkpoint.",
    statusTime: "15m ago",
    vehicle: "Freight Truck XL500",
    weight: "220.3 KG",
    estFinish: "15 Aug - 10:30",
    localCompany: "FedEx Express",
    destination: "Moscow, Russia",
    totalPaid: "$2,145,789,123",
    totalPending: "$125,450",
    currentSegment: {
      number: 3,
      from: "Warsaw, Poland",
      to: "Minsk, Belarus",
      distance: "55 KM",
    },
    segmentPath: [
      [21.0122, 52.2297],
      [27.5615, 53.9045],
    ] as const,
  },
  {
    id: "4",
    name: "Maria Garcia",
    avatarUrl: driver3,
    messagePreview: "Need assistance with...",
    alerts: 0,
    messages: 5,
    timestamp: "11:45",
    shipmentId: "#8e45o80",
    shipmentNumber: "Food Shipment n.32",
    driverId: "d4",
    companyId: "company-4",
    recipientType: CHAT_RECIPIENT_TYPE.DRIVER,
    rating: 4.2,
    status: "Loading completed.",
    statusTime: "1h ago",
    vehicle: "Refrigerated Truck RT200",
    weight: "89.7 KG",
    estFinish: "16 Aug - 08:15",
    localCompany: "UPS Logistics",
    destination: "Barcelona, Spain",
    totalPaid: "$987,654,321",
    totalPending: "$45,678",
    currentSegment: {
      number: 1,
      from: "Madrid, Spain",
      to: "Valencia, Spain",
      distance: "28 KM",
    },
    segmentPath: [
      [-3.7038, 40.4168],
      [-0.3774, 39.4699],
    ] as const,
  },
];
