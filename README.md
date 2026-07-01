# MuniFix Backend API Documentation

## Base URL

```text
http://localhost:3000/api
```

---

# Authentication

## Register User

Create a new user account.

### Endpoint

```http
POST /auth/signup
```

### Request Body

| Field         | Type   | Required |
| ------------- | ------ | -------- |
| name          | String | ✅       |
| email         | String | ✅       |
| phone         | String | ✅       |
| password      | String | ✅       |
| department_id | UUID   | ✅       |
| role          | String | ✅       |

### Example Request

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "01712345678",
  "password": "password123",
  "department_id": "550e8400-e29b-41d4-a716-446655440000",
  "role": "citizen"
}
```

### Success Response (201)

```json
{
  "success": true,
  "message": "Account registered successfully",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "01712345678",
    "department_id": "550e8400-e29b-41d4-a716-446655440000",
    "role": "citizen"
  }
}
```

### Error Responses

**400 Bad Request**

```json
{
  "success": false,
  "message": "Name, email, Password and phone are required fields."
}
```

**409 Conflict**

```json
{
  "success": false,
  "message": "An Account with this email already exist."
}
```

---

# Login User

Authenticate an existing user.

### Endpoint

```http
POST /auth/signin
```

### Request Body

| Field    | Type   | Required |
| -------- | ------ | -------- |
| email    | String | ✅       |
| password | String | ✅       |

### Example Request

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Success Response (200)

```json
{
  "success": true,
  "message": "Login Success.",
  "users": {
    "email": "john@example.com",
    "id": "user_uuid"
  },
  "authtoken": "your_jwt_token"
}
```

### Error Responses

**400 Bad Request**

```json
{
  "success": false,
  "message": "wrong password.",
  "email": "john@example.com"
}
```

**409 Conflict**

```json
{
  "success": false,
  "message": "Account not found with this email."
}
```

---

# Authorization

For all protected routes, send the JWT in the request header.

```http
Authorization: Bearer <your_jwt_token>
```

---

# HTTP Status Codes

| Status Code | Description           |
| ----------- | --------------------- |
| 200         | OK                    |
| 201         | Created               |
| 400         | Bad Request           |
| 409         | Conflict              |
| 500         | Internal Server Error |

---

# Complains Filter (Admin Only)

Get filtered complains based on various fields. Only `super_admin` and `dept_admin` have access. `dept_admin` is restricted to see complaints only from their own department.

### Endpoint

```http
GET /complain/admin/filter
```

### Request Headers

```http
Authorization: Bearer <your_jwt_token>
```

### Query Parameters (Optional)

You can pass single or multiple values (comma-separated or multiple keys) to filter:

- `status` or `statuses`: e.g. `pending`, `pending,assigned`, or multiple `status` parameters.
- `category` or `categories`: e.g. `Waterlogging`, `Road Repair`.
- `priority` or `priorities`: e.g. `low`, `medium`, `high`, `critical`.
- `department_id` or `department_ids`: e.g. `1,2`.
- `citizen_id` or `citizen_ids`: citizen user UUID.

### Example Request

```http
GET /complain/admin/filter?status=pending,assigned&category=Waterlogging
```

### Success Response (200)

```json
{
  "success": true,
  "count": 1,
  "complains": [
    {
      "id": "complaint-uuid",
      "citizen_id": "citizen-uuid",
      "description": "Road pothole near Gate 2",
      "image_url": ["url"],
      "latitude": 22.341,
      "longitude": 91.812,
      "category": "Road Repair",
      "priority": "high",
      "status": "pending",
      "department_id": 2,
      "citizen_name": "John Doe",
      "citizen_email": "john@example.com",
      "department_name": "Road Repair"
    }
  ]
}
```

---

## Project Stack

- Node.js
- Express.js
- PostgreSQL
- JWT Authentication
- bcrypt Password Hashing
