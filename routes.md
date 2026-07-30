# API Overview

| Module | Method | Endpoint | Role | Purpose |
|--------|--------|----------|------|---------|
| Authentication | POST | `/api/auth/signup` | Public | Register a new user |
| Authentication | POST | `/api/auth/signin` | Public | Authenticate user and generate JWT tokens |
| Authentication | POST | `/api/auth/verify-otp` | Public | Verify email using OTP |
| Authentication | POST | `/api/auth/refresh` | Authenticated | Generate a new access token |
| Authentication | POST | `/api/auth/signout` | Authenticated | Logout the current user |
| Authentication | POST | `/api/auth/forgot-password` | Public | Request password reset OTP |
| Profile | GET | `/api/my/profile` | Authenticated | Get current user profile |
| Profile | PUT | `/api/my/profile` | Authenticated | Update profile information |
| Profile | PATCH | `/api/my/password` | Authenticated | Change account password |
| Profile | POST | `/api/my/avatar` | Authenticated | Upload profile picture |
| Citizen | GET | `/api/citizen/complain` | Citizen | View own complaints |
| Complaint | POST | `/api/complain` | Citizen | Create a new complaint |
| Complaint | GET | `/api/complain` | Authenticated | List complaints |
| Complaint | GET | `/api/complain/search` | Authenticated | Search complaints |
| Complaint | GET | `/api/complain/:id` | Authenticated | Get complaint details |
| Complaint | PATCH | `/api/complain/:id` | Citizen, Department Admin, Super Admin | Update complaint information |
| Complaint | PATCH | `/api/complain/:id/category` | Department Admin, Super Admin | Update complaint category |
| Complaint | PATCH | `/api/complain/:id/status` | Citizen, Worker, Department Admin, Super Admin | Update complaint status |
| Complaint | PATCH | `/api/complain/:id/assign` | Department Admin, Super Admin | Assign complaint to a worker |
| Complaint | POST | `/api/complain/:id/assign` | Department Admin, Super Admin | Assign complaint (alternative endpoint) |
| Complaint | DELETE | `/api/complain/:id` | Department Admin, Super Admin | Delete a complaint |
| Worker | GET | `/api/complain/worker/tasks` | Worker | View assigned tasks |
| Department | GET | `/api/departments` | Authenticated Users | List all departments |
| Department | POST | `/api/departments` | Super Admin | Create a department |
| Department | PUT | `/api/departments/:id` | Super Admin | Update department information |
| Department | DELETE | `/api/departments/:id` | Super Admin | Delete a department |
| Admin | GET | `/api/admin/departments` | Authenticated Users | Get department list |
| Admin | GET | `/api/admin/workers` | Department Admin, Super Admin | List department workers |
| Admin | PATCH | `/api/admin/users/:id/role` | Super Admin | Update user role |
| Admin | POST | `/api/admin/departments` | Super Admin | Create department (alias endpoint) |
| Users | GET | `/api/users` | Department Admin, Super Admin | List system users |
| Users | PATCH | `/api/users/:userId/status` | Super Admin | Activate or deactivate a user |
| Notifications | GET | `/api/notifications` | Authenticated Users | Retrieve user notifications |
| Notifications | PATCH | `/api/notifications/:id/read` | Authenticated Users | Mark a notification as read |
| Activity Logs | GET | `/api/logs` | Super Admin | View system activity logs |
