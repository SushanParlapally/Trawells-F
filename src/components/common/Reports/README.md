# Travel Desk Reporting System

This module provides reporting and export functionality for the Travel Desk Management System using
existing backend APIs.

## Features

### 1. Report Generation Interface (`ReportGenerator.tsx`)

- **Date Range Selection**: Pick start and end dates for the report period
- **Advanced Filters**: Filter by status, department, and project
- **Role-based Access**: Different filter options based on user role
- **Real-time Statistics**: Summary cards showing key metrics
- **Export Options**: CSV and text export with proper formatting

### 2. Reports Wrapper (`Reports.tsx`)

- **Unified Interface**: Provides a consistent wrapper for the reporting functionality
- **Role-based Props**: Accepts user role, userId, and managerId for proper access control
- **No Backend Changes**: Uses existing TravelRequestController API

### 3. Export Utilities

- **CSV Export**: Export filtered data to CSV format
- **Text Export**: Export data as formatted text file
- **File Download**: Automatic file download with proper naming conventions

## Usage

### Basic Report Generation

```tsx
import { Reports } from './components/common/Reports';

// In your dashboard component
<Reports userRole='Admin' userId={currentUser.id} managerId={currentUser.managerId} />;
```

### Role-specific Usage

```tsx
// Employee Dashboard - can only see their own requests
<Reports userRole="Employee" userId={employeeId} />

// Manager Dashboard - can see team requests
<Reports userRole="Manager" managerId={managerId} />

// Travel Admin Dashboard - can see all requests
<Reports userRole="TravelAdmin" />

// Admin Dashboard - full access to all features
<Reports userRole="Admin" />
```

## API Integration

The reporting system uses existing backend APIs through the `travelRequestService`:

```tsx
import { travelRequestService } from '../../../services/api/travelRequestService';

// Get all travel requests
const response = await travelRequestService.getTravelRequests();
const requests = response.requests || [];
```

## Backend Alignment

The reporting system is fully aligned with the existing backend:

### Available Fields (from TravelRequestController)

- **TravelRequestId**: Unique identifier
- **User**: User information (UserId, FirstName, LastName, Department)
- **Project**: Project information (ProjectId, ProjectName)
- **ReasonForTravel**: Travel purpose
- **FromDate/ToDate**: Travel dates
- **FromLocation/ToLocation**: Travel locations
- **Status**: Request status (Pending, Approved, Rejected, etc.)
- **Comments**: Optional comments

### Filtering Options

- **Date Range**: Filter by travel date range
- **Status**: Filter by request status
- **Department**: Filter by user department
- **Project**: Filter by project

## Data Types

### TravelRequestDto (Backend-aligned)

```typescript
interface TravelRequestDto {
  travelRequestId: number;
  user: UserDto;
  project: ProjectDto;
  reasonForTravel: string;
  fromDate: string;
  toDate: string;
  fromLocation: string;
  toLocation: string;
  status: string;
  comments?: string;
}
```

## Backend Limitations

This reporting system is designed to work with the existing backend APIs. The following limitations
apply:

### Supported Operations

- **GET: api/TravelRequest** - Returns all travel requests
- **GET: api/TravelRequest/user/{userId}** - Returns user-specific requests
- **GET: api/Department** - Returns department data
- **GET: api/Project** - Returns project data

### Not Supported (Backend Limitations)

- **Approval Actions**: Approve, disapprove, or return requests (not implemented in backend)
- **Bulk Operations**: Bulk approval/disapproval actions
- **Status Updates**: Individual request status updates
- **Real-time Updates**: Live status changes

All filtering and export functionality is handled on the frontend using the data returned by these
existing endpoints.

## Export Features

### CSV Export

- Exports filtered travel request data
- Includes employee name, department, project, locations, status, and reason
- Proper CSV formatting with headers

### Text Export

- Simple text format for easy reading
- Includes key information in readable format

## Summary Statistics

The system provides real-time statistics:

- **Total Requests**: Count of filtered requests
- **Status Types**: Number of different statuses
- **Departments**: Number of departments represented
- **Records Found**: Total count for export

## Error Handling

- **API Errors**: Proper error handling for failed API calls
- **No Data**: User-friendly messages when no data is available
- **Export Errors**: Graceful handling of export failures
- **Backend Limitations**: Clear messaging about unsupported features

## Responsive Design

- **Mobile Friendly**: Responsive layout using Box components
- **Flexible Grid**: Adapts to different screen sizes
- **Touch Friendly**: Proper spacing for mobile interaction

## Implementation Notes

### Frontend-Only Features

Since the backend only supports read operations, the following features are implemented on the
frontend:

- **Date Filtering**: Applied to the response data
- **Status Filtering**: Applied to the response data
- **Department/Project Filtering**: Applied to the response data
- **Export Functionality**: Generates files from filtered data

### User Experience

- **Clear Messaging**: Users are informed about backend limitations
- **Disabled Actions**: Approval buttons are disabled with explanatory tooltips
- **Info Alerts**: Clear communication about what features are available
