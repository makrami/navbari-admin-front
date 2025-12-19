import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import {
  deleteConversation,
  getChatConversation,
  getConversationMessages,
  getTotalUnreadCount,
  listChatConversations,
  markConversationAsRead,
  sendChatAlert,
  sendChatMessage,
} from "./chat.service";
import {appendMessageToCache, updateConversationCache} from "./socket";
import type {
  ConversationReadDto,
  MessageReadDto,
  SendChatAlertInput,
  SendChatMessageInput,
  UnreadCountResponse,
} from "./chat.types";
import {CHAT_MESSAGE_TYPE} from "./chat.types";

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
    refetchOnMount: "always", // Always refetch when component mounts to ensure fresh data
    staleTime: 0, // Always consider data stale so it refetches when needed
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
    queryFn: ({pageParam}) =>
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
    onMutate: async (variables) => {
      // Create a temporary message with "sending" status
      const tempId = `temp-${Date.now()}-${Math.random()}`;
      // Use conversationId from input if provided, otherwise try to find it from cache
      const conversationId =
        variables.conversationId ||
        (await getConversationIdFromInput(queryClient, variables));

      if (!conversationId) {
        return {tempId: null, conversationId: null};
      }

      const tempMessage: TemporaryMessage = {
        id: tempId,
        conversationId,
        senderId: variables.senderId || "", // Use senderId from input for optimistic update
        messageType: CHAT_MESSAGE_TYPE.MESSAGE,
        content: variables.content || null,
        fileName:
          variables.file && variables.file instanceof File
            ? variables.file.name
            : null,
        fileMimeType:
          variables.file instanceof File ? variables.file.type : null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        _tempId: tempId,
        _status: "sending",
      };

      // Add temporary message to cache
      addTemporaryMessageToCache(queryClient, tempMessage);

      return {tempId, conversationId};
    },
    onSuccess: (message, _variables, context) => {
      if (!context?.tempId || !context?.conversationId) {
        // Fallback: add message normally if no temp message was created
        appendMessageToCache(queryClient, message);
        updateConversationCache(queryClient, message);
        // Only invalidate conversations and unread count, not messages (already in cache)
        queryClient.invalidateQueries({queryKey: chatKeys.conversations()});
        queryClient.invalidateQueries({queryKey: chatKeys.unreadCount()});
        return;
      }

      // Replace temporary message with real message
      replaceTemporaryMessageInCache(
        queryClient,
        context.conversationId,
        context.tempId,
        message
      );
      updateConversationCache(queryClient, message);

      // Only invalidate conversations and unread count, not messages (already updated in cache)
      // The socket will also receive the message and update cache, but duplicate check prevents issues
      queryClient.invalidateQueries({queryKey: chatKeys.conversations()});
      queryClient.invalidateQueries({queryKey: chatKeys.unreadCount()});
      if (message.conversationId) {
        queryClient.invalidateQueries({
          queryKey: chatKeys.conversation(message.conversationId),
        });
      }
    },
    onError: (_error, _variables, context) => {
      if (!context?.tempId || !context?.conversationId) return;

      // Update temporary message status to "failed"
      updateTemporaryMessageStatus(
        queryClient,
        context.conversationId,
        context.tempId,
        "failed"
      );
    },
  });
}

