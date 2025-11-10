import type { Message, ActionableAlertChip } from "../types/chat";
import type { ChatAlert } from "../data";

// Global alert cards - same across all drivers
const GLOBAL_ALERT_CARDS: Message[] = [
  {
    id: "alert-global-1",
    type: "alert",
    alertType: "delay",
    title: "Delay",
    shipmentId: "SHP-2671",
    description: "ETA updated to 15:45",
    timestamp: "16:36",
    dateGroup: "today",
  },
  {
    id: "alert-global-2",
    type: "alert",
    alertType: "delivered",
    title: "Delivered",
    shipmentId: "SHP-2671",
    description: "Completed.",
    timestamp: "16:36",
    dateGroup: "today",
  },
  {
    id: "alert-global-3",
    type: "alert",
    alertType: "gps-lost",
    title: "GPS Lost",
    description: "Signal lost for 10 min at Main St & 1st Ave.",
    timestamp: "16:36",
    dateGroup: "today",
  },
  {
    id: "alert-global-4",
    type: "alert",
    alertType: "payment",
    title: "Payment",
    description: "Payment of $3,500.00 received",
    timestamp: "16:36",
    dateGroup: "today",
  },
];

// Global actionable alerts - same across all drivers
const GLOBAL_ACTIONABLE_ALERTS: ActionableAlertChip[] = [
  {
    id: "chip-global-1",
    label: "Turn GPS On",
    alertType: "gps-lost",
  },
  {
    id: "chip-global-2",
    label: "Delay on Shipment",
    alertType: "delay",
  },
  {
    id: "chip-global-3",
    label: "Files Pending",
    alertType: "other",
  },
];

// Mock data generator for driver-specific information
export function getDriverMockData(driverId: string, chatAlert: ChatAlert) {
  // Different data sets for different drivers
  // Note: Alert cards and actionable alerts are global and consistent across all drivers
  const driverDataMap: Record<
    string,
    {
      messages: Message[]; // Only chat messages are driver-specific
      currentStateIndex: number; // 0-6
      financialData: {
        estFinish: string;
        totalPaid: string;
        totalPending: string;
      };
      segmentData: {
        number: number;
        from: string;
        to: string;
        distance: string;
      };
    }
  > = {
    d1: {
      // Amita Sing - Early stage, GPS issues
      currentStateIndex: 1,
      messages: [
        {
          id: "msg-d1-1",
          type: "chat",
          text: "Hi, I'm having trouble with my GPS. Can you help me turn it on?",
          timestamp: "14:32",
          dateGroup: "today",
          isOutgoing: false,
        },
        {
          id: "msg-d1-2",
          type: "chat",
          text: "Sure, I'll guide you through it. Can you check if the GPS device is powered on?",
          timestamp: "14:33",
          dateGroup: "today",
          isOutgoing: true,
        },
      ],
      financialData: {
        estFinish: "14 Aug - 16:00",
        totalPaid: "$1,563,263,236",
        totalPending: "$463,864",
      },
      segmentData: {
        number: 1,
        from: "Hejiang, China",
        to: "Chengdu, China",
        distance: "12 KM",
      },
    },
    d2: {
      // Xin Zhao - Mid stage, payment received
      currentStateIndex: 4,
      messages: [
        {
          id: "msg-d2-1",
          type: "chat",
          text: "Everything is on schedule. I'm about 15 minutes away from the drop off location",
          timestamp: "16:36",
          dateGroup: "yesterday",
          isOutgoing: false,
        },
        {
          id: "msg-d2-2",
          type: "chat",
          text: "Hi, just checking on your progress for shipment (SHP-2671). any updates?",
          timestamp: "16:36",
          dateGroup: "today",
          isOutgoing: true,
        },
      ],
      financialData: {
        estFinish: "14 Aug - 15:45",
        totalPaid: "$1,566,763,236",
        totalPending: "$460,364",
      },
      segmentData: {
        number: 2,
        from: "Hejiang, China",
        to: "Inner Mongolia, Mongolia",
        distance: "34 KM",
      },
    },
    d3: {
      // Olaf Khan - Late stage, checkpoint reached
      currentStateIndex: 5,
      messages: [
        {
          id: "msg-d3-1",
          type: "chat",
          text: "I've arrived at the checkpoint. All documents are ready for inspection.",
          timestamp: "12:15",
          dateGroup: "today",
          isOutgoing: false,
        },
        {
          id: "msg-d3-2",
          type: "chat",
          text: "Great! Please proceed with the inspection. Let me know if you need any assistance.",
          timestamp: "12:18",
          dateGroup: "today",
          isOutgoing: true,
        },
      ],
      financialData: {
        estFinish: "15 Aug - 10:30",
        totalPaid: "$2,147,789,123",
        totalPending: "$123,450",
      },
      segmentData: {
        number: 3,
        from: "Warsaw, Poland",
        to: "Minsk, Belarus",
        distance: "55 KM",
      },
    },
    d4: {
      // Maria Garcia - Very early stage, just started
      currentStateIndex: 0,
      messages: [
        {
          id: "msg-d4-1",
          type: "chat",
          text: "Hi, I just started loading. Everything looks good so far.",
          timestamp: "11:40",
          dateGroup: "today",
          isOutgoing: false,
        },
        {
          id: "msg-d4-2",
          type: "chat",
          text: "Thanks for the update! Keep me posted on your progress.",
          timestamp: "11:42",
          dateGroup: "today",
          isOutgoing: true,
        },
      ],
      financialData: {
        estFinish: "16 Aug - 08:15",
        totalPaid: "$987,654,321",
        totalPending: "$45,678",
      },
      segmentData: {
        number: 1,
        from: "Madrid, Spain",
        to: "Valencia, Spain",
        distance: "28 KM",
      },
    },
  };

  // Get driver-specific data
  const driverData = driverDataMap[driverId] || {
    currentStateIndex: 3,
    messages: [
      {
        id: "msg-default-1",
        type: "chat",
        text: "Default message for driver",
        timestamp: "12:00",
        dateGroup: "today",
        isOutgoing: false,
      },
    ],
    financialData: {
      estFinish: chatAlert.estFinish,
      totalPaid: chatAlert.totalPaid,
      totalPending: chatAlert.totalPending,
    },
    segmentData: chatAlert.currentSegment,
  };

  // Combine driver-specific chat messages with global alert cards
  const allMessages: Message[] = [...driverData.messages, ...GLOBAL_ALERT_CARDS];

  // Return data with global alerts and actionable alerts
  return {
    ...driverData,
    messages: allMessages,
    actionableAlerts: GLOBAL_ACTIONABLE_ALERTS,
  };
}

