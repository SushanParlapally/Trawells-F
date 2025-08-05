import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { travelAdminService } from '../../services/api/travelAdminService';

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

interface WorkflowManagementState {
  requests: TravelAdminRequestResponse[];
  loading: boolean;
  error: string | null;
  selectedRequest: TravelAdminRequestResponse | null;
  showActionDialog: boolean;
  actionType: 'booked' | 'completed' | 'returned' | null;
  comments: string;
  filters: {
    status: string;
    department: string;
    searchTerm: string;
  };
}

const WorkflowManagement: React.FC = () => {
  const [state, setState] = useState<WorkflowManagementState>({
    requests: [],
    loading: true,
    error: null,
    selectedRequest: null,
    showActionDialog: false,
    actionType: null,
    comments: '',
    filters: {
      status: '',
      department: '',
      searchTerm: '',
    },
  });

  useEffect(() => {
    loadTravelRequests();
  }, []);

  const loadTravelRequests = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const response = await travelAdminService.getAllRequests();
      setState(prev => ({
        ...prev,
        requests: response,
        loading: false,
      }));
    } catch {
      setState(prev => ({
        ...prev,
        error: 'Failed to load travel requests',
        loading: false,
      }));
    }
  };

  const handleActionClick = (
    request: TravelAdminRequestResponse,
    action: 'booked' | 'completed' | 'returned'
  ) => {
    setState(prev => ({
      ...prev,
      selectedRequest: request,
      actionType: action,
      showActionDialog: true,
      comments: '',
    }));
  };

  const handleActionSubmit = async () => {
    if (!state.selectedRequest || !state.actionType) return;

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const bookingDetails = {
        comments: state.comments,
        ticketUrl: '',
      };

      switch (state.actionType) {
        case 'booked':
          await travelAdminService.bookTicket(
            state.selectedRequest.travelRequestId,
            bookingDetails
          );
          break;
        case 'completed':
          await travelAdminService.closeRequest(
            state.selectedRequest.travelRequestId,
            bookingDetails
          );
          break;
        case 'returned':
          await travelAdminService.returnToEmployee(
            state.selectedRequest.travelRequestId,
            bookingDetails
          );
          break;
        default:
          throw new Error('Invalid action');
      }

      // Update the request in the list
      const updatedRequest = {
        ...state.selectedRequest,
        status:
          state.actionType === 'booked'
            ? 'Booked'
            : state.actionType === 'completed'
              ? 'Completed'
              : 'Returned to Employee',
        comments: state.comments,
      };

      setState(prev => ({
        ...prev,
        requests: prev.requests.map(req =>
          req.travelRequestId === state.selectedRequest!.travelRequestId
            ? updatedRequest
            : req
        ),
        loading: false,
        showActionDialog: false,
        selectedRequest: null,
        actionType: null,
        comments: '',
      }));
    } catch {
      setState(prev => ({
        ...prev,
        error: 'Failed to process action',
        loading: false,
      }));
    }
  };

  const handleCloseDialog = () => {
    setState(prev => ({
      ...prev,
      showActionDialog: false,
      selectedRequest: null,
      actionType: null,
      comments: '',
    }));
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

  const getActionLabel = (action: 'booked' | 'completed' | 'returned') => {
    switch (action) {
      case 'booked':
        return 'Mark as Booked';
      case 'completed':
        return 'Mark as Completed';
      case 'returned':
        return 'Return to Employee';
      default:
        return '';
    }
  };

  // Filter requests based on current filters
  const filteredRequests = state.requests.filter(request => {
    const matchesStatus =
      !state.filters.status || request.status === state.filters.status;
    const matchesDepartment =
      !state.filters.department ||
      request.department?.departmentName === state.filters.department;
    const matchesSearch =
      !state.filters.searchTerm ||
      request.user?.firstName
        ?.toLowerCase()
        .includes(state.filters.searchTerm.toLowerCase()) ||
      request.user?.lastName
        ?.toLowerCase()
        .includes(state.filters.searchTerm.toLowerCase()) ||
      request.reasonForTravel
        ?.toLowerCase()
        .includes(state.filters.searchTerm.toLowerCase());

    return matchesStatus && matchesDepartment && matchesSearch;
  });

  // Get unique departments and statuses
  const departments = Array.from(
    new Set(
      state.requests.map(r => r.department?.departmentName).filter(Boolean)
    )
  );
  const statuses = Array.from(new Set(state.requests.map(r => r.status)));

  if (state.loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant='h4' gutterBottom>
        Workflow Management
      </Typography>

      {state.error && (
        <Alert severity='error' sx={{ mb: 2 }}>
          {state.error}
        </Alert>
      )}

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
                value={state.filters.status}
                label='Status'
                onChange={e =>
                  setState(prev => ({
                    ...prev,
                    filters: { ...prev.filters, status: e.target.value },
                  }))
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
                value={state.filters.department}
                label='Department'
                onChange={e =>
                  setState(prev => ({
                    ...prev,
                    filters: { ...prev.filters, department: e.target.value },
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
              value={state.filters.searchTerm}
              onChange={e =>
                setState(prev => ({
                  ...prev,
                  filters: { ...prev.filters, searchTerm: e.target.value },
                }))
              }
            />
            <Button
              variant='outlined'
              startIcon={<RefreshIcon />}
              onClick={loadTravelRequests}
              fullWidth
            >
              Refresh
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Request List */}
      <Card>
        <CardContent>
          <Typography variant='h6' gutterBottom>
            Travel Requests ({filteredRequests.length})
          </Typography>
          <List>
            {filteredRequests.map(request => (
              <ListItem key={request.travelRequestId} divider>
                <ListItemIcon>
                  <AssignmentIcon color='primary' />
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
                  <Stack direction='row' spacing={1} alignItems='center'>
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
                        onClick={() =>
                          setState(prev => ({
                            ...prev,
                            selectedRequest: request,
                            showActionDialog: true,
                            actionType: null,
                          }))
                        }
                      >
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    {request.status === 'Approved' && (
                      <>
                        <Button
                          size='small'
                          variant='outlined'
                          startIcon={<CheckCircleIcon />}
                          onClick={() => handleActionClick(request, 'booked')}
                        >
                          Book
                        </Button>
                        <Button
                          size='small'
                          variant='outlined'
                          startIcon={<CancelIcon />}
                          onClick={() => handleActionClick(request, 'returned')}
                        >
                          Return
                        </Button>
                      </>
                    )}
                    {request.status === 'Booked' && (
                      <Button
                        size='small'
                        variant='outlined'
                        startIcon={<CheckCircleIcon />}
                        onClick={() => handleActionClick(request, 'completed')}
                      >
                        Complete
                      </Button>
                    )}
                  </Stack>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog
        open={state.showActionDialog}
        onClose={handleCloseDialog}
        maxWidth='md'
        fullWidth
      >
        <DialogTitle>
          {state.actionType
            ? getActionLabel(state.actionType)
            : 'Request Details'}
        </DialogTitle>
        <DialogContent>
          {state.selectedRequest && (
            <Box>
              <Typography variant='h6' gutterBottom>
                {state.selectedRequest.user.firstName}{' '}
                {state.selectedRequest.user.lastName}
              </Typography>
              <Typography variant='body2' color='text.secondary' gutterBottom>
                {state.selectedRequest.user.email}
              </Typography>
              <Typography variant='body1' sx={{ mt: 2 }}>
                <strong>Reason:</strong> {state.selectedRequest.reasonForTravel}
              </Typography>
              <Typography variant='body2' sx={{ mt: 1 }}>
                <strong>From:</strong> {state.selectedRequest.fromLocation} (
                {state.selectedRequest.fromDate})
              </Typography>
              <Typography variant='body2' sx={{ mt: 1 }}>
                <strong>To:</strong> {state.selectedRequest.toLocation} (
                {state.selectedRequest.toDate})
              </Typography>
              <Typography variant='body2' sx={{ mt: 1 }}>
                <strong>Department:</strong>{' '}
                {state.selectedRequest.department.departmentName}
              </Typography>
              <Typography variant='body2' sx={{ mt: 1 }}>
                <strong>Project:</strong>{' '}
                {state.selectedRequest.project.projectName}
              </Typography>
              <Typography variant='body2' sx={{ mt: 1 }}>
                <strong>Status:</strong> {state.selectedRequest.status}
              </Typography>
              {state.selectedRequest.comments && (
                <Typography variant='body2' sx={{ mt: 1 }}>
                  <strong>Comments:</strong> {state.selectedRequest.comments}
                </Typography>
              )}

              {state.actionType && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant='h6' gutterBottom>
                    Action Comments
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label='Comments'
                    value={state.comments}
                    onChange={e =>
                      setState(prev => ({ ...prev, comments: e.target.value }))
                    }
                    placeholder='Enter comments about this action...'
                    required
                  />
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
          {state.actionType && (
            <Button
              onClick={handleActionSubmit}
              variant='contained'
              disabled={!state.comments.trim() || state.loading}
              startIcon={state.loading ? <CircularProgress size={20} /> : null}
            >
              {state.loading ? 'Processing...' : 'Submit Action'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WorkflowManagement;