export function useSendChatAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SendChatAlertInput) => sendChatAlert(input),
    onMutate: async (variables) => {
      // Create a temporary message with "sending" status
      const tempId = `temp-${Date.now()}-${Math.random()}`;
      // Use conversationId from input if provided, otherwise try to find it from cache
      const conversationId =
        variables.conversationId ||
        (await getConversationIdFromInput(queryClient, variables));

      if (!conversationId) {
        return {tempId: null, conversationId: null};
      }

      const tempMessage: TemporaryMessage = {
        id: tempId,
        conversationId,
        senderId: variables.senderId || "", // Use senderId from input for optimistic update
        messageType: CHAT_MESSAGE_TYPE.ALERT,
        alertType: variables.alertType,
        content: variables.content || null,
        fileName:
          variables.file && variables.file instanceof File
            ? variables.file.name
            : null,
        fileMimeType:
          variables.file instanceof File ? variables.file.type : null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        _tempId: tempId,
        _status: "sending",
      };

      // Add temporary message to cache
      addTemporaryMessageToCache(queryClient, tempMessage);

      return {tempId, conversationId};
    },
    onSuccess: (message, _variables, context) => {
      if (!context?.tempId || !context?.conversationId) {
        // Fallback: add message normally if no temp message was created
        appendMessageToCache(queryClient, message);
        updateConversationCache(queryClient, message);
        // Only invalidate conversations and unread count, not messages (already in cache)
        queryClient.invalidateQueries({queryKey: chatKeys.conversations()});
        queryClient.invalidateQueries({queryKey: chatKeys.unreadCount()});
        return;
      }

      // Replace temporary message with real message
      replaceTemporaryMessageInCache(
        queryClient,
        context.conversationId,
        context.tempId,
        message
      );
      updateConversationCache(queryClient, message);

      // Only invalidate conversations and unread count, not messages (already updated in cache)
      // The socket will also receive the message and update cache, but duplicate check prevents issues
      queryClient.invalidateQueries({queryKey: chatKeys.conversations()});
      queryClient.invalidateQueries({queryKey: chatKeys.unreadCount()});
    },
    onError: (_error, _variables, context) => {
      if (!context?.tempId || !context?.conversationId) return;

      // Update temporary message status to "failed"
      updateTemporaryMessageStatus(
        queryClient,
        context.conversationId,
        context.tempId,
        "failed"
      );
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
    refetchOnMount: "always", // Always refetch when component mounts to ensure fresh data
    staleTime: 0, // Always consider data stale so it refetches when needed
  });
}

export function useDeleteConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (conversationId: string) => deleteConversation(conversationId),
    onSuccess: (_, conversationId) => {
      // Invalidate all conversation-related queries
      queryClient.invalidateQueries({queryKey: chatKeys.conversations()});
      queryClient.invalidateQueries({queryKey: chatKeys.unreadCount()});
      queryClient.removeQueries({
        queryKey: chatKeys.conversation(conversationId),
      });
      queryClient.removeQueries({queryKey: chatKeys.messages(conversationId)});
    },
  });
}

function invalidateChatQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  conversationId: string
) {
  // Update conversation cache directly instead of invalidating all conversations
  // This prevents refetching all conversation lists
  updateConversationReadStatus(queryClient, conversationId);

  // Invalidate unread count (global) - needs refetch
  queryClient.invalidateQueries({queryKey: chatKeys.unreadCount()});

  // Invalidate specific conversation and messages queries
  if (conversationId) {
    queryClient.invalidateQueries({
      queryKey: chatKeys.messages(conversationId),
    });
    queryClient.invalidateQueries({
      queryKey: chatKeys.conversation(conversationId),
    });
  }
}

/**
 * Updates the conversation cache to mark a conversation as read
 * This updates all conversation list queries (including those with recipientType)
 * without causing refetches - similar to updateConversationCache but for read status
 */
export function updateConversationReadStatus(
  queryClient: ReturnType<typeof useQueryClient>,
  conversationId: string
) {
  const baseKey = chatKeys.conversations();

  const updateConversation = (
    oldConversations: ConversationReadDto[] | undefined
  ): ConversationReadDto[] | undefined => {
    if (!oldConversations) {
      return oldConversations;
    }

    const foundConversation = oldConversations.find(
      (conv) => conv.id === conversationId
    );

    if (!foundConversation) {
      // Conversation not in this list, no update needed
      return oldConversations;
    }

    // Update the conversation to mark as read (set unread counts to 0)
    return oldConversations.map((conversation) => {
      if (conversation.id !== conversationId) {
        return conversation;
      }

      return {
        ...conversation,
        unreadMessageCount: 0,
        unreadAlertCount: 0,
      };
    });
  };

  // Update all conversation queries that match the base key
  // This matches: ["chat", "conversations"] and ["chat", "conversations", "driver"], etc.
  queryClient.setQueriesData<ConversationReadDto[]>(
    {
      predicate: (query) => {
        const queryKey = query.queryKey;
        return (
          queryKey.length >= baseKey.length &&
          baseKey.every((key, index) => queryKey[index] === key)
        );
      },
    },
    updateConversation
  );
}

