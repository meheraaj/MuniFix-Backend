# Authentication API

Base Route

```text
/api/auth
```

---

## POST /api/auth/signup

Register a new user.

### Input

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "01700000000",
  "password": "password123"
}
```

### Success Response

```json
{
  "success": true,
  "message": "Registration successful. Please verify your email.",
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

---

## POST /api/auth/signin

Authenticate a user and return JWT tokens.

### Input

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Success Response

```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "role": "citizen"
    },
    "accessToken": "jwt_access_token",
    "refreshToken": "jwt_refresh_token"
  }
}
```

---

## POST /api/auth/verify-otp

Verify email using OTP.

### Input

```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

### Success Response

```json
{
  "success": true,
  "message": "Account verified successfully."
}
```

---

## POST /api/auth/refresh

Generate a new access token.

### Input

```json
{
  "refreshToken": "jwt_refresh_token"
}
```

### Success Response

```json
{
  "success": true,
  "data": {
    "accessToken": "new_access_token"
  }
}
```

---

## POST /api/auth/signout

Logout the current user.

### Input

```json
{
  "refreshToken": "jwt_refresh_token"
}
```

### Success Response

```json
{
  "success": true,
  "message": "Logged out successfully."
}
```

---

## POST /api/auth/forgot-password

Request a password reset OTP.

### Input

```json
{
  "email": "john@example.com"
}
```

### Success Response

```json
{
  "success": true,
  "message": "Password reset OTP sent successfully."
}
```
# Profile API

Base Route

```text
/api/my
```

---

## GET /api/my/profile

Get the authenticated user's profile.

### Input

None

### Success Response

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "01700000000",
    "role": "citizen",
    "department": null,
    "avatarUrl": "https://..."
  }
}
```

---

## PUT /api/my/profile

Update profile information.

### Input

```json
{
  "name": "John Doe",
  "phone": "01800000000"
}
```

### Success Response

```json
{
  "success": true,
  "message": "Profile updated successfully.",
  "data": {
    "name": "John Doe",
    "phone": "01800000000"
  }
}
```

---

## PATCH /api/my/password

Change account password.

### Input

```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword123"
}
```

### Success Response

```json
{
  "success": true,
  "message": "Password updated successfully."
}
```

---

## POST /api/my/avatar

Upload a profile picture.

### Form Data

| Field | Type |
|------|------|
| avatar | File |

### Success Response

```json
{
  "success": true,
  "message": "Avatar uploaded successfully.",
  "data": {
    "avatarUrl": "https://..."
  }
}
```

---

# Citizen API

Base Route

```text
/api/citizen
```

---

## GET /api/citizen/complain

Returns complaints submitted by the logged-in citizen.

### Query Parameters

| Field | Type |
|------|------|
| page | Number |
| limit | Number |

### Success Response

```json
{
  "success": true,
  "page": 1,
  "limit": 10,
  "total": 15,
  "data": [
    {
      "id": "uuid",
      "category": "Road Repair",
      "priority": "High",
      "status": "Pending",
      "createdAt": "2026-07-30T12:00:00Z"
    }
  ]
}
```
# Complaint Management API

Base Route

```text
/api/complain
```

---

## POST /api/complain

Create a new complaint.

### Form Data

| Field | Type |
|------|------|
| description | Text |
| latitude | Number |
| longitude | Number |
| images | File[] (Max 6) |

### Success Response

```json
{
  "success": true,
  "message": "Complaint submitted successfully.",
  "data": {
    "id": "uuid",
    "category": "Road Repair",
    "priority": "High",
    "department": "Road Maintenance",
    "status": "Pending"
  }
}
```

---

## GET /api/complain

Returns complaints based on the user's role.

### Query Parameters

| Field | Type |
|------|------|
| page | Number |
| limit | Number |
| status | String |
| category | String |

### Success Response

```json
{
  "success": true,
  "page": 1,
  "limit": 10,
  "total": 42,
  "data": [
    {
      "id": "uuid",
      "category": "Road Repair",
      "priority": "High",
      "status": "Pending"
    }
  ]
}
```

---

## GET /api/complain/search

Search complaints by keyword and filters.

### Query Parameters

| Field | Type |
|------|------|
| q | String |
| status | String |
| category | String |
| priority | String |

### Success Response

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "description": "Large pothole on road",
      "category": "Road Repair",
      "priority": "High"
    }
  ]
}
```

---

## GET /api/complain/:id

Retrieve complaint details.

### Input

None

### Success Response

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "description": "Large pothole",
    "category": "Road Repair",
    "priority": "High",
    "status": "In Progress",
    "citizen": {},
    "worker": {},
    "timeline": []
  }
}
```
---

