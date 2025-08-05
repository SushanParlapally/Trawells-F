# Travel Request Submission and Tracking Implementation

This document describes the implementation of Task 14: "Add travel request submission and tracking"
which includes form submission with unique request ID generation, status tracking with visual
indicators, edit functionality for pending requests, and request cancellation with confirmation
dialog.

## Components Overview

### 1. TravelRequestSubmission (`TravelRequestSubmission.tsx`)

**Purpose**: Handles the submission of travel requests with unique ID generation and state
management.

**Key Features**:

- Unique request ID generation using timestamp and user ID
- Form data validation and API submission
- Success/error state management
- Notification components for user feedback

**Hook**: `useTravelRequestSubmission`

```typescript
const { submissionState, submitTravelRequest, resetSubmissionState } = useTravelRequestSubmission({
  onSubmissionSuccess: request => {
    /* handle success */
  },
  onSubmissionError: error => {
    /* handle error */
  },
});
```

**Components**:

- `SubmissionSuccessNotification`: Shows success message with request ID
- `SubmissionErrorNotification`: Shows error message with optional retry

### 2. TravelRequestStatusTracker (`TravelRequestStatusTracker.tsx`)

**Purpose**: Provides visual status tracking for travel requests with multiple display modes.

**Key Features**:

- Multiple display modes: compact, timeline, and default stepper
- Visual progress indicators with percentage completion
- Status-specific icons and colors
- Comment display for active status

**Display Modes**:

- **Compact**: Card-based display with progress bar
- **Timeline**: Vertical timeline showing request progression
- **Default**: Stepper with detailed status information

**Components**:

- `TravelRequestStatusTracker`: Main status tracking component
- `StatusBadge`: Reusable status badge for tables and lists

### 3. TravelRequestEditor (`TravelRequestEditor.tsx`)

**Purpose**: Handles editing of pending and returned travel requests.

**Key Features**:

- Edit mode for pending requests
- Resubmit functionality for returned requests
- View-only mode for non-editable requests
- Manager/admin comment display
- Form pre-population with existing data

**Editable Statuses**: `pending`, `returned`

### 4. TravelRequestCancellation (`TravelRequestCancellation.tsx`)

**Purpose**: Provides request cancellation functionality with confirmation dialog.

**Key Features**:

- Status-specific cancellation warnings
- Mandatory cancellation reason (minimum 10 characters)
- Confirmation dialog with impact assessment
- Different warning messages based on request status

**Cancellable Statuses**: `pending`, `approved`, `returned`

### 5. TravelRequestManager (`TravelRequestManager.tsx`)

**Purpose**: Orchestrates all travel request operations in a single component.

**Key Features**:

- Mode switching: create, edit, view
- Integrated submission, editing, and cancellation
- Notification management
- Supporting data loading (projects, departments)

## Implementation Details

### Unique Request ID Generation

```typescript
const generateRequestId = useCallback((): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  const userId = user?.userId || 0;
  return `TR-${userId}-${timestamp}-${random}`;
}, [user?.userId]);
```

### Status Tracking Logic

The status tracker uses a predefined flow:

1. **Pending** (25% progress) - Waiting for manager approval
2. **Approved** (50% progress) - Approved by manager, sent to travel admin
3. **Booked** (75% progress) - Travel arrangements booked
4. **Completed** (100% progress) - Travel completed

Special statuses:

- **Disapproved** (0% progress) - Request rejected
- **Returned** (10% progress) - Sent back for modifications

### Edit Functionality

```typescript
const EDITABLE_STATUSES: RequestStatus[] = ['pending', 'returned'];

// Different API endpoints based on status
if (request.status === 'returned') {
  updatedRequest = await travelRequestService.resubmit(requestId, updateData);
} else {
  updatedRequest = await travelRequestService.update(requestId, updateData);
}
```

### Cancellation Logic

