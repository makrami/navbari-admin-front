# WebSocket Implementation Guide for Dart

This document describes how to implement the same WebSocket (Socket.IO) configuration used in the React/TypeScript frontend project in a Dart application.

## Overview

The WebSocket implementation uses **Socket.IO** protocol for real-time chat communication. The client connects to a Socket.IO server and handles various events including messages, alerts, typing indicators, and conversation updates.

## Connection Configuration

### Base URL Configuration

The WebSocket URL is configured based on the environment:

- **Development**: `/ws/chat` (relative path, uses proxy)
- **Production**: `https://api-nav.dimansoft.ir/ws/chat` (full URL)

### Socket.IO Connection Options

```dart
// Connection options equivalent to TypeScript implementation
final socketOptions = {
  'transports': ['websocket', 'polling'], // Fallback to polling if websocket fails
  'withCredentials': true,                // Include credentials (cookies)
  'timeout': 20000,                       // 20 seconds timeout
  'reconnection': true,                   // Enable automatic reconnection
  'reconnectionDelay': 1000,              // Initial delay before reconnection (ms)
  'reconnectionDelayMax': 5000,           // Maximum delay between reconnection attempts (ms)
  'reconnectionAttempts': 5,              // Maximum number of reconnection attempts
  'forceNew': false,                      // Reuse existing connection if available
  'autoConnect': true,                    // Connect automatically
  'path': '/socket.io/',                  // Socket.IO path (if not included in URL)
};
```

**Note**: If the URL already contains `/ws/chat`, the path should not be set separately as Socket.IO automatically appends `/socket.io/` to the base URL.

## Dart Package Requirements

Add the Socket.IO client package to your `pubspec.yaml`:

```yaml
dependencies:
  socket_io_client: ^2.0.3+1 # Check for latest version at pub.dev
  # Other dependencies...
```

Install the package:

```bash
flutter pub get
# or
dart pub get
```

