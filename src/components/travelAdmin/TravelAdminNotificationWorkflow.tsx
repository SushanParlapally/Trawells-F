import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Tooltip,
} from '@mui/material';
import { CheckCircle, Visibility } from '@mui/icons-material';
import { travelAdminService } from '../../services/api/travelAdminService';
import type { TravelRequest } from '../../types';

// Use the backend response type
interface TravelAdminRequestResponse {
  travelRequestId: number;
  status: string;
  comments?: string;
  fromDate: string;
  toDate: string;
  reasonForTravel: string;
  fromLocation: string;
  toLocation: string;
  ticketUrl?: string;
  user: {
    userId: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  project: {
    projectId: number;
    projectName: string;
  };
  department: {
    departmentId: number;
    departmentName: string;
  };
}

interface TravelAdminNotificationWorkflowProps {
  onRequestUpdate?: (request: TravelRequest) => void;
}

/**
 * Integrated component that combines notification management with workflow management
 * for travel admin users. This component is aligned with backend capabilities.
 */
const TravelAdminNotificationWorkflow: React.FC<
  TravelAdminNotificationWorkflowProps
> = ({ onRequestUpdate }) => {
  const [requests, setRequests] = useState<TravelAdminRequestResponse[]>([]);
  const [selectedRequest, setSelectedRequest] =
    useState<TravelAdminRequestResponse | null>(null);
  const [requestDetailsDialogOpen, setRequestDetailsDialogOpen] =
    useState(false);
  const [workflowDialogOpen, setWorkflowDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Load travel requests
  useEffect(() => {
    const loadRequests = async () => {
      try {
        setLoading(true);
        const response = await travelAdminService.getAllRequests();
        setRequests(response);
      } catch (err) {
        setError('Failed to load travel requests');
        console.error('Error loading requests:', err);
      } finally {
        setLoading(false);
      }
    };

    loadRequests();
  }, []);

  // Handle request selection
  const handleRequestClick = useCallback(
    (request: TravelAdminRequestResponse) => {
      setSelectedRequest(request);
      setRequestDetailsDialogOpen(true);
    },
    []
  );

  // Handle workflow action
  const handleWorkflowAction = useCallback(
    async (action: 'booked' | 'completed' | 'returned') => {
      if (!selectedRequest) return;

      try {
        setLoading(true);
        const bookingDetails = {
          comments: `Action: ${action}`,
          ticketUrl: '',
        };

        switch (action) {
          case 'booked':
            await travelAdminService.bookTicket(
              selectedRequest.travelRequestId,
              bookingDetails
            );
            break;
          case 'completed':
            await travelAdminService.closeRequest(
              selectedRequest.travelRequestId,
              bookingDetails
            );
            break;
          case 'returned':
            await travelAdminService.returnToEmployee(
              selectedRequest.travelRequestId,
              bookingDetails
            );
            break;
          default:
            throw new Error('Invalid action');
        }

        // Update the request with the new status
        const updatedRequest = {
          ...selectedRequest,
          status:
            action === 'booked'
              ? 'Booked'
              : action === 'completed'
                ? 'Completed'
                : 'Returned to Employee',
          comments: `Action: ${action}`,
        };

        // Update local state
        setRequests(prev =>
          prev.map(req =>
            req.travelRequestId === selectedRequest.travelRequestId
              ? updatedRequest
              : req
          )
        );

        onRequestUpdate?.(updatedRequest as unknown as TravelRequest);
        setWorkflowDialogOpen(false);
        setSelectedRequest(null);
      } catch (err) {
        setError('Failed to process workflow action');
        console.error('Error processing workflow action:', err);
      } finally {
        setLoading(false);
      }
    },
    [selectedRequest, onRequestUpdate]
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'success';
      case 'Booked':
        return 'primary';
      case 'Pending':
        return 'warning';
      case 'Rejected':
        return 'error';
      case 'Returned to Employee':
        return 'secondary';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <Typography>Loading notifications...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity='error'>{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant='h4' gutterBottom>
        Notification & Workflow Management
      </Typography>

      <Alert severity='info' sx={{ mb: 3 }}>
        This component provides integrated notification and workflow management
        for travel requests.
      </Alert>

      {/* Request List */}
      <Card>
        <CardContent>
          <Typography variant='h6' gutterBottom>
            Recent Travel Requests ({requests.length})
          </Typography>
          <List>
            {requests.slice(0, 10).map(request => (
              <ListItem key={request.travelRequestId} divider>
                <ListItemIcon>
                  <CheckCircle color='primary' />
                </ListItemIcon>
                <ListItemText
                  primary={`${request.user.firstName} ${request.user.lastName}`}
                  secondary={
                    <Box>
                      <Typography variant='body2'>
                        {request.reasonForTravel}
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {request.fromLocation} → {request.toLocation} •{' '}
                        {request.department.departmentName}
                      </Typography>
                      <Typography
                        variant='caption'
                        color='text.secondary'
                        display='block'
                      >
                        {new Date(request.fromDate).toLocaleDateString()} -{' '}
                        {new Date(request.toDate).toLocaleDateString()}
                      </Typography>
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Chip
                      label={request.status}
                      color={
                        getStatusColor(request.status) as
                          | 'default'
                          | 'primary'
                          | 'secondary'
                          | 'error'
                          | 'info'
                          | 'success'
                          | 'warning'
                      }
                      size='small'
                    />
                    <Tooltip title='View Details'>
                      <IconButton
                        size='small'
                        onClick={() => handleRequestClick(request)}
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Request Details Dialog */}
      <Dialog
        open={requestDetailsDialogOpen}
        onClose={() => setRequestDetailsDialogOpen(false)}
        maxWidth='md'
        fullWidth
      >
        <DialogTitle>Request Details</DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Box>
              <Typography variant='h6' gutterBottom>
                {selectedRequest.user.firstName} {selectedRequest.user.lastName}
              </Typography>
              <Typography variant='body2' color='text.secondary' gutterBottom>
                {selectedRequest.user.email}
              </Typography>
              <Typography variant='body1' sx={{ mt: 2 }}>
                <strong>Reason:</strong> {selectedRequest.reasonForTravel}
              </Typography>
              <Typography variant='body2' sx={{ mt: 1 }}>
                <strong>From:</strong> {selectedRequest.fromLocation} (
                {selectedRequest.fromDate})
              </Typography>
              <Typography variant='body2' sx={{ mt: 1 }}>
                <strong>To:</strong> {selectedRequest.toLocation} (
                {selectedRequest.toDate})
              </Typography>
              <Typography variant='body2' sx={{ mt: 1 }}>
                <strong>Department:</strong>{' '}
                {selectedRequest.department.departmentName}
              </Typography>
              <Typography variant='body2' sx={{ mt: 1 }}>
                <strong>Project:</strong> {selectedRequest.project.projectName}
              </Typography>
              <Typography variant='body2' sx={{ mt: 1 }}>
                <strong>Status:</strong> {selectedRequest.status}
              </Typography>
              {selectedRequest.comments && (
                <Typography variant='body2' sx={{ mt: 1 }}>
                  <strong>Comments:</strong> {selectedRequest.comments}
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRequestDetailsDialogOpen(false)}>
            Close
          </Button>
          {selectedRequest && (
            <Button
              variant='contained'
              onClick={() => {
                setRequestDetailsDialogOpen(false);
                setWorkflowDialogOpen(true);
              }}
            >
              Take Action
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Workflow Action Dialog */}
      <Dialog
        open={workflowDialogOpen}
        onClose={() => setWorkflowDialogOpen(false)}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>Workflow Action</DialogTitle>
        <DialogContent>
          <Typography variant='body1' gutterBottom>
            Select an action for request #{selectedRequest?.travelRequestId}:
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <Button
              fullWidth
              variant='outlined'
              color='primary'
              onClick={() => handleWorkflowAction('booked')}
              disabled={loading}
            >
              Mark as Booked
            </Button>
            <Button
              fullWidth
              variant='outlined'
              color='success'
              onClick={() => handleWorkflowAction('completed')}
              disabled={loading}
            >
              Mark as Completed
            </Button>
            <Button
              fullWidth
              variant='outlined'
              color='warning'
              onClick={() => handleWorkflowAction('returned')}
              disabled={loading}
            >
              Return to Employee
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWorkflowDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TravelAdminNotificationWorkflow;
