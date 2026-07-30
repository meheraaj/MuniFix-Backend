# API Overview

| Module | Method | Endpoint | Role | Details |
|--------|--------|----------|------|---------|
| Authentication | POST | `/api/auth/signup` | Public | ↓ [Signup](#post-apiauthsignup) |
| Authentication | POST | `/api/auth/signin` | Public | ↓ [Signin](#post-apiauthsignin) |
| Authentication | POST | `/api/auth/verify-otp` | Public | ↓ [Verify OTP](#post-apiauthverify-otp) |
| Authentication | POST | `/api/auth/refresh` | Authenticated | ↓ [Refresh Token](#post-apiauthrefresh) |
| Authentication | POST | `/api/auth/signout` | Authenticated | ↓ [Signout](#post-apiauthsignout) |
| Authentication | POST | `/api/auth/forgot-password` | Public | ↓ [Forgot Password](#post-apiauthforgot-password) |
| Profile | GET | `/api/my/profile` | Authenticated | ↓ [Profile](#get-apimyprofile) |
| Profile | PUT | `/api/my/profile` | Authenticated | ↓ [Update Profile](#put-apimyprofile) |
| Profile | PATCH | `/api/my/password` | Authenticated | ↓ [Change Password](#patch-apimypassword) |
| Profile | POST | `/api/my/avatar` | Authenticated | ↓ [Upload Avatar](#post-apimyavatar) |
| Citizen | GET | `/api/citizen/complain` | Citizen | ↓ [Citizen Complaints](#get-apicitizencomplain) |
| Complaint | POST | `/api/complain` | Citizen | ↓ [Create Complaint](#post-apicomplain) |
| Complaint | GET | `/api/complain` | Authenticated | ↓ [List Complaints](#get-apicomplain) |
| Complaint | GET | `/api/complain/search` | Authenticated | ↓ [Search Complaints](#get-apicomplainsearch) |
| Complaint | GET | `/api/complain/:id` | Authenticated | ↓ [Complaint Details](#get-apicomplainid) |
| Complaint | PATCH | `/api/complain/:id` | Citizen/Admin | ↓ [Update Complaint](#patch-apicomplainid) |
| Complaint | PATCH | `/api/complain/:id/category` | Department Admin, Super Admin | ↓ [Update Category](#patch-apicomplainidcategory) |
| Complaint | PATCH | `/api/complain/:id/status` | Worker/Admin | ↓ [Update Status](#patch-apicomplainidstatus) |
| Complaint | PATCH | `/api/complain/:id/assign` | Department Admin, Super Admin | ↓ [Assign Worker](#patch-apicomplainidassign) |
| Complaint | DELETE | `/api/complain/:id` | Department Admin, Super Admin | ↓ [Delete Complaint](#delete-apicomplainid) |
| Worker | GET | `/api/complain/worker/tasks` | Worker | ↓ [Worker Tasks](#get-apicomplainworkertasks) |
| Department | GET | `/api/departments` | Authenticated | Quick Reference |
| Department | POST | `/api/departments` | Super Admin | Quick Reference |
| Department | PUT | `/api/departments/:id` | Super Admin | Quick Reference |
| Department | DELETE | `/api/departments/:id` | Super Admin | Quick Reference |
| Admin | GET | `/api/admin/departments` | Authenticated | Quick Reference |
| Admin | GET | `/api/admin/workers` | Department Admin, Super Admin | Quick Reference |
| Admin | PATCH | `/api/admin/users/:id/role` | Super Admin | Quick Reference |
| Admin | POST | `/api/admin/departments` | Super Admin | Quick Reference |
| Users | GET | `/api/users` | Department Admin, Super Admin | Quick Reference |
| Users | PATCH | `/api/users/:userId/status` | Super Admin | Quick Reference |
| Notifications | GET | `/api/notifications` | Authenticated | Quick Reference |
| Notifications | PATCH | `/api/notifications/:id/read` | Authenticated | Quick Reference |
| Activity Logs | GET | `/api/logs` | Super Admin | Quick Reference |
