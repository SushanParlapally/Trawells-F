import React, { useState, useCallback } from 'react';
import {
  Typography,
  Paper,
  Button,
  Stack,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Send as SendIcon,
  Cancel as CancelIcon,
  CheckCircle as SuccessIcon,
} from '@mui/icons-material';
import { useAppSelector } from '../../hooks/redux';
import { selectUser } from '../../store/slices/authSlice';
import { travelRequestService } from '../../services/api/travelRequestService';
import type { TravelRequestCreateData, TravelRequest } from '../../types';

interface TravelRequestSubmissionProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface SubmissionState {
  loading: boolean;
  error: string | null;
  status: 'idle' | 'submitting' | 'success' | 'error';
}

interface FormData {
  project: { projectId: number };
  department: { departmentId: number };
  reasonForTravel: string;
  fromDate: string;
  toDate: string;
  fromLocation: string;
  toLocation: string;
}

export const TravelRequestSubmission: React.FC<
  TravelRequestSubmissionProps
> = ({ onSuccess, onCancel }) => {
  const [state, setState] = useState<SubmissionState>({
    loading: false,
    error: null,
    status: 'idle',
  });
  const user = useAppSelector(selectUser);

  const submitTravelRequest = useCallback(
    async (formData: FormData): Promise<TravelRequest> => {
      if (!user?.userId) {
        throw new Error('User not authenticated');
      }

      const travelRequestData: TravelRequestCreateData = {
        userId: user.userId,
        projectId: formData.project.projectId,
        departmentId: formData.department.departmentId,
        reasonForTravel: formData.reasonForTravel,
        fromDate: new Date(formData.fromDate).toISOString(),
        toDate: new Date(formData.toDate).toISOString(),
        fromLocation: formData.fromLocation,
        toLocation: formData.toLocation,
        createdOn: new Date().toISOString(),
        isActive: true,
      };

      return await travelRequestService.createTravelRequest(travelRequestData);
    },
    [user?.userId]
  );

  const handleSubmit = useCallback(
    async (formData: FormData) => {
      try {
        setState(prev => ({
          ...prev,
          loading: true,
          error: null,
          status: 'submitting',
        }));

        await submitTravelRequest(formData);

        setState(prev => ({
          ...prev,
          loading: false,
          status: 'success',
        }));
        onSuccess?.();
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to submit request';
        setState(prev => ({
          ...prev,
          loading: false,
          error: errorMessage,
          status: 'error',
        }));
      }
    },
    [submitTravelRequest, onSuccess]
  );

  const handleCancel = () => {
    onCancel?.();
  };

  const SuccessAlert: React.FC<{
    requestId?: string;
    onClose: () => void;
  }> = ({ requestId, onClose }) => (
    <Alert
      onClose={onClose}
      severity='success'
      variant='filled'
      icon={<SuccessIcon />}
      sx={{ width: '100%' }}
    >
      <Typography variant='body2'>
        Travel request {requestId} submitted successfully! Your manager will be
        notified for approval.
      </Typography>
    </Alert>
  );

  const ErrorAlert: React.FC<{
    error: string;
    onClose: () => void;
    onRetry?: () => void;
  }> = ({ error, onClose, onRetry }) => (
    <Alert
      onClose={onClose}
      severity='error'
      variant='filled'
      action={
        onRetry && (
          <Button color='inherit' size='small' onClick={onRetry}>
            RETRY
          </Button>
        )
      }
      sx={{ width: '100%' }}
    >
      <Typography variant='body2'>{error}</Typography>
    </Alert>
  );

  return (
    <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant='h6' gutterBottom>
        Submit Travel Request
      </Typography>

      {state.status === 'idle' && (
        <Stack spacing={2}>
          <Typography>
            Please review your travel request details before submitting.
          </Typography>
          <Stack direction='row' spacing={2}>
            <Button
              variant='contained'
              onClick={() => handleSubmit({} as FormData)}
              startIcon={<SendIcon />}
              disabled={state.loading}
            >
              {state.loading ? (
                <CircularProgress size={24} />
              ) : (
                'Submit Request'
              )}
            </Button>
            <Button
              variant='outlined'
              onClick={handleCancel}
              startIcon={<CancelIcon />}
            >
              Cancel
            </Button>
          </Stack>
        </Stack>
      )}

      {state.status === 'submitting' && (
        <Stack spacing={2} alignItems='center'>
          <Typography>Submitting your request...</Typography>
          <CircularProgress />
        </Stack>
      )}

      {state.status === 'success' && (
        <SuccessAlert
          requestId='123'
          onClose={() => setState(prev => ({ ...prev, status: 'idle' }))}
        />
      )}

      {state.status === 'error' && state.error && (
        <ErrorAlert
          error={state.error}
          onClose={() => setState(prev => ({ ...prev, status: 'idle' }))}
          onRetry={() => handleSubmit({} as FormData)}
        />
      )}
    </Paper>
  );
};

export default TravelRequestSubmission;
