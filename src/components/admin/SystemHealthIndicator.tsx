import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  CheckCircle as HealthyIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  Storage as DatabaseIcon,
  Cloud as ApiIcon,
  Memory as MemoryIcon,
  CheckCircle,
} from '@mui/icons-material';

interface SystemHealthIndicatorProps {
  usersCount: number;
  departmentsCount: number;
  projectsCount: number;
  requestsCount: number;
  onRefresh?: () => void;
}

const SystemHealthIndicator: React.FC<SystemHealthIndicatorProps> = ({
  usersCount,
  departmentsCount,
  projectsCount,
  requestsCount,
  onRefresh,
}) => {
  // Determine overall system health based on data availability
  const getOverallHealth = () => {
    if (usersCount > 0 && departmentsCount > 0 && projectsCount > 0) {
      return 'healthy';
    } else if (usersCount > 0 || departmentsCount > 0) {
      return 'warning';
    }
    return 'critical';
  };

  const overallHealth = getOverallHealth();

  const getStatusIcon = (status: 'healthy' | 'warning' | 'critical') => {
    switch (status) {
      case 'healthy':
        return <HealthyIcon color='success' />;
      case 'warning':
        return <WarningIcon color='warning' />;
      case 'critical':
        return <ErrorIcon color='error' />;
    }
  };

  const getStatusColor = (status: 'healthy' | 'warning' | 'critical') => {
    switch (status) {
      case 'healthy':
        return 'success';
      case 'warning':
        return 'warning';
      case 'critical':
        return 'error';
    }
  };

  return (
    <Card>
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {getStatusIcon(overallHealth)}
            <Typography variant='h6'>System Overview</Typography>
            <Chip
              label={overallHealth.toUpperCase()}
              color={getStatusColor(overallHealth)}
              size='small'
            />
          </Box>
          {onRefresh && (
            <Tooltip title='Refresh data'>
              <IconButton onClick={onRefresh} size='small'>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr 1fr', md: '1fr 1fr 1fr 1fr' },
            gap: 3,
          }}
        >
          {/* Users Count */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <DatabaseIcon color='action' />
              <Typography variant='subtitle2'>Users</Typography>
              {getStatusIcon(usersCount > 0 ? 'healthy' : 'critical')}
            </Box>
            <Stack spacing={1}>
              <Box>
                <Typography variant='h4' color='primary'>
                  {usersCount}
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  Total Users
                </Typography>
              </Box>
            </Stack>
          </Box>

          {/* Departments Count */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <ApiIcon color='action' />
              <Typography variant='subtitle2'>Departments</Typography>
              {getStatusIcon(departmentsCount > 0 ? 'healthy' : 'critical')}
            </Box>
            <Stack spacing={1}>
              <Box>
                <Typography variant='h4' color='primary'>
                  {departmentsCount}
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  Active Departments
                </Typography>
              </Box>
            </Stack>
          </Box>

          {/* Projects Count */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <MemoryIcon color='action' />
              <Typography variant='subtitle2'>Projects</Typography>
              {getStatusIcon(projectsCount > 0 ? 'healthy' : 'warning')}
            </Box>
            <Stack spacing={1}>
              <Box>
                <Typography variant='h4' color='primary'>
                  {projectsCount}
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  Active Projects
                </Typography>
              </Box>
            </Stack>
          </Box>

          {/* Travel Requests Count */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <CheckCircle color='action' />
              <Typography variant='subtitle2'>Requests</Typography>
              {getStatusIcon('healthy')}
            </Box>
            <Stack spacing={1}>
              <Box>
                <Typography variant='h4' color='primary'>
                  {requestsCount}
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  Travel Requests
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Box>

        <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant='caption' color='text.secondary'>
            Last updated: {new Date().toLocaleString()}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default SystemHealthIndicator;
