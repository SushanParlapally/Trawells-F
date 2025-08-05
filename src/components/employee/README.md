# Employee Components

This directory contains components specific to employee functionality in the Travel Desk Management
System, aligned with the backend API.

## Backend Alignment

The employee components are designed to work with the following backend endpoints:

### Supported Endpoints:

- `GET /api/TravelRequest` - Get all travel requests with dashboard data
- `POST /api/TravelRequest` - Create new travel request
- `GET /api/TravelRequest/user/{userId}` - Get user's travel requests
- `GET /api/Project` - Get all projects
- `GET /api/department` - Get all departments

### Unsupported Features:

- Update existing travel requests
- Cancel travel requests
- Resubmit returned requests
- Get individual request by ID
- Manager-specific actions

## Components Implemented

### 1. EmployeeDashboard

A comprehensive dashboard for employees to view their travel requests, statistics, and create new
requests.

**Features:**

- **Overview tab** with request statistics and KPIs
- **Requests tab** with detailed request list and status tracking
- **Analytics tab** with charts and trends
- **Create new request** functionality
- **Real-time data** from backend API
- **Responsive design** with Material-UI components

**Usage:**

```tsx
import { EmployeeDashboard } from './components/employee';

<EmployeeDashboard />;
```

### 2. TravelRequestForm

A multi-step travel request form that allows employees to create travel requests with basic
information supported by the backend.

**Features:**

- **Multi-step form interface** with 3 steps:
  1. Basic Information (reason, project, department)
  2. Travel Details (dates, locations)
  3. Review & Submit

- **Backend-aligned fields**:
  - Reason for travel
  - Project selection (fetched from API)
  - Department selection (fetched from API)
  - Travel dates (from/to)
  - Travel locations (from/to)

- **Comprehensive validation** using Yup schemas
- **Responsive design** with Material-UI components
- **Read-only mode** for viewing submitted requests
- **Loading states** and error handling
- **Automatic data fetching** for projects and departments

**Props:**

```typescript
interface TravelRequestFormProps {
  initialData?: Partial<TravelRequest>;
  onSubmit: (data: TravelRequestFormData) => void;
  readonly?: boolean;
  loading?: boolean;
}
```

**Usage:**

```tsx
import { TravelRequestForm } from './components/employee';

<TravelRequestForm onSubmit={handleSubmit} loading={isSubmitting} readonly={isReadOnly} />;
```

### 3. BookingTypeSelection

A component that renders the travel request form fields with automatic data fetching for projects
and departments.

**Features:**

- **Automatic data fetching** for projects and departments
- **Loading states** while fetching data
- **Error handling** for API failures
- **Form validation** integration
- **Responsive layout** with Material-UI components

**Props:**

```typescript
interface BookingTypeSelectionProps {
  control: Control<TravelRequestFormData>;
  disabled?: boolean;
}
```

### 4. TravelRequestManager

A comprehensive component for managing travel requests with create, view, and edit capabilities.

**Features:**

- **Create new requests** with form validation
- **View request details** with status tracking
- **Edit requests** (when supported by backend)
- **Error handling** and user feedback
- **Loading states** and progress indicators

**Props:**

```typescript
interface TravelRequestManagerProps {
  requestId?: number;
  mode?: 'create' | 'edit' | 'view';
  onRequestCreated?: (request: TravelRequest) => void;
  onRequestUpdated?: (request: TravelRequest) => void;
  onRequestCancelled?: (request: TravelRequest) => void;
}
```

### 5. TravelRequestEditor

A component for editing existing travel requests (limited by backend support).

**Features:**

- **View request details** with status information
- **Edit functionality** (when backend supports it)
- **Status tracking** with timeline view
- **Comments display** for returned requests
- **Responsive design** with Material-UI components

**Note:** Edit functionality is not available in this system.

### 6. TravelRequestCancellation

A component for cancelling travel requests (limited by backend support).

**Features:**

- **Cancellation dialog** with reason input
- **Status-based warnings** and impact information
- **Validation** for cancellation reasons
- **Error handling** for API failures

**Note:** Cancellation functionality is not available in this system.

### 7. TravelRequestStatusTracker

A component for displaying travel request status and progress.

**Features:**

- **Status timeline** with step-by-step progress
- **Compact mode** for table displays
- **Progress indicators** with percentage completion
- **Status badges** with color coding
- **Comments display** for additional information

**Props:**

```typescript
interface TravelRequestStatusTrackerProps {
  request: TravelRequest;
  showTimeline?: boolean;
  compact?: boolean;
}
```

### 8. TravelRequestSubmission

A hook and components for handling travel request submission.

**Features:**

- **Submission hook** with state management
- **Success notifications** with request ID
- **Error notifications** with retry functionality
- **Loading states** and progress tracking

## Form Data Structure

```typescript
interface TravelRequestFormData {
  reasonForTravel: string;
  projectId: number;
  departmentId: number;
  fromDate: Date;
  toDate: Date;
  fromLocation: string;
  toLocation: string;
}
```

## Backend Data Structure

```typescript
interface TravelRequest {
  travelRequestId: number;
  userId: number;
  projectId: number;
  departmentId: number;
  reasonForTravel: string;
  fromDate: string;
  toDate: string;
  fromLocation: string;
  toLocation: string;
  status: TravelRequestStatus;
  comments?: string;
  createdOn: string;
  modifiedOn?: string;
  isActive: boolean;
}

type TravelRequestStatus =
  | 'Pending'
  | 'Approved'
  | 'Rejected'
  | 'Booked'
  | 'Returned to Employee'
  | 'Completed';
```

## Usage Examples

### Creating a New Travel Request

```tsx
import { TravelRequestManager } from './components/employee';

<TravelRequestManager
  mode='create'
  onRequestCreated={request => {
    console.log('Request created:', request);
  }}
/>;
```

### Viewing Request Details

```tsx
import { TravelRequestManager } from './components/employee';

<TravelRequestManager requestId={123} mode='view' />;
```

### Displaying Status

```tsx
import { TravelRequestStatusTracker } from './components/employee';

<TravelRequestStatusTracker request={travelRequest} showTimeline={true} />;
```

## Error Handling

All components include comprehensive error handling for:

- **API failures** with user-friendly error messages
- **Network issues** with retry functionality
- **Validation errors** with field-specific feedback
- **Backend limitations** with appropriate messaging

## Testing

All components include comprehensive test suites covering:

- **Component rendering** and user interactions
- **API integration** with mocked services
- **Error scenarios** and edge cases
- **Accessibility** compliance
- **Backend alignment** with supported endpoints

## Notes

- Components are designed to work with the current backend implementation
- Unsupported features are properly disabled with user feedback
- All data fetching is handled internally by components
- Error messages clearly indicate system limitations
- Components focus on available functionality only
