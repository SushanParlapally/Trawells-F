import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography,
  Card,
  CardContent,
  Grid,
  Paper,
  Button,
  Box,
  Alert,
  Skeleton,
  Divider,
  Stack,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Flight as FlightIcon,
  History as HistoryIcon,
  Analytics as AnalyticsIcon,
  Dashboard as DashboardIcon,
  Add as AddIcon,
  Notifications as NotificationsIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../hooks/redux';
import { selectUser } from '../../store/slices/authSlice';
import { MainLayout } from '../common/Layout';
import { DataTable } from '../common/Tables';
import { travelRequestService } from '../../services/api/travelRequestService';
import { StatusBadge } from './TravelRequestStatusTracker';
import { TravelRequestCancellation } from './TravelRequestCancellation';
import {
  StatusDistributionChart,
  TimeSeriesChart,
  TrendAnalysisChart,
} from '../common/Charts';
import StatCard from '../common/StatCard';
import type { TravelRequest, RequestStatus, TableColumn } from '../../types';

interface DashboardStats {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  completedRequests: number;
  averageProcessingTime: number;
  thisMonthRequests: number;
  lastMonthRequests: number;
}

interface RecentActivity {
  id: string;
  type: 'request_created' | 'status_changed' | 'comment_added';
  message: string;
  timestamp: Date;
  requestId?: number;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`employee-tabpanel-${index}`}
      aria-labelledby={`employee-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

type FetchError = { response?: { status?: number } };

const EmployeeDashboard: React.FC = () => {
  const user = useAppSelector(selectUser);
  const [tabValue, setTabValue] = useState(0);
  const [requests, setRequests] = useState<TravelRequest[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    completedRequests: 0,
    averageProcessingTime: 0,
    thisMonthRequests: 0,
    lastMonthRequests: 0,
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>(
    '30d'
  );
  const [showHelp, setShowHelp] = useState(() => {
    // Load help preference from localStorage
    const dismissed = localStorage.getItem('employee-dashboard-help-dismissed');
    return dismissed !== 'true'; // Show help if not previously dismissed
  });

  // Fetch user's travel requests
  const fetchRequests = useCallback(async () => {
    if (!user?.userId) return;

    try {
      setLoading(true);
      const userRequests = await travelRequestService.getByUserId(user.userId);
      setRequests(userRequests);

      // Calculate stats
      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

      const thisMonthRequests = userRequests.filter(r => {
        const dateToShow = r.createdOn || r.fromDate;
        return dateToShow ? new Date(dateToShow) >= thisMonth : false;
      }).length;
      const lastMonthRequestsCount = userRequests.filter(r => {
        const dateToShow = r.createdOn || r.fromDate;
        if (!dateToShow) return false;
        const createdDate = new Date(dateToShow);
        return createdDate >= lastMonth && createdDate <= lastMonthEnd;
      }).length;

      // Calculate average processing time
      const completedRequests = userRequests.filter(
        r => r.status === 'Completed'
      );
      const avgProcessingTime =
        completedRequests.length > 0
          ? completedRequests.reduce((sum, req) => {
              const dateToShow = req.createdOn || req.fromDate;
              const created = dateToShow ? new Date(dateToShow) : new Date();
              const modified = new Date(req.fromDate);
              return (
                sum +
                (modified.getTime() - created.getTime()) / (1000 * 60 * 60)
              ); // hours
            }, 0) / completedRequests.length
          : 0;

      const stats: DashboardStats = {
        totalRequests: userRequests.length,
        pendingRequests: userRequests.filter(r => r.status === 'Pending')
          .length,
        approvedRequests: userRequests.filter(r => r.status === 'Approved')
          .length,
        completedRequests: userRequests.filter(r => r.status === 'Completed')
          .length,
        averageProcessingTime: avgProcessingTime,
        thisMonthRequests,
        lastMonthRequests: lastMonthRequestsCount,
      };

      setStats(stats);

      // Generate recent activities (mock for now)
      const activities: RecentActivity[] = userRequests
        .slice(0, 5)
        .map(request => ({
          id: `activity-${request.travelRequestId}`,
          type: 'request_created',
          message: `Travel request for ${request.toLocation} was created`,
          timestamp: new Date(request.createdOn || request.fromDate),
          requestId: request.travelRequestId,
        }));

      setRecentActivities(activities);
    } catch (e) {
      const err = e as FetchError;
      // Check if it's a 404 error (no requests found) - this is normal for new users
      if (err?.response?.status === 404) {
        // No travel requests found - this is normal for new users
        setRequests([]);
        setStats({
          totalRequests: 0,
          pendingRequests: 0,
          approvedRequests: 0,
          completedRequests: 0,
          averageProcessingTime: 0,
          thisMonthRequests: 0,
          lastMonthRequests: 0,
        });
        setRecentActivities([]);
      } else {
        // Real error
        setError('Failed to load travel requests');
        console.error('Error fetching requests: ', err);
      }
    } finally {
      setLoading(false);
    }
  }, [user?.userId]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Table columns configuration
  const columns: TableColumn<TravelRequest>[] = [
    {
      key: 'travelRequestId',
      title: 'Request ID',
      width: 120,
      sortable: true,
      render: (_value: string | number | boolean, item: TravelRequest) =>
        `#${item.travelRequestId}`,
    },
    {
      key: 'destination',
      title: 'Destination',
      sortable: true,
      render: (_value: string | number | boolean, item: TravelRequest) => (
        <Box>
          <Typography variant='body2' fontWeight={500}>
            {item.fromLocation} → {item.toLocation}
          </Typography>
          <Typography variant='caption' color='text.secondary'>
            {new Date(item.fromDate).toLocaleDateString()} -{' '}
            {new Date(item.toDate).toLocaleDateString()}
          </Typography>
        </Box>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      render: (_value: string | number | boolean, item: TravelRequest) => (
        <StatusBadge status={item.status as RequestStatus} />
      ),
    },
    {
      key: 'createdOn',
      title: 'Created',
      sortable: true,
      render: (_value: string | number | boolean, item: TravelRequest) => {
        const dateToShow = item.createdOn || item.fromDate;
        return dateToShow ? new Date(dateToShow).toLocaleDateString() : 'N/A';
      },
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_value: string | number | boolean, item: TravelRequest) => (
        <Stack direction='row' spacing={1}>
          <Button size='small' variant='outlined'>
            View Details
          </Button>
          <TravelRequestCancellation
            request={item}
            onCancel={cancelledRequest => {
              // Update the request in the list
              setRequests(prev =>
                prev.map(req =>
                  req.travelRequestId === cancelledRequest.travelRequestId
                    ? cancelledRequest
                    : req
                )
              );
            }}
            onError={error => {
              setError(error);
            }}
          />
        </Stack>
      ),
    },
  ];

  // Handle create new request
  const navigate = useNavigate();
  const handleCreateRequest = () => {
    navigate('/employee/travel-request/new');
  };

  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle help toggle
  const handleHelpToggle = () => {
    const newShowHelp = !showHelp;
    setShowHelp(newShowHelp);
    if (!newShowHelp) {
      // Save that user has seen help
      localStorage.setItem('employee-dashboard-help-shown', 'true');
    }
  };

  // Generate analytics data
  const generateAnalyticsData = () => {
    // Status distribution
    const statusData = {
      Pending: stats.pendingRequests,
      Approved: stats.approvedRequests,
      Completed: stats.completedRequests,
      Rejected: requests.filter(r => r.status === 'Rejected').length,
      Booked: requests.filter(r => r.status === 'Booked').length,
      'Returned to Employee': requests.filter(
        r => r.status === 'Returned to Employee'
      ).length,
    };

    // Time series data for the last 6 months
    const timeSeriesData = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const monthRequests = requests.filter(r => {
        const dateToShow = r.createdOn || r.fromDate;
        if (!dateToShow) return false;
        const createdDate = new Date(dateToShow);
        return createdDate >= monthStart && createdDate <= monthEnd;
      });

      timeSeriesData.push({
        period: date.toLocaleDateString('en-US', {
          month: 'short',
          year: '2-digit',
        }),
        value: monthRequests.length,
        approved: monthRequests.filter(
          r => r.status === 'Approved' || r.status === 'Completed'
        ).length,
        completed: monthRequests.filter(r => r.status === 'Completed').length,
      });
    }

    // Trend analysis
    const trendAnalysis = {
      direction:
        stats.thisMonthRequests > stats.lastMonthRequests
          ? ('up' as const)
          : stats.thisMonthRequests < stats.lastMonthRequests
            ? ('down' as const)
            : ('flat' as const),
      strength:
        Math.abs(stats.thisMonthRequests - stats.lastMonthRequests) > 2
          ? ('strong' as const)
          : Math.abs(stats.thisMonthRequests - stats.lastMonthRequests) > 1
            ? ('moderate' as const)
            : ('weak' as const),
      percentage:
        stats.lastMonthRequests > 0
          ? ((stats.thisMonthRequests - stats.lastMonthRequests) /
              stats.lastMonthRequests) *
            100
          : 0,
      significance: 0.8,
    };

    return { statusData, timeSeriesData, trendAnalysis };
  };

  const analyticsData = generateAnalyticsData();

  if (error) {
    return (
      <MainLayout title='Employee Dashboard'>
        <Alert severity='error' sx={{ mb: 2 }}>
          {error}
        </Alert>
      </MainLayout>
    );
  }

  return (
    <MainLayout title='Employee Dashboard'>
      <Grid container spacing={3}>
        {/* Welcome Section */}
        <Grid size={12}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box
              display='flex'
              justifyContent='space-between'
              alignItems='center'
            >
              <Box>
                <Typography variant='h4' gutterBottom>
                  Welcome back, {user?.firstName}!
                </Typography>
                <Typography variant='body1' color='text.secondary'>
                  Manage your travel requests and track their status from your
                  dashboard.
                </Typography>
              </Box>
              <Stack direction='row' spacing={2}>
                <Button
                  variant='outlined'
                  startIcon={<InfoIcon />}
                  onClick={handleHelpToggle}
                >
                  Help
                </Button>
                <Button
                  variant='contained'
                  size='large'
                  startIcon={<AddIcon />}
                  onClick={handleCreateRequest}
                  sx={{ minWidth: 200 }}
                >
                  New Travel Request
                </Button>
              </Stack>
            </Box>
          </Paper>
        </Grid>

        {/* Help Section */}
        {showHelp && (
          <Grid size={12}>
            <Alert
              severity='info'
              sx={{ mb: 2 }}
              onClose={() => {
                setShowHelp(false);
                localStorage.setItem(
                  'employee-dashboard-help-dismissed',
                  'true'
                );
              }}
            >
              <Typography variant='h6' gutterBottom>
                How to use the Travel Desk System
              </Typography>
              <Typography variant='body2' paragraph>
                • <strong>Create Requests:</strong> Click "New Travel Request"
                to submit a new travel request
              </Typography>
              <Typography variant='body2' paragraph>
                • <strong>Track Status:</strong> View your request status in the
                History tab
              </Typography>
              <Typography variant='body2' paragraph>
                • <strong>Analytics:</strong> See your request trends and
                statistics in the Analytics tab
              </Typography>
              <Typography variant='body2' paragraph>
                • <strong>Note:</strong> Edit and cancel functions are not
                available. Create new requests if needed.
              </Typography>
            </Alert>
          </Grid>
        )}

        {/* Dashboard Tabs */}
        <Grid size={12}>
          <Paper sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                aria-label='employee dashboard tabs'
              >
                <Tab icon={<DashboardIcon />} label='Overview' />
                <Tab icon={<AnalyticsIcon />} label='Analytics' />
                <Tab icon={<HistoryIcon />} label='History' />
              </Tabs>
            </Box>

            {/* Overview Tab */}
            <TabPanel value={tabValue} index={0}>
              {/* Statistics Cards */}
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <StatCard
                    title='Total Requests'
                    value={stats.totalRequests}
                    icon={<AssignmentIcon />}
                    iconColor='primary'
                    loading={loading}
                    trend={{
                      value:
                        stats.lastMonthRequests > 0
                          ? ((stats.thisMonthRequests -
                              stats.lastMonthRequests) /
                              stats.lastMonthRequests) *
                            100
                          : 0,
                      direction:
                        stats.thisMonthRequests > stats.lastMonthRequests
                          ? 'up'
                          : stats.thisMonthRequests < stats.lastMonthRequests
                            ? 'down'
                            : 'flat',
                      period: 'last month',
                    }}
                    info='Total number of travel requests submitted'
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <StatCard
                    title='Pending Approval'
                    value={stats.pendingRequests}
                    icon={<HistoryIcon />}
                    iconColor='warning'
                    loading={loading}
                    info='Requests awaiting manager approval'
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <StatCard
                    title='Approved'
                    value={stats.approvedRequests}
                    icon={<TrendingUpIcon />}
                    iconColor='success'
                    loading={loading}
                    info='Requests approved and ready for booking'
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <StatCard
                    title='Avg Processing'
                    value={stats.averageProcessingTime}
                    icon={<FlightIcon />}
                    iconColor='info'
                    loading={loading}
                    format='time'
                    info='Average time from submission to completion'
                  />
                </Grid>
              </Grid>

              {/* Quick Actions */}
              <Grid container spacing={3} sx={{ mt: 2 }}>
                <Grid size={{ xs: 12, md: 8 }}>
                  <Card>
                    <CardContent>
                      <Typography variant='h6' gutterBottom>
                        Quick Actions
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                          <Button
                            fullWidth
                            variant='outlined'
                            startIcon={<AddIcon />}
                            onClick={handleCreateRequest}
                            sx={{ py: 2 }}
                          >
                            New Request
                          </Button>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                          <Button
                            fullWidth
                            variant='outlined'
                            startIcon={<HistoryIcon />}
                            onClick={() => setTabValue(2)}
                            sx={{ py: 2 }}
                          >
                            View History
                          </Button>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                          <Button
                            fullWidth
                            variant='outlined'
                            startIcon={<FlightIcon />}
                            sx={{ py: 2 }}
                          >
                            Track Bookings
                          </Button>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Recent Activities */}
                <Grid size={{ xs: 12, md: 4 }}>
                  <Card>
                    <CardContent>
                      <Box display='flex' alignItems='center' gap={1} mb={2}>
                        <NotificationsIcon color='primary' />
                        <Typography variant='h6'>Recent Activities</Typography>
                      </Box>
                      <Divider sx={{ mb: 2 }} />
                      {loading ? (
                        <Stack spacing={2}>
                          {[1, 2, 3].map(i => (
                            <Box key={i}>
                              <Skeleton variant='text' width='80%' />
                              <Skeleton variant='text' width='60%' />
                            </Box>
                          ))}
                        </Stack>
                      ) : recentActivities.length > 0 ? (
                        <Stack spacing={2}>
                          {recentActivities.map(activity => (
                            <Box key={activity.id}>
                              <Typography variant='body2' sx={{ mb: 0.5 }}>
                                {activity.message}
                              </Typography>
                              <Typography
                                variant='caption'
                                color='text.secondary'
                              >
                                {activity.timestamp.toLocaleDateString()}
                              </Typography>
                            </Box>
                          ))}
                        </Stack>
                      ) : (
                        <Typography variant='body2' color='text.secondary'>
                          No recent activities
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </TabPanel>

            {/* Analytics Tab */}
            <TabPanel value={tabValue} index={1}>
              <Grid container spacing={3}>
                {/* Status Distribution */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <StatusDistributionChart
                    data={analyticsData.statusData}
                    title='Request Status Distribution'
                    height={400}
                  />
                </Grid>

                {/* Request Trend */}
                <Grid size={12}>
                  <TimeSeriesChart
                    data={analyticsData.timeSeriesData}
                    title='Request Submission Trend'
                    height={400}
                    timeRange={timeRange}
                    onTimeRangeChange={setTimeRange}
                    multiSeries={[
                      {
                        key: 'value',
                        name: 'Total Requests',
                        color: '#2196F3',
                      },
                      { key: 'approved', name: 'Approved', color: '#4CAF50' },
                      { key: 'completed', name: 'Completed', color: '#FF9800' },
                    ]}
                  />
                </Grid>

                {/* Trend Analysis */}
                <Grid size={12}>
                  <TrendAnalysisChart
                    data={analyticsData.timeSeriesData}
                    title='Request Volume Trend Analysis'
                    height={400}
                    trendAnalysis={analyticsData.trendAnalysis}
                    timeRange={timeRange}
                    onTimeRangeChange={setTimeRange}
                  />
                </Grid>
              </Grid>
            </TabPanel>

            {/* History Tab */}
            <TabPanel value={tabValue} index={2}>
              {/* Travel Request History Table */}
              <Grid container spacing={3}>
                <Grid size={12}>
                  <Card>
                    <CardContent>
                      <Typography variant='h6' gutterBottom>
                        Travel Request History
                      </Typography>
                      <DataTable
                        columns={columns}
                        data={requests}
                        loading={loading}
                        pagination={{
                          page: 1,
                          pageSize: 10,
                          total: requests.length,
                        }}
                        searchable
                        searchPlaceholder='Search requests...'
                        exportable
                        exportFileName='travel-requests'
                        rowKey='travelRequestId'
                        emptyText='No travel requests found. Create your first request to get started!'
                      />
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>
    </MainLayout>
  );
};

export default EmployeeDashboard;
