import React, { useState, useCallback } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Alert,
  Box,
  Typography,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Cancel as CancelIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import type { TravelRequest, RequestStatus } from '../../types';

interface TravelRequestCancellationProps {
  request: TravelRequest;
  onCancel: (cancelledRequest: TravelRequest) => void;
  onError: (error: string) => void;
}

interface CancellationState {
  dialogOpen: boolean;
  loading: boolean;
  reason: string;
  error: string | null;
}

const CANCELLABLE_STATUSES: RequestStatus[] = [
  'Pending',
  'Approved',
  'Returned to Employee',
];

const getCancellationWarnings = (status: RequestStatus): string[] => {
  switch (status) {
    case 'Pending':
      return [
        'Your manager will be notified of the cancellation',
        'You can create a new request anytime',
      ];
    case 'Approved':
      return [
        'The travel admin will be notified of the cancellation',
        'Any booking process will be stopped',
        'You may need manager approval again for a new request',
      ];
    case 'Returned to Employee':
      return [
        'The request will be permanently cancelled',
        'You can create a new request if needed',
      ];
    default:
      return [];
  }
};

const getCancellationImpact = (
  status: RequestStatus
): {
  severity: 'info' | 'warning' | 'error';
  message: string;
} => {
  switch (status) {
    case 'Pending':
      return {
        severity: 'info',
        message:
          'This request is still pending approval. Cancellation will be processed immediately.',
      };
    case 'Approved':
      return {
        severity: 'warning',
        message:
          'This request has been approved and is with the travel admin. Cancelling may affect booking arrangements.',
      };
    case 'Returned to Employee':
      return {
        severity: 'info',
        message:
          'This request was returned for modifications. Cancelling will close it permanently.',
      };
    default:
      return {
        severity: 'error',
        message: 'This request cannot be cancelled in its current status.',
      };
  }
};

export const TravelRequestCancellation: React.FC<
  TravelRequestCancellationProps
> = ({ request, onCancel, onError }) => {
  const [state, setState] = useState<CancellationState>({
    dialogOpen: false,
    loading: false,
    reason: '',
    error: null,
  });

  const isCancellable = CANCELLABLE_STATUSES.includes(
    request.status as RequestStatus
  );
  const warnings = getCancellationWarnings(request.status as RequestStatus);
  const impact = getCancellationImpact(request.status as RequestStatus);

  const handleOpenDialog = useCallback(() => {
    setState(prev => ({ ...prev, dialogOpen: true, reason: '', error: null }));
  }, []);

  const handleCloseDialog = useCallback(() => {
    setState(prev => ({ ...prev, dialogOpen: false, reason: '', error: null }));
  }, []);

  const handleReasonChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setState(prev => ({ ...prev, reason: event.target.value, error: null }));
    },
    []
  );

  const handleSubmit = useCallback(async () => {
    if (state.reason.length < 10) {
      setState(prev => ({
        ...prev,
        error: 'Please provide a detailed reason',
      }));
      return;
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update the request status
      const cancelledRequest: TravelRequest = {
        ...request,
        status: 'Cancelled',
        comments: state.reason,
      };

      onCancel(cancelledRequest);
      setState(prev => ({ ...prev, dialogOpen: false, loading: false }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to cancel request';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      onError(errorMessage);
    }
  }, [state.reason, onError]);

  if (!isCancellable) {
    return null;
  }

  return (
    <>
      <Button
        variant='outlined'
        color='error'
        startIcon={<CancelIcon />}
        onClick={handleOpenDialog}
        size='small'
      >
        Cancel Request
      </Button>

      <Dialog
        open={state.dialogOpen}
        onClose={handleCloseDialog}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>
          <Box display='flex' alignItems='center' gap={1}>
            <WarningIcon color='warning' />
            <Typography variant='h6'>Cancel Travel Request</Typography>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Box mb={3}>
            <Typography variant='body1' gutterBottom>
              Are you sure you want to cancel this travel request?
            </Typography>

            <Box display='flex' alignItems='center' gap={2} mt={2} mb={2}>
              <Typography variant='body2' color='text.secondary'>
                Request ID:
              </Typography>
              <Chip label={`#${request.travelRequestId}`} size='small' />

              <Typography variant='body2' color='text.secondary'>
                Status:
              </Typography>
              <Chip
                label={request.status}
                size='small'
                color={request.status === 'Approved' ? 'success' : 'warning'}
              />
            </Box>

            <Typography variant='body2' color='text.secondary'>
              Destination: {request.fromLocation} → {request.toLocation}
            </Typography>
          </Box>

          <Alert severity={impact.severity} sx={{ mb: 3 }}>
            {impact.message}
          </Alert>

          {warnings.length > 0 && (
            <Box mb={3}>
              <Typography variant='subtitle2' gutterBottom>
                Please note:
              </Typography>
              <List dense>
                {warnings.map((warning, index) => (
                  <ListItem key={index} sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <InfoIcon fontSize='small' color='info' />
                    </ListItemIcon>
                    <ListItemText
                      primary={warning}
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          <Divider sx={{ my: 2 }} />

          <TextField
            fullWidth
            multiline
            rows={4}
            label='Reason for Cancellation'
            placeholder='Please provide a detailed reason for cancelling this travel request...'
            value={state.reason}
            onChange={handleReasonChange}
            error={!!state.error}
            helperText={state.error || 'Minimum 10 characters required'}
            disabled={state.loading}
            required
          />

          {state.error && (
            <Alert severity='error' sx={{ mt: 2 }}>
              {state.error}
            </Alert>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={state.loading}>
            Keep Request
          </Button>
          <Button
            onClick={handleSubmit}
            color='error'
            variant='contained'
            disabled={state.loading || !state.reason.trim()}
            startIcon={state.loading ? undefined : <CancelIcon />}
          >
            {state.loading ? 'Cancelling...' : 'Cancel Request'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

// Hook for cancellation functionality
export const useTravelRequestCancellation = () => {
  const [cancellationState, setCancellationState] = useState<{
    loading: boolean;
    error: string | null;
    success: boolean;
  }>({
    loading: false,
    error: null,
    success: false,
  });

  const cancelRequest = useCallback(async () => {
    setCancellationState({ loading: true, error: null, success: false });

    try {
      // Cancel functionality is not available in this system
      setCancellationState({
        loading: false,
        error:
          'Cancel functionality is not available. You can track your request status in the dashboard.',
        success: false,
      });
      throw new Error('Cancel functionality is not available');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to cancel request';
      setCancellationState({
        loading: false,
        error: errorMessage,
        success: false,
      });
      throw error;
    }
  }, []);

  const resetState = useCallback(() => {
    setCancellationState({ loading: false, error: null, success: false });
  }, []);

  return { cancellationState, cancelRequest, resetState };
};

export default TravelRequestCancellation;
