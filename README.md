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

## Project Stack

- Node.js
- Express.js
- PostgreSQL
- JWT Authentication
- bcrypt Password Hashing