**Note**: The `socket_io_client` package API may vary between versions. Check the [package documentation](https://pub.dev/packages/socket_io_client) for the exact API for your version. The code examples in this guide use common patterns but may need adjustment based on your package version.

## Implementation Structure

### 1. Socket Manager Class

Create a socket manager class to handle all WebSocket operations:

```dart
import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'dart:async';

class ChatSocketManager {
  IO.Socket? _socket;
  bool _isConnected = false;
  String? _activeConversationId;
  Timer? _pollingTimer;
  StreamSubscription? _connectSubscription;

  // Callbacks
  Function(MessageReadDto)? onMessageReceived;
  Function(MessageReadDto)? onAlertReceived;
  Function(String)? onConversationUpdated;
  Function(String)? onTypingStart;
  Function(String)? onTypingStop;

  // Initialize socket connection
  void initialize({String? activeConversationId}) {
    _activeConversationId = activeConversationId;
    _connect();
  }

  void _connect() {
    final url = _resolveSocketUrl();
    print('🔌 Initializing socket connection: $url');

    // Determine if custom path is needed
    final useCustomPath = url.contains('/ws/chat');

    // Build socket options
    // Note: socket_io_client uses OptionBuilder pattern
    final options = IO.OptionBuilder()
        .setTransports(['websocket', 'polling']) // Fallback to polling
        .setTimeout(20000) // 20 seconds timeout
        .enableReconnection() // Enable automatic reconnection
        .setReconnectionDelay(1000) // Initial delay 1 second
        .setReconnectionDelayMax(5000) // Max delay 5 seconds
        .setReconnectionAttempts(5) // Max 5 attempts
        .setAutoConnect(true) // Connect automatically
        .enableForceNew() // Create new connection
        .setExtraHeaders({'withCredentials': 'true'}) // Include credentials
        .build();

    // Set path if needed (Socket.IO automatically appends /socket.io/)
    if (!useCustomPath) {
      // The path option may need to be set differently depending on package version
      // Some versions use setPath() method instead
      // options['path'] = '/socket.io/';
    }

    _socket = IO.io(url, options);
    _setupEventListeners();
  }

  String _resolveSocketUrl() {
    const isDev = bool.fromEnvironment('dart.vm.product') == false;
    const chatSocketUrl = String.fromEnvironment(
      'CHAT_SOCKET_URL',
      defaultValue: isDev ? '/ws/chat' : 'https://api-nav.dimansoft.ir/ws/chat',
    );

    // Handle relative URLs
    if (chatSocketUrl.startsWith('/')) {
      if (isDev) {
        return chatSocketUrl; // Use relative path in dev
      }
      // In production, prepend origin if needed
      // You may need to get this from your app configuration
      return 'https://api-nav.dimansoft.ir$chatSocketUrl';
    }

    return chatSocketUrl;
  }

  void _setupEventListeners() {
    if (_socket == null) return;

    // Connection events
    _socket!.onConnect((_) {
      _isConnected = true;
      print('✅ Socket connected: ${_socket!.id}');
      _stopPollingFallback();

      // Join conversation if active
      if (_activeConversationId != null) {
        _joinConversation(_activeConversationId!);
      }
    });

    _socket!.onDisconnect((reason) {
      _isConnected = false;
      print('❌ Socket disconnected: $reason');

      if (reason == 'io server disconnect') {
        // Server disconnected, reconnect manually
        _socket!.connect();
      }

      _startPollingFallback();
    });

    _socket!.onConnectError((error) {
      _isConnected = false;
      print('❌ Socket connection error: $error');
      _startPollingFallback();

      // Try to reconnect after delay
      Future.delayed(Duration(seconds: 2), () {
        if (_socket != null && !_socket!.connected) {
          print('🔄 Attempting to reconnect...');
          _socket!.connect();
        }
      });
    });

    // Note: Reconnection events may vary by package version
    // Some versions use onReconnect, onReconnectAttempt, etc.
    // Check your package documentation for exact event names
    _socket!.on('reconnect', (data) {
      print('✅ Socket reconnected after ${data ?? 'unknown'} attempts');
    });

    _socket!.on('reconnect_attempt', (data) {
      print('🔄 Reconnection attempt: ${data ?? 'unknown'}');
    });

    _socket!.on('reconnect_error', (error) {
      print('❌ Reconnection error: $error');
    });

    _socket!.on('reconnect_failed', (_) {
      print('❌ Reconnection failed after all attempts');
    });

    // Chat events
    _socket!.on('message:new', (data) {
      final message = MessageReadDto.fromJson(data);
      print('📨 New message received: ${message.id}');
      onMessageReceived?.call(message);
    });

    _socket!.on('alert:new', (data) {
      final message = MessageReadDto.fromJson(data);
      print('📨 New alert received: ${message.id}');
      onAlertReceived?.call(message);
    });

    _socket!.on('conversation:updated', (data) {
      final payload = Map<String, dynamic>.from(data);
      final conversationId = payload['conversationId'] as String;
      onConversationUpdated?.call(conversationId);
    });

    _socket!.on('conversation:read', (data) {
      final payload = Map<String, dynamic>.from(data);
      final conversationId = payload['conversationId'] as String;
      onConversationUpdated?.call(conversationId);
    });

    _socket!.on('typing:start', (data) {
      final payload = Map<String, dynamic>.from(data);
      final conversationId = payload['conversationId'] as String;
      if (conversationId == _activeConversationId) {
        onTypingStart?.call(conversationId);
      }
    });

    _socket!.on('typing:stop', (data) {
      final payload = Map<String, dynamic>.from(data);
      final conversationId = payload['conversationId'] as String;
      if (conversationId == _activeConversationId) {
        onTypingStop?.call(conversationId);
      }
    });

    _socket!.on('conversation:joined', (data) {
      print('✅ Successfully joined conversation: $data');
    });

    // Start polling fallback if connection doesn't establish within 5 seconds
    Future.delayed(Duration(seconds: 5), () {
      if (!_socket!.connected) {
        print('⏱️ Socket connection timeout - starting polling fallback');
        _startPollingFallback();
      }
    });
  }

  // Join a conversation
  void _joinConversation(String conversationId) {
    if (_socket == null || !_socket!.connected) {
      print('⏳ Waiting for socket connection before joining conversation...');
      // Listen for connect event once
      _socket!.onConnect((_) {
        print('🚪 Joining conversation: $conversationId');
        _socket!.emit('join_conversation', {'conversationId': conversationId});
      });
      return;
    }

    print('🚪 Joining conversation: $conversationId');
    _socket!.emit('join_conversation', {'conversationId': conversationId});
  }

  // Leave a conversation
  void leaveConversation(String conversationId) {
    if (_socket != null && _socket!.connected) {
      print('🚪 Leaving conversation: $conversationId');
      _socket!.emit('leave_conversation', {'conversationId': conversationId});
    }
  }

  // Update active conversation
  void setActiveConversation(String? conversationId) {
    // Leave previous conversation
    if (_activeConversationId != null) {
      leaveConversation(_activeConversationId!);
    }

    _activeConversationId = conversationId;

    // Join new conversation
    if (conversationId != null && _socket != null) {
      _joinConversation(conversationId);
    }
  }

  // Polling fallback mechanism
  void _startPollingFallback() {
    if (_activeConversationId == null) return;
    if (_pollingTimer != null && _pollingTimer!.isActive) return;

    print('🔄 Starting polling fallback for conversation: $_activeConversationId');

    _pollingTimer = Timer.periodic(Duration(seconds: 3), (timer) {
      // Invalidate and refetch messages
      // You'll need to implement this based on your state management solution
      // For example, using Riverpod, Provider, or GetX
      _refetchMessages();
    });
  }

  void _stopPollingFallback() {
    _pollingTimer?.cancel();
    _pollingTimer = null;
    if (_activeConversationId != null) {
      print('🛑 Stopped polling fallback for conversation: $_activeConversationId');
    }
  }

  void _refetchMessages() {
    // Implement your message refetching logic here
    // This should invalidate/refetch messages for the active conversation
    print('🔄 Polling: Refetching messages...');
  }

  // Disconnect socket
  void disconnect() {
    _stopPollingFallback();
    _connectSubscription?.cancel();
    _socket?.disconnect();
    _socket?.dispose();
    _socket = null;
    _isConnected = false;
  }

  // Get connection status
  bool get isConnected => _isConnected;

  // Get socket instance
  IO.Socket? get socket => _socket;
}
```

### 2. Data Models

Create Dart models matching the TypeScript types:

```dart
// chat_types.dart

enum ChatMessageType {
  message,
  alert;

  static ChatMessageType fromString(String value) {
    switch (value) {
      case 'message':
        return ChatMessageType.message;
      case 'alert':
        return ChatMessageType.alert;
      default:
        return ChatMessageType.message;
    }
  }

  String get value {
    switch (this) {
      case ChatMessageType.message:
        return 'message';
      case ChatMessageType.alert:
        return 'alert';
    }
  }
}

enum ChatAlertType {
  warning,
  alert,
  info,
  success;

  static ChatAlertType? fromString(String? value) {
    if (value == null) return null;
    switch (value) {
      case 'warning':
        return ChatAlertType.warning;
      case 'alert':
        return ChatAlertType.alert;
      case 'info':
        return ChatAlertType.info;
      case 'success':
        return ChatAlertType.success;
      default:
        return null;
    }
  }
}

enum ChatRecipientType {
  driver,
  company;

  static ChatRecipientType fromString(String value) {
    switch (value) {
      case 'driver':
        return ChatRecipientType.driver;
      case 'company':
        return ChatRecipientType.company;
      default:
        return ChatRecipientType.driver;
    }
  }

  String get value {
    switch (this) {
      case ChatRecipientType.driver:
        return 'driver';
      case ChatRecipientType.company:
        return 'company';
    }
  }
}

class ConversationReadDto {
  final String id;
  final String? driverId;
  final String? companyId;
  final ChatRecipientType recipientType;
  final String? lastMessageId;
  final String? lastMessageAt;
  final int unreadMessageCount;
  final int unreadAlertCount;
  final String? lastMessageContent;
  final DateTime createdAt;
  final DateTime updatedAt;

  ConversationReadDto({
    required this.id,
    this.driverId,
    this.companyId,
    required this.recipientType,
    this.lastMessageId,
    this.lastMessageAt,
    required this.unreadMessageCount,
    required this.unreadAlertCount,
    this.lastMessageContent,
    required this.createdAt,
    required this.updatedAt,
  });

  factory ConversationReadDto.fromJson(Map<String, dynamic> json) {
    return ConversationReadDto(
      id: json['id'] as String,
      driverId: json['driverId'] as String?,
      companyId: json['companyId'] as String?,
      recipientType: ChatRecipientType.fromString(json['recipientType'] as String),
      lastMessageId: json['lastMessageId'] as String?,
      lastMessageAt: json['lastMessageAt'] as String?,
      unreadMessageCount: json['unreadMessageCount'] as int? ?? 0,
      unreadAlertCount: json['unreadAlertCount'] as int? ?? 0,
      lastMessageContent: json['lastMessageContent'] as String?,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'driverId': driverId,
      'companyId': companyId,
      'recipientType': recipientType.value,
      'lastMessageId': lastMessageId,
      'lastMessageAt': lastMessageAt,
      'unreadMessageCount': unreadMessageCount,
      'unreadAlertCount': unreadAlertCount,
      'lastMessageContent': lastMessageContent,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }
}

class MessageReadDto {
  final String id;
  final String conversationId;
  final String senderId;
  final ChatMessageType messageType;
  final ChatAlertType? alertType;
  final String? content;
  final String? filePath;
  final String? fileName;
  final String? fileMimeType;
  final DateTime createdAt;
  final DateTime updatedAt;

  MessageReadDto({
    required this.id,
    required this.conversationId,
    required this.senderId,
    required this.messageType,
    this.alertType,
    this.content,
    this.filePath,
    this.fileName,
    this.fileMimeType,
    required this.createdAt,
    required this.updatedAt,
  });

  factory MessageReadDto.fromJson(Map<String, dynamic> json) {
    return MessageReadDto(
      id: json['id'] as String,
      conversationId: json['conversationId'] as String,
      senderId: json['senderId'] as String,
      messageType: ChatMessageType.fromString(json['messageType'] as String),
      alertType: ChatAlertType.fromString(json['alertType'] as String?),
      content: json['content'] as String?,
      filePath: json['filePath'] as String?,
      fileName: json['fileName'] as String?,
      fileMimeType: json['fileMimeType'] as String?,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'conversationId': conversationId,
      'senderId': senderId,
      'messageType': messageType.value,
      'alertType': alertType?.value,
      'content': content,
      'filePath': filePath,
      'fileName': fileName,
      'fileMimeType': fileMimeType,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }
}
```

### 3. Usage Example

Here's how to use the socket manager in your Dart/Flutter application:

```dart
import 'package:flutter/material.dart';
import 'chat_socket_manager.dart';
import 'chat_types.dart';

class ChatPage extends StatefulWidget {
  final String conversationId;

  const ChatPage({required this.conversationId, Key? key}) : super(key: key);

  @override
  State<ChatPage> createState() => _ChatPageState();
}

class _ChatPageState extends State<ChatPage> {
  late ChatSocketManager _socketManager;
  List<MessageReadDto> _messages = [];
  bool _isTyping = false;

  @override
  void initState() {
    super.initState();
    _initializeSocket();
  }

  void _initializeSocket() {
    _socketManager = ChatSocketManager();

    // Set up event handlers
    _socketManager.onMessageReceived = (message) {
      setState(() {
        // Add message to list (avoid duplicates)
        if (!_messages.any((m) => m.id == message.id)) {
          _messages.insert(0, message); // Insert at beginning (newest first)
        }
      });
    };

    _socketManager.onAlertReceived = (alert) {
      setState(() {
        if (!_messages.any((m) => m.id == alert.id)) {
          _messages.insert(0, alert);
        }
      });
    };

    _socketManager.onConversationUpdated = (conversationId) {
      // Refresh conversation data
      _refreshConversation();
    };

    _socketManager.onTypingStart = (_) {
      setState(() {
        _isTyping = true;
      });
    };

    _socketManager.onTypingStop = (_) {
      setState(() {
        _isTyping = false;
      });
    };

    // Initialize with active conversation
    _socketManager.initialize(activeConversationId: widget.conversationId);
  }

  void _refreshConversation() {
    // Implement your refresh logic here
    // This should refetch messages and conversation data
  }

  @override
  void dispose() {
    _socketManager.disconnect();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Chat'),
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              reverse: true, // Show newest messages at bottom
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                final message = _messages[index];
                return ListTile(
                  title: Text(message.content ?? ''),
                  subtitle: Text(message.createdAt.toString()),
                );
              },
            ),
          ),
          if (_isTyping)
            Padding(
              padding: EdgeInsets.all(8.0),
              child: Text('User is typing...'),
            ),
        ],
      ),
    );
  }
}
```

## Event Types and Payloads

### Emitted Events (Client → Server)

1. **`join_conversation`**

   ```dart
   socket.emit('join_conversation', {
     'conversationId': 'conversation-id-here'
   });
   ```

2. **`leave_conversation`**
   ```dart
   socket.emit('leave_conversation', {
     'conversationId': 'conversation-id-here'
   });
   ```

### Received Events (Server → Client)

1. **`message:new`** - New message received

   ```dart
   {
     'id': 'message-id',
     'conversationId': 'conversation-id',
     'senderId': 'sender-id',
     'messageType': 'message',
     'content': 'Message content',
     'createdAt': '2024-01-01T00:00:00Z',
     'updatedAt': '2024-01-01T00:00:00Z',
     // ... other fields
   }
   ```

2. **`alert:new`** - New alert received

   ```dart
   {
     'id': 'alert-id',
     'conversationId': 'conversation-id',
     'senderId': 'sender-id',
     'messageType': 'alert',
     'alertType': 'warning', // or 'alert', 'info', 'success'
     'content': 'Alert content',
     'createdAt': '2024-01-01T00:00:00Z',
     // ... other fields
   }
   ```

3. **`conversation:updated`** - Conversation updated

   ```dart
   {
     'conversationId': 'conversation-id'
   }
   ```

4. **`conversation:read`** - Conversation marked as read

   ```dart
   {
     'conversationId': 'conversation-id'
   }
   ```

5. **`typing:start`** - User started typing

   ```dart
   {
     'conversationId': 'conversation-id'
   }
   ```

6. **`typing:stop`** - User stopped typing

   ```dart
   {
     'conversationId': 'conversation-id'
   }
   ```

7. **`conversation:joined`** - Successfully joined conversation
   ```dart
   // Response data (format depends on server implementation)
   ```

## Important Considerations

### 1. Credentials and Authentication

The socket connection uses `withCredentials: true`, which means cookies and authentication headers are sent with the connection. Ensure your Dart implementation includes:

- Cookie handling for HTTP requests
- Authentication tokens in headers if required
- CORS configuration on the server side

### 2. Polling Fallback

The implementation includes a polling fallback mechanism that:

- Starts polling every 3 seconds if the socket is not connected
- Stops polling when the socket successfully connects
- Refetches messages and conversations during polling

You'll need to implement the `_refetchMessages()` method based on your state management solution (Riverpod, Provider, GetX, etc.).

### 3. Message Deduplication

When receiving messages via WebSocket, check if the message already exists in your local cache/state to avoid duplicates. The TypeScript implementation checks by message ID before adding to cache.

### 4. Connection State Management

Monitor the connection state and:

- Show connection status to users
- Handle offline scenarios gracefully
- Implement retry logic for failed connections

### 5. Environment Configuration

Set up environment variables for different build configurations:

```dart
// For Flutter, use flutter_dotenv or compile-time constants
// In pubspec.yaml:
// dependencies:
//   flutter_dotenv: ^5.0.2

// .env file:
// CHAT_SOCKET_URL=/ws/chat  # Development
// CHAT_SOCKET_URL=https://api-nav.dimansoft.ir/ws/chat  # Production
```

### 6. Error Handling

Implement comprehensive error handling for:

- Connection failures
- Network timeouts
- Invalid message formats
- Server disconnections

## Testing

Test the implementation with:

1. **Connection Test**: Verify socket connects successfully
2. **Reconnection Test**: Disconnect network and verify reconnection
3. **Message Test**: Send and receive messages
4. **Polling Fallback Test**: Disable WebSocket and verify polling works
5. **Multiple Conversations**: Test joining/leaving multiple conversations

## Troubleshooting

### Common Issues

1. **Connection fails**: Check URL, CORS settings, and authentication
2. **Messages not received**: Verify event listener setup and conversation joining
3. **Polling doesn't stop**: Check connection state detection
4. **Duplicate messages**: Implement proper deduplication logic

### Debug Logging

Enable debug logging to track socket events:

```dart
// Add print statements for all socket events
// Monitor connection state changes
// Log all received messages
```

## Package Version Compatibility Notes

Different versions of `socket_io_client` may have slightly different APIs:

- **Version 2.x**: Uses `OptionBuilder` pattern and `IO.io()` factory
- **Version 1.x**: May use different option structure

Always check the [package documentation](https://pub.dev/packages/socket_io_client) for your specific version.

### Alternative: Using Raw WebSocket

If you prefer not to use Socket.IO client library, you can implement a raw WebSocket connection, but you'll need to handle the Socket.IO protocol manually (handshake, heartbeat, etc.), which is more complex. The Socket.IO client library is recommended.

## Additional Resources

- [Socket.IO Client Dart Package](https://pub.dev/packages/socket_io_client)
- [Socket.IO Protocol Documentation](https://socket.io/docs/v4/)
- [Flutter WebSocket Guide](https://docs.flutter.dev/cookbook/networking/web-sockets)
- [Socket.IO Client-Server Communication](https://socket.io/docs/v4/client-api/)

## Notes

- The Socket.IO path (`/socket.io/`) is automatically appended by the Socket.IO client library
- The implementation supports both WebSocket and polling transports as fallback
- Reconnection is handled automatically with exponential backoff
- The polling fallback ensures messages are received even if WebSocket fails
