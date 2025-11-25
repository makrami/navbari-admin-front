export const CHAT_MESSAGE_TYPE = {
  MESSAGE: "message",
  ALERT: "alert",
} as const;
export type ChatMessageType =
  (typeof CHAT_MESSAGE_TYPE)[keyof typeof CHAT_MESSAGE_TYPE];

export const CHAT_ALERT_TYPE = {
  WARNING: "warning",
  ALERT: "alert",
  INFO: "info",
  SUCCESS: "success",
} as const;
export type ChatAlertType =
  (typeof CHAT_ALERT_TYPE)[keyof typeof CHAT_ALERT_TYPE];

export const CHAT_RECIPIENT_TYPE = {
  DRIVER: "driver",
  COMPANY: "company",
} as const;
export type ChatRecipientType =
  (typeof CHAT_RECIPIENT_TYPE)[keyof typeof CHAT_RECIPIENT_TYPE];

export interface ConversationReadDto {
  id: string;
  driverId?: string | null;
  companyId?: string | null;
  recipientType: ChatRecipientType;
  lastMessageId?: string | null;
  lastMessageAt?: string | null;
  unreadMessageCount: number;
  unreadAlertCount: number;
  lastMessageContent?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MessageReadDto {
  id: string;
  conversationId: string;
  senderId: string;
  messageType: ChatMessageType;
  alertType?: ChatAlertType | null;
  content?: string | null;
  filePath?: string | null;
  fileName?: string | null;
  fileMimeType?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MessageQueryParams {
  skip?: number;
  take?: number;
  before?: string;
}

export interface SendChatMessageInput {
  driverId?: string;
  companyId?: string;
  recipientType: ChatRecipientType;
  content?: string;
  file?: File | Blob | null;
}

export interface SendChatAlertInput extends SendChatMessageInput {
  alertType: ChatAlertType;
}

export interface UnreadCountResponse {
  count: number;
}

export interface ConversationReadResponse {
  success: boolean;
}
