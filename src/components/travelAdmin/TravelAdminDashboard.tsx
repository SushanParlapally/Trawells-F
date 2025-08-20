import React, { useState, useEffect } from 'react';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from '@mui/material';
import {
  CheckCircle,
  Visibility,
  Search,
  Flight,
  Reply,
} from '@mui/icons-material';
import { travelAdminService } from '../../services/api/travelAdminService';
import PerformanceMetricsChart from '../common/Charts/PerformanceMetricsChart';
import TravelAnalyticsChart from '../common/Charts/TravelAnalyticsChart';
import TimeSeriesChart from '../common/Charts/TimeSeriesChart';
import DepartmentAnalyticsChart from '../common/Charts/DepartmentAnalyticsChart';
import { MainLayout } from '../common/Layout';
import StatCard from '../common/StatCard';
import {
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Timer as TimerIcon,
} from '@mui/icons-material';

// Use the backend response type - aligned with TravelAdminController response structure
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
    email: string; // Backend includes email in the response
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

type TravelAdminDashboardProps = Record<string, never>;

const TravelAdminDashboard: React.FC<TravelAdminDashboardProps> = () => {
  const [requests, setRequests] = useState<TravelAdminRequestResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] =
    useState<TravelAdminRequestResponse | null>(null);
  const [processingDialogOpen, setProcessingDialogOpen] = useState(false);
  const [requestDetailsDialogOpen, setRequestDetailsDialogOpen] =
    useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [lastBookedRequestId, setLastBookedRequestId] = useState<number | null>(
    null
  );
  const [bookingFormOpen, setBookingFormOpen] = useState(false);
  const [bookingFormData, setBookingFormData] = useState({
    comments: '',
    ticketUrl: '',
    flightNumber: '',
    airline: '',
    departureTime: '',
    arrivalTime: '',
    seatNumber: '',
    bookingReference: '',
  });
  const [filters, setFilters] = useState({
    status: '',
    department: '',
    searchTerm: '',
  });

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

  // Handle booking ticket
  const handleBookTicket = async (requestId: number) => {
    // Open booking form instead of direct booking
    setSelectedRequest(
      requests.find(r => r.travelRequestId === requestId) || null
    );
    setBookingFormOpen(true);
  };

  // Handle booking form submission
  const handleBookingFormSubmit = async () => {
    if (!selectedRequest) return;

    try {
      setProcessingDialogOpen(true);
      const bookingDetails = {
        comments: bookingFormData.comments || 'Ticket booked by travel admin',
        ticketUrl:
          bookingFormData.ticketUrl || 'https://example.com/ticket.pdf',
        flightNumber: bookingFormData.flightNumber,
        airline: bookingFormData.airline,
        departureTime: bookingFormData.departureTime,
        arrivalTime: bookingFormData.arrivalTime,
        seatNumber: bookingFormData.seatNumber,
        bookingReference: bookingFormData.bookingReference,
      };

      await travelAdminService.bookTicket(
        selectedRequest.travelRequestId,
        bookingDetails
      );

      // Reload requests to reflect changes
      const updatedRequests = await travelAdminService.getAllRequests();
      setRequests(updatedRequests);

      setBookingFormOpen(false);
      setProcessingDialogOpen(false);
      setSuccessMessage(
        `✅ Ticket successfully booked for request #${selectedRequest.travelRequestId}!\n\n📧 Email notification sent to employee.\n📄 You can now download the ticket PDF.`
      );
      setLastBookedRequestId(selectedRequest.travelRequestId);
      setSuccessDialogOpen(true);

      // Reset form data
      setBookingFormData({
        comments: '',
        ticketUrl: '',
        flightNumber: '',
        airline: '',
        departureTime: '',
        arrivalTime: '',
        seatNumber: '',
        bookingReference: '',
      });
    } catch (error) {
      console.error('Failed to book ticket:', error);
      setProcessingDialogOpen(false);
      setSuccessMessage(
        `❌ Failed to book ticket: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      setSuccessDialogOpen(true);
    }
  };

  // Handle returning to employee
  const handleReturnToEmployee = async (requestId: number) => {
    try {
      setProcessingDialogOpen(true);
      const bookingDetails = {
        comments: 'Request returned to employee for more information',
        ticketUrl: '',
      };
      await travelAdminService.returnToEmployee(requestId, bookingDetails);

      // Reload requests to reflect changes
      const updatedRequests = await travelAdminService.getAllRequests();
      setRequests(updatedRequests);

      setRequestDetailsDialogOpen(false);
      setProcessingDialogOpen(false);
      setSuccessMessage(
        `✅ Request #${requestId} returned to employee successfully!\n\n📧 Email notification sent to employee.\n🔄 Employee can now update and resubmit the request.`
      );
      setSuccessDialogOpen(true);
    } catch (error) {
      console.error('Failed to return to employee:', error);
      setProcessingDialogOpen(false);
      setSuccessMessage(
        `❌ Failed to return request: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      setSuccessDialogOpen(true);
    }
  };

  // Handle closing request
  const handleCloseRequest = async (requestId: number) => {
    try {
      setProcessingDialogOpen(true);
      const bookingDetails = {
        comments: 'Request closed as completed',
        ticketUrl: '',
      };
      await travelAdminService.closeRequest(requestId, bookingDetails);

      // Reload requests to reflect changes
      const updatedRequests = await travelAdminService.getAllRequests();
      setRequests(updatedRequests);

      setRequestDetailsDialogOpen(false);
      setProcessingDialogOpen(false);
      setSuccessMessage(
        `✅ Request #${requestId} closed successfully!\n\n📧 Email notification sent to employee.\n✅ Request marked as completed.`
      );
      setSuccessDialogOpen(true);
    } catch (error) {
      console.error('Failed to close request:', error);
      setProcessingDialogOpen(false);
      setSuccessMessage(
        `❌ Failed to close request: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      setSuccessDialogOpen(true);
    }
  };

  // Handle downloading PDF
  const handleDownloadPdf = async (requestId: number) => {
    try {
      setProcessingDialogOpen(true);
      const result = await travelAdminService.generateTicketPdf(requestId);

      // Open Supabase download URL in new tab
      if (result.downloadUrl) {
        window.open(result.downloadUrl, '_blank');

        setProcessingDialogOpen(false);
        setSuccessMessage(
          `✅ PDF generated successfully!\n\n📄 Download URL opened in new tab.\n🔗 Supabase Storage: ${result.message}`
        );
        setSuccessDialogOpen(true);
      } else {
        throw new Error('No download URL received');
      }
    } catch (error) {
      console.error('Failed to download PDF:', error);
      setProcessingDialogOpen(false);
      setSuccessMessage(
        `❌ Failed to download PDF: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      setSuccessDialogOpen(true);
    }
  };

  // Filter requests based on current filters
  const filteredRequests = requests.filter(request => {
    const matchesStatus = !filters.status || request.status === filters.status;
    const matchesDepartment =
      !filters.department ||
      request.department?.departmentName === filters.department;
    const matchesSearch =
      !filters.searchTerm ||
      request.user?.firstName
        ?.toLowerCase()
        .includes(filters.searchTerm.toLowerCase()) ||
      request.user?.lastName
        ?.toLowerCase()
        .includes(filters.searchTerm.toLowerCase()) ||
      request.reasonForTravel
        ?.toLowerCase()
        .includes(filters.searchTerm.toLowerCase());

    return matchesStatus && matchesDepartment && matchesSearch;
  });

  // Calculate statistics
  const stats = {
    totalRequests: requests.length,
    pendingRequests: requests.filter(r => r.status === 'pending').length,
    approvedRequests: requests.filter(r => r.status === 'approved').length,
    completedRequests: requests.filter(r => r.status === 'completed').length,
    rejectedRequests: requests.filter(r => r.status === 'rejected').length,
    averageProcessingTime: 24, // Mock data
    completedToday: requests.filter(r => {
      const dateToShow = r.fromDate;
      const createdDate = dateToShow ? new Date(dateToShow) : new Date();
      const today = new Date();
      return createdDate >= today && r.status === 'completed';
    }).length,
    pendingBooking: requests.filter(r => r.status === 'approved').length,
  };

  // Get unique departments
  const departments = Array.from(
    new Set(requests.map(r => r.department?.departmentName).filter(Boolean))
  );

  // Get unique statuses
  const statuses = Array.from(new Set(requests.map(r => r.status)));

  if (loading) {
    return (
      <MainLayout title='Travel Admin Dashboard'>
        <Box sx={{ p: 3 }}>
          <Typography>Loading dashboard...</Typography>
        </Box>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout title='Travel Admin Dashboard'>
        <Box sx={{ p: 3 }}>
          <Alert severity='error'>{error}</Alert>
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout title='Travel Admin Dashboard'>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant='h4' gutterBottom>
            Travel Admin Dashboard
          </Typography>
          <Typography variant='body1' color='text.secondary'>
            Manage and monitor travel requests
          </Typography>
        </Box>

        {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2,
                alignItems: 'center',
              }}
            >
              <FormControl fullWidth size='small'>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  label='Status'
                  onChange={e =>
                    setFilters(prev => ({ ...prev, status: e.target.value }))
                  }
                >
                  <MenuItem value=''>All Statuses</MenuItem>
                  {statuses.map(status => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth size='small'>
                <InputLabel>Department</InputLabel>
                <Select
                  value={filters.department}
                  label='Department'
                  onChange={e =>
                    setFilters(prev => ({
                      ...prev,
                      department: e.target.value,
                    }))
                  }
                >
                  <MenuItem value=''>All Departments</MenuItem>
                  {departments.map(dept => (
                    <MenuItem key={dept} value={dept}>
                      {dept}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                size='small'
                label='Search'
                value={filters.searchTerm}
                onChange={e =>
                  setFilters(prev => ({ ...prev, searchTerm: e.target.value }))
                }
                InputProps={{
                  startAdornment: (
                    <Search sx={{ mr: 1, color: 'text.secondary' }} />
                  ),
                }}
              />
              <Button
                variant='outlined'
                onClick={() =>
                  setFilters({ status: '', department: '', searchTerm: '' })
                }
                fullWidth
              >
                Clear Filters
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Statistics Cards */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: '1fr 1fr',
              md: '1fr 1fr 1fr 1fr',
            },
            gap: 3,
            mb: 3,
          }}
        >
          <StatCard
            title='Total Requests'
            value={stats.totalRequests}
            icon={<AssignmentIcon />}
            iconColor='primary'
            info='Total travel requests in the system'
          />
          <StatCard
            title='Pending Requests'
            value={stats.pendingRequests}
            icon={<ScheduleIcon />}
            iconColor='warning'
            info='Requests awaiting processing'
          />
          <StatCard
            title='Completed Today'
            value={stats.completedToday}
            icon={<CheckCircleIcon />}
            iconColor='success'
            info='Requests completed today'
          />
          <StatCard
            title='Avg Processing Time'
            value={stats.averageProcessingTime}
            icon={<TimerIcon />}
            iconColor='info'
            format='time'
            info='Average time to process requests'
          />
        </Box>

        {/* Charts */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 3,
          }}
        >
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                Performance Metrics
              </Typography>
              <PerformanceMetricsChart
                metrics={[
                  {
                    name: 'Total Requests',
                    value: stats.totalRequests,
                    target: 100,
                    unit: 'requests',
                  },
                  {
                    name: 'Completed Requests',
                    value: stats.completedRequests,
                    target: stats.totalRequests,
                    unit: 'requests',
                  },
                  {
                    name: 'Pending Requests',
                    value: stats.pendingRequests,
                    target: stats.totalRequests,
                    unit: 'requests',
                  },
                  {
                    name: 'Average Processing Time',
                    value: stats.averageProcessingTime,
                    target: 24,
                    unit: 'hours',
                  },
                ]}
              />
            </CardContent>
          </Card>
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                Travel Analytics
              </Typography>
              <TravelAnalyticsChart data={[]} />
            </CardContent>
          </Card>
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                Time Series Analysis
              </Typography>
              <TimeSeriesChart data={[]} />
            </CardContent>
          </Card>
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                Department Analytics
              </Typography>
              <DepartmentAnalyticsChart data={[]} />
            </CardContent>
          </Card>
        </Box>

        {/* Request List */}
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant='h6' gutterBottom>
              Recent Requests ({filteredRequests.length})
            </Typography>
            <List>
              {filteredRequests.slice(0, 10).map(request => (
                <ListItem key={request.travelRequestId}>
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
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <Chip
                        label={request.status}
                        color={
                          request.status === 'Completed'
                            ? 'success'
                            : request.status === 'Pending'
                              ? 'warning'
                              : request.status === 'Rejected'
                                ? 'error'
                                : 'default'
                        }
                        size='small'
                      />
                      <Tooltip title='View Details'>
                        <IconButton
                          size='small'
                          onClick={() => {
                            setSelectedRequest(request);
                            setRequestDetailsDialogOpen(true);
                          }}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      {(request.status === 'Approved' ||
                        request.status === 'Pending') && (
                        <>
                          <Tooltip title='Book Ticket'>
                            <IconButton
                              size='small'
                              color='primary'
                              onClick={() =>
                                handleBookTicket(request.travelRequestId)
                              }
                            >
                              <Flight />
                            </IconButton>
                          </Tooltip>
                          {request.status === 'Approved' && (
                            <Tooltip title='Return to Employee'>
                              <IconButton
                                size='small'
                                color='warning'
                                onClick={() =>
                                  handleReturnToEmployee(
                                    request.travelRequestId
                                  )
                                }
                              >
                                <Reply />
                              </IconButton>
                            </Tooltip>
                          )}
                        </>
                      )}
                      {request.ticketUrl && (
                        <Tooltip title='Download Ticket PDF'>
                          <IconButton
                            size='small'
                            color='success'
                            onClick={() =>
                              handleDownloadPdf(request.travelRequestId)
                            }
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                      )}
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
                  {selectedRequest.user.firstName}{' '}
                  {selectedRequest.user.lastName}
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
                  <strong>Project:</strong>{' '}
                  {selectedRequest.project.projectName}
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
            {selectedRequest && selectedRequest.ticketUrl && (
              <Button
                variant='outlined'
                color='success'
                onClick={() =>
                  handleDownloadPdf(selectedRequest.travelRequestId)
                }
              >
                Download PDF
              </Button>
            )}
            {selectedRequest &&
              (selectedRequest.status === 'Approved' ||
                selectedRequest.status === 'Pending') && (
                <>
                  <Button
                    variant='contained'
                    color='primary'
                    onClick={() => {
                      setBookingFormOpen(true);
                    }}
                  >
                    Book Ticket
                  </Button>
                  {selectedRequest.status === 'Approved' && (
                    <>
                      <Button
                        variant='outlined'
                        color='warning'
                        onClick={() =>
                          handleReturnToEmployee(
                            selectedRequest.travelRequestId
                          )
                        }
                      >
                        Return to Employee
                      </Button>
                      <Button
                        variant='outlined'
                        color='success'
                        onClick={() =>
                          handleCloseRequest(selectedRequest.travelRequestId)
                        }
                      >
                        Close Request
                      </Button>
                    </>
                  )}
                </>
              )}
          </DialogActions>
        </Dialog>

        {/* Processing Dialog */}
        <Dialog
          open={processingDialogOpen}
          onClose={() => setProcessingDialogOpen(false)}
        >
          <DialogTitle>Processing Request</DialogTitle>
          <DialogContent>
            <Typography>
              Please wait while we process your request...
            </Typography>
          </DialogContent>
        </Dialog>

        {/* Success Dialog */}
        <Dialog
          open={successDialogOpen}
          onClose={() => setSuccessDialogOpen(false)}
          maxWidth='sm'
          fullWidth
        >
          <DialogTitle>Success</DialogTitle>
          <DialogContent>
            <Typography sx={{ whiteSpace: 'pre-line' }}>
              {successMessage}
            </Typography>
          </DialogContent>
          <DialogActions>
            {lastBookedRequestId && successMessage.includes('✅') && (
              <Button
                variant='contained'
                color='primary'
                onClick={() => {
                  handleDownloadPdf(lastBookedRequestId);
                  setSuccessDialogOpen(false);
                }}
              >
                Download PDF
              </Button>
            )}
            <Button onClick={() => setSuccessDialogOpen(false)}>OK</Button>
          </DialogActions>
        </Dialog>

        {/* Booking Form Dialog */}
        <Dialog
          open={bookingFormOpen}
          onClose={() => setBookingFormOpen(false)}
          maxWidth='md'
          fullWidth
        >
          <DialogTitle>
            Book Ticket for Request #{selectedRequest?.travelRequestId}
          </DialogTitle>
          <DialogContent>
            {selectedRequest && (
              <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant='h6' gutterBottom>
                  Request Details
                </Typography>
                <Typography variant='body2'>
                  <strong>Employee:</strong> {selectedRequest.user.firstName}{' '}
                  {selectedRequest.user.lastName}
                </Typography>
                <Typography variant='body2'>
                  <strong>From:</strong> {selectedRequest.fromLocation} (
                  {selectedRequest.fromDate})
                </Typography>
                <Typography variant='body2'>
                  <strong>To:</strong> {selectedRequest.toLocation} (
                  {selectedRequest.toDate})
                </Typography>
                <Typography variant='body2'>
                  <strong>Reason:</strong> {selectedRequest.reasonForTravel}
                </Typography>
              </Box>
            )}
            <Typography variant='h6' gutterBottom>
              Booking Details
            </Typography>
            <Box
              sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}
            >
              <TextField
                fullWidth
                label='Comments'
                multiline
                rows={2}
                value={bookingFormData.comments}
                onChange={e =>
                  setBookingFormData(prev => ({
                    ...prev,
                    comments: e.target.value,
                  }))
                }
              />
              <TextField
                fullWidth
                label='Ticket URL'
                value={bookingFormData.ticketUrl}
                onChange={e =>
                  setBookingFormData(prev => ({
                    ...prev,
                    ticketUrl: e.target.value,
                  }))
                }
              />
              <TextField
                fullWidth
                label='Flight Number'
                value={bookingFormData.flightNumber}
                onChange={e =>
                  setBookingFormData(prev => ({
                    ...prev,
                    flightNumber: e.target.value,
                  }))
                }
              />
              <TextField
                fullWidth
                label='Airline'
                value={bookingFormData.airline}
                onChange={e =>
                  setBookingFormData(prev => ({
                    ...prev,
                    airline: e.target.value,
                  }))
                }
              />
              <TextField
                fullWidth
                label='Departure Time'
                type='datetime-local'
                value={bookingFormData.departureTime}
                onChange={e =>
                  setBookingFormData(prev => ({
                    ...prev,
                    departureTime: e.target.value,
                  }))
                }
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                label='Arrival Time'
                type='datetime-local'
                value={bookingFormData.arrivalTime}
                onChange={e =>
                  setBookingFormData(prev => ({
                    ...prev,
                    arrivalTime: e.target.value,
                  }))
                }
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                label='Seat Number'
                value={bookingFormData.seatNumber}
                onChange={e =>
                  setBookingFormData(prev => ({
                    ...prev,
                    seatNumber: e.target.value,
                  }))
                }
              />
              <TextField
                fullWidth
                label='Booking Reference'
                value={bookingFormData.bookingReference}
                onChange={e =>
                  setBookingFormData(prev => ({
                    ...prev,
                    bookingReference: e.target.value,
                  }))
                }
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setBookingFormOpen(false)}>Cancel</Button>
            <Button
              variant='outlined'
              onClick={() => {
                // Save draft functionality - just close the form
                setBookingFormOpen(false);
                setSuccessMessage('📝 Booking details saved as draft.');
                setSuccessDialogOpen(true);
              }}
            >
              Save Draft
            </Button>
            <Button variant='contained' onClick={handleBookingFormSubmit}>
              Book Ticket
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </MainLayout>
  );
};

export default TravelAdminDashboard;
