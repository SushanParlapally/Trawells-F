# Travel Desk API Endpoints Documentation

This document lists all 40 API endpoints available in the Travel Desk backend, organized by
controller.

## 🔹 Login Controller (1 endpoint)

- **POST** `/api/Login` - User authentication and login

## 🔹 Manager Controller (7 endpoints)

- **GET** `/api/Manager/{managerId}/Requests` - Get pending requests for a manager
- **PUT** `/api/Manager/ApproveRequest/{requestId}` - Approve a travel request
- **PUT** `/api/Manager/RejectRequest/{requestId}` - Reject a travel request
- **GET** `/api/Manager/{managerId}/statistics` - Get manager dashboard statistics
- **GET** `/api/Manager/{managerId}/all-requests` - Get all requests for a manager
- **GET** `/api/Manager/{managerId}/requests-by-status/{status}` - Get requests by status for a
  manager
- **GET** `/api/Manager/{managerId}/team-members` - Get team members for a manager

## 🔹 Project Controller (6 endpoints)

- **GET** `/api/Project` - Get all projects
- **GET** `/api/Project/{id}` - Get project by ID
- **GET** `/api/Project/statistics` - Get project statistics
- **GET** `/api/Project/{id}/details` - Get project details with recent requests
- **GET** `/api/Project/{id}/travel-requests` - Get travel requests for a specific project
- **GET** `/api/Project/by-status/{isActive}` - Get projects by status (active/inactive)

## 🔹 Role Controller (2 endpoints)

- **GET** `/api/Role` - Get all roles
- **GET** `/api/Role/{id}` - Get role by ID

## 🔹 TravelAdmin Controller (12 endpoints)

- **GET** `/api/travel-requests` - Get all travel requests for travel admin
- **POST** `/api/travel-requests/{travelRequestId}/book` - Book a ticket for a travel request
- **GET** `/api/travel-requests/{travelRequestId}/download-ticket` - Download ticket PDF (public)
- **GET** `/api/travel-requests/{travelRequestId}/ticket-pdf` - Generate PDF ticket for a travel
  request
- **POST** `/api/travel-requests/{travelRequestId}/return-to-employee` - Return a travel request to
  employee
- **POST** `/api/travel-requests/{travelRequestId}/close` - Close a travel request as completed
- **POST** `/api/travel-requests/{travelRequestId}/return-to-manager` - Return a travel request to
  manager
- **GET** `/api/travel-requests/statistics` - Get travel admin statistics
- **GET** `/api/travel-requests/by-status/{status}` - Get travel requests by status
- **GET** `/api/travel-requests/by-department/{departmentId}` - Get travel requests by department
- **GET** `/api/travel-requests/by-date-range` - Get travel requests by date range
- **GET** `/api/travel-requests/{travelRequestId}` - Get single travel request by ID

## 🔹 TravelRequest Controller (3 endpoints)

- **GET** `/api/TravelRequest` - Get all travel requests
- **POST** `/api/TravelRequest` - Create new travel request
- **GET** `/api/TravelRequest/user/{userId}` - Get travel requests for a specific user

## 🔹 User Controller (9 endpoints)

- **GET** `/api/User/users` - Get all users (excluding Admin role)
- **POST** `/api/User/users` - Create new user
- **PUT** `/api/User/users/{id}` - Update existing user
- **DELETE** `/api/User/users/{id}` - Delete user (soft delete)
- **GET** `/api/User/managers` - Get managers (users with RoleId = 3)
- **GET** `/api/User/statistics` - Get system-wide statistics for admin dashboard
- **GET** `/api/User/activity` - Get user activity statistics
- **GET** `/api/User/by-role/{roleId}` - Get users by role
- **GET** `/api/User/by-department/{departmentId}` - Get users by department

## 🔹 Department Controller (4 endpoints)

- **GET** `/api/department` - Get all departments
- **GET** `/api/department/statistics` - Get department statistics
- **GET** `/api/department/{id}` - Get department by ID with details
- **GET** `/api/department/{id}/users` - Get users in a specific department
- **GET** `/api/department/{id}/travel-requests` - Get travel requests for a specific department

## Frontend Service Integration

All these endpoints are available through the following frontend services:

- `authService` - Login functionality
- `userService` - User management and admin statistics
- `travelRequestService` - Travel request operations
- `managerService` - Manager dashboard and team management
- `travelAdminService` - Travel admin booking and management
- `departmentService` - Department management and statistics
- `projectService` - Project management and statistics
- `roleService` - Role management

## Authentication

Most endpoints require JWT authentication. Include the Bearer token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Response Formats

All endpoints return JSON responses with consistent error handling:

- Success: 200 OK with data
- Created: 201 Created for new resources
- Not Found: 404 for missing resources
- Bad Request: 400 for invalid data
- Unauthorized: 401 for missing/invalid authentication
- Internal Server Error: 500 for server errors

## Total: 40 API Endpoints ✅
