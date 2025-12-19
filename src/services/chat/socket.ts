import {useEffect, useRef} from "react";
import {io, type Socket} from "socket.io-client";
import {useQueryClient, type InfiniteData} from "@tanstack/react-query";

import type {ConversationReadDto, MessageReadDto} from "./chat.types";
import {CHAT_MESSAGE_TYPE} from "./chat.types";
import {chatKeys, updateConversationReadStatus} from "./hooks";
import {ENV} from "../../lib/env";

// Singleton socket instance - shared across all hook calls
let globalSocket: Socket | null = null;
const activeConversations = new Set<string>();
const conversationRefCounts = new Map<string, number>();
const typingCallbacks = new Map<string, (isTyping: boolean) => void>();

// Store hook instance callbacks with their active conversation IDs
interface HookInstance {
  queryClient: ReturnType<typeof useQueryClient>;
  activeConversationId?: string;
}

const hookInstances = new Set<HookInstance>();

/**
 * Initialize the singleton socket connection
 */
function initializeSocket(): Socket {
  if (globalSocket && globalSocket.connected) {
    return globalSocket;
  }

  if (globalSocket && !globalSocket.connected) {
    // Socket exists but disconnected, try to reconnect
    globalSocket.connect();
    return globalSocket;
  }

  const url = resolveChatSocketUrl();

  // Determine if we should use a custom path
  const useCustomPath = url.includes("/ws/chat");
  const socketOptions: Parameters<typeof io>[1] = {
    transports: ["websocket"],
    withCredentials: true,
    auth: {
      appScope: "head_office",
    },
    timeout: 20000,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
    forceNew: false,
    autoConnect: true,
    path: "/socket.io/",
  };

  if (!useCustomPath) {
    socketOptions.path = "/socket.io/";
  }

  const socket = io(url, socketOptions);
  globalSocket = socket;

  // Set up global event listeners (only once)
  setupGlobalSocketListeners(socket);

  return socket;
}

/**
 * Set up global socket event listeners that handle all conversations
 */
function setupGlobalSocketListeners(socket: Socket) {
  // Connection events
  socket.on("connect", () => {
    // Socket connected
  });

  socket.on("disconnect", (reason) => {
    if (reason === "io server disconnect") {
      socket.connect();
    }
  });

  socket.on("reconnect", () => {
    // Rejoin all active conversations after reconnect
    // activeConversations.forEach((conversationId) => {
    //   if (socket.connected) {
    //     socket.emit("join_conversation", {conversationId});
    //   }
    // });
  });

  socket.on("reconnect_attempt", () => {
    // Reconnection attempt
  });

  socket.on("reconnect_error", () => {
    // Reconnection error
  });

  // Message events - handle for all conversations
  socket.on("message:new", (message: MessageReadDto) => {
    handleMessageReceived(message);
  });

  socket.on("alert:new", (message: MessageReadDto) => {
    handleMessageReceived(message);
  });

  socket.on("conversation:updated", (payload: {conversationId: string}) => {
    handleConversationUpdated(payload.conversationId);
  });

  socket.on("conversation:read", (payload: {conversationId: string}) => {
    handleConversationRead(payload.conversationId);
  });

  socket.on("conversation:new", () => {
    handleConversationNew();
  });

  socket.on("typing:start", (payload: {conversationId: string}) => {
    const callback = typingCallbacks.get(payload.conversationId);
    callback?.(true);
  });

  socket.on("typing:stop", (payload: {conversationId: string}) => {
    const callback = typingCallbacks.get(payload.conversationId);
    callback?.(false);
  });
}

function handleMessageReceived(message: MessageReadDto) {
  // Update cache for all hook instances
  hookInstances.forEach((instance) => {
    appendMessageToCache(instance.queryClient, message);
    updateConversationCache(instance.queryClient, message);

    // Invalidate and refetch unread count to ensure immediate update
    // Use refetchType: "all" to refetch both active and inactive queries
    instance.queryClient.invalidateQueries({
      queryKey: chatKeys.unreadCount(),
      refetchType: "all",
    });
    // Also explicitly refetch all matching queries to ensure immediate update
    instance.queryClient.refetchQueries({
      queryKey: chatKeys.unreadCount(),
    });

    // Stop typing indicator if this is the active conversation for this instance
    if (message.conversationId === instance.activeConversationId) {
      const callback = typingCallbacks.get(message.conversationId);
      callback?.(false);
    }
  });
}

function handleConversationUpdated(conversationId: string) {
  hookInstances.forEach((instance) => {
    updateCaches(instance.queryClient, conversationId);
  });
}

function handleConversationRead(conversationId: string) {
  hookInstances.forEach((instance) => {
    updateConversationReadStatus(instance.queryClient, conversationId);
    instance.queryClient.invalidateQueries({queryKey: chatKeys.unreadCount()});
  });
}

