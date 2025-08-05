import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  Stack,
  Divider,
} from '@mui/material';
import { Refresh as RefreshIcon, Add as AddIcon } from '@mui/icons-material';
import { TravelRequestForm } from './TravelRequestForm';
import { TravelRequestEditor } from './TravelRequestEditor';
import { TravelRequestCancellation } from './TravelRequestCancellation';
import { TravelRequestStatusTracker } from './TravelRequestStatusTracker';
import type { TravelRequest } from '../../types';

interface TravelRequestManagerProps {
  requestId?: number; // If provided, will load and manage specific request
  mode?: 'create' | 'edit' | 'view';
  onRequestCreated?: (request: TravelRequest) => void;
  onRequestUpdated?: (request: TravelRequest) => void;
  onRequestCancelled?: (request: TravelRequest) => void;
}

interface ManagerState {
  loading: boolean;
  error: string | null;
  request: TravelRequest | null;
  mode: 'create' | 'edit' | 'view';
}

export const TravelRequestManager: React.FC<TravelRequestManagerProps> = ({
  requestId,
  mode: initialMode = 'create',
  onRequestCreated,
  onRequestUpdated,
  onRequestCancelled,
}) => {
  const [state, setState] = useState<ManagerState>({
    loading: false,
    error: null,
    request: null,
    mode: initialMode,
  });

  // Load request data if requestId is provided
  const loadRequest = useCallback(async () => {
    if (!requestId) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Individual request loading is not available in this system
      // Users can view their requests in the dashboard instead
      setState(prev => ({
        ...prev,
        loading: false,
        error:
          'Individual request loading is not available. Please view your requests in the dashboard.',
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to load travel request';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
    }
  }, [requestId]);

  useEffect(() => {
    loadRequest();
  }, [loadRequest]);

  function handleSubmissionSuccess(request: TravelRequest) {
    setState(prev => ({ ...prev, request, mode: 'view' }));
    onRequestCreated?.(request);
  }

  function handleError(error: string) {
    setState(prev => ({ ...prev, error, loading: false }));
  }

  const handleRequestUpdate = useCallback(
    (updatedRequest: TravelRequest) => {
      setState(prev => ({ ...prev, request: updatedRequest, mode: 'view' }));
      onRequestUpdated?.(updatedRequest);
    },
    [onRequestUpdated]
  );

  const handleRequestCancellation = useCallback(
    (cancelledRequest: TravelRequest) => {
      setState(prev => ({ ...prev, request: cancelledRequest }));
      onRequestCancelled?.(cancelledRequest);
    },
    [onRequestCancelled]
  );

  const handleCreateNew = useCallback(() => {
    setState(prev => ({ ...prev, request: null, mode: 'create', error: null }));
  }, []);

  const handleRefresh = useCallback(() => {
    if (requestId) {
      loadRequest();
    }
  }, [requestId, loadRequest]);

  if (state.loading) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography>Loading travel request...</Typography>
      </Paper>
    );
  }

  if (state.error) {
    return (
      <Paper sx={{ p: 3 }}>
        <Alert severity='error' sx={{ mb: 2 }}>
          {state.error}
        </Alert>
        <Button
          variant='outlined'
          onClick={handleRefresh}
          startIcon={<RefreshIcon />}
        >
          Retry
        </Button>
      </Paper>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box
        display='flex'
        justifyContent='space-between'
        alignItems='center'
        mb={3}
      >
        <Typography variant='h4'>
          {state.mode === 'create'
            ? 'New Travel Request'
            : state.mode === 'edit'
              ? 'Edit Travel Request'
              : 'Travel Request Details'}
        </Typography>
        <Stack direction='row' spacing={2}>
          {state.request && (
            <TravelRequestCancellation
              request={state.request}
              onCancel={handleRequestCancellation}
              onError={handleError}
            />
          )}
          {state.mode !== 'create' && (
            <Button
              variant='outlined'
              onClick={handleCreateNew}
              startIcon={<AddIcon />}
            >
              New Request
            </Button>
          )}
          {requestId && (
            <Button
              variant='outlined'
              onClick={handleRefresh}
              startIcon={<RefreshIcon />}
            >
              Refresh
            </Button>
          )}
        </Stack>
      </Box>

      {/* Main Content */}
      {state.mode === 'create' ? (
        <Paper sx={{ p: 3 }}>
          <TravelRequestForm
            onSubmit={formData => {
              // Convert form data to TravelRequest and call success handler
              const mockRequest: TravelRequest = {
                travelRequestId: Date.now(), // Temporary ID
                user: {
                  userId: 1,
                  firstName: 'User',
                  lastName: 'Name',
                  address: '123 Main St',
                  email: 'user@company.com',
                  mobileNum: '1234567890',
                  password: 'password',
                  roleId: 1,
                  departmentId: formData.department.departmentId,
                  createdBy: 1,
                  createdOn: new Date().toISOString(),
                  isActive: true,
                  department: {
                    departmentId: formData.department.departmentId,
                    departmentName: formData.department.departmentName,
                    createdBy: 1,
                    createdOn: new Date().toISOString(),
                    isActive: true,
                  },
                },
                project: {
                  projectId: formData.project.projectId,
                  projectName: formData.project.projectName,
                  createdBy: 1,
                  createdOn: new Date().toISOString(),
                  isActive: true,
                },
                reasonForTravel: formData.reasonForTravel,
                fromDate: formData.fromDate,
                toDate: formData.toDate,
                fromLocation: formData.fromLocation,
                toLocation: formData.toLocation,
                status: 'Pending',
                comments: undefined,
              };
              handleSubmissionSuccess(mockRequest);
            }}
          />
        </Paper>
      ) : state.request ? (
        <Box>
          {state.mode === 'view' && (
            <Box mb={3}>
              <TravelRequestStatusTracker
                request={state.request}
                showTimeline
              />
            </Box>
          )}
          <Divider sx={{ my: 3 }} />
          <TravelRequestEditor
            request={state.request}
            onUpdate={handleRequestUpdate}
            onError={handleError}
          />
        </Box>
      ) : (
        <Paper sx={{ p: 3 }}>
          <Alert severity='info'>
            No travel request found. Please create a new one.
          </Alert>
        </Paper>
      )}

      {/* Notifications */}
      {/* The following components were removed as per the edit hint:
          SubmissionSuccessNotification, SubmissionErrorNotification */}
    </Box>
  );
};

export default TravelRequestManager;
