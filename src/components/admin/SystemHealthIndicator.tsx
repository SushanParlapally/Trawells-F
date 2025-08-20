import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Grid,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  CheckCircle as HealthyIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  Assignment as ProjectIcon,
  Flight as RequestIcon,
} from '@mui/icons-material';
import StatCard from '../common/StatCard';

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

        <Grid container spacing={3}>
          {/* Users Count */}
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title='Total Users'
              value={usersCount}
              icon={<PeopleIcon />}
              iconColor='primary'
              info='Total number of users in the system'
            />
          </Grid>

          {/* Departments Count */}
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title='Departments'
              value={departmentsCount}
              icon={<BusinessIcon />}
              iconColor='info'
              info='Active departments in the organization'
            />
          </Grid>

          {/* Projects Count */}
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title='Projects'
              value={projectsCount}
              icon={<ProjectIcon />}
              iconColor='success'
              info='Active projects available for travel requests'
            />
          </Grid>

          {/* Travel Requests Count */}
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title='Travel Requests'
              value={requestsCount}
              icon={<RequestIcon />}
              iconColor='warning'
              info='Total travel requests in the system'
            />
          </Grid>
        </Grid>

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
