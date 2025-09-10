import React from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Typography,
  Chip,
  Paper,
  Card,
  CardContent,
  LinearProgress,
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from '@mui/lab';
import {
  Pending as PendingIcon,
  CheckCircle as ApprovedIcon,
  Cancel as DisapprovedIcon,
  Refresh as ReturnedIcon,
  Flight as BookedIcon,
  Done as CompletedIcon,
} from '@mui/icons-material';
import type { TravelRequest, RequestStatus } from '../../types';

interface TravelRequestStatusTrackerProps {
  request: TravelRequest;
  showTimeline?: boolean;
  compact?: boolean;
}

interface StatusStep {
  status: RequestStatus;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: 'primary' | 'success' | 'error' | 'warning' | 'info';
  completed: boolean;
  active: boolean;
}

const statusConfig: Record<
  RequestStatus,
  {
    label: string;
    description: string;
    icon: React.ReactNode;
    color: 'primary' | 'success' | 'error' | 'warning' | 'info';
    chipColor:
      | 'default'
      | 'primary'
      | 'secondary'
      | 'error'
      | 'info'
      | 'success'
      | 'warning';
  }
> = {
  Pending: {
    label: 'Pending Approval',
    description: 'Waiting for manager approval',
    icon: <PendingIcon />,
    color: 'warning',
    chipColor: 'warning',
  },
  Approved: {
    label: 'Approved',
    description: 'Approved by manager, sent to travel admin',
    icon: <ApprovedIcon />,
    color: 'success',
    chipColor: 'success',
  },
  Rejected: {
    label: 'Rejected',
    description: 'Request was rejected by manager',
    icon: <DisapprovedIcon />,
    color: 'error',
    chipColor: 'error',
  },
  'Returned to Employee': {
    label: 'Returned',
    description: 'Returned for modifications',
    icon: <ReturnedIcon />,
    color: 'info',
    chipColor: 'info',
  },
  Booked: {
    label: 'Booked',
    description: 'Travel arrangements have been booked',
    icon: <BookedIcon />,
    color: 'primary',
    chipColor: 'primary',
  },
  Completed: {
    label: 'Completed',
    description: 'Travel request completed successfully',
    icon: <CompletedIcon />,
    color: 'success',
    chipColor: 'success',
  },
};

const getStatusSteps = (currentStatus: RequestStatus): StatusStep[] => {
  const statusOrder: RequestStatus[] = [
    'Pending',
    'Approved',
    'Booked',
    'Completed',
  ];
  const currentIndex = statusOrder.indexOf(currentStatus);

  // Handle special cases
  if (
    currentStatus === 'Rejected' ||
    currentStatus === 'Returned to Employee'
  ) {
    return statusOrder
      .map(status => {
        const config = statusConfig[status];
        return {
          status,
          label: config.label,
          description: config.description,
          icon: config.icon,
          color: config.color,
          completed: false,
          active: false,
        };
      })
      .concat([
        {
          status: currentStatus,
          label: statusConfig[currentStatus].label,
          description: statusConfig[currentStatus].description,
          icon: statusConfig[currentStatus].icon,
          color: statusConfig[currentStatus].color,
          completed: true,
          active: true,
        },
      ]);
  }

  return statusOrder.map((status, index) => {
    const config = statusConfig[status];
    return {
      status,
      label: config.label,
      description: config.description,
      icon: config.icon,
      color: config.color,
      completed: index < currentIndex,
      active: index === currentIndex,
    };
  });
};

const getProgressPercentage = (status: RequestStatus): number => {
  const progressMap: Record<RequestStatus, number> = {
    Pending: 25,
    Approved: 50,
    Booked: 75,
    Completed: 100,
    Rejected: 0,
    'Returned to Employee': 10,
  };

  return progressMap[status] || 0;
};

export const TravelRequestStatusTracker: React.FC<
  TravelRequestStatusTrackerProps
