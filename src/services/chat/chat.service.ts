import { http } from "../../lib/http";
import type {
  ConversationReadDto,
  ConversationReadResponse,
  MessageQueryParams,
  MessageReadDto,
  SendChatAlertInput,
  SendChatMessageInput,
  UnreadCountResponse,
} from "./chat.types";

const CHAT_BASE_PATH = "/chat";

export async function listChatConversations(
  recipientType?: "driver" | "company"
): Promise<ConversationReadDto[]> {
  const params = recipientType ? { recipientType } : {};
  const response = await http.get<ConversationReadDto[]>(
    `${CHAT_BASE_PATH}/conversations`,
    { params }
  );
  return response.data;
}

export async function getChatConversation(
  conversationId: string
): Promise<ConversationReadDto> {
  const response = await http.get<ConversationReadDto>(
    `${CHAT_BASE_PATH}/conversations/${conversationId}`
  );
  return response.data;
}

export async function getConversationMessages(
  conversationId: string,
  params?: MessageQueryParams
): Promise<MessageReadDto[]> {
  const response = await http.get<MessageReadDto[]>(
    `${CHAT_BASE_PATH}/conversations/${conversationId}/messages`,
    { params }
  );
  return response.data;
}

export async function sendChatMessage(
  payload: SendChatMessageInput
): Promise<MessageReadDto> {
  const formData = buildFormData(payload);
  const response = await http.post<MessageReadDto>(
    `${CHAT_BASE_PATH}/messages`,
    formData
  );
  return response.data;
}

export async function sendChatAlert(
  payload: SendChatAlertInput
): Promise<MessageReadDto> {
  const formData = buildFormData(payload);
  formData.append("alertType", payload.alertType);
  const response = await http.post<MessageReadDto>(
    `${CHAT_BASE_PATH}/alerts`,
    formData
  );
  return response.data;
}

export async function markConversationAsRead(
  conversationId: string
): Promise<ConversationReadResponse> {
  const response = await http.put<ConversationReadResponse>(
    `${CHAT_BASE_PATH}/conversations/${conversationId}/read`
  );
  return response.data;
}

export async function getTotalUnreadCount(): Promise<UnreadCountResponse> {
  const response = await http.get<UnreadCountResponse>(
    `${CHAT_BASE_PATH}/unread-count`
  );
  return response.data;
}

function buildFormData(input: SendChatMessageInput): FormData {
  const formData = new FormData();
  if (input.driverId) {
    formData.append("driverId", input.driverId);
  }
  if (input.companyId) {
    formData.append("companyId", input.companyId);
  }
  formData.append("recipientType", input.recipientType);
  if (input.content) {
    formData.append("content", input.content);
  }
  if (input.file) {
    formData.append("file", input.file);
  }
  return formData;
}
