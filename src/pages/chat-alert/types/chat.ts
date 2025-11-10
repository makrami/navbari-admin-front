export type MessageType = "chat" | "alert";

export type AlertType = "delay" | "delivered" | "gps-lost" | "payment" | "other";

export type DateGroup = "today" | "yesterday" | string; // string for other dates

export interface ChatMessage {
  id: string;
  type: "chat";
  text: string;
  timestamp: string; // Format: "HH:mm"
  dateGroup: DateGroup;
  isOutgoing?: boolean; // true for right-aligned (outgoing), false for left-aligned (incoming)
}

export interface AlertMessage {
  id: string;
  type: "alert";
  alertType: AlertType;
  title: string;
  shipmentId?: string;
  description: string;
  timestamp: string; // Format: "HH:mm"
  dateGroup: DateGroup;
}

export type Message = ChatMessage | AlertMessage;

export interface ActionableAlertChip {
  id: string;
  label: string;
  alertType: AlertType;
}

