# Chat and Alerts System Implementation Document
## Head Office App - React.js

**Base URL:** `http://api-nav.dimansoft.ir/`

**Important Notes:**
- The app UI must not change during implementation
- Data structures between backend and client must be unified
- Use TanStack Query for data fetching and caching
- This document focuses on API contracts, data structures, and WebSocket connection details

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Data Structures](#data-structures)
4. [REST API Endpoints](#rest-api-endpoints)
5. [WebSocket Connection](#websocket-connection)
6. [File Handling](#file-handling)
7. [Implementation Guidelines](#implementation-guidelines)

---

## Overview

The chat and alerts system enables real-time communication between Head Office users and recipients (Drivers or Companies). The system supports:

- **Messages**: Regular text messages with optional file attachments
- **Alerts**: Special messages with alert types (warning, alert, info, success) with optional file attachments
- **Real-time Updates**: WebSocket-based notifications for new messages and alerts
- **Read Status**: Track read/unread status separately for messages and alerts
- **Conversations**: Each Driver or Company has a unique conversation with Head Office

### Key Concepts

- **Conversation**: A chat thread between Head Office and a recipient (Driver or Company)
- **Message**: A regular chat message (`messageType: 'message'`)
- **Alert**: A special message with an alert type (`messageType: 'alert'`)
- **Recipient Types**: `DRIVER` or `COMPANY`
- **Unread Counts**: Separate counts for unread messages and unread alerts

---

## Authentication

All API endpoints and WebSocket connections require authentication using JWT tokens.

### REST API Authentication

Include the access token in cookies as `accessToken` or in the `Authorization` header:
```
Authorization: Bearer <token>
```

### WebSocket Authentication

The WebSocket connection requires authentication via:
1. **Handshake Auth** (preferred): Pass token in connection options
2. **Cookies**: Token in `accessToken` cookie

---

## Data Structures

### Enums

#### CHAT_MESSAGE_TYPE
```typescript
enum CHAT_MESSAGE_TYPE {
  MESSAGE = 'message',
  ALERT = 'alert'
}
```

#### CHAT_ALERT_TYPE
```typescript
enum CHAT_ALERT_TYPE {
  WARNING = 'warning',
  ALERT = 'alert',
  INFO = 'info',
  SUCCESS = 'success'
}
```

#### CHAT_RECIPIENT_TYPE
```typescript
enum CHAT_RECIPIENT_TYPE {
  DRIVER = 'driver',
  COMPANY = 'company'
}
```

### ConversationReadDto

Represents a conversation with unread counts.

```typescript
interface ConversationReadDto {
  id: string;                    // UUID - Conversation ID
  driverId?: string;             // UUID - Driver ID (nullable, mutually exclusive with companyId)
  companyId?: string;            // UUID - Company ID (nullable, mutually exclusive with driverId)
  recipientType: CHAT_RECIPIENT_TYPE;  // 'driver' | 'company'
  lastMessageId?: string;        // UUID - Last message ID
  lastMessageAt?: Date;          // ISO 8601 timestamp
  unreadMessageCount: number;    // Integer - Count of unread messages
  unreadAlertCount: number;      // Integer - Count of unread alerts
  createdAt: Date;               // ISO 8601 timestamp
  updatedAt: Date;               // ISO 8601 timestamp
}
```

**Notes:**
- `driverId` and `companyId` are mutually exclusive (only one is set)
- `unreadMessageCount` and `unreadAlertCount` are calculated based on `lastReadByHeadOfficeAt`
- Dates are returned as ISO 8601 strings

### MessageReadDto

Represents a message or alert.

```typescript
interface MessageReadDto {
  id: string;                    // UUID - Message ID
  conversationId: string;        // UUID - Conversation ID
  senderId: string;              // UUID - Sender user ID
  messageType: CHAT_MESSAGE_TYPE; // 'message' | 'alert'
  alertType?: CHAT_ALERT_TYPE;   // Only set when messageType = 'alert'
  content?: string;               // Text content (nullable)
  filePath?: string;              // Relative path to file (e.g., "uploads/chat/{id}/{filename}")
  fileName?: string;              // Original filename
  fileMimeType?: string;          // MIME type (e.g., "image/jpeg", "application/pdf")
  createdAt: Date;               // ISO 8601 timestamp
  updatedAt: Date;               // ISO 8601 timestamp
}
```

**Notes:**
- `content` and `filePath` are optional, but at least one must be present
- `alertType` is only set when `messageType === 'alert'`
- `filePath` is relative to the base URL (e.g., `uploads/chat/{driverId|companyId}/{filename}`)
- Full file URL: `{baseUrl}/{filePath}` (e.g., `http://api-nav.dimansoft.ir/uploads/chat/{id}/1234567890-123456789.jpg`)

### SendMessageDto

Request body for sending a message.

```typescript
interface SendMessageDto {
  driverId?: string;                    // UUID - Required for Head Office when recipientType is DRIVER
  companyId?: string;                   // UUID - Required for Head Office when recipientType is COMPANY
  recipientType?: CHAT_RECIPIENT_TYPE;  // Required for Head Office
  content?: string;                     // Max length: 5000 characters
  file?: File;                           // Optional file upload (multipart/form-data)
}
```

**Validation Rules:**
- For Head Office: `recipientType` is required
- If `recipientType === 'driver'`: `driverId` is required
- If `recipientType === 'company'`: `companyId` is required
- Either `content` or `file` (or both) must be provided
- File size limit: 10MB
- Allowed file types: `image/jpeg`, `image/png`, `image/jpg`, `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`

### SendAlertDto

Request body for sending an alert.

```typescript
interface SendAlertDto {
  driverId?: string;                    // UUID - Required for Head Office when recipientType is DRIVER
  companyId?: string;                   // UUID - Required for Head Office when recipientType is COMPANY
  recipientType?: CHAT_RECIPIENT_TYPE;  // Required for Head Office
  alertType: CHAT_ALERT_TYPE;           // Required - Alert type
  content?: string;                     // Max length: 5000 characters
  file?: File;                           // Optional file upload (multipart/form-data)
}
```

**Validation Rules:**
- Same as `SendMessageDto`, plus `alertType` is required
- `alertType` must be one of: `'warning'`, `'alert'`, `'info'`, `'success'`

---

## REST API Endpoints

All endpoints are prefixed with `/v1/chat` and require authentication.

### Base Path
```
http://api-nav.dimansoft.ir/v1/chat
```

### 1. List Conversations

**GET** `/conversations`

Get all conversations for the authenticated user. For Head Office users, returns all conversations.

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "driverId": "uuid" | null,
    "companyId": "uuid" | null,
    "recipientType": "driver" | "company",
    "lastMessageId": "uuid" | null,
    "lastMessageAt": "2024-01-01T00:00:00.000Z" | null,
    "unreadMessageCount": 0,
    "unreadAlertCount": 0,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

**TanStack Query Usage:**
- Query Key: `['chat', 'conversations']`
- Refetch on: WebSocket events `conversation:updated`, `message:new`, `alert:new`

---

### 2. Get Conversation by ID

**GET** `/conversations/:id`

Get a specific conversation by ID.

**Path Parameters:**
- `id` (string, UUID): Conversation ID

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "driverId": "uuid" | null,
  "companyId": "uuid" | null,
  "recipientType": "driver" | "company",
  "lastMessageId": "uuid" | null,
  "lastMessageAt": "2024-01-01T00:00:00.000Z" | null,
  "unreadMessageCount": 0,
  "unreadAlertCount": 0,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**TanStack Query Usage:**
- Query Key: `['chat', 'conversation', id]`
- Refetch on: WebSocket events `conversation:updated`, `message:new`, `alert:new` for this conversation

---

### 3. Get Messages for Conversation

**GET** `/conversations/:id/messages`

Get messages for a conversation with pagination.

**Path Parameters:**
- `id` (string, UUID): Conversation ID

**Query Parameters:**
- `skip` (number, optional): Number of records to skip (for pagination)
- `take` (number, optional): Number of records to take (page size)
- `before` (string, optional): ISO 8601 date string - get messages before this date (for infinite scroll)

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "conversationId": "uuid",
    "senderId": "uuid",
    "messageType": "message" | "alert",
    "alertType": "warning" | "alert" | "info" | "success" | null,
    "content": "string" | null,
    "filePath": "uploads/chat/{id}/{filename}" | null,
    "fileName": "original-filename.jpg" | null,
    "fileMimeType": "image/jpeg" | null,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

**Notes:**
- Messages are returned in descending order by `createdAt` (newest first)
- Use `before` parameter for infinite scroll (load older messages)
- Use `skip` and `take` for traditional pagination

**TanStack Query Usage:**
- Query Key: `['chat', 'messages', conversationId, { skip, take, before }]`
- Refetch on: WebSocket events `message:new`, `alert:new` for this conversation
- Consider using `useInfiniteQuery` for infinite scroll

---

### 4. Send Message

**POST** `/messages`

Send a message (with optional file upload). Conversation is auto-created if it doesn't exist.

**Content-Type:** `multipart/form-data`

**Request Body (FormData):**
- `driverId` (string, optional): UUID - Required when `recipientType` is `'driver'`
- `companyId` (string, optional): UUID - Required when `recipientType` is `'company'`
- `recipientType` (string, required): `'driver'` | `'company'`
- `content` (string, optional): Message text (max 5000 characters)
- `file` (File, optional): File to upload (max 10MB)

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "conversationId": "uuid",
  "senderId": "uuid",
  "messageType": "message",
  "alertType": null,
  "content": "string" | null,
  "filePath": "uploads/chat/{id}/{filename}" | null,
  "fileName": "original-filename.jpg" | null,
  "fileMimeType": "image/jpeg" | null,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**TanStack Query Usage:**
- Use `useMutation` for sending messages
- On success:
  - Invalidate `['chat', 'conversations']`
  - Invalidate `['chat', 'conversation', conversationId]`
  - Invalidate `['chat', 'messages', conversationId]`
  - Optimistically update messages list

**Error Responses:**
- `400 Bad Request`: Validation error (missing required fields, invalid file type, etc.)
- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: User doesn't have permission
- `404 Not Found`: Driver or Company not found

---

### 5. Send Alert

**POST** `/alerts`

Send an alert (with optional file upload). Conversation is auto-created if it doesn't exist.

**Content-Type:** `multipart/form-data`

**Request Body (FormData):**
- `driverId` (string, optional): UUID - Required when `recipientType` is `'driver'`
- `companyId` (string, optional): UUID - Required when `recipientType` is `'company'`
- `recipientType` (string, required): `'driver'` | `'company'`
- `alertType` (string, required): `'warning'` | `'alert'` | `'info'` | `'success'`
- `content` (string, optional): Alert text (max 5000 characters)
- `file` (File, optional): File to upload (max 10MB)

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "conversationId": "uuid",
  "senderId": "uuid",
  "messageType": "alert",
  "alertType": "warning",
  "content": "string" | null,
  "filePath": "uploads/chat/{id}/{filename}" | null,
  "fileName": "original-filename.jpg" | null,
  "fileMimeType": "image/jpeg" | null,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**TanStack Query Usage:**
- Same as Send Message
- Use `useMutation` for sending alerts
- On success, invalidate same queries as Send Message

---

### 6. Mark Conversation as Read

**PUT** `/conversations/:id/read`

Mark a conversation as read (updates `lastReadByHeadOfficeAt` timestamp).

**Path Parameters:**
- `id` (string, UUID): Conversation ID

**Response:** `200 OK`
```json
{
  "success": true
}
```

**TanStack Query Usage:**
- Use `useMutation` for marking as read
- On success:
  - Invalidate `['chat', 'conversations']`
  - Invalidate `['chat', 'conversation', id]`
  - Optimistically update conversation unread counts to 0

---

### 7. Get Unread Count

**GET** `/unread-count`

Get total unread message count across all conversations for the authenticated user.

**Response:** `200 OK`
```json
{
  "count": 5
}
```

**Notes:**
- This count includes both messages and alerts
- For Head Office users, counts messages/alerts after `lastReadByHeadOfficeAt` for each conversation

**TanStack Query Usage:**
- Query Key: `['chat', 'unread-count']`
- Refetch on: WebSocket events `message:new`, `alert:new`
- Consider polling interval for badge updates

---

## WebSocket Connection

### Connection Details

**Namespace:** `/ws/chat`

**Full URL:** `ws://api-nav.dimansoft.ir/ws/chat` (or `wss://` for secure connections)

**Connection Options:**
```typescript
{
  auth: {
    token: '<accessToken>'
  },
  // OR include token in cookies as 'accessToken'
}
```

### Connection Lifecycle

1. **Connect**: Establish WebSocket connection with authentication
2. **Auto-Join**: User automatically joins room `user:{userId}` upon successful connection
3. **Join Conversation**: Explicitly join conversation rooms when viewing a conversation
4. **Disconnect**: Clean up on disconnect

### Socket Events

#### Client → Server Events

##### 1. Join Conversation

**Event:** `join_conversation`

**Payload:**
```typescript
{
  conversationId: string; // UUID
}
```

**Response:**
```typescript
{
  success: true,
  conversationId: string;
}
```

**Usage:** Emit when user opens a conversation view.

---

##### 2. Leave Conversation

**Event:** `leave_conversation`

**Payload:**
```typescript
{
  conversationId: string; // UUID
}
```

**Response:**
```typescript
{
  success: true,
  conversationId: string;
}
```

**Usage:** Emit when user leaves/closes a conversation view.

---

#### Server → Client Events

##### 1. New Message

**Event:** `message:new`

**Payload:** `MessageReadDto` (where `messageType === 'message'`)

```typescript
{
  id: string;
  conversationId: string;
  senderId: string;
  messageType: 'message';
  alertType: null;
  content?: string;
  filePath?: string;
  fileName?: string;
  fileMimeType?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

**Emitted To:** All users in the conversation room (`conversation:{conversationId}`)

**TanStack Query Integration:**
- Update `['chat', 'messages', conversationId]` query data
- Invalidate `['chat', 'conversations']` to update last message
- Invalidate `['chat', 'conversation', conversationId]` to update unread counts
- Update `['chat', 'unread-count']` if applicable

---

##### 2. New Alert

**Event:** `alert:new`

**Payload:** `MessageReadDto` (where `messageType === 'alert'`)

```typescript
{
  id: string;
  conversationId: string;
  senderId: string;
  messageType: 'alert';
  alertType: 'warning' | 'alert' | 'info' | 'success';
  content?: string;
  filePath?: string;
  fileName?: string;
  fileMimeType?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

**Emitted To:** All users in the conversation room (`conversation:{conversationId}`)

**TanStack Query Integration:**
- Same as `message:new`
- Consider showing a notification/toast for alerts

---

##### 3. Conversation Read

**Event:** `conversation:read`

**Payload:**
```typescript
{
  conversationId: string; // UUID
  userId: string;         // UUID - User who marked as read
  readAt: Date;           // ISO 8601 timestamp
}
```

**Emitted To:** All users in the conversation room (`conversation:{conversationId}`)

**TanStack Query Integration:**
- Update `['chat', 'conversation', conversationId]` to update read timestamp
- Update `['chat', 'conversations']` to update unread counts
- Update `['chat', 'unread-count']` if applicable

---

### WebSocket Implementation Example (Conceptual)

```typescript
// Connection setup
const socket = io('http://api-nav.dimansoft.ir/ws/chat', {
  auth: {
    token: accessToken
  }
});

// Join conversation when viewing
socket.emit('join_conversation', { conversationId });

// Leave conversation when leaving view
socket.emit('leave_conversation', { conversationId });

// Listen for new messages
socket.on('message:new', (message) => {
  // Update TanStack Query cache
});

// Listen for new alerts
socket.on('alert:new', (alert) => {
  // Update TanStack Query cache
  // Show notification
});

// Listen for read updates
socket.on('conversation:read', (data) => {
  // Update TanStack Query cache
});
```

---

## File Handling

### File Upload

- **Endpoint:** `POST /v1/chat/messages` or `POST /v1/chat/alerts`
- **Content-Type:** `multipart/form-data`
- **Field Name:** `file`
- **Max Size:** 10MB
- **Allowed Types:**
  - Images: `image/jpeg`, `image/png`, `image/jpg`
  - Documents: `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`

### File Storage

Files are stored in: `uploads/chat/{driverId|companyId|general}/{timestamp}-{random}.{ext}`

### File URL Construction

The `filePath` in the response is relative. Construct the full URL as:

```
{baseUrl}/{filePath}
```

**Example:**
- `filePath`: `uploads/chat/abc-123-def/1234567890-987654321.jpg`
- **Full URL**: `http://api-nav.dimansoft.ir/uploads/chat/abc-123-def/1234567890-987654321.jpg`

### File Display

- **Images:** Display directly using `<img>` tag or image component
- **PDFs/Documents:** Provide download link or use PDF viewer
- **File Name:** Use `fileName` field for display/download

---

## Implementation Guidelines

### TanStack Query Setup

1. **Query Client Configuration:**
   - Configure query client with appropriate cache settings
   - Set up WebSocket integration for real-time updates

2. **Query Keys:**
   - Use consistent query key structure:
     - Conversations: `['chat', 'conversations']`
     - Conversation: `['chat', 'conversation', id]`
     - Messages: `['chat', 'messages', conversationId, { skip, take, before }]`
     - Unread Count: `['chat', 'unread-count']`

3. **Mutations:**
   - Use optimistic updates for better UX
   - Invalidate related queries on success
   - Handle errors appropriately

4. **Real-time Updates:**
   - Listen to WebSocket events
   - Update query cache on `message:new`, `alert:new`, `conversation:read`
   - Use `queryClient.setQueryData` for immediate updates

### Data Unification

Ensure the following data structures match exactly between backend and frontend:

1. **Enums:** Use the exact same enum values
2. **DTOs:** Match TypeScript interfaces with backend DTOs
3. **Date Formats:** Parse ISO 8601 strings consistently
4. **Null/Undefined:** Handle nullable fields consistently

### Error Handling

- **401 Unauthorized:** Redirect to login or refresh token
- **403 Forbidden:** Show access denied message
- **404 Not Found:** Show not found message
- **400 Bad Request:** Display validation errors
- **Network Errors:** Show retry option

### Performance Considerations

1. **Pagination:** Use infinite scroll or pagination for messages
2. **Caching:** Leverage TanStack Query caching
3. **Optimistic Updates:** Update UI immediately, sync with server
4. **Debouncing:** Debounce read status updates
5. **Connection Management:** Reconnect WebSocket on disconnect

### UI Considerations

- **No UI Changes:** Maintain existing UI/UX
- **Real-time Indicators:** Show typing indicators, delivery status if needed
- **Unread Badges:** Update unread counts in real-time
- **Notifications:** Show notifications for new alerts
- **File Previews:** Show file previews for images, download links for documents

---

## Summary

This document provides the complete API contract and WebSocket specification for implementing the chat and alerts system in the Head Office React.js app. Key points:

1. **Base URL:** `http://api-nav.dimansoft.ir/`
2. **REST API:** All endpoints under `/v1/chat`
3. **WebSocket:** Namespace `/ws/chat`
4. **Data Structures:** Use provided TypeScript interfaces
5. **TanStack Query:** Use for data fetching and caching
6. **Real-time:** WebSocket events for live updates
7. **Files:** Relative paths, construct full URLs with base URL

Ensure data structures are unified between backend and frontend, and maintain existing UI while adding real-time functionality.