## PATCH /api/complain/:id

Update complaint information.

### Input

```json
{
  "description": "Road damage has become worse.",
  "latitude": 22.3568,
  "longitude": 91.7832
}
```

### Success Response

```json
{
  "success": true,
  "message": "Complaint updated successfully."
}
```

---

## PATCH /api/complain/:id/category

Update the complaint category.

### Input

```json
{
  "category": "Road Repair"
}
```

### Success Response

```json
{
  "success": true,
  "message": "Complaint category updated successfully."
}
```

---

## PATCH /api/complain/:id/status

Update complaint status.

### Input

```json
{
  "status": "Resolved",
  "notes": "Road repaired successfully."
}
```

### Success Response

```json
{
  "success": true,
  "message": "Complaint status updated successfully."
}
```

---

## PATCH /api/complain/:id/assign

Assign a worker to a complaint.

### Input

```json
{
  "workerId": "uuid"
}
```

### Success Response

```json
{
  "success": true,
  "message": "Complaint assigned successfully."
}
```

---

## DELETE /api/complain/:id

Delete a complaint.

### Input

None

### Success Response

```json
{
  "success": true,
  "message": "Complaint deleted successfully."
}
```

---

## GET /api/complain/worker/tasks

Get tasks assigned to the logged-in worker.

### Query Parameters

| Field | Type |
|------|------|
| page | Number |
| limit | Number |

### Success Response

```json
{
  "success": true,
  "page": 1,
  "limit": 10,
  "total": 8,
  "data": [
    {
      "id": "uuid",
      "category": "Road Repair",
      "priority": "High",
      "status": "Assigned"
    }
  ]
}
```

---

# Other API Endpoints

These endpoints are commonly used but are documented in a simplified format.

| Method | Endpoint | Role | Input | Success Response |
|--------|----------|------|-------|------------------|
| **GET** | `/api/departments` | Authenticated Users | — | `departments[]` |
| **POST** | `/api/departments` | Super Admin | `name, description` | `department` |
| **PUT** | `/api/departments/:id` | Super Admin | `name, description` | `updated department` |
| **DELETE** | `/api/departments/:id` | Super Admin | — | `message` |
| **GET** | `/api/users` | Department Admin, Super Admin | `role, departmentId` | `users[]` |
| **PATCH** | `/api/users/:userId/status` | Super Admin | `is_active` | `message` |
| **GET** | `/api/notifications` | Authenticated Users | — | `notifications[]` |
| **PATCH** | `/api/notifications/:id/read` | Authenticated Users | — | `message` |
# Remaining Endpoints

The following endpoints are available but omitted from the detailed documentation for brevity.

| Method | Endpoint | Description | Input | Response |
|--------|----------|-------------|-------|----------|
| GET | `/api/departments` | List all departments | — | `departments[]` |
| POST | `/api/departments` | Create department | `name, description` | `department` |
| PUT | `/api/departments/:id` | Update department | `name, description` | `department` |
| DELETE | `/api/departments/:id` | Delete department | — | `message` |
| GET | `/api/admin/departments` | Department dropdown list | — | `departments[]` |
| GET | `/api/admin/workers` | Get department workers | `departmentId` | `workers[]` |
| PATCH | `/api/admin/users/:id/role` | Change user role | `role, departmentId` | `message` |
| POST | `/api/admin/departments` | Create department (Alias) | `name, description` | `department` |
| GET | `/api/users` | List users | `role, departmentId` | `users[]` |
| PATCH | `/api/users/:userId/status` | Activate/Deactivate user | `is_active` | `message` |
| GET | `/api/notifications` | Get notifications | — | `notifications[]` |
| PATCH | `/api/notifications/:id/read` | Mark notification as read | — | `message` |
| GET | `/api/logs` | Activity logs | `page, limit, filters` | `logs[]` |

---

## Standard Response Format

### Success

```json
{
  "success": true,
  "message": "Operation completed successfully.",
  "data": {}
}
```

### Error

```json
{
  "success": false,
  "message": "Something went wrong."
}
```

---

## HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Resource Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Internal Server Error |
