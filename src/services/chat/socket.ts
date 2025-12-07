import {useEffect, useRef} from "react";
import {io, type Socket} from "socket.io-client";
import {useQueryClient, type InfiniteData} from "@tanstack/react-query";

import type {ConversationReadDto, MessageReadDto} from "./chat.types";
import {CHAT_MESSAGE_TYPE} from "./chat.types";
import {chatKeys} from "./hooks";
import {ENV} from "../../lib/env";

export function useChatSocket(
  activeConversationId?: string,
  onTypingChange?: (isTyping: boolean) => void
) {
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);
  const isConnectedRef = useRef(false);

  useEffect(() => {
    const url = resolveChatSocketUrl();
    console.log("🔌 Initializing socket connection:", url);

    // Determine if we should use a custom path
    // If URL contains /ws/chat, we might need to adjust the path
    const useCustomPath = url.includes("/ws/chat");
    const socketOptions: Parameters<typeof io>[1] = {
      transports: ["websocket"],
      withCredentials: true,
      auth: {
        appScope: "head_office",
      },
      timeout: 20000, // 20 seconds timeout
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      forceNew: false, // Reuse existing connection if available
      autoConnect: true,
      path: "/socket.io/",
    };

    // Only set path if URL doesn't already include the socket.io path
    // Socket.IO automatically appends /socket.io/ to the base URL
    // So if URL is /ws/chat, the actual path will be /ws/chat/socket.io/
    if (!useCustomPath) {
      socketOptions.path = "/socket.io/";
    }

    console.log("🔌 Socket connection options:", {
      url,
      transports: socketOptions.transports,
      path: socketOptions.path,
      withCredentials: socketOptions.withCredentials,
    });

    const socket = io(url, socketOptions);
    socketRef.current = socket;

    // Log socket connection events
    socket.on("connect", () => {
      isConnectedRef.current = true;
      console.log(
        "✅ Socket connected:",
        socket.id,
        "Transport:",
        socket.io.engine.transport.name
      );
    });

    socket.on("disconnect", (reason) => {
      isConnectedRef.current = false;
      console.log("❌ Socket disconnected:", reason);
      if (reason === "io server disconnect") {
        // Server disconnected, reconnect manually
        socket.connect();
      }
    });

    socket.on("connect_error", (error) => {
      isConnectedRef.current = false;
      console.error("❌ Socket connection error:", error.message, error);
    });

    socket.on("reconnect", (attemptNumber) => {
      console.log("✅ Socket reconnected after", attemptNumber, "attempts");
    });

    socket.on("reconnect_attempt", (attemptNumber) => {
      console.log("🔄 Reconnection attempt:", attemptNumber);
    });

    socket.on("reconnect_error", (error) => {
      console.error("❌ Reconnection error:", error);
    });

    socket.on("reconnect_failed", () => {
      console.error("❌ Reconnection failed after all attempts");
    });

    const handleMessageEvent = (message: MessageReadDto) => {
      console.log("📨 New message received from socket:", {
        messageId: message.id,
        conversationId: message.conversationId,
        activeConversationId,
        content: message.content?.substring(0, 50),
        socketId: socket.id,
      });

      // Always add to cache regardless of active conversation
      appendMessageToCache(queryClient, message);
      updateConversationCache(queryClient, message, activeConversationId);
      queryClient.invalidateQueries({queryKey: chatKeys.unreadCount()});

      // Stop typing indicator when new message arrives (only for active conversation)
      if (message.conversationId === activeConversationId) {
        onTypingChange?.(false);
      }
    };

    const handleConversationUpdated = (payload: {conversationId: string}) => {
      updateCaches(queryClient, payload.conversationId);
    };

    const handleTypingStart = (payload: {conversationId: string}) => {
      if (payload.conversationId === activeConversationId) {
        onTypingChange?.(true);
      }
    };

    const handleTypingStop = (payload: {conversationId: string}) => {
      if (payload.conversationId === activeConversationId) {
        onTypingChange?.(false);
      }
    };

    socket.on("message:new", handleMessageEvent);
    socket.on("alert:new", handleMessageEvent);
    socket.on("conversation:updated", handleConversationUpdated);
    socket.on("conversation:read", handleConversationUpdated);
    socket.on("typing:start", handleTypingStart);
    socket.on("typing:stop", handleTypingStop);

    console.log(
      "👂 Socket event listeners registered for conversation:",
      activeConversationId
    );

    return () => {
      socket.off("message:new", handleMessageEvent);
      socket.off("alert:new", handleMessageEvent);
      socket.off("conversation:updated", handleConversationUpdated);
      socket.off("conversation:read", handleConversationUpdated);
      socket.off("typing:start", handleTypingStart);
      socket.off("typing:stop", handleTypingStop);
      socket.disconnect();
      socketRef.current = null;
      isConnectedRef.current = false;
    };
  }, [queryClient, activeConversationId, onTypingChange]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !activeConversationId) {
      if (!socket) {
        console.log("⚠️ Socket not ready for join_conversation");
      }
      if (!activeConversationId) {
        console.log("⚠️ No active conversation ID for join_conversation");
      }
      return;
    }

    // Wait for socket to be connected before joining
    const joinConversation = () => {
      if (!socket.connected) {
        console.log(
          "⏳ Waiting for socket connection before joining conversation..."
        );
        socket.once("connect", () => {
          console.log(
            "🚪 Joining conversation:",
            activeConversationId,
            "Socket ID:",
            socket.id
          );
          socket.emit("join_conversation", {
            conversationId: activeConversationId,
          });
        });
      } else {
        console.log(
          "🚪 Joining conversation:",
          activeConversationId,
          "Socket ID:",
          socket.id
        );
        socket.emit("join_conversation", {
          conversationId: activeConversationId,
        });
      }
    };

    joinConversation();

    // Listen for join confirmation (if server sends one)
    const handleJoinSuccess = (data: unknown) => {
      console.log("✅ Successfully joined conversation:", data);
    };
    socket.on("conversation:joined", handleJoinSuccess);

    return () => {
      console.log("🚪 Leaving conversation:", activeConversationId);
      if (socket.connected) {
        socket.emit("leave_conversation", {
          conversationId: activeConversationId,
        });
      }
      socket.off("conversation:joined", handleJoinSuccess);
    };
  }, [activeConversationId]);

  return socketRef.current;
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
        // const exists = oldData.pages.some((page) =>
        //   page.some((item) => item.id === message.id)
        // );
        // if (exists) {
        //   console.log(
        //     "⚠️ Message already exists in cache, skipping:",
        //     message.id
        //   );
        //   return oldData;
        // }

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
          console.log(
            "🔄 Found temporary message, replacing with real message:",
            message.id
          );
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
        console.log(
          "✅ Creating new cache structure for conversation:",
          message.conversationId
        );
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

      console.log("✅ Message added to cache:", {
        messageId: message.id,
        conversationId: message.conversationId,
        insertIndex,
        firstPageLength: firstPage.length,
      });

      return {
        ...oldData,
        pages: newPages,
      };
    }
  );
}

