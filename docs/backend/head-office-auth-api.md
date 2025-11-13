# Authentication API Documentation - Head Office Client

This document provides comprehensive API documentation for implementing the authentication system (login and logout) in the Head Office React client application.

## Table of Contents

1. [Base Configuration](#base-configuration)
2. [Authentication Overview](#authentication-overview)
3. [Login API](#login-api)
4. [Logout API](#logout-api)
5. [Token Management](#token-management)
6. [Error Handling](#error-handling)
7. [Implementation Guide](#implementation-guide)

---

## Base Configuration

### Base URL
```
https://api-nav.dimansoft.ir/
```

### API Version
All authentication endpoints use version `v1`:
```
https://api-nav.dimansoft.ir/api/v1/auth/*
```

### Content-Type
All requests must use:
```
Content-Type: application/json
```

### CORS Configuration
- **Credentials**: Enabled (required for HTTP-only cookies)
- **Allowed Origins**: Must be configured on the backend to allow your frontend domain
- **Important**: When using HTTP-only cookies, CORS must allow credentials. The `Access-Control-Allow-Origin` header must specify the exact frontend origin (cannot use `*`)

---

## Authentication Overview

### Authentication Method
The API uses **HTTP-only cookies** for authentication. This provides enhanced security compared to storing tokens in localStorage or sessionStorage.

### How It Works

1. **Login Flow**:
   - Client sends credentials to `/api/v1/auth/login`
   - Server validates credentials
   - Server sets two HTTP-only cookies:
     - `accessToken`: Short-lived token (4 hours)
     - `refreshToken`: Long-lived token (configurable, typically 7-30 days)
   - Server returns user verification status
   - Browser automatically includes cookies in subsequent requests

2. **Authenticated Requests**:
   - Browser automatically sends cookies with every request
   - Server validates the `accessToken` cookie
   - If access token expires, server automatically refreshes it using the `refreshToken` cookie (handled by interceptor)
   - Client doesn't need to manually handle token refresh

3. **Logout Flow**:
   - Client sends POST request to `/api/v1/auth/logout`
   - Server invalidates the token in the database
   - Server clears both cookies
   - Client redirects to login page

### Security Features

- **HTTP-only Cookies**: Tokens are not accessible via JavaScript, preventing XSS attacks
- **Secure Flag**: Cookies are marked as `Secure` in production (HTTPS only)
- **SameSite**: Set to `Lax` to prevent CSRF attacks while allowing normal navigation
- **Automatic Token Refresh**: Expired access tokens are automatically refreshed using refresh tokens
- **Token Invalidation**: Logout invalidates tokens server-side

### Cookie Details

| Cookie Name | Purpose | Expiration | HttpOnly | Secure | SameSite |
|------------|---------|------------|----------|--------|----------|
| `accessToken` | Authenticates API requests | 4 hours | Yes | Yes (production) | Lax |
| `refreshToken` | Refreshes expired access tokens | 7-30 days (configurable) | Yes | Yes (production) | Lax |

---

## Login API

### Endpoint
```
POST /api/v1/auth/login
```

### Description
Authenticates a user with email/phone and password. Sets authentication cookies upon successful login.

### Request

#### Headers
```
Content-Type: application/json
```

#### Request Body
```json
{
  "emailOrPhone": "string",
  "password": "string",
  "appScope": "head_office"
}
```

#### Field Descriptions

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `emailOrPhone` | string | Yes | User's email address or phone number | `"user@example.com"` or `"+1234567890"` |
| `password` | string | Yes | User's password | `"SecurePassword123!"` |
| `appScope` | enum | Yes | Application scope - must be `"head_office"` for head office client | `"head_office"` |

#### Example Request
```bash
curl -X POST https://api-nav.dimansoft.ir/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "emailOrPhone": "admin@example.com",
    "password": "SecurePassword123!",
    "appScope": "head_office"
  }'
```

### Response

#### Success Response (200 OK)

**Response Body:**
```json
{
  "isEmailVerified": true,
  "isPhoneNumberVerified": false
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `isEmailVerified` | boolean | Whether the user's email is verified |
| `isPhoneNumberVerified` | boolean | Whether the user's phone number is verified |

**Response Headers:**
```
Set-Cookie: accessToken=<jwt_token>; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=14400
Set-Cookie: refreshToken=<jwt_token>; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=604800
```

**Note**: The actual token values are not returned in the response body. They are set as HTTP-only cookies and automatically included in subsequent requests.

#### Response Scenarios

**Successful Login**:
```json
{
  "isEmailVerified": true,
  "isPhoneNumberVerified": false
}
```
- User can access the application
- Both `accessToken` and `refreshToken` cookies are set

### Error Responses

#### 401 Unauthorized - Invalid Credentials
```json
{
  "statusCode": 401,
  "message": "Wrong credentials!",
  "error": "Unauthorized"
}
```

**Possible Causes:**
- Invalid email/phone number
- Incorrect password
- User doesn't exist in the `head_office` app scope

#### 400 Bad Request - Validation Error
```json
{
  "statusCode": 400,
  "message": [
    "emailOrPhone must be a string",
    "password must be a string",
    "appScope must be one of the following values: head_office, local_company, driver"
  ],
  "error": "Bad Request"
}
```

**Possible Causes:**
- Missing required fields
- Invalid field types
- Invalid `appScope` value

#### 422 Unprocessable Entity - Invalid App Scope
```json
{
  "statusCode": 422,
  "message": "User not found in this app scope",
  "error": "Unprocessable Entity"
}
```

### Implementation Notes

1. **Cookie Handling**: 
   - Cookies are automatically handled by the browser
   - No need to manually store or retrieve tokens
   - Cookies are sent automatically with every request

2. **Error Handling**:
   - Display user-friendly error messages
   - Handle network errors gracefully
   - Show loading state during login request

---

## Logout API

### Endpoint
```
POST /api/v1/auth/logout
```

### Description
Logs out the current user by invalidating the access token and clearing authentication cookies.

### Request

#### Headers
```
Content-Type: application/json
```

**Authentication**: Required (via `accessToken` cookie)

#### Request Body
No request body required.

#### Example Request
```bash
curl -X POST https://api-nav.dimansoft.ir/api/v1/auth/logout \
  -H "Content-Type: application/json" \
  --cookie "accessToken=<token>"
```

### Response

#### Success Response (200 OK)

**Response Body:**
```json
{}
```

**Response Headers:**
```
Set-Cookie: accessToken=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0
Set-Cookie: refreshToken=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0
```

The server clears both cookies by setting them to empty values with `Max-Age=0`.

### Error Responses

#### 401 Unauthorized - Not Authenticated
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

**Possible Causes:**
- Missing or invalid `accessToken` cookie
- Token has been expired or invalidated
- User is not authenticated

### Implementation Notes

1. **Cookie Clearing**:
   - Server automatically clears cookies
   - Client doesn't need to manually clear cookies
   - After logout, redirect user to login page

2. **Token Invalidation**:
   - Server invalidates the token in the database
   - Token cannot be reused after logout
   - All subsequent requests with the old token will fail

3. **Error Handling**:
   - If logout fails (e.g., network error), still redirect to login page
   - Clear any client-side state (e.g., user data in memory/state)
   - Show loading state during logout request

---

## Token Management

### Automatic Token Refresh

The backend includes an automatic token refresh interceptor that handles expired access tokens:

1. **How It Works**:
   - When an API request is made with an expired `accessToken`
   - Server detects expiration and validates the `refreshToken`
   - Server generates new `accessToken` and `refreshToken`
   - Server sets new cookies automatically
   - Original request proceeds with new token

2. **Client Implementation**:
   - **No action required** - handled automatically by the backend
   - Client doesn't need to detect token expiration
   - Client doesn't need to call a refresh endpoint
   - Requests continue to work seamlessly

3. **Refresh Token Expiration**:
   - If `refreshToken` is expired or invalid, user must login again
   - Server will return `401 Unauthorized` for all requests
   - Client should redirect to login page

### Token Validation

- Tokens are validated on every authenticated request
- Invalid or expired tokens result in `401 Unauthorized` responses
- Client should handle `401` responses by redirecting to login

### Multiple Sessions

- Each login creates a new session with unique tokens
- Logging out invalidates only the current session's token
- User can be logged in from multiple devices/browsers simultaneously
- Each session has independent token expiration

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
| `200` | Success | Login/logout successful |
| `400` | Bad Request | Invalid request format or validation errors |
| `401` | Unauthorized | Invalid credentials, missing/invalid token, or expired token |
| `403` | Forbidden | Valid token but insufficient permissions |
| `422` | Unprocessable Entity | Business logic validation errors |
| `500` | Internal Server Error | Server-side errors |

### Common Error Scenarios

#### Invalid Credentials
```json
{
  "statusCode": 401,
  "message": "Wrong credentials!",
  "error": "Unauthorized"
}
```
**Client Action**: Show error message, allow user to retry

#### Token Expired (Refresh Failed)
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```
**Client Action**: Redirect to login page, clear any client-side state

#### Network Error
**Client Action**: 
- Show network error message
- Allow user to retry
- Consider implementing retry logic with exponential backoff

#### Validation Errors
```json
{
  "statusCode": 400,
  "message": [
    "emailOrPhone must be a string",
    "password must be a string"
  ],
  "error": "Bad Request"
}
```
**Client Action**: Display field-specific error messages

---

## Implementation Guide

### React Implementation Overview

#### 1. Login Flow

When implementing the login functionality:

- Send a POST request to `/api/v1/auth/login` with `emailOrPhone`, `password`, and `appScope: "head_office"`
- Always include `credentials: 'include'` in your fetch configuration to allow cookies
- Upon successful login, proceed to dashboard
- Handle errors gracefully and display user-friendly messages

#### 2. Logout Flow

When implementing the logout functionality:

- Send a POST request to `/api/v1/auth/logout` with authentication cookies
- Always include `credentials: 'include'` in your fetch configuration
- Server will automatically clear cookies, so redirect to login page after logout
- Even if logout request fails (e.g., network error), still redirect to login page
- Clear any client-side user state (user data in memory/state)

#### 3. Authenticated API Requests

For all authenticated API requests:

- Always include `credentials: 'include'` in your fetch configuration
- Set `Content-Type: application/json` header
- Check for `401 Unauthorized` status code on all responses
- When `401` is received, redirect user to login page and clear client-side state
- The backend automatically handles token refresh, so no manual refresh logic is needed

### Key Implementation Points

1. **Always Include Credentials**:
   - Set `credentials: 'include'` in fetch requests (or `withCredentials: true` in Axios)
   - This is required for HTTP-only cookies to be sent with requests

2. **Handle 401 Responses**:
   - Check for `401` status on all API requests
   - Redirect to login page when `401` is received
   - Clear any client-side user state

3. **Error Handling**:
   - Display user-friendly error messages
   - Handle network errors gracefully
   - Show loading states during requests

4. **State Management**:
   - Don't store tokens in state/localStorage (handled by cookies)
   - Store user information after successful login
   - Clear user state on logout

### Fetch Configuration

For all API requests using Fetch API:
- Set `credentials: 'include'` to allow cookies
- Set `Content-Type: application/json` header
- Use the base URL: `https://api-nav.dimansoft.ir/api/v1`

### Axios Configuration

If using Axios:
- Set `baseURL` to `https://api-nav.dimansoft.ir/api/v1`
- Set `withCredentials: true` to allow cookies
- Set `Content-Type: application/json` header
- Add a response interceptor to handle `401` status codes and redirect to login

### Testing Authentication

#### Test Login
```bash
curl -X POST https://api-nav.dimansoft.ir/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "emailOrPhone": "test@example.com",
    "password": "password123",
    "appScope": "head_office"
  }' \
  -c cookies.txt \
  -v
```

#### Test Authenticated Request
```bash
curl -X GET https://api-nav.dimansoft.ir/api/v1/some-endpoint \
  -b cookies.txt \
  -v
```

#### Test Logout
```bash
curl -X POST https://api-nav.dimansoft.ir/api/v1/auth/logout \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -v
```

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

4. **CSRF Protection**:
   - Backend uses `SameSite=Lax` cookies for CSRF protection
   - Consider implementing CSRF tokens for additional protection

5. **Input Validation**:
   - Validate inputs client-side before sending
   - Don't trust client-side validation alone (server validates too)

### Server-Side (Already Implemented)

- HTTP-only cookies prevent XSS token theft
- Secure flag ensures HTTPS-only transmission
- SameSite=Lax prevents CSRF attacks
- Token expiration limits exposure window
- Token invalidation on logout prevents reuse

---

## Troubleshooting

### Cookies Not Being Sent

**Symptoms**: Requests return `401 Unauthorized` even after login

**Solutions**:
1. Ensure `credentials: 'include'` is set in fetch requests
2. Ensure `withCredentials: true` is set in Axios
3. Check CORS configuration allows credentials
4. Verify frontend domain is in allowed origins
5. Check browser console for CORS errors

### Login Succeeds But Subsequent Requests Fail

**Symptoms**: Login returns `200 OK` but API calls return `401`

**Solutions**:
1. Verify cookies are being set (check browser DevTools → Application → Cookies)
2. Ensure cookies are being sent with requests (check Network tab)
3. Check cookie domain/path matches API domain
4. Verify `credentials: 'include'` is set on all requests

### Token Refresh Not Working

**Symptoms**: Requests work initially but fail after 4 hours

**Solutions**:
1. Verify `refreshToken` cookie is set
2. Check `refreshToken` expiration (should be longer than `accessToken`)
3. Verify backend interceptor is working (check server logs)
4. Ensure cookies are being sent with requests

### CORS Errors

**Symptoms**: Browser console shows CORS errors

**Solutions**:
1. Verify backend CORS allows your frontend origin
2. Ensure `Access-Control-Allow-Credentials: true` is set
3. Verify `Access-Control-Allow-Origin` is not `*` (must be specific origin)
4. Check preflight OPTIONS requests are handled

---

## Additional Resources

### Related Endpoints

- **Password Reset**: `/api/v1/auth/reset-password` (for password recovery)

### API Versioning

- Current version: `v1`
- All endpoints are prefixed with `/api/v1`
- Future versions will use `/api/v2`, `/api/v3`, etc.

### Support

For API-related questions or issues:
- Check server logs for detailed error messages
- Verify request/response formats match this documentation
- Ensure backend is running latest version

---

## Summary

### Quick Reference

| Endpoint | Method | Auth Required | Description |
|----------|--------|---------------|-------------|
| `/api/v1/auth/login` | POST | No | Authenticate user and receive cookies |
| `/api/v1/auth/logout` | POST | Yes | Logout user and clear cookies |

### Key Takeaways

1. **Cookies are automatic**: Tokens are stored in HTTP-only cookies, no manual handling needed
2. **Include credentials**: Always set `credentials: 'include'` in fetch requests
3. **Handle 401**: Redirect to login when receiving `401 Unauthorized`
4. **Automatic refresh**: Token refresh is handled automatically by backend

---

**Last Updated**: 2024  
**API Version**: v1  
**Base URL**: https://api-nav.dimansoft.ir/

