# Chat and Alert Optimistic Updates System

This document explains how the Optimistic Updates system for chat messages and alerts has been implemented.

## Table of Contents

- [Introduction](#introduction)
- [Overall Architecture](#overall-architecture)
- [Implementation](#implementation)
- [Message Statuses](#message-statuses)
- [Message Display](#message-display)
- [Cache Management](#cache-management)
- [Important Notes](#important-notes)

## Introduction

The Optimistic Updates system allows users to see their messages immediately in the user interface without waiting for the server response. This improves user experience and increases the feeling of speed and responsiveness.

### Key Features

- ✅ Instant display of messages and alerts after sending
- ✅ Display of status icons (sending, sent, failed)
- ✅ Display of sent messages on the right side
- ✅ Automatic management of replacing temporary messages with real messages
- ✅ Synchronization with WebSocket for real-time updates

## Overall Architecture

### Workflow

```
1. User sends a message/alert
   ↓
2. Temporary message with status="sending" is added to cache
   ↓
3. HTTP request is sent to server
   ↓
4a. Success: Temporary message is replaced with real message (status="sent")
4b. Error: Temporary message status changes to "failed"
   ↓
5. WebSocket receives real message and updates cache
```

### Key Components

- **`useSendChatMessage`**: Hook for sending chat messages
- **`useSendChatAlert`**: Hook for sending alerts
- **`ChatMessageBubble`**: Component for displaying chat messages
- **`AlertCard`**: Component for displaying alerts
- **`appendMessageToCache`**: Function for adding messages to cache
- **`replaceTemporaryMessageInCache`**: Function for replacing temporary messages

## Implementation

### 1. Data Types

#### MessageStatus

```typescript
export type MessageStatus = "sending" | "sent" | "failed";
```

#### ChatMessage and AlertMessage

Both message types include `status` and `isOutgoing` fields:

```typescript
export interface ChatMessage {
  id: string;
  type: "chat";
  text?: string;
  timestamp: string;
  dateGroup: DateGroup;
  isOutgoing?: boolean; // For determining display position
  status?: MessageStatus; // Sending status
  // ... other fields
}

export interface AlertMessage {
  id: string;
  type: "alert";
  alertType: AlertType;
  title: string;
  description?: string;
  timestamp: string;
  dateGroup: DateGroup;
  isOutgoing?: boolean; // For determining display position
  status?: MessageStatus; // Sending status
  // ... other fields
}
```

### 2. Mutation Hooks

#### useSendChatMessage

```typescript
export function useSendChatMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SendChatMessageInput) => sendChatMessage(input),

    // Before sending: Add temporary message
    onMutate: async (variables) => {
      const tempId = `temp-${Date.now()}-${Math.random()}`;
      const conversationId =
        variables.conversationId ||
        (await getConversationIdFromInput(queryClient, variables));

      if (!conversationId) {
        return { tempId: null, conversationId: null };
      }

      const tempMessage: TemporaryMessage = {
        id: tempId,
        conversationId,
        senderId: variables.senderId || "",
        messageType: CHAT_MESSAGE_TYPE.MESSAGE,
        content: variables.content || null,
        createdAt: new Date().toISOString(),
        _tempId: tempId,
        _status: "sending", // Initial status
      };

      addTemporaryMessageToCache(queryClient, tempMessage);
      return { tempId, conversationId };
    },

    // After success: Replace temporary message with real message
    onSuccess: (message, _variables, context) => {
      if (!context?.tempId || !context?.conversationId) {
        // Fallback: If temporary message doesn't exist
        appendMessageToCache(queryClient, message);
        return;
      }

      replaceTemporaryMessageInCache(
        queryClient,
        context.conversationId,
        context.tempId,
        message
      );
    },

    // On error: Change status to failed
    onError: (_error, _variables, context) => {
      if (!context?.tempId || !context?.conversationId) return;

      updateTemporaryMessageStatus(
        queryClient,
        context.conversationId,
        context.tempId,
        "failed"
      );
    },
  });
}
```

#### useSendChatAlert

This hook is similar to `useSendChatMessage` but for alerts:

```typescript
export function useSendChatAlert() {
  // Similar to useSendChatMessage but with messageType: ALERT
}
```

### 3. Cache Management Functions

#### addTemporaryMessageToCache

Adds temporary message to the beginning of the first page in cache:

```typescript
function addTemporaryMessageToCache(
  queryClient: ReturnType<typeof useQueryClient>,
  tempMessage: TemporaryMessage
) {
  const queryKey = chatKeys.messages(tempMessage.conversationId);

  queryClient.setQueryData(queryKey, (oldData) => {
    if (!oldData) {
      return {
        pageParams: [undefined],
        pages: [[tempMessage]],
      };
    }

    // Add to beginning of first page (newest messages)
    const firstPage = [tempMessage, ...oldData.pages[0]];
    return {
      ...oldData,
      pages: [[firstPage], ...oldData.pages.slice(1)],
    };
  });
}
```

#### replaceTemporaryMessageInCache

Replaces temporary message with real message and changes status to "sent":

```typescript
function replaceTemporaryMessageInCache(
  queryClient: ReturnType<typeof useQueryClient>,
  conversationId: string,
  tempId: string,
  realMessage: MessageReadDto
) {
  const queryKey = chatKeys.messages(conversationId);

  queryClient.setQueryData(queryKey, (oldData) => {
    if (!oldData) return oldData;

    const newPages = oldData.pages.map((page) =>
      page.map((msg) => {
        const tempMsg = msg as TemporaryMessage;
        if (
          tempMsg._tempId === tempId ||
          (msg.id === tempId && tempMsg._status === "sending")
        ) {
          // Replace with real message and preserve "sent" status
          return {
            ...realMessage,
            _status: "sent",
          } as TemporaryMessage;
        }
        return msg;
      })
    );

    return { ...oldData, pages: newPages };
  });
}
```

#### updateTemporaryMessageStatus

Updates temporary message status (for errors):

```typescript
function updateTemporaryMessageStatus(
  queryClient: ReturnType<typeof useQueryClient>,
  conversationId: string,
  tempId: string,
  status: "failed"
) {
  const queryKey = chatKeys.messages(conversationId);

  queryClient.setQueryData(queryKey, (oldData) => {
    if (!oldData) return oldData;

    const newPages = oldData.pages.map((page) =>
      page.map((msg) => {
        const tempMsg = msg as TemporaryMessage;
        if (
          tempMsg._tempId === tempId ||
          (msg.id === tempId && tempMsg._status === "sending")
        ) {
          return { ...msg, _status: status };
        }
        return msg;
      })
    );

    return { ...oldData, pages: newPages };
  });
}
```

## Message Statuses

### sending

Message is being sent. A spinning loading icon is displayed.

```typescript
case "sending":
  return (
    <Loader2
      className="size-3 text-slate-400 animate-spin"
      aria-label="Sending"
    />
  );
```

### sent

Message has been sent successfully. A green check icon is displayed.

```typescript
case "sent":
  return <Check className="size-3 text-green-500" aria-label="Sent" />;
```

### failed

Message sending failed. A red warning icon is displayed.

```typescript
case "failed":
  return (
    <AlertTriangle className="size-3 text-red-500" aria-label="Failed" />
  );
```

## Message Display

### ChatMessageBubble

Chat messages are displayed on the right or left based on `isOutgoing`:

```typescript
export function ChatMessageBubble({ message }: ChatMessageBubbleProps) {
  const isOutgoing = message.isOutgoing ?? true;
  const status = message.status;

  if (isOutgoing) {
    // Right side - sent message
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] flex flex-col items-end">
          <div className="bg-[#1B54FE] text-white rounded-2xl rounded-br-sm px-4 py-2.5">
            {message.text && <p>{message.text}</p>}
          </div>
          <div className="flex items-center gap-1 mt-1 px-1">
            <span className="text-xs text-slate-500">{message.timestamp}</span>
            {status && <MessageStatusIcon status={status} />}
          </div>
        </div>
      </div>
    );
  }

  // Left side - received message
  return <div className="flex justify-start">{/* ... */}</div>;
}
```

### AlertCard

Alerts are also displayed on the right or left based on `isOutgoing`:

```typescript
export function AlertCard({ message }: AlertCardProps) {
  const isOutgoing = message.isOutgoing ?? false;
  const status = message.status;

  if (isOutgoing) {
    // Right side - sent alert
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] flex flex-col items-end">
          <div
            className={cn(
              "flex items-start gap-3 rounded-xl px-4 py-3",
              config.bgColor
            )}
          >
            {/* Alert content */}
          </div>
          <div className="flex items-center gap-1 mt-1 px-1">
            <span>{message.timestamp}</span>
            {status && <AlertStatusIcon status={status} />}
          </div>
        </div>
      </div>
    );
  }

  // Left side - received alert
  return <div className="flex justify-start">{/* ... */}</div>;
}
```

## Cache Management

### WebSocket Synchronization

When WebSocket receives a new message, `appendMessageToCache` checks if a temporary message with the same content exists:

```typescript
export function appendMessageToCache(
  queryClient: ReturnType<typeof useQueryClient>,
  message: MessageReadDto
) {
  // Check for temporary message with same content
  const hasTempMessage = oldData.pages.some((page) =>
    page.some((item) => {
      const tempMsg = item as TemporaryMessage;
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
        const tempMsg = item as TemporaryMessage;
        if (
          tempMsg._status === "sending" &&
          tempMsg.content === message.content
        ) {
          return message; // Replace
        }
        return item;
      })
    );
    return { ...oldData, pages: newPages };
  }

  // Add new message
  // ...
}
```

### Converting MessageReadDto to Message

The `mapMessageDtoToUi` function converts DTO messages to UI format and sets `status` and `isOutgoing`:

```typescript
function mapMessageDtoToUi(
  message: MessageReadDto,
  currentUserId: string
): Message {
  // For chat messages
  if (message.messageType === CHAT_MESSAGE_TYPE.MESSAGE) {
    return {
      id: message.id,
      type: "chat",
      text: message.content || undefined,
      isOutgoing: message.senderId === currentUserId,
      status: (message as any)._status, // From temporary message
      // ...
    };
  }

  // For alerts
  if (message.messageType === CHAT_MESSAGE_TYPE.ALERT) {
    return {
      id: message.id,
      type: "alert",
      isOutgoing: message.senderId === currentUserId,
      status: (message as any)._status, // From temporary message
      // ...
    };
  }
}
```

## Important Notes

### 1. Temporary Message Identification

Temporary messages are identified by `_tempId` and `_status`:

```typescript
type TemporaryMessage = MessageReadDto & {
  _tempId?: string;
  _status?: "sending" | "sent" | "failed";
};
```

### 2. Passing conversationId and senderId

For Optimistic Updates to work correctly, we must pass `conversationId` and `senderId` to the mutation:

```typescript
sendMessageMutation.mutate({
  content: payload.content,
  conversationId: conversation.id, // Required for optimistic update
  senderId: currentUserId, // Required to determine isOutgoing
  // ...
});
```

### 3. Error Handling

If sending fails, the temporary message status changes to "failed" and the user can retry.

### 4. WebSocket Synchronization

WebSocket may receive the message before the HTTP response. In this case, the temporary message is replaced with the real message.

### 5. Preventing Duplicates

The `appendMessageToCache` function checks if a message with the same ID already exists to prevent duplicates.

## Usage Examples

### Sending Chat Message

```typescript
const handleSendMessage = (payload: { content: string }) => {
  sendMessageMutation.mutate({
    content: payload.content,
    recipientType: conversation.recipientType,
    driverId: conversation.driverId,
    conversationId: conversation.id, // For optimistic update
    senderId: currentUserId, // To determine isOutgoing
  });
};
```

### Sending Alert

```typescript
const handleAlertChipClick = (chip: ActionableAlertChip) => {
  sendAlertMutation.mutate({
    alertType: chip.alertType,
    content: chip.label,
    recipientType: conversation.recipientType,
    driverId: conversation.driverId,
    conversationId: conversation.id, // For optimistic update
    senderId: currentUserId, // To determine isOutgoing
  });
};
```

## Related Files

- `src/services/chat/hooks.ts`: Mutation hooks and cache management functions
- `src/services/chat/socket.ts`: WebSocket management and cache synchronization
- `src/pages/chat-alert/components/ChatMessageBubble.tsx`: Chat message display component
- `src/pages/chat-alert/components/AlertCard.tsx`: Alert display component
- `src/pages/chat-alert/components/ChatAlertDetails.tsx`: Message sending management
- `src/pages/chat-alert/types/chat.ts`: Data types

## Conclusion

The Optimistic Updates system significantly improves user experience by:

- Instant display of messages after sending
- Clear display of sending status
- Automatic error handling
- WebSocket synchronization

This system makes users feel that the application is fast and responsive, even in the presence of network delays.