```typescript
const CANCELLABLE_STATUSES: RequestStatus[] = ['pending', 'approved', 'returned'];

// Status-specific warnings
const getCancellationWarnings = (status: RequestStatus): string[] => {
  switch (status) {
    case 'pending':
      return ['Your manager will be notified of the cancellation'];
    case 'approved':
      return ['The travel admin will be notified', 'Any booking process will be stopped'];
    // ... more cases
  }
};
```

## API Integration

### Service Methods Used

- `travelRequestService.create(data)` - Create new request
- `travelRequestService.update(id, data)` - Update existing request
- `travelRequestService.resubmit(id, data)` - Resubmit returned request
- `travelRequestService.cancel(id, reason)` - Cancel request
- `travelRequestService.getById(id)` - Get request details

### Data Flow

1. **Submission**: Form data → API → Success/Error notification → UI update
2. **Status Tracking**: Request data → Status calculation → Visual indicators
3. **Editing**: Load existing data → Form pre-population → Update API → UI refresh
4. **Cancellation**: Confirmation → API call → Success notification → UI update

## Requirements Fulfillment

### ✅ Requirement 2.8: Form submission with unique request ID generation

- Implemented unique ID generation algorithm
- Automatic email notification to manager (API handles this)
- Form becomes read-only after submission

### ✅ Requirement 2.9: Request status tracking with visual indicators

- Multiple visual tracking modes (compact, timeline, stepper)
- Progress indicators with percentage completion
- Status-specific colors and icons

### ✅ Requirement 2.10: Edit functionality for pending requests

- Edit mode for pending and returned requests
- Form pre-population with existing data
- Different API endpoints for update vs resubmit

### ✅ Requirement 2.11: Request cancellation with confirmation dialog

- Confirmation dialog with impact assessment
- Mandatory cancellation reason
- Status-specific warnings and restrictions

## Usage Examples

### Basic Usage

```typescript
// Create new request
<TravelRequestManager
  mode="create"
  onRequestCreated={(request) => console.log('Created:', request)}
/>

// Edit existing request
<TravelRequestManager
  requestId={123}
  mode="edit"
  onRequestUpdated={(request) => console.log('Updated:', request)}
  onRequestCancelled={(request) => console.log('Cancelled:', request)}
/>

// Status tracking
<TravelRequestStatusTracker
  request={travelRequest}
  showTimeline={true}
/>

// Cancellation
<TravelRequestCancellation
  request={travelRequest}
  onCancel={(cancelled) => handleCancellation(cancelled)}
  onError={(error) => handleError(error)}
/>
```

### Integration with Employee Dashboard

The components integrate seamlessly with the existing employee dashboard:

```typescript
// In table actions column
<TravelRequestCancellation
  request={record}
  onCancel={(cancelledRequest) => {
    setRequests(prev =>
      prev.map(req =>
        req.travelRequestId === cancelledRequest.travelRequestId
          ? cancelledRequest
          : req
      )
    );
  }}
  onError={setError}
/>
```

## Testing

Comprehensive test suites are provided for:

- Submission hook functionality
- Status tracking visual states
- Cancellation dialog behavior
- Error handling scenarios

Run tests with:

```bash
npm test -- TravelRequestSubmission.test.tsx
npm test -- TravelRequestStatusTracker.test.tsx
npm test -- TravelRequestCancellation.test.tsx
```

## Future Enhancements

1. **Real-time Updates**: WebSocket integration for live status updates
2. **Bulk Operations**: Multi-select cancellation and status updates
3. **Advanced Filtering**: Status-based filtering in request lists
4. **Audit Trail**: Detailed history of all request changes
5. **Mobile Optimization**: Enhanced mobile experience for status tracking

## Dependencies

- Material-UI components for UI elements
- React Hook Form for form management
- Redux Toolkit for state management
- Custom API service layer for backend integration

This implementation provides a complete solution for travel request submission and tracking,
fulfilling all requirements while maintaining code quality and user experience standards.