> = ({ request, showTimeline = false, compact = false }) => {
  const steps = getStatusSteps(request.status as RequestStatus);
  const currentConfig = statusConfig[request.status as RequestStatus];
  const progress = getProgressPercentage(request.status as RequestStatus);

  if (compact) {
    return (
      <Card variant='outlined'>
        <CardContent sx={{ py: 2 }}>
          <Box
            display='flex'
            alignItems='center'
            justifyContent='space-between'
            mb={1}
          >
            <Typography variant='subtitle2' color='text.secondary'>
              Request #{request.travelRequestId}
            </Typography>
            <Chip
              label={currentConfig.label}
              color={currentConfig.chipColor}
              size='small'
              icon={currentConfig.icon as React.ReactElement}
            />
          </Box>
          <LinearProgress
            variant='determinate'
            value={progress}
            color={currentConfig.color}
            sx={{ height: 6, borderRadius: 3 }}
          />
          <Typography
            variant='caption'
            color='text.secondary'
            sx={{ mt: 1, display: 'block' }}
          >
            {currentConfig.description}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (showTimeline) {
    return (
      <Paper elevation={1} sx={{ p: 3 }}>
        <Typography variant='h6' gutterBottom>
          Request Status Timeline
        </Typography>
        <Timeline>
          {steps.map((step, index) => (
            <TimelineItem key={step.status}>
              <TimelineOppositeContent color='text.secondary' variant='body2'>
                {step.active && new Date(request.fromDate).toLocaleDateString()}
                {step.completed &&
                  index === 0 &&
                  (request.createdOn
                    ? new Date(request.createdOn).toLocaleDateString()
                    : new Date(request.fromDate).toLocaleDateString())}
              </TimelineOppositeContent>
              <TimelineSeparator>
                <TimelineDot
                  color={
                    step.active
                      ? step.color
                      : step.completed
                        ? 'success'
                        : 'grey'
                  }
                  variant={
                    step.active
                      ? 'filled'
                      : step.completed
                        ? 'filled'
                        : 'outlined'
                  }
                >
                  {step.icon}
                </TimelineDot>
                {index < steps.length - 1 && <TimelineConnector />}
              </TimelineSeparator>
              <TimelineContent>
                <Typography variant='h6' component='span'>
                  {step.label}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  {step.description}
                </Typography>
                {step.active && request.comments && (
                  <Typography
                    variant='body2'
                    sx={{ mt: 1, fontStyle: 'italic' }}
                  >
                    Comment: {request.comments}
                  </Typography>
                )}
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      </Paper>
    );
  }

  return (
    <Paper elevation={1} sx={{ p: 3 }}>
      <Box
        display='flex'
        alignItems='center'
        justifyContent='space-between'
        mb={3}
      >
        <Typography variant='h6'>Request Status</Typography>
        <Chip
          label={currentConfig.label}
          color={currentConfig.chipColor}
          icon={currentConfig.icon as React.ReactElement}
        />
      </Box>

      <Box mb={3}>
        <Box
          display='flex'
          justifyContent='space-between'
          alignItems='center'
          mb={1}
        >
          <Typography variant='body2' color='text.secondary'>
            Progress
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            {progress}%
          </Typography>
        </Box>
        <LinearProgress
          variant='determinate'
          value={progress}
          color={currentConfig.color}
          sx={{ height: 8, borderRadius: 4 }}
        />
      </Box>

      <Stepper
        activeStep={steps.findIndex(step => step.active)}
        orientation='vertical'
      >
        {steps.map(step => (
          <Step key={step.status} completed={step.completed}>
            <StepLabel
              StepIconComponent={() => (
                <Box
                  sx={{
                    color: step.active
                      ? `${step.color}.main`
                      : step.completed
                        ? 'success.main'
                        : 'grey.400',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {step.icon}
                </Box>
              )}
            >
              <Typography
                variant='subtitle1'
                color={step.active ? 'primary' : 'text.primary'}
              >
                {step.label}
              </Typography>
            </StepLabel>
            <StepContent>
              <Typography variant='body2' color='text.secondary'>
                {step.description}
              </Typography>
              {step.active && request.comments && (
                <Box mt={1} p={2} bgcolor='grey.50' borderRadius={1}>
                  <Typography variant='body2' fontWeight={500}>
                    Latest Comment:
                  </Typography>
                  <Typography variant='body2' sx={{ mt: 0.5 }}>
                    {request.comments}
                  </Typography>
                </Box>
              )}
            </StepContent>
          </Step>
        ))}
      </Stepper>
    </Paper>
  );
};

// Status badge component for use in tables and lists
export const StatusBadge: React.FC<{
  status: RequestStatus;
  size?: 'small' | 'medium';
}> = ({ status, size = 'small' }) => {
  const config = statusConfig[status];

  return (
    <Chip
      label={config.label}
      color={config.chipColor}
      size={size}
      icon={config.icon as React.ReactElement}
      variant='filled'
    />
  );
};

export default TravelRequestStatusTracker;
