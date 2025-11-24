# Settings Implementation Guide for Head Office Panel

## Overview

This document provides a comprehensive guide for implementing the Settings feature in the Head Office Panel. The implementation focuses on three main categories:
- **General Settings**
- **Notification & Alerts**
- **SLA Settings**

The client-side implementation must use React.js with TanStack Query, maintain existing UI components, and follow a unified data model that matches the server-side structure.

---

## Table of Contents

1. [Server-Side Architecture](#server-side-architecture)
2. [API Endpoints](#api-endpoints)
3. [Unified Data Models](#unified-data-models)
4. [Client-Side Implementation Rules](#client-side-implementation-rules)
5. [Data Flow](#data-flow)
6. [Error Handling](#error-handling)
7. [Validation Rules](#validation-rules)

---

## Server-Side Architecture

### Database Schema

Settings are stored in the `system_settings` table with the following structure:

```typescript
{
  id: string (UUID)
  key: string (unique identifier, e.g., "companyName")
  value: any (JSONB - stores the actual setting value)
  category: SETTING_CATEGORY (enum: 'general' | 'notification' | 'sla' | 'roles')
  createdAt: Date
  updatedAt: Date
}
```

**Key Points:**
- Each setting is stored as a key-value pair
- Settings are grouped by category
- Values are stored as JSONB for flexibility
- Settings are cached in memory for performance

### Settings Service

The `SettingsService` implements the following key methods:

#### `getAllSettings(): Promise<SettingsReadDto>`
- Returns all settings grouped by category
- Uses in-memory cache for performance
- Returns structure: `{ general, notification, sla }`

#### `getSettingsByCategory(category: SETTING_CATEGORY): Promise<any>`
- Returns settings for a specific category only
- Uses cached data

#### `updateSettingsByCategory(category, data, userId): Promise<any>`
- Updates multiple settings within a category
- Only updates fields that are provided (partial updates supported)
- Invalidates cache after update
- Logs activity via ActivityLogService
- Returns updated settings for the category

#### `getAvailableOptions(): SettingsOptionsDto`
- Returns all available enum values and static options
- Used for populating dropdowns and form controls

### Caching Strategy

- Settings are loaded into memory cache on module initialization
- Cache is invalidated and reloaded after any update operation
- Cache ensures fast read operations without database queries

---

## API Endpoints

### Base URL
All endpoints are prefixed with `/api/v1/settings`

### Authentication & Authorization
- All endpoints require authentication: `@NeedsAuth('user.auth')`
- Read operations require permission: `settings:read`
- Update operations require permission: `settings:update`

### Endpoints

#### 1. Get All Settings
```
GET /api/v1/settings
```

**Response:** `SettingsReadDto`
```json
{
  "general": {
    "companyName": "string",
    "companyLogoUrl": "string",
    "distanceUnit": "km" | "mile",
    "weightUnit": "kg" | "lb"
  },
  "notification": {
    "gpsOfflineThresholdMin": number,
    "delayThresholdHr": number,
    "notificationChannels": ["system" | "email" | "sms" | "mobile_push"]
  },
  "sla": {
    "loadingTimeHours": number,
    "transitTimeHours": number,
    "unloadingTimeHours": number,
    "arrivalRadiusKm": number
  }
}
```

**Status Codes:**
- `200 OK`: Success
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Missing `settings:read` permission

---

#### 2. Get Settings by Category
```
GET /api/v1/settings/:category
```

**Path Parameters:**
- `category`: `"general"` | `"notification"` | `"sla"`

**Response:** Category-specific DTO (same structure as the corresponding property in `SettingsReadDto`)

**Example:**
```
GET /api/v1/settings/general
Response: { "companyName": "...", "companyLogoUrl": "...", ... }
```

**Status Codes:**
- `200 OK`: Success
- `400 Bad Request`: Invalid category
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Missing `settings:read` permission

---

#### 3. Update Settings by Category
```
PUT /api/v1/settings/:category
```

**Path Parameters:**
- `category`: `"general"` | `"notification"` | `"sla"`

**Request Body:** Category-specific update DTO (all fields optional)

**Example Request (General Settings):**
```json
{
  "companyName": "New Company Name",
  "distanceUnit": "mile"
}
```

**Response:** Updated category settings (same structure as GET response)

**Status Codes:**
- `200 OK`: Success
- `400 Bad Request`: Invalid category or validation error
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Missing `settings:update` permission

**Important Notes:**
- Only provided fields are updated (partial updates)
- Fields with `undefined` or `null` values are ignored
- Server validates all provided fields according to DTO rules

---

#### 4. Get Available Options
```
GET /api/v1/settings/options
```

**Response:** `SettingsOptionsDto`
```json
{
  "distanceUnits": ["km", "mile"],
  "weightUnits": ["kg", "lb"],
  "notificationChannels": ["system", "email", "sms", "mobile_push"],
  "categories": ["general", "notification", "sla", "roles"]
}
```

**Status Codes:**
- `200 OK`: Success
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Missing `settings:read` permission

---

#### 5. Get Single Setting by Key
```
GET /api/v1/settings/key/:key
```

**Path Parameters:**
- `key`: Setting key (e.g., `"companyName"`)

**Response:**
```json
{
  "key": "companyName",
  "value": "Company Name Value"
}
```

**Status Codes:**
- `200 OK`: Success
- `404 Not Found`: Setting key not found
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Missing `settings:read` permission

---

## Unified Data Models

The following TypeScript interfaces represent the unified data model that should be used on both server and client side:

### General Settings

```typescript
interface GeneralSettings {
  companyName?: string;
  companyLogoUrl?: string;
  distanceUnit?: 'km' | 'mile';
  weightUnit?: 'kg' | 'lb';
}

interface UpdateGeneralSettings {
  companyName?: string;
  companyLogoUrl?: string;
  distanceUnit?: 'km' | 'mile';
  weightUnit?: 'kg' | 'lb';
}
```

### Notification & Alerts Settings

```typescript
type NotificationChannel = 'system' | 'email' | 'sms' | 'mobile_push';

interface NotificationSettings {
  gpsOfflineThresholdMin?: number;  // 1-1440 minutes
  delayThresholdHr?: number;         // 1-168 hours
  notificationChannels?: NotificationChannel[];
}

interface UpdateNotificationSettings {
  gpsOfflineThresholdMin?: number;
  delayThresholdHr?: number;
  notificationChannels?: NotificationChannel[];
}
```

### SLA Settings

```typescript
interface SlaSettings {
  loadingTimeHours?: number;      // 1-720 hours
  transitTimeHours?: number;      // 1-720 hours
  unloadingTimeHours?: number;    // 1-720 hours
  arrivalRadiusKm?: number;       // 1-100 km
}

interface UpdateSlaSettings {
  loadingTimeHours?: number;
  transitTimeHours?: number;
  unloadingTimeHours?: number;
  arrivalRadiusKm?: number;
}
```

### Complete Settings Response

```typescript
interface SettingsReadDto {
  general: GeneralSettings;
  notification: NotificationSettings;
  sla: SlaSettings;
}
```

### Available Options

```typescript
interface SettingsOptions {
  distanceUnits: ('km' | 'mile')[];
  weightUnits: ('kg' | 'lb')[];
  notificationChannels: NotificationChannel[];
  categories: ('general' | 'notification' | 'sla' | 'roles')[];
}
```

---

## Client-Side Implementation Rules

### Technology Stack Requirements

1. **React.js**: Use functional components with hooks
2. **TanStack Query (React Query)**: For data fetching, caching, and mutations
3. **TypeScript**: Use the unified data models defined above
4. **Existing UI Components**: Do not modify existing UI components; work with what's already created

### TanStack Query Implementation Rules

#### 1. Query Keys Structure

Use a consistent query key structure:

```typescript
// Query keys
const settingsKeys = {
  all: ['settings'] as const,
  lists: () => [...settingsKeys.all, 'list'] as const,
  list: (filters: string) => [...settingsKeys.lists(), { filters }] as const,
  details: () => [...settingsKeys.all, 'detail'] as const,
  detail: (category: string) => [...settingsKeys.details(), category] as const,
  options: () => [...settingsKeys.all, 'options'] as const,
  key: (key: string) => [...settingsKeys.all, 'key', key] as const,
};
```

#### 2. Queries

**Fetch All Settings:**
- Use `useQuery` with key: `settingsKeys.all`
- Endpoint: `GET /api/v1/settings`
- Stale time: 5 minutes (settings don't change frequently)
- Cache time: 10 minutes

**Fetch Settings by Category:**
- Use `useQuery` with key: `settingsKeys.detail(category)`
- Endpoint: `GET /api/v1/settings/:category`
- Stale time: 5 minutes
- Cache time: 10 minutes

**Fetch Available Options:**
- Use `useQuery` with key: `settingsKeys.options()`
- Endpoint: `GET /api/v1/settings/options`
- Stale time: 1 hour (options rarely change)
- Cache time: 24 hours

#### 3. Mutations

**Update Settings by Category:**
- Use `useMutation` for each category
- Endpoint: `PUT /api/v1/settings/:category`
- On success:
  - Invalidate `settingsKeys.all` to refresh all settings
  - Invalidate `settingsKeys.detail(category)` to refresh category-specific cache
  - Optionally update cache optimistically
- On error: Handle validation errors and display user-friendly messages

#### 4. Optimistic Updates (Optional)

For better UX, consider optimistic updates:
- Update local cache immediately
- Revert on error
- Use `onMutate` and `onError` callbacks

### Form Handling Rules

1. **Partial Updates**: Only send fields that have been modified
2. **Validation**: Implement client-side validation matching server-side rules
3. **Loading States**: Show loading indicators during mutations
4. **Error Display**: Display validation errors next to relevant form fields
5. **Success Feedback**: Show success notification after successful updates

### UI Integration Rules

1. **Do Not Modify Existing Components**: Work with existing UI components as-is
2. **Form State Management**: Use React state or form libraries (React Hook Form recommended)
3. **Data Binding**: Bind form fields to TanStack Query cached data
4. **Real-time Updates**: When settings are updated, other components using the same query keys will automatically refetch

### Data Synchronization

1. **Initial Load**: Fetch all settings on component mount using `useQuery`
2. **Category-Specific Forms**: Use category-specific queries for individual forms
3. **Cache Invalidation**: After successful mutation, invalidate relevant query keys
4. **Background Refetching**: TanStack Query will automatically refetch stale data

---

## Data Flow

### Reading Settings

```
Component → useQuery → TanStack Query Cache → API Request → Server → Database/Cache → Response → Update Cache → Component Re-render
```

### Updating Settings

```
User Input → Form State → useMutation → API Request → Server Validation → Database Update → Cache Invalidation → Activity Log → Response → Update Cache → Component Re-render
```

### Cache Management

- TanStack Query manages cache automatically
- Cache is invalidated after successful mutations
- Stale data triggers background refetching
- Components using the same query keys share cached data

---

## Error Handling

### Server-Side Error Responses

**Validation Errors (400 Bad Request):**
```json
{
  "statusCode": 400,
  "message": ["validation error messages"],
  "error": "Bad Request"
}
```

**Authorization Errors (403 Forbidden):**
```json
{
  "statusCode": 403,
  "message": "Forbidden resource"
}
```

**Not Found Errors (404 Not Found):**
```json
{
  "statusCode": 404,
  "message": "Setting with key 'xxx' not found"
}
```

### Client-Side Error Handling Rules

1. **Validation Errors**: Display field-specific errors next to form fields
2. **Network Errors**: Show generic error message with retry option
3. **Authorization Errors**: Redirect to login or show permission denied message
4. **Unknown Errors**: Show user-friendly error message with option to contact support

### Error Recovery

- TanStack Query automatically retries failed requests (configurable)
- Provide manual retry buttons for user-initiated retries
- Maintain form state on error so users don't lose their input

---

## Validation Rules

### General Settings

| Field | Type | Validation Rules |
|-------|------|------------------|
| `companyName` | string | Optional, max length should be reasonable |
| `companyLogoUrl` | string | Optional, should be valid URL format |
| `distanceUnit` | enum | Optional, must be `'km'` or `'mile'` |
| `weightUnit` | enum | Optional, must be `'kg'` or `'lb'` |

### Notification & Alerts Settings

| Field | Type | Validation Rules |
|-------|------|------------------|
| `gpsOfflineThresholdMin` | number | Optional, integer, min: 1, max: 1440 |
| `delayThresholdHr` | number | Optional, integer, min: 1, max: 168 |
| `notificationChannels` | array | Optional, array of `NotificationChannel` enum values |

### SLA Settings

| Field | Type | Validation Rules |
|-------|------|------------------|
| `loadingTimeHours` | number | Optional, integer, min: 1, max: 720 |
| `transitTimeHours` | number | Optional, integer, min: 1, max: 720 |
| `unloadingTimeHours` | number | Optional, integer, min: 1, max: 720 |
| `arrivalRadiusKm` | number | Optional, integer, min: 1, max: 100 |

### Client-Side Validation Requirements

1. **Match Server Rules**: Client-side validation must match server-side validation exactly
2. **Real-time Validation**: Validate fields on blur or change (user preference)
3. **Submit Validation**: Validate all fields before submitting
4. **Error Messages**: Display clear, user-friendly error messages

---

## Implementation Checklist

### Server-Side (Already Implemented)
- ✅ Settings entity and database schema
- ✅ Settings service with caching
- ✅ DTOs for all categories
- ✅ Controller with all endpoints
- ✅ Validation decorators
- ✅ Activity logging
- ✅ Permission checks

### Client-Side (To Be Implemented)
- [ ] TypeScript interfaces matching server DTOs
- [ ] TanStack Query setup and configuration
- [ ] Query hooks for fetching settings
- [ ] Mutation hooks for updating settings
- [ ] Form components for each category
- [ ] Validation logic matching server rules
- [ ] Error handling and display
- [ ] Loading states
- [ ] Success notifications
- [ ] Integration with existing UI components

---

## Best Practices

1. **Type Safety**: Use TypeScript interfaces that match server DTOs exactly
2. **Cache Strategy**: Leverage TanStack Query's caching for optimal performance
3. **Optimistic Updates**: Consider optimistic updates for better UX
4. **Error Boundaries**: Implement error boundaries to catch and handle errors gracefully
5. **Loading States**: Always show loading indicators during async operations
6. **Form Validation**: Validate on both client and server side
7. **Accessibility**: Ensure forms are accessible (labels, ARIA attributes)
8. **Testing**: Write tests for queries, mutations, and form validation

---

## Notes

- **Roles Settings**: This document does not cover the Roles settings category. Do not implement client-side code for roles settings.
- **UI Preservation**: Existing UI components must not be modified. Work within the existing component structure.
- **Unified Models**: The data models defined in this document should be shared between server and client (consider using a shared package or monorepo structure).
- **API Versioning**: All endpoints use version `v1`. Future changes will be versioned accordingly.

---

## Support

For questions or issues regarding the settings implementation, refer to:
- Server-side code: `src/modules/settings/`
- API documentation: Swagger UI at `/api/docs`
- Activity logs: Check activity log service for settings update history

