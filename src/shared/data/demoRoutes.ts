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
  // China to Russia routes
  {
    id: "s01-cn-ru-001",
    from: "Beijing, China",
    to: "Moscow, Russia",
    status: "normal",
    details: {
      shipmentTitle: "Shipment n.01",
      shipmentCode: "#cn-ru-001",
      driverName: "Vladimir Petrov",
      driverRating: 4.8,
      stateLabel: "In Transit",
    },
  },
  {
    id: "s02-cn-ru-002",
    from: "Shanghai, China",
    to: "Saint Petersburg, Russia",
    status: "pending",
    details: {
      shipmentTitle: "Shipment n.02",
      shipmentCode: "#cn-ru-002",
      driverName: "Ivan Sokolov",
      driverRating: 4.6,
      stateLabel: "Awaiting Driver",
    },
  },
  {
    id: "s03-cn-ru-003",
    from: "Guangzhou, China",
    to: "Novosibirsk, Russia",
    status: "normal",
    details: {
      shipmentTitle: "Shipment n.03",
      shipmentCode: "#cn-ru-003",
      driverName: "Dmitry Volkov",
      driverRating: 4.7,
      stateLabel: "On Route",
    },
  },
  {
    id: "s04-cn-ru-004",
    from: "Shenzhen, China",
    to: "Yekaterinburg, Russia",
    status: "alert",
    details: {
      shipmentTitle: "Shipment n.04",
      shipmentCode: "#cn-ru-004",
      driverName: "Sergey Kuznetsov",
      driverRating: 4.5,
      stateLabel: "Delay Alert",
    },
  },
  // China to Iran routes
  {
    id: "s05-cn-ir-001",
    from: "Beijing, China",
    to: "Tehran, Iran",
    status: "normal",
    details: {
      shipmentTitle: "Shipment n.05",
      shipmentCode: "#cn-ir-001",
      driverName: "Hassan Rezaei",
      driverRating: 4.9,
      stateLabel: "In Transit",
    },
  },
  {
    id: "s06-cn-ir-002",
    from: "Shanghai, China",
    to: "Tehran, Iran",
    status: "pending",
    details: {
      shipmentTitle: "Shipment n.06",
      shipmentCode: "#cn-ir-002",
      driverName: "Mohammad Karimi",
      driverRating: 4.6,
      stateLabel: "In Origin",
    },
  },
  {
    id: "s07-cn-ir-003",
    from: "Guangzhou, China",
    to: "Tehran, Iran",
    status: "normal",
    details: {
      shipmentTitle: "Shipment n.07",
      shipmentCode: "#cn-ir-003",
      driverName: "Ali Mohammadi",
      driverRating: 4.7,
      stateLabel: "On Route",
    },
  },
  // China to Kazakhstan routes
  {
    id: "s08-cn-kz-001",
    from: "Beijing, China",
    to: "Almaty, Kazakhstan",
    status: "normal",
    details: {
      shipmentTitle: "Shipment n.08",
      shipmentCode: "#cn-kz-001",
      driverName: "Aibek Nurlan",
      driverRating: 4.8,
      stateLabel: "In Transit",
    },
  },
  {
    id: "s09-cn-kz-002",
    from: "Shanghai, China",
    to: "Astana, Kazakhstan",
    status: "pending",
    details: {
      shipmentTitle: "Shipment n.09",
      shipmentCode: "#cn-kz-002",
      driverName: "Daniyar Kuanysh",
      driverRating: 4.5,
      stateLabel: "Awaiting Driver",
    },
  },
  {
    id: "s10-cn-kz-003",
    from: "Shenzhen, China",
    to: "Shymkent, Kazakhstan",
    status: "normal",
    details: {
      shipmentTitle: "Shipment n.10",
      shipmentCode: "#cn-kz-003",
      driverName: "Askar Zhumabek",
      driverRating: 4.6,
      stateLabel: "On Route",
    },
  },
  // Kazakhstan to Iran routes
  {
    id: "s11-kz-ir-001",
    from: "Almaty, Kazakhstan",
    to: "Tehran, Iran",
    status: "normal",
    details: {
      shipmentTitle: "Shipment n.11",
      shipmentCode: "#kz-ir-001",
      driverName: "Reza Ahmadi",
      driverRating: 4.7,
      stateLabel: "In Transit",
    },
  },
  {
    id: "s12-kz-ir-002",
    from: "Astana, Kazakhstan",
    to: "Tehran, Iran",
    status: "pending",
    details: {
      shipmentTitle: "Shipment n.12",
      shipmentCode: "#kz-ir-002",
      driverName: "Hossein Farahani",
      driverRating: 4.6,
      stateLabel: "Awaiting Driver",
    },
  },
  {
    id: "s13-kz-ir-003",
    from: "Shymkent, Kazakhstan",
    to: "Tehran, Iran",
    status: "normal",
    details: {
      shipmentTitle: "Shipment n.13",
      shipmentCode: "#kz-ir-003",
      driverName: "Amir Hosseini",
      driverRating: 4.8,
      stateLabel: "On Route",
    },
  },
  // Kazakhstan to Turkey routes
  {
    id: "s14-kz-tr-001",
    from: "Almaty, Kazakhstan",
    to: "Istanbul, Turkey",
    status: "normal",
    details: {
      shipmentTitle: "Shipment n.14",
      shipmentCode: "#kz-tr-001",
      driverName: "Mehmet Yılmaz",
      driverRating: 4.9,
      stateLabel: "In Transit",
    },
  },
  {
    id: "s15-kz-tr-002",
    from: "Astana, Kazakhstan",
    to: "Ankara, Turkey",
    status: "pending",
    details: {
      shipmentTitle: "Shipment n.15",
      shipmentCode: "#kz-tr-002",
      driverName: "Ahmet Demir",
      driverRating: 4.7,
      stateLabel: "Awaiting Driver",
    },
  },
  {
    id: "s16-kz-tr-003",
    from: "Shymkent, Kazakhstan",
    to: "Izmir, Turkey",
    status: "normal",
    details: {
      shipmentTitle: "Shipment n.16",
      shipmentCode: "#kz-tr-003",
      driverName: "Mustafa Kaya",
      driverRating: 4.6,
      stateLabel: "On Route",
    },
  },
];

