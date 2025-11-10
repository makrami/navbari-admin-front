import type { Message } from "../types/chat";

// Sample messages data matching the reference design
export const SAMPLE_MESSAGES: Message[] = [
  // Yesterday messages
  {
    id: "msg-1",
    type: "chat",
    text: "Everything is on schedule. im about 15 minutes away from the drop off location",
    timestamp: "16:36",
    dateGroup: "yesterday",
    isOutgoing: false, // Incoming message (left-aligned)
  },
  // Today messages
  {
    id: "msg-2",
    type: "chat",
    text: "Hi, just checking on your progress for shipment (SHP-2671). any updates?",
    timestamp: "16:36",
    dateGroup: "today",
    isOutgoing: true, // Outgoing message (right-aligned)
  },
  {
    id: "alert-1",
    type: "alert",
    alertType: "delay",
    title: "Delay",
    shipmentId: "SHP-2671",
    description: "ETA updated to 15:45",
    timestamp: "16:36",
    dateGroup: "today",
  },
  {
    id: "alert-2",
    type: "alert",
    alertType: "delivered",
    title: "Delivered",
    shipmentId: "SHP-2671",
    description: "Completed.",
    timestamp: "16:36",
    dateGroup: "today",
  },
  {
    id: "alert-3",
    type: "alert",
    alertType: "gps-lost",
    title: "GPS Lost",
    description: "Signal lost for 10 min at Main St & 1st Ave.",
    timestamp: "16:36",
    dateGroup: "today",
  },
  {
    id: "alert-4",
    type: "alert",
    alertType: "payment",
    title: "Payment",
    description: "Payment of $3,500.00 received",
    timestamp: "16:36",
    dateGroup: "today",
  },
];

export const SAMPLE_ACTIONABLE_ALERTS = [
  {
    id: "chip-1",
    label: "Turn GPS On",
    alertType: "gps-lost",
  },
  {
    id: "chip-2",
    label: "Delay on Shipment",
    alertType: "delay",
  },
  {
    id: "chip-3",
    label: "Files Pending",
    alertType: "other",
  },
];

