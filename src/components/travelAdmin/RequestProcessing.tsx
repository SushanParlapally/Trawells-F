import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Chip,
  Divider,
} from '@mui/material';
import {
  Person,
  Business,
  LocationOn,
  DateRange,
  CheckCircle,
} from '@mui/icons-material';
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

interface RequestProcessingProps {
  request: TravelAdminRequestResponse | null;
  open: boolean;
  onClose: () => void;
  onActionComplete: (updatedRequest: TravelRequest) => void;
}

const RequestProcessing: React.FC<RequestProcessingProps> = ({
  request,
  open,
  onClose,
  onActionComplete,
}) => {
  const [selectedAction, setSelectedAction] = useState<
    'booked' | 'completed' | 'returned' | ''
  >('');
  const [comments, setComments] = useState('');
  const [ticketUrl, setTicketUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when dialog opens/closes
  React.useEffect(() => {
    if (open && request) {
      setSelectedAction('');
      setComments('');
      setTicketUrl(request.ticketUrl || '');
      setError(null);
    }
  }, [open, request]);

  // Handle action submission
  const handleSubmit = useCallback(async () => {
    if (!request || !selectedAction) return;

    if (!comments.trim()) {
      setError('Comments are required for all actions');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Prepare booking details for backend
      const bookingDetails = {
        comments: comments,
        ticketUrl: ticketUrl,
      };

      // Call appropriate backend endpoint based on action
      switch (selectedAction) {
        case 'booked':
          await travelAdminService.bookTicket(
            request.travelRequestId,
            bookingDetails
          );
          break;
        case 'completed':
          await travelAdminService.closeRequest(
            request.travelRequestId,
            bookingDetails
          );
          break;
        case 'returned':
          await travelAdminService.returnToEmployee(
            request.travelRequestId,
            bookingDetails
          );
          break;
        default:
          throw new Error('Invalid action selected');
      }

      // Update the request with the new status
      const updatedRequest = {
        ...request,
        status:
          selectedAction === 'booked'
            ? 'Booked'
            : selectedAction === 'completed'
              ? 'Completed'
              : 'Returned to Employee',
        comments: comments,
        ticketUrl: ticketUrl,
      };

      // Call the callback with the updated request
      onActionComplete(updatedRequest as unknown as TravelRequest);

      // Close the dialog
      onClose();
    } catch (err) {
      setError('Failed to process request. Please try again.');
      console.error('Error processing request:', err);
    } finally {
      setLoading(false);
    }
  }, [request, selectedAction, comments, ticketUrl, onActionComplete, onClose]);

  const handleCancel = () => {
    setSelectedAction('');
    setComments('');
    setTicketUrl('');
    setError(null);
    onClose();
  };

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

  if (!request) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle>Process Travel Request</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant='h6' gutterBottom>
            Request Details
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Person sx={{ mr: 1 }} />
            <Typography>
              {request.user.firstName} {request.user.lastName}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Business sx={{ mr: 1 }} />
            <Typography>{request.department.departmentName}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <LocationOn sx={{ mr: 1 }} />
            <Typography>
              {request.fromLocation} → {request.toLocation}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <DateRange sx={{ mr: 1 }} />
            <Typography>
              {new Date(request.fromDate).toLocaleDateString()} -{' '}
              {new Date(request.toDate).toLocaleDateString()}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <CheckCircle sx={{ mr: 1 }} />
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
          </Box>
          <Divider sx={{ my: 2 }} />
          <Typography variant='body2' color='text.secondary'>
            {request.reasonForTravel}
          </Typography>
        </Box>

        {error && (
          <Alert severity='error' sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Select Action</InputLabel>
          <Select
            value={selectedAction}
            label='Select Action'
            onChange={e =>
              setSelectedAction(e.target.value as typeof selectedAction)
            }
          >
            <MenuItem value='booked'>Mark as Booked</MenuItem>
            <MenuItem value='completed'>Mark as Completed</MenuItem>
            <MenuItem value='returned'>Return to Employee</MenuItem>
          </Select>
        </FormControl>

        <TextField
          fullWidth
          multiline
          rows={4}
          label='Comments'
          value={comments}
          onChange={e => setComments(e.target.value)}
          placeholder='Enter comments about this action...'
          sx={{ mb: 2 }}
        />

        <TextField
          fullWidth
          label='Ticket URL (Optional)'
          value={ticketUrl}
          onChange={e => setTicketUrl(e.target.value)}
          placeholder='Enter ticket URL if available...'
          sx={{ mb: 2 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant='contained'
          disabled={!selectedAction || !comments.trim() || loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Processing...' : 'Submit Action'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RequestProcessing;