function handleConversationNew() {
  const baseKey = chatKeys.conversations();
  const unreadCountKey = chatKeys.unreadCount();

  // Invalidate and refetch all conversation queries when a new conversation is created
  hookInstances.forEach((instance) => {
    // Invalidate all conversation queries with refetchType: "all" to refetch both active and inactive
    // This marks them as stale and triggers refetch for active queries
    instance.queryClient.invalidateQueries({
      queryKey: baseKey,
      exact: false,
      refetchType: "all", // This should refetch all matching queries
    });

    // Also explicitly refetch active queries to ensure immediate update
    instance.queryClient.refetchQueries({
      queryKey: baseKey,
      exact: false,
      type: "active",
    });

    // Handle unread count - invalidate and refetch
    instance.queryClient.invalidateQueries({
      queryKey: unreadCountKey,
      refetchType: "all",
    });

    instance.queryClient.refetchQueries({
      queryKey: unreadCountKey,
      type: "active",
    });
  });
}

export function useChatSocket(
  activeConversationId?: string,
  onTypingChange?: (isTyping: boolean) => void
) {
  const queryClient = useQueryClient();
  const instanceRef = useRef<HookInstance | null>(null);

  // Initialize singleton socket
  useEffect(() => {
    initializeSocket();
  }, []);

  // Register/unregister hook instance
  useEffect(() => {
    const instance: HookInstance = {
      queryClient,
      activeConversationId,
    };
    instanceRef.current = instance;
    hookInstances.add(instance);

    return () => {
      hookInstances.delete(instance);
      instanceRef.current = null;
    };
  }, [queryClient, activeConversationId]);

  // Register/unregister typing callback
  useEffect(() => {
    if (activeConversationId && onTypingChange) {
      typingCallbacks.set(activeConversationId, onTypingChange);
      return () => {
        typingCallbacks.delete(activeConversationId);
      };
    }
  }, [activeConversationId, onTypingChange]);

  // Join/leave conversations
  useEffect(() => {
    const socket = globalSocket;
    if (!socket || !activeConversationId) {
      return;
    }

    // Track reference count for this conversation
    const currentCount = conversationRefCounts.get(activeConversationId) || 0;
    conversationRefCounts.set(activeConversationId, currentCount + 1);

    // Only join if this is the first instance using this conversation
    if (currentCount === 0) {
      activeConversations.add(activeConversationId);

      // Wait for socket to be connected before joining
      const joinConversation = () => {
        if (!socket.connected) {
          socket.once("connect", () => {
            // socket.emit("join_conversation", {
            //   conversationId: activeConversationId,
            // });
          });
        } else {
          // socket.emit("join_conversation", {
          //   conversationId: activeConversationId,
          // });
        }
      };

      joinConversation();
    }

    // Listen for join confirmation
    const handleJoinSuccess = () => {
      // Successfully joined conversation
    };
    socket.on("conversation:joined", handleJoinSuccess);

    return () => {
      // Decrement reference count
      const count = conversationRefCounts.get(activeConversationId) || 0;
      const newCount = Math.max(0, count - 1);
      conversationRefCounts.set(activeConversationId, newCount);

      // Only leave if this was the last instance using this conversation
      if (newCount === 0) {
        activeConversations.delete(activeConversationId);
        if (socket.connected) {
          socket.emit("leave_conversation", {
            conversationId: activeConversationId,
          });
        }
      }
      socket.off("conversation:joined", handleJoinSuccess);
    };
  }, [activeConversationId]);

  return globalSocket;
}

function resolveChatSocketUrl(): string {
  const url = ENV.CHAT_SOCKET_URL;
  const isDev = import.meta.env.DEV;

  if (!url) {
    throw new Error("CHAT_SOCKET_URL is not defined in environment variables");
  }

  // In development, use relative path (will use Vite proxy)
  if (isDev && url.startsWith("/")) {
    return url;
  }

  // If URL is already a full URL (starts with http:// or https:// or ws:// or wss://), return as is
  if (/^(https?|wss?):\/\//.test(url)) {
    return url;
  }

  // If URL starts with /, it's a relative path - prepend origin
  if (url.startsWith("/")) {
    if (typeof window !== "undefined" && window.location) {
      const fullUrl = `${window.location.origin}${url}`;
      return fullUrl;
    }
  }

  return url;
}

function updateCaches(
  queryClient: ReturnType<typeof useQueryClient>,
  conversationId: string
) {
  queryClient.invalidateQueries({queryKey: chatKeys.conversations()});
  queryClient.invalidateQueries({queryKey: chatKeys.unreadCount()});
  if (conversationId) {
    queryClient.invalidateQueries({
      queryKey: chatKeys.messages(conversationId),
    });
    queryClient.invalidateQueries({
      queryKey: chatKeys.conversation(conversationId),
    });
  }
}