// Helper function to get conversation ID from input
async function getConversationIdFromInput(
  queryClient: ReturnType<typeof useQueryClient>,
  input: SendChatMessageInput | SendChatAlertInput
): Promise<string | null> {
  // Try to find conversation from cache
  const conversations = queryClient.getQueryData<
    Array<{id: string; driverId?: string | null; companyId?: string | null}>
  >(chatKeys.conversations());

  if (conversations) {
    const conversation = conversations.find(
      (conv) =>
        (input.driverId && conv.driverId === input.driverId) ||
        (input.companyId && conv.companyId === input.companyId)
    );
    if (conversation) {
      return conversation.id;
    }
  }

  // If not found, we'll need to fetch it or use a placeholder
  // For now, return null and let the mutation handle it
  return null;
}

// Type for temporary message with status
type TemporaryMessage = MessageReadDto & {
  _tempId?: string;
  _status?: "sending" | "sent" | "failed";
};

// Add temporary message to cache with "sending" status
function addTemporaryMessageToCache(
  queryClient: ReturnType<typeof useQueryClient>,
  tempMessage: TemporaryMessage
) {
  const queryKey = chatKeys.messages(tempMessage.conversationId);

  queryClient.setQueryData(
    queryKey,
    (oldData: InfiniteData<MessageReadDto[]> | undefined) => {
      if (!oldData) {
        return {
          pageParams: [undefined],
          pages: [[tempMessage]],
        };
      }

      const newPages = [...oldData.pages];
      if (newPages.length === 0) {
        return {
          ...oldData,
          pages: [[tempMessage]],
        };
      }

      // Add to beginning of first page (most recent)
      const firstPage = [tempMessage, ...newPages[0]];
      newPages[0] = firstPage;

      return {
        ...oldData,
        pages: newPages,
      };
    }
  );
}

// Replace temporary message with real message
function replaceTemporaryMessageInCache(
  queryClient: ReturnType<typeof useQueryClient>,
  conversationId: string,
  tempId: string,
  realMessage: MessageReadDto
) {
  const queryKey = chatKeys.messages(conversationId);

  queryClient.setQueryData(
    queryKey,
    (oldData: InfiniteData<MessageReadDto[]> | undefined) => {
      if (!oldData) {
        return {
          pageParams: [undefined],
          pages: [[realMessage]],
        };
      }

      const newPages = oldData.pages.map((page) =>
        page.map((msg) => {
          // Check if this is the temporary message (by tempId or by matching content)
          const tempMsg = msg as TemporaryMessage;
          if (
            tempMsg._tempId === tempId ||
            (msg.id === tempId && tempMsg._status === "sending")
          ) {
            // Replace with real message but keep status as "sent" temporarily
            // The status will be removed when socket receives the message
            const messageWithStatus: TemporaryMessage = {
              ...realMessage,
              _status: "sent",
            };
            return messageWithStatus;
          }
          return msg;
        })
      );

      return {
        ...oldData,
        pages: newPages,
      };
    }
  );
}

// Update temporary message status
function updateTemporaryMessageStatus(
  queryClient: ReturnType<typeof useQueryClient>,
  conversationId: string,
  tempId: string,
  status: "failed"
) {
  const queryKey = chatKeys.messages(conversationId);

  queryClient.setQueryData(
    queryKey,
    (oldData: InfiniteData<MessageReadDto[]> | undefined) => {
      if (!oldData) return oldData;

      const newPages = oldData.pages.map((page) =>
        page.map((msg) => {
          const tempMsg = msg as TemporaryMessage;
          if (
            tempMsg._tempId === tempId ||
            (msg.id === tempId && tempMsg._status === "sending")
          ) {
            return {
              ...msg,
              _status: status,
            } as TemporaryMessage;
          }
          return msg;
        })
      );

      return {
        ...oldData,
        pages: newPages,
      };
    }
  );
}
