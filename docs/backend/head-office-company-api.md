# Company Management API Documentation - Head Office Panel

This document provides comprehensive API documentation for implementing company management operations in the Head Office React client application.

**Important**: This document focuses on operations available to **Head Office users only**. These operations allow Head Office to manage all local companies, including approving/rejecting companies, suspending companies, managing company documents, and viewing internal notes.

## Table of Contents

1. [Base Configuration](#base-configuration)
2. [Company Management Overview](#company-management-overview)
3. [List Companies API](#list-companies-api)
4. [Get Company Details API](#get-company-details-api)
5. [Get Company Details with Statistics API](#get-company-details-with-statistics-api)
6. [Update Company API](#update-company-api)
7. [Approve Company API](#approve-company-api)
8. [Reject Company API](#reject-company-api)
9. [Suspend Company API](#suspend-company-api)
10. [Unsuspend Company API](#unsuspend-company-api)
11. [Delete Company API](#delete-company-api)
12. [Company Documents API](#company-documents-api)
13. [Error Handling](#error-handling)
14. [Implementation Guide](#implementation-guide)
15. [Enums and Constants](#enums-and-constants)
16. [Data Transfer Objects (DTOs)](#data-transfer-objects-dtos)

---

## Base Configuration

### Base URL
```
https://api-nav.dimansoft.ir/
```

### API Version
All company endpoints use version `v1`:
```
https://api-nav.dimansoft.ir/api/v1/companies/*
https://api-nav.dimansoft.ir/api/v1/company-documents/*
```

### Content-Type
- **JSON Requests**: `Content-Type: application/json`
- **Multipart Form Data** (for file uploads): `Content-Type: multipart/form-data`

### CORS Configuration
- **Credentials**: Enabled (required for HTTP-only cookies)
- **Allowed Origins**: Must be configured on the backend to allow your frontend domain
- **Important**: When using HTTP-only cookies, CORS must allow credentials. The `Access-Control-Allow-Origin` header must specify the exact frontend origin (cannot use `*`)

---

## Company Management Overview

### Authentication
All company endpoints require authentication via HTTP-only cookies (same as authentication endpoints). The `accessToken` cookie is automatically included in requests.

### Access Control
- **Head Office Users**: Can manage all companies across all countries (unless restricted by role country)
- **Local Company Users**: Can only view and update their own company (not covered in this document)
- **Country Restrictions**: Head Office users with country-restricted roles can only manage companies in their assigned country

### Permissions Required
- `companies:read` - Required for listing and viewing companies
- `companies:update` - Required for updating companies and uploading documents
- `companies:manage` - Required for approving/rejecting/suspending companies and documents
- `companies:delete` - Required for deleting companies

### Company Status Flow
1. **PENDING**: Company registration submitted, awaiting Head Office approval
2. **APPROVED**: Company approved by Head Office, can operate normally
3. **REJECTED**: Company registration rejected (includes rejection reason)
4. **SUSPENDED**: Company temporarily suspended (can be reactivated)

**Important**: 
- Head Office can approve/reject companies from `PENDING` status
- Head Office can suspend (deactivate) companies from `APPROVED` status
- Head Office can unsuspend (activate) companies from `SUSPENDED` status
- Head Office can delete companies (soft delete)
- Head Office can view and manage internal notes (not visible to Local Company users)
- **UI Note**: In the user interface, "Suspend" is displayed as "Deactivate" and "Unsuspend" is displayed as "Activate"

---

## List Companies API

### Endpoint
```
GET /api/v1/companies
```

### Description
Retrieves a list of companies with optional filtering and pagination. Head Office users can see all companies (subject to country restrictions if applicable).

### Request

#### Headers
```
Content-Type: application/json
```

**Authentication**: Required (via `accessToken` cookie)

#### Query Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `skip` | number | No | Number of records to skip (for pagination) | `0` |
| `take` | number | No | Number of records to return (for pagination) | `20` |
| `status` | enum | No | Filter by company status | `"pending"` |
| `country` | string | No | Filter by country | `"United States"` |
| `registrationId` | string | No | Filter by registration ID | `"REG-12345"` |

#### Example Request
```bash
curl -X GET "https://api-nav.dimansoft.ir/api/v1/companies?skip=0&take=20&status=pending" \
  -H "Content-Type: application/json" \
  --cookie "accessToken=<token>"
```

### Response

#### Success Response (200 OK)

**Response Body:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "ABC Logistics Ltd",
    "country": "United States",
    "address": "123 Main St, New York, NY 10001",
    "email": "contact@abclogistics.com",
    "phone": "+1-555-123-4567",
    "status": "pending",
    "registrationId": "REG-12345",
    "website": "https://www.abclogistics.com",
    "driverCapacityCount": 50,
    "vehicleTypes": ["tented", "refrigerated"],
    "primaryContactFullName": "John Doe",
    "primaryContactEmail": "john.doe@abclogistics.com",
    "primaryContactPhoneNumber": "+1-555-123-4568",
    "preferredLanguage": "en",
    "logoUrl": "uploads/companies/550e8400-e29b-41d4-a716-446655440000/logo.png",
    "internalNote": "High priority client",
    "rejectionReason": null,
    "createdAt": "2024-01-10T08:00:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
]
```

**Response Fields:** See [CompanyReadDto](#companyreaddto) section for complete field descriptions.

### Error Responses

#### 401 Unauthorized - Not Authenticated
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

#### 403 Forbidden - Insufficient Permissions
```json
{
  "statusCode": 403,
  "message": "Insufficient permissions",
  "error": "Forbidden"
}
```

---

## Get Company Details API

### Endpoint
```
GET /api/v1/companies/:id
```

### Description
Retrieves detailed information about a specific company by ID. Head Office users can access any company (subject to country restrictions).

### Request

#### Headers
```
Content-Type: application/json
```

**Authentication**: Required (via `accessToken` cookie)

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string (UUID) | Yes | Company ID |

#### Example Request
```bash
curl -X GET https://api-nav.dimansoft.ir/api/v1/companies/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  --cookie "accessToken=<token>"
```

### Response

#### Success Response (200 OK)

**Response Body:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "ABC Logistics Ltd",
  "country": "United States",
  "address": "123 Main St, New York, NY 10001",
  "email": "contact@abclogistics.com",
  "phone": "+1-555-123-4567",
  "status": "pending",
  "registrationId": "REG-12345",
  "website": "https://www.abclogistics.com",
  "driverCapacityCount": 50,
  "vehicleTypes": ["tented", "refrigerated"],
  "primaryContactFullName": "John Doe",
  "primaryContactEmail": "john.doe@abclogistics.com",
  "primaryContactPhoneNumber": "+1-555-123-4568",
  "preferredLanguage": "en",
  "logoUrl": "uploads/companies/550e8400-e29b-41d4-a716-446655440000/logo.png",
  "internalNote": "High priority client",
  "rejectionReason": null,
  "createdAt": "2024-01-10T08:00:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

### Error Responses

#### 404 Not Found - Company Not Found
```json
{
  "statusCode": 404,
  "message": "Company not found",
  "error": "Not Found"
}
```

#### 403 Forbidden - Access Denied
```json
{
  "statusCode": 403,
  "message": "You do not have access to this company",
  "error": "Forbidden"
}
```

#### 401 Unauthorized - Not Authenticated
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

---

## Get Company Details with Statistics API

### Endpoint
```
GET /api/v1/companies/:id/details
```

### Description
Retrieves detailed information about a specific company including computed statistics (total drivers and total segments). This endpoint is useful for displaying company dashboard information.

### Request

#### Headers
```
Content-Type: application/json
```

**Authentication**: Required (via `accessToken` cookie)

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string (UUID) | Yes | Company ID |

#### Example Request
```bash
curl -X GET https://api-nav.dimansoft.ir/api/v1/companies/550e8400-e29b-41d4-a716-446655440000/details \
  -H "Content-Type: application/json" \
  --cookie "accessToken=<token>"
```

### Response

#### Success Response (200 OK)

**Response Body:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "ABC Logistics Ltd",
  "country": "United States",
  "address": "123 Main St, New York, NY 10001",
  "email": "contact@abclogistics.com",
  "phone": "+1-555-123-4567",
  "status": "approved",
  "registrationId": "REG-12345",
  "website": "https://www.abclogistics.com",
  "driverCapacityCount": 50,
  "vehicleTypes": ["tented", "refrigerated"],
  "primaryContactFullName": "John Doe",
  "primaryContactEmail": "john.doe@abclogistics.com",
  "primaryContactPhoneNumber": "+1-555-123-4568",
  "preferredLanguage": "en",
  "logoUrl": "uploads/companies/550e8400-e29b-41d4-a716-446655440000/logo.png",
  "internalNote": "High priority client",
  "rejectionReason": null,
  "totalDrivers": 25,
  "totalSegments": 150,
  "createdAt": "2024-01-10T08:00:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

**Additional Fields:**
- `totalDrivers`: Number of drivers associated with this company
- `totalSegments`: Number of active shipment segments assigned to this company

### Error Responses

Same as [Get Company Details API](#get-company-details-api) error responses.

---

## Update Company API

### Endpoint
```
PUT /api/v1/companies/:id
```

### Description
Updates company details. Head Office users can update any company (subject to country restrictions).

### Request

#### Headers
```
Content-Type: application/json
```

**Authentication**: Required (via `accessToken` cookie)

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string (UUID) | Yes | Company ID |

#### Request Body

All fields are optional. Only include fields that need to be updated.

```json
{
  "name": "string (optional, 1-200 chars)",
  "country": "string (optional, 1-100 chars)",
  "address": "string (optional, max 500 chars)",
  "email": "string (optional, valid email)",
  "phone": "string (optional, 1-50 chars)",
  "registrationId": "string (optional, max 100 chars, unique)",
  "website": "string (optional, max 500 chars)",
  "driverCapacityCount": "number (optional)",
  "vehicleTypes": "array (optional, enum values)",
  "primaryContactFullName": "string (optional, 1-200 chars)",
  "primaryContactEmail": "string (optional, valid email)",
  "primaryContactPhoneNumber": "string (optional, 1-50 chars)",
  "preferredLanguage": "enum (optional)",
  "internalNote": "string (optional, max 2000 chars, Head Office only)"
}
```

#### Example Request
```bash
curl -X PUT https://api-nav.dimansoft.ir/api/v1/companies/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  --cookie "accessToken=<token>" \
  -d '{
    "country": "Canada",
    "driverCapacityCount": 75,
    "internalNote": "Updated note"
  }'
```

### Response

#### Success Response (200 OK)

**Response Body:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "ABC Logistics Ltd",
  "country": "Canada",
  "address": "123 Main St, New York, NY 10001",
  "email": "contact@abclogistics.com",
  "phone": "+1-555-123-4567",
  "status": "approved",
  "website": "https://www.abclogistics.com",
  "driverCapacityCount": 75,
  "vehicleTypes": ["tented", "refrigerated"],
  "primaryContactFullName": "John Doe",
  "primaryContactEmail": "john.doe@abclogistics.com",
  "primaryContactPhoneNumber": "+1-555-123-4568",
  "preferredLanguage": "en",
  "internalNote": "Updated note",
  "createdAt": "2024-01-10T08:00:00Z",
  "updatedAt": "2024-01-15T11:45:00Z"
}
```

### Error Responses

#### 404 Not Found - Company Not Found
```json
{
  "statusCode": 404,
  "message": "Company not found",
  "error": "Not Found"
}
```

#### 400 Bad Request - Validation Error
```json
{
  "statusCode": 400,
  "message": [
    "name must be longer than or equal to 1 characters",
    "email must be an email"
  ],
  "error": "Bad Request"
}
```

#### 400 Bad Request - Company Already Exists
```json
{
  "statusCode": 400,
  "message": "Company with this name already exists",
  "error": "Bad Request"
}
```

#### 403 Forbidden - Access Denied
```json
{
  "statusCode": 403,
  "message": "You do not have access to this company",
  "error": "Forbidden"
}
```

#### 401 Unauthorized - Not Authenticated
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

---

## Approve Company API

### Endpoint
```
PATCH /api/v1/companies/:id/approve
```

### Description
Approves a company, changing its status from `PENDING` to `APPROVED`. Only Head Office users can approve companies. When a company is approved, the owner user (if exists) is automatically assigned the `company_manager` role.

### Request

#### Headers
```
Content-Type: application/json
```

**Authentication**: Required (via `accessToken` cookie)

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string (UUID) | Yes | Company ID |

#### Example Request
```bash
curl -X PATCH https://api-nav.dimansoft.ir/api/v1/companies/550e8400-e29b-41d4-a716-446655440000/approve \
  -H "Content-Type: application/json" \
  --cookie "accessToken=<token>"
```

### Response

#### Success Response (200 OK)

**Response Body:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "ABC Logistics Ltd",
  "country": "United States",
  "status": "approved",
  "rejectionReason": null,
  "createdAt": "2024-01-10T08:00:00Z",
  "updatedAt": "2024-01-15T12:00:00Z"
}
```

**Important Notes:**
- Company status changes from `PENDING` to `APPROVED`
- `rejectionReason` is cleared (set to `null`)
- Company owner user (if exists) is assigned `company_manager` role
- Notification is sent to company users

### Error Responses

#### 404 Not Found - Company Not Found
```json
{
  "statusCode": 404,
  "message": "Company not found",
  "error": "Not Found"
}
```

#### 400 Bad Request - Invalid Status
```json
{
  "statusCode": 400,
  "message": "Cannot approve company with status approved",
  "error": "Bad Request"
}
```

#### 403 Forbidden - Insufficient Permissions
```json
{
  "statusCode": 403,
  "message": "Only Head Office can approve companies",
  "error": "Forbidden"
}
```

#### 401 Unauthorized - Not Authenticated
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

---

## Reject Company API

### Endpoint
```
PATCH /api/v1/companies/:id/reject
```

### Description
Rejects a company, changing its status from `PENDING` to `REJECTED`. Only Head Office users can reject companies. A rejection reason must be provided.

### Request

#### Headers
```
Content-Type: application/json
```

**Authentication**: Required (via `accessToken` cookie)

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string (UUID) | Yes | Company ID |

#### Request Body

```json
{
  "rejectionReason": "string (required, max 500 chars)"
}
```

#### Field Descriptions

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `rejectionReason` | string | Yes | Reason for rejection (max 500 chars) | `"Missing required documents"` |

#### Example Request
```bash
curl -X PATCH https://api-nav.dimansoft.ir/api/v1/companies/550e8400-e29b-41d4-a716-446655440000/reject \
  -H "Content-Type: application/json" \
  --cookie "accessToken=<token>" \
  -d '{
    "rejectionReason": "Missing required documents"
  }'
```

### Response

#### Success Response (200 OK)

**Response Body:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "ABC Logistics Ltd",
  "country": "United States",
  "status": "rejected",
  "rejectionReason": "Missing required documents",
  "createdAt": "2024-01-10T08:00:00Z",
  "updatedAt": "2024-01-15T12:00:00Z"
}
```

**Important Notes:**
- Company status changes from `PENDING` to `REJECTED`
- `rejectionReason` is required and stored
- Notification is sent to company users with rejection reason

### Error Responses

#### 404 Not Found - Company Not Found
```json
{
  "statusCode": 404,
  "message": "Company not found",
  "error": "Not Found"
}
```

#### 400 Bad Request - Missing Rejection Reason
```json
{
  "statusCode": 400,
  "message": "Rejection reason is required",
  "error": "Bad Request"
}
```

#### 400 Bad Request - Invalid Status
```json
{
  "statusCode": 400,
  "message": "Cannot reject company with status approved",
  "error": "Bad Request"
}
```

#### 403 Forbidden - Insufficient Permissions
```json
{
  "statusCode": 403,
  "message": "Only Head Office can reject companies",
  "error": "Forbidden"
}
```

#### 401 Unauthorized - Not Authenticated
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

---

## Suspend Company API

### Endpoint
```
PATCH /api/v1/companies/:id/suspend
```

### Description
Suspends a company, changing its status from `APPROVED` to `SUSPENDED`. Only Head Office users can suspend companies. Suspended companies cannot operate normally.

**UI Note**: In the user interface, this action is displayed as **"Deactivate Company"** instead of "Suspend Company".

### Request

#### Headers
```
Content-Type: application/json
```

**Authentication**: Required (via `accessToken` cookie)

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string (UUID) | Yes | Company ID |

#### Example Request
```bash
curl -X PATCH https://api-nav.dimansoft.ir/api/v1/companies/550e8400-e29b-41d4-a716-446655440000/suspend \
  -H "Content-Type: application/json" \
  --cookie "accessToken=<token>"
```

### Response

#### Success Response (200 OK)

**Response Body:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "ABC Logistics Ltd",
  "country": "United States",
  "status": "suspended",
  "createdAt": "2024-01-10T08:00:00Z",
  "updatedAt": "2024-01-15T12:00:00Z"
}
```

**Important Notes:**
- Company status changes from `APPROVED` to `SUSPENDED`
- Notification is sent to company users

### Error Responses

#### 404 Not Found - Company Not Found
```json
{
  "statusCode": 404,
  "message": "Company not found",
  "error": "Not Found"
}
```

#### 400 Bad Request - Invalid Status
```json
{
  "statusCode": 400,
  "message": "Cannot suspend company with status pending",
  "error": "Bad Request"
}
```

#### 403 Forbidden - Insufficient Permissions
```json
{
  "statusCode": 403,
  "message": "Only Head Office can suspend companies",
  "error": "Forbidden"
}
```

#### 401 Unauthorized - Not Authenticated
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

---

## Unsuspend Company API

### Endpoint
```
PATCH /api/v1/companies/:id/unsuspend
```

### Description
Unsuspends a company, changing its status from `SUSPENDED` back to `APPROVED`. Only Head Office users can unsuspend companies. This reactivates a previously suspended company.

**UI Note**: In the user interface, this action is displayed as **"Activate Company"** instead of "Unsuspend Company".

### Request

#### Headers
```
Content-Type: application/json
```

**Authentication**: Required (via `accessToken` cookie)

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string (UUID) | Yes | Company ID |

#### Example Request
```bash
curl -X PATCH https://api-nav.dimansoft.ir/api/v1/companies/550e8400-e29b-41d4-a716-446655440000/unsuspend \
  -H "Content-Type: application/json" \
  --cookie "accessToken=<token>"
```

### Response

#### Success Response (200 OK)

**Response Body:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "ABC Logistics Ltd",
  "country": "United States",
  "status": "approved",
  "createdAt": "2024-01-10T08:00:00Z",
  "updatedAt": "2024-01-15T13:00:00Z"
}
```

**Important Notes:**
- Company status changes from `SUSPENDED` to `APPROVED`
- Notification is sent to company users

### Error Responses

#### 404 Not Found - Company Not Found
```json
{
  "statusCode": 404,
  "message": "Company not found",
  "error": "Not Found"
}
```

#### 400 Bad Request - Invalid Status
```json
{
  "statusCode": 400,
  "message": "Cannot unsuspend company with status approved",
  "error": "Bad Request"
}
```

#### 403 Forbidden - Insufficient Permissions
```json
{
  "statusCode": 403,
  "message": "Only Head Office can unsuspend companies",
  "error": "Forbidden"
}
```

#### 401 Unauthorized - Not Authenticated
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

---

## Delete Company API

### Endpoint
```
DELETE /api/v1/companies/:id
```

### Description
Deletes a company (soft delete). Only Head Office users with `companies:delete` permission can delete companies.

### Request

#### Headers
```
Content-Type: application/json
```

**Authentication**: Required (via `accessToken` cookie)

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string (UUID) | Yes | Company ID |

#### Example Request
```bash
curl -X DELETE https://api-nav.dimansoft.ir/api/v1/companies/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  --cookie "accessToken=<token>"
```

### Response

#### Success Response (200 OK)

**Response Body:**
```json
{
  "message": "Company deleted successfully"
}
```

**Important Notes:**
- Company is soft deleted (not permanently removed)
- Deleted companies are not returned in list queries

### Error Responses

#### 404 Not Found - Company Not Found
```json
{
  "statusCode": 404,
  "message": "Company not found",
  "error": "Not Found"
}
```

#### 403 Forbidden - Insufficient Permissions
```json
{
  "statusCode": 403,
  "message": "Insufficient permissions",
  "error": "Forbidden"
}
```

#### 401 Unauthorized - Not Authenticated
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

---

## Company Documents API

### Upload Company Document

#### Endpoint
```
POST /api/v1/company-documents
```

#### Description
Uploads a document for a company. Head Office users can upload documents for any company.

#### Request

**Headers:**
```
Content-Type: multipart/form-data
```

**Authentication**: Required (via `accessToken` cookie)

**Request Body (Multipart Form Data):**

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `companyId` | string (UUID) | Yes | Company ID | `"550e8400-e29b-41d4-a716-446655440000"` |
| `documentType` | enum | Yes | Document type | `"license"` |
| `file` | file | Yes | File to upload | File upload |

**Document Types:**
- `license` - Company license
- `insurance` - Insurance document
- `manager_id` - Manager ID document
- `primary_contact_id` - Primary contact ID document
- `other` - Other document

**File Upload Requirements:**

| Field | Required | Accepted Types | Max Size |
|-------|----------|---------------|----------|
| `file` | Yes | JPEG, PNG, JPG, PDF, DOC, DOCX | 10MB |

#### Example Request (JavaScript FormData)
```javascript
const formData = new FormData();
formData.append('companyId', '550e8400-e29b-41d4-a716-446655440000');
formData.append('documentType', 'license');
formData.append('file', fileInput.files[0]); // File object

fetch('https://api-nav.dimansoft.ir/api/v1/company-documents', {
  method: 'POST',
  headers: {
    // Don't set Content-Type header - browser will set it with boundary
  },
  credentials: 'include',
  body: formData
});
```

#### Response (201 Created)
```json
{
  "id": "880e8400-e29b-41d4-a716-446655440003",
  "companyId": "550e8400-e29b-41d4-a716-446655440000",
  "documentType": "license",
  "filePath": "uploads/companies/550e8400-e29b-41d4-a716-446655440000/license.pdf",
  "status": "pending",
  "rejectionReason": null,
  "uploadedBy": "660e8400-e29b-41d4-a716-446655440001",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

### List Company Documents

#### Endpoint
```
GET /api/v1/company-documents/company/:companyId
```

#### Description
Retrieves all documents for a specific company.

#### Request

**Headers:**
```
Content-Type: application/json
```

**Authentication**: Required (via `accessToken` cookie)

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `companyId` | string (UUID) | Yes | Company ID |

#### Example Request
```bash
curl -X GET https://api-nav.dimansoft.ir/api/v1/company-documents/company/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  --cookie "accessToken=<token>"
```

#### Response (200 OK)
```json
[
  {
    "id": "880e8400-e29b-41d4-a716-446655440003",
    "companyId": "550e8400-e29b-41d4-a716-446655440000",
    "documentType": "license",
    "filePath": "uploads/companies/550e8400-e29b-41d4-a716-446655440000/license.pdf",
    "status": "approved",
    "rejectionReason": null,
    "uploadedBy": "660e8400-e29b-41d4-a716-446655440001",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-16T09:00:00Z"
  },
  {
    "id": "990e8400-e29b-41d4-a716-446655440004",
    "companyId": "550e8400-e29b-41d4-a716-446655440000",
    "documentType": "insurance",
    "filePath": "uploads/companies/550e8400-e29b-41d4-a716-446655440000/insurance.pdf",
    "status": "pending",
    "rejectionReason": null,
    "uploadedBy": "660e8400-e29b-41d4-a716-446655440001",
    "createdAt": "2024-01-15T11:00:00Z",
    "updatedAt": "2024-01-15T11:00:00Z"
  }
]
```

### Approve Company Document

#### Endpoint
```
PUT /api/v1/company-documents/:id/approve
```

#### Description
Approves a company document, changing its status from `PENDING` to `APPROVED`. Only Head Office users can approve documents.

#### Request

**Headers:**
```
Content-Type: application/json
```

**Authentication**: Required (via `accessToken` cookie)

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string (UUID) | Yes | Document ID |

#### Example Request
```bash
curl -X PUT https://api-nav.dimansoft.ir/api/v1/company-documents/880e8400-e29b-41d4-a716-446655440003/approve \
  -H "Content-Type: application/json" \
  --cookie "accessToken=<token>"
```

#### Response (200 OK)
```json
{
  "id": "880e8400-e29b-41d4-a716-446655440003",
  "companyId": "550e8400-e29b-41d4-a716-446655440000",
  "documentType": "license",
  "filePath": "uploads/companies/550e8400-e29b-41d4-a716-446655440000/license.pdf",
  "status": "approved",
  "rejectionReason": null,
  "uploadedBy": "660e8400-e29b-41d4-a716-446655440001",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-16T09:00:00Z"
}
```

### Reject Company Document

#### Endpoint
```
PUT /api/v1/company-documents/:id/reject
```

#### Description
Rejects a company document, changing its status from `PENDING` to `REJECTED`. Only Head Office users can reject documents. A rejection reason must be provided.

#### Request

**Headers:**
```
Content-Type: application/json
```

**Authentication**: Required (via `accessToken` cookie)

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string (UUID) | Yes | Document ID |

**Request Body:**

```json
{
  "rejectionReason": "string (required, max 500 chars)"
}
```

#### Example Request
```bash
curl -X PUT https://api-nav.dimansoft.ir/api/v1/company-documents/880e8400-e29b-41d4-a716-446655440003/reject \
  -H "Content-Type: application/json" \
  --cookie "accessToken=<token>" \
  -d '{
    "rejectionReason": "Document is not clear"
  }'
```

#### Response (200 OK)
```json
{
  "id": "880e8400-e29b-41d4-a716-446655440003",
  "companyId": "550e8400-e29b-41d4-a716-446655440000",
  "documentType": "license",
  "filePath": "uploads/companies/550e8400-e29b-41d4-a716-446655440000/license.pdf",
  "status": "rejected",
  "rejectionReason": "Document is not clear",
  "uploadedBy": "660e8400-e29b-41d4-a716-446655440001",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-16T10:00:00Z"
}
```

---

## Error Handling

### Standard Error Response Format

All error responses follow this structure:

```json
{
  "statusCode": 400,
  "message": "Error message or array of validation errors",
  "error": "Error Type"
}
```

### HTTP Status Codes

| Status Code | Meaning | When It Occurs |
|------------|---------|----------------|
| `200` | Success | Update/delete successful |
| `201` | Created | Company/document created successfully |
| `400` | Bad Request | Invalid request format or validation errors |
| `401` | Unauthorized | Missing/invalid token or expired token |
| `403` | Forbidden | Valid token but insufficient permissions or access denied |
| `404` | Not Found | Company/document not found |
| `500` | Internal Server Error | Server-side errors |

### Common Error Scenarios

#### Insufficient Permissions
```json
{
  "statusCode": 403,
  "message": "Insufficient permissions",
  "error": "Forbidden"
}
```
**Client Action**: Show error message, verify user has required permissions

#### Access Denied (Country Restriction)
```json
{
  "statusCode": 403,
  "message": "You do not have access to this company",
  "error": "Forbidden"
}
```
**Client Action**: Show error message, verify company belongs to user's allowed country

#### Validation Errors
```json
{
  "statusCode": 400,
  "message": [
    "name must be longer than or equal to 1 characters",
    "email must be an email"
  ],
  "error": "Bad Request"
}
```
**Client Action**: Display field-specific error messages

#### Company Not Found
```json
{
  "statusCode": 404,
  "message": "Company not found",
  "error": "Not Found"
}
```
**Client Action**: Show error message, redirect to company list

#### Token Expired
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```
**Client Action**: Redirect to login page, clear client-side state

---

## Implementation Guide

### React Implementation Overview

#### 1. List Companies

When implementing the company list:

- Send a GET request to `/api/v1/companies` with optional query parameters
- Always include `credentials: 'include'` in your fetch configuration
- Handle pagination using `skip` and `take` parameters
- Filter by status, country, or registration ID
- Display companies in a table or card layout
- Show company status badges (pending, approved, rejected, suspended)
- Display internal notes (Head Office only)

#### 2. Get Company Details

When implementing company details view:

- Send a GET request to `/api/v1/companies/:id` for basic details
- Send a GET request to `/api/v1/companies/:id/details` for details with statistics
- Always include `credentials: 'include'` in your fetch configuration
- Display all company information including internal notes
- Show company status and statistics (total drivers, total segments)
- Display documents list with status indicators

#### 3. Update Company

When implementing company update:

- Send a PUT request to `/api/v1/companies/:id` with JSON body
- Only include fields that need to be updated
- Always include `credentials: 'include'` in your fetch configuration
- Show success message after update
- Refresh company details or redirect to company list

#### 4. Approve/Reject/Activate/Deactivate Company

When implementing company status management:

- **Approve**: Use `PATCH /api/v1/companies/:id/approve` (no body)
- **Reject**: Use `PATCH /api/v1/companies/:id/reject` with `rejectionReason` in body
- **Deactivate (Suspend)**: Use `PATCH /api/v1/companies/:id/suspend` (no body)
- **Activate (Unsuspend)**: Use `PATCH /api/v1/companies/:id/unsuspend` (no body)
- Show confirmation dialog before status changes
- Display rejection reason input field for reject action
- Refresh company details after status change
- Show success/error messages
- **UI Naming**: Display "Deactivate" instead of "Suspend" and "Activate" instead of "Unsuspend" in the user interface

#### 5. Delete Company

When implementing company deletion:

- Send a DELETE request to `/api/v1/companies/:id`
- Show confirmation dialog before deletion
- Redirect to company list after successful deletion
- Handle errors gracefully

#### 6. Company Documents

When implementing document management:

- **Upload**: Use `POST /api/v1/company-documents` with multipart/form-data
- **List**: Use `GET /api/v1/company-documents/company/:companyId`
- **Approve**: Use `PUT /api/v1/company-documents/:id/approve` (no body)
- **Reject**: Use `PUT /api/v1/company-documents/:id/reject` with `rejectionReason` in body
- Display document status badges (pending, approved, rejected)
- Show rejection reason if document is rejected
- Allow file download via file path

### Key Implementation Points

1. **Always Include Credentials**:
   - Set `credentials: 'include'` in fetch requests (or `withCredentials: true` in Axios)
   - This is required for HTTP-only cookies to be sent with requests

2. **Handle 401 Responses**:
   - Check for `401` status on all API requests
   - Redirect to login page when `401` is received
   - Clear any client-side user state

3. **Handle 403 Responses**:
   - Check for `403` status (insufficient permissions or access denied)
   - Show appropriate error messages
   - Hide UI elements that require permissions the user doesn't have

4. **File Uploads**:
   - Use `FormData` for multipart/form-data requests
   - Don't set `Content-Type` header manually (browser sets it with boundary)
   - Include `credentials: 'include'` for file uploads
   - Validate file types and sizes client-side before upload

5. **Error Handling**:
   - Display user-friendly error messages
   - Handle network errors gracefully
   - Show loading states during requests
   - Validate forms client-side before submission

6. **Access Control**:
   - Head Office users can manage all companies (subject to country restrictions)
   - Show appropriate UI based on user permissions
   - Display internal notes only for Head Office users

### Fetch Configuration

For all API requests using Fetch API:
- Set `credentials: 'include'` to allow cookies
- Set appropriate `Content-Type` header (except for multipart/form-data)
- Use the base URL: `https://api-nav.dimansoft.ir/api/v1`

**Example:**
```javascript
fetch('https://api-nav.dimansoft.ir/api/v1/companies', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',
});
```

### Axios Configuration

If using Axios:
- Set `baseURL` to `https://api-nav.dimansoft.ir/api/v1`
- Set `withCredentials: true` to allow cookies
- Set appropriate `Content-Type` header
- Add a response interceptor to handle `401` and `403` status codes

**Example:**
```javascript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://api-nav.dimansoft.ir/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      // Show permission error
      console.error('Insufficient permissions');
    }
    return Promise.reject(error);
  }
);
```

---

## Enums and Constants

### COMPANY_STATUS Enum

```typescript
enum COMPANY_STATUS {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SUSPENDED = 'suspended',
}
```

**Status Meanings:**
- `pending`: Company registration submitted, awaiting Head Office approval
- `approved`: Company approved by Head Office, can operate normally
- `rejected`: Company registration was rejected (includes rejection reason)
- `suspended`: Company temporarily suspended (can be reactivated)

### VEHICLE_TYPE Enum

```typescript
enum VEHICLE_TYPE {
  TENTED = 'tented',
  REFRIGERATED = 'refrigerated',
  FLATBED = 'flatbed',
  DOUBLE_WALL = 'double_wall',
}
```

**Usage**: Vehicle types that the company operates.

### COMPANY_DOCUMENT_TYPE Enum

```typescript
enum COMPANY_DOCUMENT_TYPE {
  LICENSE = 'license',
  INSURANCE = 'insurance',
  MANAGER_ID = 'manager_id',
  PRIMARY_CONTACT_ID = 'primary_contact_id',
  OTHER = 'other',
}
```

**Usage**: Document type when uploading company documents.

### COMPANY_DOCUMENT_STATUS Enum

```typescript
enum COMPANY_DOCUMENT_STATUS {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}
```

**Usage**: Document approval status.

### LANGUAGE Enum

```typescript
enum LANGUAGE {
  EN = 'en',
  FA = 'fa',
  // Add other languages as needed
}
```

**Usage**: Preferred language for company localization.

---

## Data Transfer Objects (DTOs)

### CompanyReadDto

Full company information returned from all company endpoints.

```typescript
{
  id: string;                        // UUID
  name: string;                       // Company name
  country: string;                    // Country of operation
  address?: string;                   // Company address
  email: string;                      // Business contact email
  phone: string;                      // Official phone number
  status: COMPANY_STATUS;             // Company status enum
  rejectionReason?: string;           // Reason for rejection (if rejected)
  registrationId?: string;            // Internal registration identifier
  website?: string;                   // Company website URL
  driverCapacityCount: number;        // Driver capacity count
  vehicleTypes?: VEHICLE_TYPE[];      // Vehicle types array
  primaryContactFullName: string;     // Primary contact full name
  primaryContactEmail: string;        // Primary contact email
  primaryContactPhoneNumber: string;  // Primary contact phone number
  preferredLanguage?: LANGUAGE;       // Preferred language
  logoUrl?: string;                   // Company logo file path
  internalNote?: string;              // Internal note (Head Office only)
  totalDrivers?: number;              // Count of drivers (if details endpoint)
  totalSegments?: number;            // Count of segments (if details endpoint)
  createdAt: Date;                    // Company creation datetime
  updatedAt: Date;                    // Company last update datetime
}
```

### UpdateCompanyDto

All fields are optional. Only include fields that need to be updated.

**Updatable Fields:**
- `name`: string (1-200 chars)
- `country`: string (1-100 chars)
- `address`: string (max 500 chars)
- `email`: string (valid email)
- `phone`: string (1-50 chars)
- `registrationId`: string (max 100 chars, unique)
- `website`: string (max 500 chars)
- `driverCapacityCount`: number
- `vehicleTypes`: VEHICLE_TYPE[] array
- `primaryContactFullName`: string (1-200 chars)
- `primaryContactEmail`: string (valid email)
- `primaryContactPhoneNumber`: string (1-50 chars)
- `preferredLanguage`: LANGUAGE enum
- `internalNote`: string (max 2000 chars, Head Office only)

### CompanyStatusUpdateDto

**Required Fields:**
- `rejectionReason`: string (required if rejecting, max 500 chars)

**Usage**: Used for rejecting companies. For approving/suspending, no body is required.

### CompanyDocumentReadDto

```typescript
{
  id: string;                        // UUID
  companyId: string;                 // UUID - Company ID
  documentType: COMPANY_DOCUMENT_TYPE; // Document type enum
  filePath: string;                  // Relative path to file
  status: COMPANY_DOCUMENT_STATUS;   // Document status enum
  rejectionReason?: string;         // Reason for rejection (if rejected)
  uploadedBy: string;                // UUID - User who uploaded
  createdAt: Date;                   // Document creation datetime
  updatedAt: Date;                  // Document last update datetime
}
```

### UploadCompanyDocumentDto

**Required Fields:**
- `companyId`: string (UUID)
- `documentType`: COMPANY_DOCUMENT_TYPE enum
- `file`: File

### UpdateCompanyDocumentDto

**Required Fields:**
- `rejectionReason`: string (required if rejecting, max 500 chars)

**Usage**: Used for rejecting documents. For approving, no body is required.

### CompanyFilterDto

**Optional Query Parameters:**
- `status`: COMPANY_STATUS enum
- `country`: string
- `registrationId`: string
- `skip`: number (default 0, for pagination)
- `take`: number (default 10, for pagination)

---

## Security Best Practices

### Client-Side

1. **Never Store Tokens**:
   - Don't store tokens in localStorage, sessionStorage, or state
   - Let cookies handle token storage automatically

2. **HTTPS Only**:
   - Always use HTTPS in production
   - Cookies with `Secure` flag require HTTPS

3. **Handle Errors Securely**:
   - Don't expose sensitive error details to users
   - Log errors server-side, show generic messages to users

4. **Input Validation**:
   - Validate inputs client-side before sending
   - Don't trust client-side validation alone (server validates too)

5. **File Upload Security**:
   - Validate file types client-side before upload
   - Check file sizes before upload
   - Display file size limits to users

6. **Access Control**:
   - Hide UI elements that require permissions the user doesn't have
   - Verify permissions before making API calls
   - Show appropriate error messages for access denied scenarios

---

## Troubleshooting

### Companies Not Showing Up

**Symptoms**: Company list is empty or missing expected companies

**Solutions**:
1. Verify user has `companies:read` permission
2. Check if user has country restrictions (will only see companies in allowed country)
3. Verify query parameters (status, country filters)
4. Check pagination parameters (`skip` and `take`)

### Cannot Approve/Reject Company

**Symptoms**: Status change fails with 403 or 400 error

**Solutions**:
1. Verify user has `companies:manage` permission
2. Check if user is Head Office
3. Verify company status is `PENDING` (for approve/reject)
4. Verify company status is `APPROVED` (for suspend)
5. Check if rejection reason is provided (for reject)

### File Upload Fails

**Symptoms**: Document upload returns 400 error

**Solutions**:
1. Verify file size is under 10MB
2. Check file type is allowed (PDF, DOC, DOCX, JPEG, PNG, JPG)
3. Ensure `Content-Type` header is NOT manually set (let browser set it)
4. Verify file field name matches API requirements (`file`)
5. Check file is actually included in FormData
6. Verify `companyId` is provided and valid

---

## Summary

### Quick Reference

**Available to Head Office:**

| Endpoint | Method | Auth Required | Description |
|----------|--------|---------------|-------------|
| `/api/v1/companies` | GET | Yes | List companies (with filters) |
| `/api/v1/companies/:id` | GET | Yes | Get company details |
| `/api/v1/companies/:id/details` | GET | Yes | Get company details with statistics |
| `/api/v1/companies/:id` | PUT | Yes | Update company |
| `/api/v1/companies/:id/approve` | PATCH | Yes | Approve company |
| `/api/v1/companies/:id/reject` | PATCH | Yes | Reject company |
| `/api/v1/companies/:id/suspend` | PATCH | Yes | Suspend company (UI: "Deactivate") |
| `/api/v1/companies/:id/unsuspend` | PATCH | Yes | Unsuspend company (UI: "Activate") |
| `/api/v1/companies/:id` | DELETE | Yes | Delete company |
| `/api/v1/company-documents` | POST | Yes | Upload company document |
| `/api/v1/company-documents/company/:companyId` | GET | Yes | List company documents |
| `/api/v1/company-documents/:id/approve` | PUT | Yes | Approve document |
| `/api/v1/company-documents/:id/reject` | PUT | Yes | Reject document |

### Key Takeaways

1. **Cookies are automatic**: Tokens are stored in HTTP-only cookies, no manual handling needed
2. **Include credentials**: Always set `credentials: 'include'` in fetch requests
3. **Handle 401/403**: Redirect to login on 401, show error on 403
4. **Access control**: Head Office users can manage all companies (subject to country restrictions)
5. **Permissions**: Verify user has required permissions before making API calls
6. **File uploads**: Use FormData, don't set Content-Type manually, include credentials
7. **Status management**: Head Office can approve/reject/activate/deactivate companies and documents
8. **UI naming**: Display "Deactivate" instead of "Suspend" and "Activate" instead of "Unsuspend" in the user interface
9. **Internal notes**: Only visible to Head Office users
10. **Statistics**: Use `/details` endpoint to get company statistics (totalDrivers, totalSegments)
11. **Rejection reasons**: Required when rejecting companies or documents

---

**Last Updated**: 2024  
**API Version**: v1  
**Base URL**: https://api-nav.dimansoft.ir/