export function appendMessageToCache(
  queryClient: ReturnType<typeof useQueryClient>,
  message: MessageReadDto
) {
  const queryKey = chatKeys.messages(message.conversationId);

  queryClient.setQueryData(
    queryKey,
    (oldData: InfiniteData<MessageReadDto[]> | undefined) => {
      // Check if message already exists (by ID) - check this first
      if (oldData) {
        const exists = oldData.pages.some((page) =>
          page.some((item) => item.id === message.id)
        );
        if (exists) {
          return oldData;
        }

        // Check if there's a temporary message with matching content that should be replaced
        // This handles the case where socket receives the message we just sent
        const hasTempMessage = oldData.pages.some((page) =>
          page.some((item) => {
            const tempMsg = item as MessageReadDto & {
              _tempId?: string;
              _status?: "sending" | "sent" | "failed";
            };
            return (
              tempMsg._status === "sending" &&
              tempMsg.content === message.content &&
              tempMsg.conversationId === message.conversationId
            );
          })
        );

        if (hasTempMessage) {
          // Replace temporary message with real message
          const newPages = oldData.pages.map((page) =>
            page.map((item) => {
              const tempMsg = item as MessageReadDto & {
                _tempId?: string;
                _status?: "sending" | "sent" | "failed";
              };
              if (
                tempMsg._status === "sending" &&
                tempMsg.content === message.content &&
                tempMsg.conversationId === message.conversationId
              ) {
                // Replace temp message with real message (status will be removed)
                return message;
              }
              return item;
            })
          );
          return {
            ...oldData,
            pages: newPages,
          };
        }
      }

      if (!oldData) {
        // If no data exists, create initial structure with the new message
        return {
          pageParams: [undefined],
          pages: [[message]],
        };
      }

      // Messages are paginated with most recent on first page
      // First page contains messages in descending order (newest first)
      // Add new message to the first page (index 0) in correct chronological position
      const newPages = [...oldData.pages];
      if (newPages.length === 0) {
        return {
          ...oldData,
          pages: [[message]],
        };
      }

      // Insert message into first page in correct position
      // First page is sorted descending (newest first), so newer messages go earlier
      const firstPage = [...newPages[0]];
      const messageTime = new Date(message.createdAt).getTime();

      // Find the correct position to insert (maintain descending order by createdAt)
      // Newer messages (higher timestamp) should be inserted earlier (lower index)
      let insertIndex = firstPage.length;
      for (let i = 0; i < firstPage.length; i++) {
        const itemTime = new Date(firstPage[i].createdAt).getTime();
        // If new message is newer (higher timestamp), insert before this item
        if (messageTime >= itemTime) {
          insertIndex = i;
          break;
        }
      }

      firstPage.splice(insertIndex, 0, message);
      newPages[0] = firstPage;

      return {
        ...oldData,
        pages: newPages,
      };
    }
  );
}

export function updateConversationCache(
  queryClient: ReturnType<typeof useQueryClient>,
  message: MessageReadDto
) {
  // Update all conversation queries (including those with recipientType)
  // useChatConversations(recipientType) uses key: ["chat", "conversations", recipientType]
  // We need to update all queries that start with ["chat", "conversations"]
  const baseKey = chatKeys.conversations();

  // Helper function to update conversation data
  const updateConversation = (
    oldConversations: ConversationReadDto[] | undefined
  ): ConversationReadDto[] | undefined => {
    if (!oldConversations) {
      return oldConversations;
    }

    const foundConversation = oldConversations.find(
      (conv) => conv.id === message.conversationId
    );

    if (!foundConversation) {
      return oldConversations;
    }

    // Create a new array to ensure React Query detects the change
    const updatedConversations = oldConversations.map((conversation) => {
      if (conversation.id !== message.conversationId) {
        return conversation;
      }

      // Check if this message was already processed
      // This prevents duplicate increments when multiple hook instances process the same message
      const isAlreadyProcessed = conversation.lastMessageId === message.id;

      if (isAlreadyProcessed) {
        // Return conversation as-is since it's already been updated
        return conversation;
      }

      // // If this is the active conversation, don't increment unread counts
      // // (messages are already being viewed)
      // const isActiveConversation = conversation.id === activeConversationId;

      // // Determine if we should increment unread counts
      // // Only increment if it's not the active conversation
      // const shouldIncrementUnread = !isActiveConversation;

      // Update unread counts based on message type
      const updatedConversation: ConversationReadDto = {
        ...conversation,
        lastMessageId: message.id,
        lastMessageAt: message.createdAt,
        lastMessageContent: message.content || null,
      };

      if (message.messageType === CHAT_MESSAGE_TYPE.ALERT) {
        updatedConversation.unreadAlertCount =
          (conversation.unreadAlertCount || 0) + 1;
      } else {
        updatedConversation.unreadMessageCount =
          (conversation.unreadMessageCount || 0) + 1;
      }

      return updatedConversation;
    });

    return updatedConversations;
  };

  // Update all queries that match the base conversations key
  // This will match: ["chat", "conversations"] and ["chat", "conversations", "driver"], etc.
  const updatedQueries = queryClient.setQueriesData<ConversationReadDto[]>(
    {
      predicate: (query) => {
        const queryKey = query.queryKey;
        // Check if query key starts with baseKey
        const matches =
          queryKey.length >= baseKey.length &&
          baseKey.every((key, index) => queryKey[index] === key);
        return matches;
      },
    },
    updateConversation
  );

  const updatedCount = updatedQueries.length;

  // If no queries were updated (conversation not in cache), invalidate to force refetch
  if (updatedCount === 0) {
    queryClient.invalidateQueries({
      queryKey: baseKey,
      exact: false,
    });
  }
}
