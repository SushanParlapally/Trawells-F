import React, { useState, useCallback } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Alert,
  Typography,
  Chip,
  Divider,
  Stack,
} from '@mui/material';
import {
  Edit as EditIcon,
  Cancel as CancelIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { TravelRequestForm } from './TravelRequestForm';
import { TravelRequestStatusTracker } from './TravelRequestStatusTracker';
import type { TravelRequest, RequestStatus } from '../../types';

interface TravelRequestEditorProps {
  request: TravelRequest;
  onUpdate: (updatedRequest: TravelRequest) => void;
  onError: (error: string) => void;
}

interface EditState {
  isEditing: boolean;
  loading: boolean;
  error: string | null;
}

const EDITABLE_STATUSES: RequestStatus[] = ['Pending', 'Returned to Employee'];

export const TravelRequestEditor: React.FC<TravelRequestEditorProps> = ({
  request,
  onError,
}) => {
  const [editState, setEditState] = useState<EditState>({
    isEditing: false,
    loading: false,
    error: null,
  });
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const isEditable = EDITABLE_STATUSES.includes(
    request.status as RequestStatus
  );

  const handleStartEdit = useCallback(() => {
    setEditState(prev => ({ ...prev, isEditing: true, error: null }));
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditState(prev => ({ ...prev, isEditing: false, error: null }));
  }, []);

  const handleSaveEdit = useCallback(async () => {
    setEditState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Edit functionality is not available in this system
      // Users can create new requests instead
      setEditState({ isEditing: false, loading: false, error: null });
      onError(
        'Edit functionality is not available. Please create a new request if needed.'
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to update travel request';
      setEditState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      onError(errorMessage);
    }
  }, [onError]);

  const convertToFormData = (
    request: TravelRequest
  ): Partial<TravelRequest> => {
    return {
      reasonForTravel: request.reasonForTravel,
      project: request.project,
      fromDate: request.fromDate,
      toDate: request.toDate,
      fromLocation: request.fromLocation,
      toLocation: request.toLocation,
    };
  };

  const getStatusMessage = () => {
    switch (request.status) {
      case 'Pending':
        return "This request is pending approval. You can edit it until it's processed by your manager.";
      case 'Returned to Employee':
        return 'This request was returned for modifications. Please update the required information and resubmit.';
      case 'Approved':
        return 'This request has been approved and is now with the travel admin for booking.';
      case 'Booked':
        return 'Travel arrangements have been booked for this request.';
      case 'Completed':
        return 'This travel request has been completed.';
      case 'Rejected':
        return 'This request was rejected by your manager.';
      default:
        return 'Request status unknown.';
    }
  };

  if (editState.isEditing) {
    return (
      <Box>
        <Box
          display='flex'
          alignItems='center'
          justifyContent='space-between'
          mb={3}
        >
          <Typography variant='h5'>
            Edit Travel Request #{request.travelRequestId}
          </Typography>
          <Chip
            label={
              request.status === 'Returned to Employee'
                ? 'Resubmitting'
                : 'Editing'
            }
            color='info'
            icon={<EditIcon />}
          />
        </Box>

        {editState.error && (
          <Alert severity='error' sx={{ mb: 3 }}>
            {editState.error}
          </Alert>
        )}

        {request.status === 'Returned to Employee' && request.comments && (
          <Alert severity='info' sx={{ mb: 3 }}>
            <Typography variant='subtitle2' gutterBottom>
              Manager/Admin Comments:
            </Typography>
            <Typography variant='body2'>{request.comments}</Typography>
          </Alert>
        )}

        <TravelRequestForm
          initialData={convertToFormData(request)}
          onSubmit={handleSaveEdit}
          loading={editState.loading}
        />

        <Box display='flex' gap={2} mt={3}>
          <Button
            variant='outlined'
            onClick={handleCancelEdit}
            disabled={editState.loading}
            startIcon={<CancelIcon />}
          >
            Cancel
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <Box
        display='flex'
        alignItems='center'
        justifyContent='space-between'
        mb={3}
      >
        <Typography variant='h5'>
          Travel Request #{request.travelRequestId}
        </Typography>
        <Stack direction='row' spacing={2}>
          <Button
            variant='outlined'
            onClick={() => setViewDialogOpen(true)}
            startIcon={<ViewIcon />}
          >
            View Details
          </Button>
          {isEditable && (
            <Button
              variant='contained'
              onClick={handleStartEdit}
              startIcon={<EditIcon />}
              color={
                request.status === 'Returned to Employee'
                  ? 'warning'
                  : 'primary'
              }
            >
              {request.status === 'Returned to Employee' ? 'Resubmit' : 'Edit'}
            </Button>
          )}
        </Stack>
      </Box>

      <Alert severity='info' sx={{ mb: 3 }}>
        {getStatusMessage()}
      </Alert>

      <TravelRequestStatusTracker request={request} showTimeline />

      {/* View Details Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth='md'
        fullWidth
      >
        <DialogTitle>
          Travel Request Details #{request.travelRequestId}
        </DialogTitle>
        <DialogContent>
          <Box mb={3}>
            <TravelRequestStatusTracker request={request} compact />
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box display='grid' gridTemplateColumns='1fr 1fr' gap={2} mb={2}>
            <Box>
              <Typography variant='subtitle2' color='text.secondary'>
                Destination
              </Typography>
              <Typography variant='body1'>
                {request.fromLocation} → {request.toLocation}
              </Typography>
            </Box>
            <Box>
              <Typography variant='subtitle2' color='text.secondary'>
                Travel Dates
              </Typography>
              <Typography variant='body1'>
                {new Date(request.fromDate).toLocaleDateString()} -{' '}
                {new Date(request.toDate).toLocaleDateString()}
              </Typography>
            </Box>
            <Box>
              <Typography variant='subtitle2' color='text.secondary'>
                Created On
              </Typography>
              <Typography variant='body1'>
                {request.createdOn
                  ? new Date(request.createdOn).toLocaleDateString()
                  : new Date(request.fromDate).toLocaleDateString()}
              </Typography>
            </Box>
            <Box>
              <Typography variant='subtitle2' color='text.secondary'>
                Status
              </Typography>
              <Typography variant='body1'>{request.status}</Typography>
            </Box>
          </Box>

          <Box mb={2}>
            <Typography variant='subtitle2' color='text.secondary'>
              Reason for Travel
            </Typography>
            <Typography variant='body1'>{request.reasonForTravel}</Typography>
          </Box>

          {request.comments && (
            <Box>
              <Typography variant='subtitle2' color='text.secondary'>
                Comments
              </Typography>
              <Typography variant='body1'>{request.comments}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          {isEditable && (
            <Button
              variant='contained'
              onClick={() => {
                setViewDialogOpen(false);
                handleStartEdit();
              }}
              startIcon={<EditIcon />}
            >
              {request.status === 'Returned to Employee' ? 'Resubmit' : 'Edit'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TravelRequestEditor;
