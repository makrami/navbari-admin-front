import { useEffect, useRef, type RefObject } from "react";
import { io, type Socket } from "socket.io-client";
import { useQueryClient, type InfiniteData } from "@tanstack/react-query";
import { ENV } from "../../lib/env";
import type { ConversationReadDto, MessageReadDto } from "./chat.types";
import { CHAT_MESSAGE_TYPE } from "./chat.types";
import { chatKeys } from "./hooks";

// Store polling intervals outside of React component
const pollingIntervals = new Map<string, ReturnType<typeof setInterval>>();

// Store socket refs for polling checks
const socketRefs = new Map<string, RefObject<Socket | null>>();

// Polling fallback function - refetches messages if socket is not connected
function startPollingFallback(
  queryClient: ReturnType<typeof useQueryClient>,
  conversationId?: string,
  socketRef?: RefObject<Socket | null>
) {
  if (!conversationId) return;

  // Store socket ref for this conversation
  if (socketRef) {
    socketRefs.set(conversationId, socketRef);
  }

  // Don't start polling if socket is connected
  const socket = socketRef?.current;
  if (socket?.connected) {
    console.log("✅ Socket is connected, skipping polling fallback");
    return;
  }

  // Check if polling is already running
  if (pollingIntervals.has(conversationId)) {
    return; // Already polling
  }

  console.log("🔄 Starting polling fallback for conversation:", conversationId);

  const interval = setInterval(() => {
    // Get current socket reference
    const currentSocketRef = socketRefs.get(conversationId);
    const currentSocket = currentSocketRef?.current;

    // Double-check socket is still disconnected before polling
    if (currentSocket?.connected) {
      console.log("✅ Socket connected during polling, stopping fallback");
      stopPollingFallback(queryClient, conversationId);
      return;
    }

    // Invalidate and refetch messages
    queryClient.invalidateQueries({
      queryKey: chatKeys.messages(conversationId),
    });
    queryClient.invalidateQueries({
      queryKey: chatKeys.conversations(),
    });
  }, 15000); // Poll every 15 seconds (reduced frequency)

  pollingIntervals.set(conversationId, interval);
}

function stopPollingFallback(
  _queryClient: ReturnType<typeof useQueryClient>,
  conversationId?: string
) {
  if (!conversationId) return;

  const interval = pollingIntervals.get(conversationId);
  if (interval) {
    clearInterval(interval);
    pollingIntervals.delete(conversationId);
    socketRefs.delete(conversationId); // Clean up socket ref
    console.log(
      "🛑 Stopped polling fallback for conversation:",
      conversationId
    );
  }
}

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
      transports: ["websocket", "polling"], // Fallback to polling if websocket fails
      withCredentials: true,
      timeout: 20000, // 20 seconds timeout
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      forceNew: false, // Reuse existing connection if available
      autoConnect: true,
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
      // Stop polling if socket is connected
      stopPollingFallback(queryClient, activeConversationId);
    });

    socket.on("disconnect", (reason) => {
      isConnectedRef.current = false;
      console.log("❌ Socket disconnected:", reason);
      if (reason === "io server disconnect") {
        // Server disconnected, reconnect manually
        socket.connect();
      }
      // Start polling if socket disconnects (only if not already polling)
      if (!pollingIntervals.has(activeConversationId || "")) {
        startPollingFallback(queryClient, activeConversationId, socketRef);
      }
    });

    socket.on("connect_error", (error) => {
      isConnectedRef.current = false;
      console.error("❌ Socket connection error:", error.message, error);
      // Start polling fallback if connection fails (only if not already polling)
      if (!pollingIntervals.has(activeConversationId || "")) {
        startPollingFallback(queryClient, activeConversationId, socketRef);
      }
      // Try to reconnect after a delay
      setTimeout(() => {
        if (!socket.connected) {
          console.log("🔄 Attempting to reconnect...");
          socket.connect();
        }
      }, 2000);
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
      queryClient.invalidateQueries({ queryKey: chatKeys.unreadCount() });

      // Stop typing indicator when new message arrives (only for active conversation)
      if (message.conversationId === activeConversationId) {
        onTypingChange?.(false);
      }
    };

    const handleConversationUpdated = (payload: { conversationId: string }) => {
      updateCaches(queryClient, payload.conversationId);
    };

    const handleTypingStart = (payload: { conversationId: string }) => {
      if (payload.conversationId === activeConversationId) {
        onTypingChange?.(true);
      }
    };

    const handleTypingStop = (payload: { conversationId: string }) => {
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

    // Start polling fallback only if socket doesn't connect within 10 seconds
    // Increased timeout to give socket more time to connect
    const connectionTimeout = setTimeout(() => {
      if (
        !socket.connected &&
        !pollingIntervals.has(activeConversationId || "")
      ) {
        console.log("⏱️ Socket connection timeout - starting polling fallback");
        startPollingFallback(queryClient, activeConversationId, socketRef);
      }
    }, 10000); // Increased to 10 seconds

    return () => {
      clearTimeout(connectionTimeout);
      stopPollingFallback(queryClient, activeConversationId);
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
  console.log("🔗 Resolving socket URL:", url, "isDev:", isDev);

  if (!url) {
    console.error("❌ CHAT_SOCKET_URL is not defined!");
    throw new Error("CHAT_SOCKET_URL is not defined in environment variables");
  }

  // In development, use relative path (will use Vite proxy)
  if (isDev && url.startsWith("/")) {
    console.log("✅ Using relative URL for dev (will use Vite proxy):", url);
    return url;
  }

  // If URL is already a full URL (starts with http:// or https:// or ws:// or wss://), return as is
  if (/^(https?|wss?):\/\//.test(url)) {
    console.log("✅ Using full URL:", url);
    return url;
  }

  // If URL starts with /, it's a relative path - prepend origin
  if (url.startsWith("/")) {
    if (typeof window !== "undefined" && window.location) {
      const fullUrl = `${window.location.origin}${url}`;
      console.log("✅ Resolved relative URL to:", fullUrl);
      return fullUrl;
    }
  }

  console.log("✅ Using URL as is:", url);
  return url;
}

function updateCaches(
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
          console.log(
            "⚠️ Message already exists in cache, skipping:",
            message.id
          );
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
  queryClient.setQueryData(
    chatKeys.conversations(),
    (oldConversations: ConversationReadDto[] | undefined) => {
      if (!oldConversations) return oldConversations;
      return oldConversations.map((conversation) => {
        if (conversation.id !== message.conversationId) {
          return conversation;
        }

        // If this is the active conversation, don't increment unread counts
        // (messages are already being viewed)
        const isActiveConversation = conversation.id === activeConversationId;

        // Determine if we should increment unread counts
        // Only increment if it's not the active conversation
        const shouldIncrementUnread = !isActiveConversation;

        // Update unread counts based on message type
        const updatedConversation = {
          ...conversation,
          lastMessageId: message.id,
          lastMessageAt: message.createdAt,
          lastMessageContent: message.content || null,
        };

        if (shouldIncrementUnread) {
          if (message.messageType === CHAT_MESSAGE_TYPE.ALERT) {
            updatedConversation.unreadAlertCount =
              (conversation.unreadAlertCount || 0) + 1;
          } else {
            updatedConversation.unreadMessageCount =
              (conversation.unreadMessageCount || 0) + 1;
          }
        }

        return updatedConversation;
      });
    }
  );
}
