import React, { useState, useCallback, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Chip,
  Divider,
  Card,
  CardContent,
} from '@mui/material';
import {
  Flight,
  Download,
  CheckCircle,
  Cancel,
  Save,
  Person,
  Business,
  LocationOn,
  DateRange,
  Receipt,
} from '@mui/icons-material';
import { travelAdminService } from '../../services/api/travelAdminService';
import type { TravelRequest } from '../../types';

// Use the backend response type aligned with TravelRequestDto
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

interface BookingManagementProps {
  request: TravelAdminRequestResponse | null;
  open: boolean;
  onClose: () => void;
  onActionComplete: (updatedRequest: TravelRequest) => void;
}

interface BookingFormData {
  ticketNumber: string;
  bookingReference: string;
  airline: string;
  hotelName: string;
  confirmationNumber: string;
  totalCost: string;
  bookingNotes: string;
  ticketUrl: string;
}

const BookingManagement: React.FC<BookingManagementProps> = ({
  request,
  open,
  onClose,
  onActionComplete,
}) => {
  const [selectedAction, setSelectedAction] = useState<
    'booked' | 'completed' | 'returned' | ''
  >('');
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingFormData, setBookingFormData] = useState<BookingFormData>({
    ticketNumber: '',
    bookingReference: '',
    airline: '',
    hotelName: '',
    confirmationNumber: '',
    totalCost: '',
    bookingNotes: '',
    ticketUrl: '',
  });

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open && request) {
      setSelectedAction('');
      setComments('');
      setError(null);
      setBookingFormData({
        ticketNumber: '',
        bookingReference: '',
        airline: '',
        hotelName: '',
        confirmationNumber: '',
        totalCost: '',
        bookingNotes: '',
        ticketUrl: request.ticketUrl || '',
      });
    }
  }, [open, request]);

  const validateBookingForm = useCallback((): boolean => {
    if (selectedAction === 'booked') {
      if (
        !bookingFormData.ticketNumber.trim() &&
        !bookingFormData.bookingReference.trim()
      ) {
        setError('Please provide either a ticket number or booking reference');
        return false;
      }
    }
    if (!comments.trim()) {
      setError('Comments are required for all actions');
      return false;
    }
    return true;
  }, [selectedAction, bookingFormData, comments]);

  const handleBookingFormChange = (
    field: keyof BookingFormData,
    value: string
  ) => {
    setBookingFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = useCallback(async () => {
    if (!request || !selectedAction) return;

    if (!validateBookingForm()) return;

    try {
      setLoading(true);
      setError(null);

      // Prepare booking details for backend
      const bookingDetails = {
        comments: comments,
        ticketUrl: bookingFormData.ticketUrl,
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
        ticketUrl: bookingFormData.ticketUrl,
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
  }, [
    request,
    selectedAction,
    comments,
    bookingFormData,
    validateBookingForm,
    onActionComplete,
    onClose,
  ]);

  const handleCancel = () => {
    setSelectedAction('');
    setComments('');
    setBookingFormData({
      ticketNumber: '',
      bookingReference: '',
      airline: '',
      hotelName: '',
      confirmationNumber: '',
      totalCost: '',
      bookingNotes: '',
      ticketUrl: '',
    });
    setError(null);
    onClose();
  };

  const handleGeneratePdf = async () => {
    if (!request) return;

    try {
      setLoading(true);
      const blob = await travelAdminService.generateTicketPdf(
        request.travelRequestId
      );
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ticket-${request.travelRequestId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('Failed to generate PDF. Please try again.');
      console.error('Error generating PDF:', err);
    } finally {
      setLoading(false);
    }
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
    <Dialog open={open} onClose={onClose} maxWidth='lg' fullWidth>
      <DialogTitle>
        Booking Management - Request #{request.travelRequestId}
      </DialogTitle>
      <DialogContent>
        {/* Request Details */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant='h6' gutterBottom>
              Request Details
            </Typography>
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2,
              }}
            >
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Person sx={{ mr: 1, fontSize: 'small' }} />
                  <Typography variant='body2'>
                    {request.user.firstName} {request.user.lastName}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Business sx={{ mr: 1, fontSize: 'small' }} />
                  <Typography variant='body2'>
                    {request.department.departmentName}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationOn sx={{ mr: 1, fontSize: 'small' }} />
                  <Typography variant='body2'>
                    {request.fromLocation} → {request.toLocation}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <DateRange sx={{ mr: 1, fontSize: 'small' }} />
                  <Typography variant='body2'>
                    {new Date(request.fromDate).toLocaleDateString()} -{' '}
                    {new Date(request.toDate).toLocaleDateString()}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CheckCircle sx={{ mr: 1, fontSize: 'small' }} />
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
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Receipt sx={{ mr: 1, fontSize: 'small' }} />
                  <Typography variant='body2'>
                    Project: {request.project.projectName}
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Typography variant='body2' color='text.secondary'>
              <strong>Reason:</strong> {request.reasonForTravel}
            </Typography>
          </CardContent>
        </Card>

        {error && (
          <Alert severity='error' sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Action Selection */}
        <Box sx={{ mb: 3 }}>
          <Typography variant='h6' gutterBottom>
            Select Action
          </Typography>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 2,
            }}
          >
            <Button
              fullWidth
              variant={selectedAction === 'booked' ? 'contained' : 'outlined'}
              startIcon={<Flight />}
              onClick={() => setSelectedAction('booked')}
              disabled={loading}
            >
              Mark as Booked
            </Button>
            <Button
              fullWidth
              variant={
                selectedAction === 'completed' ? 'contained' : 'outlined'
              }
              startIcon={<CheckCircle />}
              onClick={() => setSelectedAction('completed')}
              disabled={loading}
            >
              Mark as Completed
            </Button>
            <Button
              fullWidth
              variant={selectedAction === 'returned' ? 'contained' : 'outlined'}
              startIcon={<Cancel />}
              onClick={() => setSelectedAction('returned')}
              disabled={loading}
            >
              Return to Employee
            </Button>
          </Box>
        </Box>

        {/* Booking Details (for booked action) */}
        {selectedAction === 'booked' && (
          <Box sx={{ mb: 3 }}>
            <Typography variant='h6' gutterBottom>
              Booking Details
            </Typography>
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2,
              }}
            >
              <TextField
                fullWidth
                label='Ticket Number'
                value={bookingFormData.ticketNumber}
                onChange={e =>
                  handleBookingFormChange('ticketNumber', e.target.value)
                }
                placeholder='Enter ticket number...'
              />
              <TextField
                fullWidth
                label='Booking Reference'
                value={bookingFormData.bookingReference}
                onChange={e =>
                  handleBookingFormChange('bookingReference', e.target.value)
                }
                placeholder='Enter booking reference...'
              />
            </Box>
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2,
                mt: 2,
              }}
            >
              <TextField
                fullWidth
                label='Airline'
                value={bookingFormData.airline}
                onChange={e =>
                  handleBookingFormChange('airline', e.target.value)
                }
                placeholder='Enter airline name...'
              />
              <TextField
                fullWidth
                label='Hotel Name'
                value={bookingFormData.hotelName}
                onChange={e =>
                  handleBookingFormChange('hotelName', e.target.value)
                }
                placeholder='Enter hotel name...'
              />
            </Box>
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2,
                mt: 2,
              }}
            >
              <TextField
                fullWidth
                label='Confirmation Number'
                value={bookingFormData.confirmationNumber}
                onChange={e =>
                  handleBookingFormChange('confirmationNumber', e.target.value)
                }
                placeholder='Enter confirmation number...'
              />
              <TextField
                fullWidth
                label='Total Cost'
                value={bookingFormData.totalCost}
                onChange={e =>
                  handleBookingFormChange('totalCost', e.target.value)
                }
                placeholder='Enter total cost...'
              />
            </Box>
          </Box>
        )}

        {/* Comments */}
        <Box sx={{ mb: 3 }}>
          <Typography variant='h6' gutterBottom>
            Comments
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            label='Comments'
            value={comments}
            onChange={e => setComments(e.target.value)}
            placeholder='Enter comments about this action...'
            required
          />
        </Box>

        {/* Ticket URL */}
        <Box sx={{ mb: 3 }}>
          <Typography variant='h6' gutterBottom>
            Ticket URL
          </Typography>
          <TextField
            fullWidth
            label='Ticket URL'
            value={bookingFormData.ticketUrl}
            onChange={e => handleBookingFormChange('ticketUrl', e.target.value)}
            placeholder='Enter ticket URL if available...'
          />
        </Box>

        {/* Generate PDF Button */}
        {request.ticketUrl && (
          <Box sx={{ mb: 3 }}>
            <Button
              variant='outlined'
              startIcon={<Download />}
              onClick={handleGeneratePdf}
              disabled={loading}
            >
              Generate PDF Ticket
            </Button>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant='contained'
          disabled={!selectedAction || !comments.trim() || loading}
          startIcon={loading ? <CircularProgress size={20} /> : <Save />}
        >
          {loading ? 'Processing...' : 'Submit Action'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BookingManagement;
