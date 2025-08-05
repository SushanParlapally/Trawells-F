import React, { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  IconButton,
  Tooltip,
  Alert,
} from '@mui/material';
import {
  TrendingUp,
  Schedule,
  CheckCircle,
  People,
  Business,
  Refresh,
  GetApp,
} from '@mui/icons-material';
import type { RequestStatus } from '../../types';

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

interface BookingMetrics {
  totalRequests: number;
  completedRequests: number;
  pendingRequests: number;
  averageProcessingTime: number;
  completionRate: number;
  statusDistribution: { [key in RequestStatus]: number };
  departmentStats: Array<{
    departmentName: string;
    totalRequests: number;
    completedRequests: number;
    completionRate: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    requests: number;
    completed: number;
  }>;
  topDestinations: Array<{
    destination: string;
    count: number;
  }>;
}

interface BookingStatisticsProps {
  requests: TravelAdminRequestResponse[];
  loading?: boolean;
  onRefresh?: () => void;
}

const BookingStatistics: React.FC<BookingStatisticsProps> = ({
  requests,
  loading = false,
  onRefresh,
}) => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>(
    '30d'
  );
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');

  // Calculate metrics
  const metrics = useMemo((): BookingMetrics => {
    // Filter requests based on time range
    const now = new Date();
    const timeRangeMs = {
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      '90d': 90 * 24 * 60 * 60 * 1000,
      '1y': 365 * 24 * 60 * 60 * 1000,
    };

    let filteredRequests = requests.filter(req => {
      const dateToShow = req.fromDate;
      const requestDate = dateToShow ? new Date(dateToShow) : new Date();
      return now.getTime() - requestDate.getTime() <= timeRangeMs[timeRange];
    });

    // Filter by department if selected
    if (selectedDepartment !== 'all') {
      filteredRequests = filteredRequests.filter(
        req => req.department?.departmentName === selectedDepartment
      );
    }

    const totalRequests = filteredRequests.length;
    const completedRequests = filteredRequests.filter(
      req => req.status === 'Completed'
    ).length;
    const pendingRequests = filteredRequests.filter(req =>
      ['Pending', 'Approved', 'Booked'].includes(req.status)
    ).length;

    // Calculate average processing time (mock calculation)
    const averageProcessingTime = 2.5; // This would be calculated from actual data
    const completionRate =
      totalRequests > 0 ? (completedRequests / totalRequests) * 100 : 0;

    // Status distribution
    const statusDistribution = filteredRequests.reduce(
      (acc, req) => {
        acc[req.status as RequestStatus] =
          (acc[req.status as RequestStatus] || 0) + 1;
        return acc;
      },
      {} as { [key in RequestStatus]: number }
    );

    // Department statistics
    const departmentMap = new Map<
      string,
      { total: number; completed: number }
    >();

    filteredRequests.forEach(req => {
      const deptName = req.department?.departmentName || 'Unknown';
      const current = departmentMap.get(deptName) || { total: 0, completed: 0 };
      current.total += 1;
      if (req.status === 'Completed') current.completed += 1;
      departmentMap.set(deptName, current);
    });

    const departmentStats = Array.from(departmentMap.entries())
      .map(([departmentName, stats]) => ({
        departmentName,
        totalRequests: stats.total,
        completedRequests: stats.completed,
        completionRate:
          stats.total > 0 ? (stats.completed / stats.total) * 100 : 0,
      }))
      .sort((a, b) => b.totalRequests - a.totalRequests);

    // Monthly trends (simplified)
    const monthlyTrends = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthRequests = filteredRequests.filter(req => {
        const dateToShow = req.fromDate;
        const reqDate = dateToShow ? new Date(dateToShow) : new Date();
        return (
          reqDate.getMonth() === date.getMonth() &&
          reqDate.getFullYear() === date.getFullYear()
        );
      });

      return {
        month: date.toLocaleDateString('en-US', {
          month: 'short',
          year: 'numeric',
        }),
        requests: monthRequests.length,
        completed: monthRequests.filter(req => req.status === 'Completed')
          .length,
      };
    }).reverse();

    // Top destinations
    const destinationMap = new Map<string, number>();
    filteredRequests.forEach(req => {
      const destination = req.toLocation;
      destinationMap.set(
        destination,
        (destinationMap.get(destination) || 0) + 1
      );
    });

    const topDestinations = Array.from(destinationMap.entries())
      .map(([destination, count]) => ({ destination, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalRequests,
      completedRequests,
      pendingRequests,
      averageProcessingTime,
      completionRate,
      statusDistribution,
      departmentStats,
      monthlyTrends,
      topDestinations,
    };
  }, [requests, timeRange, selectedDepartment]);

  // Get unique departments
  const departments = useMemo(() => {
    const deptSet = new Set(
      requests.map(req => req.department?.departmentName).filter(Boolean)
    );
    return Array.from(deptSet).sort();
  }, [requests]);

  // Get status color
  const getStatusColor = (status: RequestStatus) => {
    switch (status) {
      case 'Pending':
        return 'warning';
      case 'Approved':
        return 'info';
      case 'Rejected':
        return 'error';
      case 'Booked':
        return 'primary';
      case 'Completed':
        return 'success';
      case 'Returned to Employee':
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      {/* Backend Limitation Alert */}
      <Alert severity='info' sx={{ mb: 2 }}>
        Note: This component is aligned with backend capabilities. Statistics
        are based on available travel request data.
      </Alert>

      {/* Controls */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
        <FormControl size='small' sx={{ minWidth: 120 }}>
          <InputLabel>Time Range</InputLabel>
          <Select
            value={timeRange}
            label='Time Range'
            onChange={e => setTimeRange(e.target.value as typeof timeRange)}
          >
            <MenuItem value='7d'>Last 7 days</MenuItem>
            <MenuItem value='30d'>Last 30 days</MenuItem>
            <MenuItem value='90d'>Last 90 days</MenuItem>
            <MenuItem value='1y'>Last year</MenuItem>
          </Select>
        </FormControl>

        <FormControl size='small' sx={{ minWidth: 150 }}>
          <InputLabel>Department</InputLabel>
          <Select
            value={selectedDepartment}
            label='Department'
            onChange={e => setSelectedDepartment(e.target.value)}
          >
            <MenuItem value='all'>All Departments</MenuItem>
            {departments.map(dept => (
              <MenuItem key={dept} value={dept}>
                {dept}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ flexGrow: 1 }} />

        {onRefresh && (
          <Tooltip title='Refresh Data'>
            <IconButton onClick={onRefresh} disabled={loading}>
              <Refresh />
            </IconButton>
          </Tooltip>
        )}

        <Button variant='outlined' startIcon={<GetApp />} size='small'>
          Export
        </Button>
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 3,
        }}
      >
        {/* Key Metrics */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 3,
            flex: 1,
          }}
        >
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Typography color='text.secondary' gutterBottom>
                    Total Requests
                  </Typography>
                  <Typography variant='h4'>{metrics.totalRequests}</Typography>
                </Box>
                <People color='primary' sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Typography color='text.secondary' gutterBottom>
                    Completion Rate
                  </Typography>
                  <Typography variant='h4' color='success.main'>
                    {metrics.completionRate.toFixed(1)}%
                  </Typography>
                </Box>
                <CheckCircle color='success' sx={{ fontSize: 40 }} />
              </Box>
              <LinearProgress
                variant='determinate'
                value={metrics.completionRate}
                color='success'
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>

          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Typography color='text.secondary' gutterBottom>
                    Pending Requests
                  </Typography>
                  <Typography variant='h4' color='warning.main'>
                    {metrics.pendingRequests}
                  </Typography>
                </Box>
                <Schedule color='warning' sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Typography color='text.secondary' gutterBottom>
                    Avg. Processing Time
                  </Typography>
                  <Typography variant='h4'>
                    {metrics.averageProcessingTime}d
                  </Typography>
                </Box>
                <TrendingUp color='info' sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Status Distribution */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 3,
            flex: 1,
          }}
        >
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                Status Distribution
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                {Object.entries(metrics.statusDistribution).map(
                  ([status, count]) => (
                    <Chip
                      key={status}
                      label={`${status.replace('-', ' ').toUpperCase()}: ${count}`}
                      color={
                        getStatusColor(status as RequestStatus) as
                          | 'default'
                          | 'primary'
                          | 'secondary'
                          | 'error'
                          | 'info'
                          | 'success'
                          | 'warning'
                      }
                      variant='filled'
                      size='small'
                    />
                  )
                )}
              </Box>
            </CardContent>
          </Card>

          {/* Department Performance */}
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                Department Performance
              </Typography>
              <List>
                {metrics.departmentStats.slice(0, 5).map(dept => (
                  <ListItem key={dept.departmentName}>
                    <ListItemIcon>
                      <Business />
                    </ListItemIcon>
                    <ListItemText
                      primary={dept.departmentName}
                      secondary={
                        <Box>
                          <Typography variant='body2' color='text.secondary'>
                            {dept.totalRequests} requests •{' '}
                            {dept.completionRate.toFixed(1)}% completed
                          </Typography>
                          <LinearProgress
                            variant='determinate'
                            value={dept.completionRate}
                            color={
                              dept.completionRate >= 80
                                ? 'success'
                                : dept.completionRate >= 60
                                  ? 'warning'
                                  : 'error'
                            }
                            sx={{ mt: 0.5 }}
                          />
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Box>

        {/* Top Destinations */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 3,
            flex: 1,
          }}
        >
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                Top Destinations
              </Typography>
              <List>
                {metrics.topDestinations.map((dest, index) => (
                  <ListItem key={dest.destination}>
                    <ListItemIcon>
                      <Chip
                        label={index + 1}
                        size='small'
                        color={index === 0 ? 'primary' : 'default'}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={dest.destination}
                      secondary={`${dest.count} requests`}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>

          {/* Monthly Trends */}
          <Card sx={{ flex: 2 }}>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                Monthly Trends
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', py: 2 }}>
                {metrics.monthlyTrends.map(trend => (
                  <Box
                    key={trend.month}
                    sx={{
                      minWidth: 120,
                      textAlign: 'center',
                      p: 2,
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant='subtitle2' gutterBottom>
                      {trend.month}
                    </Typography>
                    <Typography variant='h6' color='primary'>
                      {trend.requests}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      Total Requests
                    </Typography>
                    <Typography
                      variant='body2'
                      color='success.main'
                      sx={{ mt: 1 }}
                    >
                      {trend.completed} Completed
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default BookingStatistics;
