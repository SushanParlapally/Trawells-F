import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Chip,
  Alert,
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

interface TeamStatistics {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  disapprovedRequests: number;
  completedRequests: number;
  teamMembersCount: number;
}

interface TeamStatisticsProps {
  statistics: TeamStatistics;
  loading?: boolean;
}

const TeamStatistics: React.FC<TeamStatisticsProps> = ({
  statistics,
  loading = false,
}) => {
  // Calculate percentages
  const getPercentage = (value: number, total: number) => {
    return total > 0 ? (value / total) * 100 : 0;
  };

  const approvalRate = getPercentage(
    statistics.approvedRequests,
    statistics.totalRequests
  );
  const pendingRate = getPercentage(
    statistics.pendingRequests,
    statistics.totalRequests
  );
  const completionRate = getPercentage(
    statistics.completedRequests,
    statistics.totalRequests
  );

  const statisticsCards = [
    {
      title: 'Total Requests',
      value: statistics.totalRequests,
      icon: <AssignmentIcon color='primary' />,
      color: 'primary',
      description: 'All travel requests from your team',
    },
    {
      title: 'Pending Requests',
      value: statistics.pendingRequests,
      icon: <ScheduleIcon color='warning' />,
      color: 'warning',
      description: 'Requests awaiting processing',
      percentage: pendingRate,
    },
    {
      title: 'Approved',
      value: statistics.approvedRequests,
      icon: <TrendingUpIcon color='success' />,
      color: 'success',
      description: 'Requests that have been approved',
      percentage: approvalRate,
    },
    {
      title: 'Team Members',
      value: statistics.teamMembersCount,
      icon: <PeopleIcon color='info' />,
      color: 'info',
      description: 'Active team members with requests',
    },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Backend Limitation Alert */}
      <Alert severity='info' icon={<InfoIcon />}>
        Note: Statistics are based on travel request data. Approval actions are
        not yet implemented in the backend.
      </Alert>

      {/* Main Statistics Cards */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {statisticsCards.map((stat, index) => (
          <Box key={index} sx={{ flex: 1, minWidth: 200 }}>
            <Card>
              <CardContent>
                <Box display='flex' alignItems='center' mb={1}>
                  {stat.icon}
                  <Typography variant='h6' sx={{ ml: 1 }}>
                    {stat.title}
                  </Typography>
                </Box>

                <Typography
                  variant='h4'
                  color={`${stat.color}.main`}
                  gutterBottom
                >
                  {loading ? '-' : stat.value}
                </Typography>

                <Typography variant='body2' color='text.secondary' gutterBottom>
                  {stat.description}
                </Typography>

                {stat.percentage !== undefined && (
                  <Box mt={1}>
                    <Box
                      display='flex'
                      justifyContent='space-between'
                      alignItems='center'
                      mb={0.5}
                    >
                      <Typography variant='caption' color='text.secondary'>
                        Progress
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {stat.percentage.toFixed(1)}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant='determinate'
                      value={stat.percentage}
                      color={
                        stat.color as
                          | 'primary'
                          | 'secondary'
                          | 'error'
                          | 'info'
                          | 'success'
                          | 'warning'
                      }
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

      {/* Additional Statistics */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        <Box sx={{ flex: 1, minWidth: 300 }}>
          <Card>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                Request Status Distribution
              </Typography>
              <Box display='flex' flexDirection='column' gap={1}>
                <Box
                  display='flex'
                  justifyContent='space-between'
                  alignItems='center'
                >
                  <Box display='flex' alignItems='center' gap={1}>
                    <Chip label='Pending' size='small' color='warning' />
                    <Typography variant='body2'>
                      {statistics.pendingRequests} requests
                    </Typography>
                  </Box>
                  <Typography variant='body2' color='text.secondary'>
                    {pendingRate.toFixed(1)}%
                  </Typography>
                </Box>
                <Box
                  display='flex'
                  justifyContent='space-between'
                  alignItems='center'
                >
                  <Box display='flex' alignItems='center' gap={1}>
                    <Chip label='Approved' size='small' color='success' />
                    <Typography variant='body2'>
                      {statistics.approvedRequests} requests
                    </Typography>
                  </Box>
                  <Typography variant='body2' color='text.secondary'>
                    {approvalRate.toFixed(1)}%
                  </Typography>
                </Box>
                <Box
                  display='flex'
                  justifyContent='space-between'
                  alignItems='center'
                >
                  <Box display='flex' alignItems='center' gap={1}>
                    <Chip label='Completed' size='small' color='default' />
                    <Typography variant='body2'>
                      {statistics.completedRequests} requests
                    </Typography>
                  </Box>
                  <Typography variant='body2' color='text.secondary'>
                    {completionRate.toFixed(1)}%
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: 1, minWidth: 300 }}>
          <Card>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                Team Overview
              </Typography>
              <Box display='flex' flexDirection='column' gap={2}>
                <Box>
                  <Typography variant='body2' color='text.secondary'>
                    Active Team Members
                  </Typography>
                  <Typography variant='h4' color='primary'>
                    {statistics.teamMembersCount}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant='body2' color='text.secondary'>
                    Average Requests per Member
                  </Typography>
                  <Typography variant='h4' color='primary'>
                    {statistics.teamMembersCount > 0
                      ? (
                          statistics.totalRequests / statistics.teamMembersCount
                        ).toFixed(1)
                      : '0'}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default TeamStatistics;
