# MuniFix Backend

**RESTful API Server for MuniFix Ctg — Intelligent Citizen Complaint Reporting System**

This is the Node.js/Express.js backend for the MuniFix Ctg platform, designed to manage citizen complaints, route them to specific municipal departments in Chattogram City Corporation using Google Gemini AI, track worker assignments, handle real-time notification streams via Socket.io, and verify users with an OTP-based registration flow.

---

## Table of Contents
1. [Tech Stack](#tech-stack)
2. [Database Schema](#database-schema)
3. [Getting Started & Local Setup](#getting-started--local-setup)
4. [Environment Variables](#environment-variables)
5. [AI Auto-Routing & Gemini Integration](#ai-auto-routing--gemini-integration)
6. [API Endpoint Reference](#api-endpoint-reference)
    - [Authentication (`/api/auth`)](#1-authentication-apiauth)
    - [Profile Management (`/api/my`)](#2-profile-management-apimy)
    - [Complaints & AI Auto-Routing (`/api/complain`)](#3-complaints--ai-auto-routing-apicomplain)
    - [Departments (`/api/departments`)](#4-departments-apidepartments)
    - [User Directory (`/api/users`)](#5-user-directory-apiusers)
    - [Activity & Audit Logs (`/api/logs`)](#6-activity--audit-logs-apilogs)
    - [Notifications (`/api/notifications`)](#7-notifications-apinotifications)
    - [Traffic & Roadblock AI Detours (`/api/traffic`)](#8-traffic--roadblock-ai-detours-apitraffic)
7. [Real-time Events (Socket.io)](#real-time-events-socketio)

---

## Tech Stack
- **Runtime Environment:** Node.js
- **Web Framework:** Express.js (v5.2.x)
- **Database:** PostgreSQL (Hosted on Neon serverless PostgreSQL)
- **Authentication:** JWT (JSON Web Tokens) + Bcrypt (password hashing)
- **Image Storage:** Cloudinary
- **AI Engine:** `@google/genai` (Google GenAI SDK using `gemini-2.5-flash`)
- **Real-time Engine:** Socket.io
- **Logger:** Winston (production logging) & Morgan (HTTP request logging)

---

## Database Schema
The database runs on PostgreSQL and consists of the following key tables:
- **`departments`**: Seeded municipal sectors (1: Waterlogging, 2: Road Repair, 3: Waste Management, 4: Electricity).
- **`users`**: System profiles with `user_role` enum (`citizen`, `field_worker`, `dept_admin`, `super_admin`) and `email_verified` state.
- **`complaints`**: Citizen reports containing geolocation, description, and status (`pending`, `assigned`, `in_progress`, `resolved`, `cancelled`).
- **`assignments`**: Direct, one-to-one linkage assigning a worker to a specific complaint.
- **`status_history`**: Audit trail logging every single transition of complaint states with actor tracking.
- **`notifications`**: User-specific alerts pushed when status changes or assignments occur.
- **`otp_verifications`**: Generates and validates OTP codes for email verification.
- **`activity_logs`**: System audit trail logs for administrative transparency.

---

## Getting Started & Local Setup

### Prerequisites
- Node.js installed (v18+ recommended)
- PostgreSQL database instance (or a Neon database connection string)
- Gemini API Key (obtained from Google AI Studio)
- Cloudinary account credentials

### Steps to Run Locally
1. Clone the repository and navigate to the backend directory:
   ```bash
   cd MuniFix-Backend
   ```
2. Install the required dependencies:
   ```bash
   npm install
   ```
3. Initialize the database schema and seed the initial data:
   - Run the SQL statements inside `schema.sql` on your PostgreSQL database query console. This sets up the initial tables and seeds department data and test admin/citizen accounts.
4. Create a `.env` file in the root of the backend folder using the values listed in the [Environment Variables](#environment-variables) section.
5. Start the development server:
   ```bash
   npm run dev
   ```
6. The server will launch and listen on `http://localhost:5000`.

---

## Environment Variables
Create a `.env` file in the root directory with the following keys:
```env
PORT=5000
FRONTEND_DOMAIN=http://localhost:3000
CONNECTION_STRING=your_postgresql_database_url
JWT_SECRET=your_jwt_signing_secret
JWT_REFRESH_SECRET=your_jwt_refresh_token_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
GEMINI_API_KEY=your_google_gemini_api_key
```

---

## AI Auto-Routing & Gemini Integration
When a citizen posts a complaint, the backend employs the **multimodal Gemini 2.5 Flash** model. It submits the user's text description along with any uploaded files (converted into base64 inline data) to perform:
- **Automatic Categorization:** Groups the report into Waterlogging, Road Repair, Waste Management, or Electricity.
- **Priority Detection:** Assesses safety hazards to flag critical, high, medium, or low priority.
- **Department Routing:** Assigns the exact department ID automatically.
- **Confidence Score:** Assigns an AI confidence percentage.

*If the Gemini API key is missing or fails, the controller automatically falls back to keyword-based local classification rules.*

---

## API Endpoint Reference

### 1. Authentication (`/api/auth`)
Endpoints for registering, logging in, signing out, and managing OTP status.

#### `POST /signup`
Registers a new user (defaults to `citizen` role) and triggers an email verification OTP code.
- **Request Body:**
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "phone": "017XXXXXXXX",
    "password": "SecurePassword123",
    "role": "citizen"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Account registered successfully. Please verify your email.",
    "user": { "id": "uuid", "name": "Jane Doe", "email": "jane@example.com" }
  }
  ```

#### `POST /signin`
Logs in a user. Note: Returns user token but secure routes will reject access with `401 Email not verified` if the account isn't verified.
- **Request Body:**
  ```json
  {
    "email": "jane@example.com",
    "password": "SecurePassword123"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Login successful",
    "authtoken": "JWT_TOKEN",
    "refreshToken": "REFRESH_TOKEN",
    "users": { "email": "jane@example.com", "id": "uuid" }
  }
  ```

#### `POST /verify-otp`
Validates the OTP code to mark the account as `email_verified = true` and `is_active = true`.
- **Request Body:**
  ```json
  {
    "email": "jane@example.com",
    "otp": "123456"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Email verified successfully."
  }
  ```

#### `POST /resend-otp`
Triggers a fresh verification OTP. Supports body param or Bearer Token headers.
- **Request Body (Optional if Bearer token present):**
  ```json
  {
    "email": "jane@example.com"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Verification OTP resent successfully."
  }
  ```

#### `POST /refresh`
Refreshes the access token using a valid, unrevoked refresh token.
- **Request Body:** `{ "refreshToken": "REFRESH_TOKEN" }`
- **Response (200 OK):** `{ "success": true, "authtoken": "NEW_JWT_TOKEN" }`

#### `POST /signout` (Auth Required)
Revokes the session refresh token.
- **Request Body:** `{ "refreshToken": "REFRESH_TOKEN" }`

---

### 2. Profile Management (`/api/my`)
Routes to fetch and modify the currently logged-in user's profile. All endpoints require `checkAuth` headers.

- **`GET /profile`**: Returns profile attributes (excluding password).
- **`PUT /profile`**: Modifies profile text fields (name, phone, address).
- **`PATCH /password`**: Modifies security credentials (requires `oldPassword` and `newPassword`).
- **`POST /avatar`**: Uploads a new profile image to Cloudinary (Multipart file key: `avatar`).

---

### 3. Complaints & AI Auto-Routing (`/api/complain`)
Endpoints for complaint creation, tracking, status progression, and admin overrides.

#### `POST /` (Citizen Auth Required)
Creates a new complaint. Can take up to 6 image attachments under the `images` multipart field key. Automatically runs Gemini AI classification on the uploaded text and image context.
- **Request Parameters (Multipart Form-Data):**
  - `description` (String, Required)
  - `latitude` (Decimal String)
  - `longitude` (Decimal String)
  - `images` (Files, maximum 6)
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "complaint": {
      "id": "uuid",
      "description": "Large road pothole",
      "image_url": ["url1"],
      "status": "pending",
      "category": "Road Repair",
      "priority": "medium",
      "ai_category": "Road Repair",
      "ai_confidence_score": "95.50"
    }
  }
  ```

#### `GET /` (Auth Required)
List complaints. Filters by status, category, or priority. Citizens will only see their own complaints, department admins see complaints belonging to their assigned department, and super admins see all complaints.
- **Query Parameters:** `?status=pending&category=Waterlogging&priority=high`

#### `GET /:id` (Auth Required)
Fetches a single complaint details, voting metrics, comments, and the full timeline of events.

#### `PATCH /:id` (Auth Required)
Modifies complaint details. Available to citizens only while the report is still `pending`.

#### `PATCH /:id/status` (Auth Required)
Updates the status of a complaint. Admins can update it to any status, field workers can set it to `in_progress` or `resolved` (requires uploading a progress/resolution photo via `images` multipart file).
- **Request Body:** `{ "status": "resolved", "notes": "Resolved pothole patch" }`

#### `PATCH /:id/category` (Dept/Super Admin Auth Required)
Overrides the category of the complaint, setting `ai_override = true` and changing the routing department.
- **Request Body:** `{ "category": "Waterlogging", "department_id": 1 }`

#### `POST /:id/assign` (Dept/Super Admin Auth Required)
Assigns a field worker to resolve the complaint.
- **Request Body:** `{ "worker_id": "worker-uuid", "notes": "Please inspect this location" }`

---

### 4. Departments (`/api/departments`)
Endpoints to manage administrative sectors.

- **`GET /` (Auth Required)**: Lists all departments, including active manager names, field worker counts, and active complaint statistics.
- **`POST /` (Super Admin Required)**: Creates a new department. Request body: `{ "name": "Electricity", "description": "Municipal power sector" }`
- **`PUT /:id` (Super Admin Required)**: Updates department attributes.
- **`DELETE /:id` (Super Admin Required)**: Removes a department.

---

### 5. User Directory (`/api/users`)
Endpoints to list users and manage admin permissions.

- **`GET /` (Auth Required)**: Lists all users. Filters by `role` or `department_id`.
- **`PATCH /admin/users/:userId/role` (Super Admin Required)**: Reassigns a user's role (e.g., promoting a worker to a department admin). Body: `{ "role": "dept_admin", "department_id": 3 }`
- **`PATCH /admin/users/:userId/status` (Super Admin Required)**: Actives/Deactivates a user's account. Body: `{ "is_active": false }`

---

### 6. Activity & Audit Logs (`/api/logs`)
Provides transparent logging of administrative modifications. Requires Super Admin auth.

- **`GET /`**: Lists system activity logs. Supports query filtering for `action` (e.g., `user_login`, `complaint_submitted`), `startDate`, `endDate`, and includes pagination parameters (`page`, `limit`).

---

### 7. Notifications (`/api/notifications`)
User-specific real-time alerts.

- **`GET /` (Auth Required)**: Fetches the list of recent notifications for the logged-in user.
- **`PATCH /:id/read` (Auth Required)**: Marks a specific notification as read.

---

### 8. Traffic & Roadblock AI Detours (`/api/traffic`)
Enables field workers to submit road blockages and request alternative routes.

- **`GET /roadblocks` (Auth Required)**: Returns all active road roadblocks.
- **`POST /roadblocks` (Field Worker/Admin Required)**: Submits a new roadblock. Body: `{ "title": "Main Street Pipeline repair", "description": "Road blocked", "latitude": 22.356, "longitude": 91.812 }`
- **`PATCH /roadblocks/:id/status` (Field Worker/Admin Required)**: Resolves or reactivates a roadblock. Body: `{ "is_active": false }`
- **`POST /reroute` (Auth Required)**: Requests Gemini AI detour routing. Evaluates active roadblocks relative to start and destination coordinates to return detours and natural language reasoning.
  - **Request Body:**
    ```json
    {
      "start": { "lat": 22.3569, "lng": 91.8123 },
      "destination": { "lat": 22.3689, "lng": 91.8213 }
    }
    ```

---

## Real-time Events (Socket.io)
When a client connects to the backend server via socket, they submit their authentication token. The server decodes it and registers the socket to a private room based on their `user_id` and room based on their `role` (e.g., `c59d9c2e-...` or `super_admin`).

The server emits the following real-time events:
- **`notification`**: Dispatched to a specific user's room when a status update, new comment, or worker assignment occurs.
- **`new_complaint`**: Dispatched to department admins and super admins when a citizen registers a complaint.
- **`complaint_status_changed`**: Broadcasts the new status of a complaint in real time.