export function updateConversationCache(
  queryClient: ReturnType<typeof useQueryClient>,
  message: MessageReadDto,
  activeConversationId?: string
) {
  // Update all conversation queries (including those with recipientType)
  // useChatConversations(recipientType) uses key: ["chat", "conversations", recipientType]
  // We need to update all queries that start with ["chat", "conversations"]
  const baseKey = chatKeys.conversations();
  console.log("🔄 Updating conversation cache for message:", {
    messageId: message.id,
    conversationId: message.conversationId,
    messageType: message.messageType,
    activeConversationId,
    baseKey,
  });

  // Helper function to update conversation data
  const updateConversation = (
    oldConversations: ConversationReadDto[] | undefined
  ): ConversationReadDto[] | undefined => {
    if (!oldConversations) {
      console.log("⚠️ No conversations in cache to update");
      return oldConversations;
    }

    console.log("📋 Found conversations in cache:", oldConversations.length);
    const foundConversation = oldConversations.find(
      (conv) => conv.id === message.conversationId
    );

    if (!foundConversation) {
      console.log(
        "⚠️ Conversation not found in cache:",
        message.conversationId,
        "Available IDs:",
        oldConversations.map((c) => c.id)
      );
      return oldConversations;
    }

    console.log("✅ Found conversation to update:", {
      conversationId: foundConversation.id,
      currentUnreadMessages: foundConversation.unreadMessageCount,
      currentUnreadAlerts: foundConversation.unreadAlertCount,
      isActive: foundConversation.id === activeConversationId,
      lastMessageId: foundConversation.lastMessageId,
      incomingMessageId: message.id,
    });

    // Create a new array to ensure React Query detects the change
    const updatedConversations = oldConversations.map((conversation) => {
      if (conversation.id !== message.conversationId) {
        return conversation;
      }

      // Check if this message was already processed
      // This prevents duplicate increments when multiple hook instances process the same message
      const isAlreadyProcessed = conversation.lastMessageId === message.id;

      if (isAlreadyProcessed) {
        console.log(
          "⚠️ Message already processed, skipping unread count increment:",
          {
            messageId: message.id,
            lastMessageId: conversation.lastMessageId,
          }
        );
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
        console.log("📈 Incremented unreadAlertCount:", {
          from: conversation.unreadAlertCount || 0,
          to: updatedConversation.unreadAlertCount,
        });
      } else {
        updatedConversation.unreadMessageCount =
          (conversation.unreadMessageCount || 0) + 1;
        console.log("📈 Incremented unreadMessageCount:", {
          from: conversation.unreadMessageCount || 0,
          to: updatedConversation.unreadMessageCount,
        });
      }

      return updatedConversation;
    });

    return updatedConversations;
  };

  // Get all matching queries first to debug
  const allQueries = queryClient.getQueryCache().getAll();
  const matchingQueries = allQueries.filter((query) => {
    const queryKey = query.queryKey;
    const matches =
      queryKey.length >= baseKey.length &&
      baseKey.every((key, index) => queryKey[index] === key);
    return matches;
  });

  console.log("🔍 Query matching results:", {
    totalQueries: allQueries.length,
    matchingQueries: matchingQueries.length,
    matchingKeys: matchingQueries.map((q) => q.queryKey),
  });

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
        if (matches) {
          console.log("✅ Matching query found:", queryKey);
        }
        return matches;
      },
    },
    updateConversation
  );

  const updatedCount = updatedQueries.length;
  console.log("📊 Updated queries count:", updatedCount);

  // If no queries were updated (conversation not in cache), invalidate to force refetch
  if (updatedCount === 0) {
    console.log("🔄 No queries updated, invalidating to force refetch");
    queryClient.invalidateQueries({
      queryKey: baseKey,
      exact: false,
    });
  }
}
