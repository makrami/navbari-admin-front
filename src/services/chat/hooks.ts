import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  getChatConversation,
  getConversationMessages,
  getTotalUnreadCount,
  listChatConversations,
  markConversationAsRead,
  sendChatAlert,
  sendChatMessage,
} from "./chat.service";
import type {
  MessageReadDto,
  SendChatAlertInput,
  SendChatMessageInput,
  UnreadCountResponse,
} from "./chat.types";

export const CHAT_MESSAGES_PAGE_SIZE = 30;

export const chatKeys = {
  all: ["chat"] as const,
  conversations: () => [...chatKeys.all, "conversations"] as const,
  conversation: (id: string) => [...chatKeys.all, "conversation", id] as const,
  messages: (conversationId: string) =>
    [...chatKeys.conversation(conversationId), "messages"] as const,
  unreadCount: () => [...chatKeys.all, "unread-count"] as const,
};

export function useChatConversations(recipientType?: "driver" | "company") {
  return useQuery({
    queryKey: [...chatKeys.conversations(), recipientType],
    queryFn: () => listChatConversations(recipientType),
    refetchOnWindowFocus: false,
  });
}

export function useChatConversation(conversationId?: string) {
  return useQuery({
    queryKey: conversationId
      ? chatKeys.conversation(conversationId)
      : ["chat", "conversation", "noop"],
    queryFn: () =>
      conversationId
        ? getChatConversation(conversationId)
        : Promise.reject(new Error("Conversation id is required")),
    enabled: Boolean(conversationId),
    refetchOnWindowFocus: false,
  });
}

export function useConversationMessages(conversationId?: string) {
  return useInfiniteQuery<MessageReadDto[], Error>({
    queryKey: conversationId
      ? chatKeys.messages(conversationId)
      : ["chat", "messages", "noop"],
    queryFn: ({ pageParam }) =>
      conversationId
        ? getConversationMessages(conversationId, {
            take: CHAT_MESSAGES_PAGE_SIZE,
            before: pageParam as string | undefined,
          })
        : Promise.resolve([]),
    enabled: Boolean(conversationId),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => {
      if (!lastPage || lastPage.length < CHAT_MESSAGES_PAGE_SIZE) {
        return undefined;
      }
      const lastMessage = lastPage[lastPage.length - 1];
      return lastMessage?.createdAt;
    },
    refetchOnWindowFocus: false,
  });
}

export function useSendChatMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SendChatMessageInput) => sendChatMessage(input),
    onSuccess: (message, variables) => {
      invalidateChatQueries(queryClient, message.conversationId);
      if (variables.recipientType && message.conversationId) {
        queryClient.invalidateQueries({
          queryKey: chatKeys.conversation(message.conversationId),
        });
      }
    },
  });
}

export function useSendChatAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SendChatAlertInput) => sendChatAlert(input),
    onSuccess: (message) => {
      invalidateChatQueries(queryClient, message.conversationId);
    },
  });
}

export function useMarkConversationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (conversationId: string) =>
      markConversationAsRead(conversationId),
    onSuccess: (_, conversationId) => {
      invalidateChatQueries(queryClient, conversationId);
    },
  });
}

export function useUnreadChatCount() {
  return useQuery<UnreadCountResponse>({
    queryKey: chatKeys.unreadCount(),
    queryFn: () => getTotalUnreadCount(),
    refetchInterval: 60 * 1000,
  });
}

function invalidateChatQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  conversationId: string
) {
  queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
  queryClient.invalidateQueries({ queryKey: chatKeys.unreadCount() });
  if (conversationId) {
    queryClient.invalidateQueries({
      queryKey: chatKeys.messages(conversationId),
    });
    queryClient.invalidateQueries({
      queryKey: chatKeys.conversation(conversationId),
    });
  }
}
