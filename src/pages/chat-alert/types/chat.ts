export type MessageType = "chat" | "alert";

export type AlertType = "warning" | "alert" | "info" | "success";

export type DateGroup = "today" | "yesterday" | string; // string for other dates

export interface ChatMessage {
  id: string;
  type: "chat";
  text?: string;
  timestamp: string; // Format: "HH:mm"
  dateGroup: DateGroup;
  isOutgoing?: boolean; // true for right-aligned (outgoing), false for left-aligned (incoming)
  createdAt?: string; // ISO 8601
  fileUrl?: string;
  fileName?: string;
  fileMimeType?: string;
}

export interface AlertMessage {
  id: string;
  type: "alert";
  alertType: AlertType;
  title: string;
  shipmentId?: string;
  description?: string;
  timestamp: string; // Format: "HH:mm"
  dateGroup: DateGroup;
  createdAt?: string; // ISO 8601
  fileUrl?: string;
  fileName?: string;
}

export type Message = ChatMessage | AlertMessage;

export interface ActionableAlertChip {
  id: string;
  label: string;
  alertType: AlertType;
}
