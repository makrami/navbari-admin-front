export type DemoRouteStatus = "pending" | "normal" | "alert";

export type DemoRouteDetails = {
  shipmentTitle: string;
  shipmentCode: string;
  driverName: string;
  driverRating: number;
  stateLabel: string;
};

export type DemoRoute = {
  id: string;
  from: string;
  to: string;
  status: DemoRouteStatus;
  details: DemoRouteDetails;
};

export const DEMO_ROUTES: DemoRoute[] = [
  {
    id: "s23-8zb11k2",
    from: "Moscow, Russia",
    to: "Berlin, Germany",
    status: "normal",
    details: {
      shipmentTitle: "Shipment n.23",
      shipmentCode: "#8zb11k2",
      driverName: "Amina Li",
      driverRating: 4.9,
      stateLabel: "Delivered",
    },
  },
  {
    id: "s21-6c23m68",
    from: "Hejiang, China",
    to: "Ningxia, China",
    status: "pending",
    details: {
      shipmentTitle: "Shipment n.21",
      shipmentCode: "#6c23m68",
      driverName: "Xin Zhao",
      driverRating: 4.5,
      stateLabel: "In Origin",
    },
  },
  {
    id: "s18-1k9qll4",
    from: "Istanbul, Turkey",
    to: "Sofia, Bulgaria",
    status: "normal",
    details: {
      shipmentTitle: "Shipment n.18",
      shipmentCode: "#1k9qll4",
      driverName: "Kamil Orlov",
      driverRating: 4.7,
      stateLabel: "On Route",
    },
  },
  {
    id: "s12-9mv7aa2",
    from: "Shenzhen, China",
    to: "Guangzhou, China",
    status: "alert",
    details: {
      shipmentTitle: "Shipment n.12",
      shipmentCode: "#9mv7aa2",
      driverName: "Mei Chen",
      driverRating: 4.6,
      stateLabel: "Delay Alert",
    },
  },
  {
    id: "s31-tt82hke",
    from: "Ulaanbaatar, Mongolia",
    to: "Hohhot, China",
    status: "pending",
    details: {
      shipmentTitle: "Shipment n.31",
      shipmentCode: "#tt82hke",
      driverName: "Baatar Gan",
      driverRating: 4.2,
      stateLabel: "Awaiting Driver",
    },
  },
  {
    id: "s09-m10jk22",
    from: "London, UK",
    to: "Calais, France",
    status: "normal",
    details: {
      shipmentTitle: "Shipment n.09",
      shipmentCode: "#m10jk22",
      driverName: "Olivia Green",
      driverRating: 4.8,
      stateLabel: "Cleared",
    },
  },
  {
    id: "s41-zx3l901",
    from: "New York, USA",
    to: "Toronto, Canada",
    status: "alert",
    details: {
      shipmentTitle: "Shipment n.41",
      shipmentCode: "#zx3l901",
      driverName: "Luis Gomez",
      driverRating: 4.1,
      stateLabel: "Customs Hold",
    },
  },
  {
    id: "s27-aa71pp9",
    from: "Novosibirsk, Russia",
    to: "Bratsk, Russia",
    status: "normal",
    details: {
      shipmentTitle: "Shipment n.27",
      shipmentCode: "#aa71pp9",
      driverName: "Svetlana Ivanova",
      driverRating: 4.4,
      stateLabel: "In Transit",
    },
  },
];

