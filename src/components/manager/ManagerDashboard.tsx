import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography,
  Paper,
  Alert,
  Snackbar,
  Box,
  Badge,
  Card,
  CardContent,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Analytics as AnalyticsIcon,
  Assignment as AssignmentIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { useAppSelector } from '../../hooks/redux';
import { selectUser } from '../../store/slices/authSlice';
import { MainLayout } from '../common/Layout';
import { managerService } from '../../services/api/managerService';
import {
  StatusDistributionChart,
  TimeSeriesChart,
  DepartmentAnalyticsChart,
  PerformanceMetricsChart,
} from '../common/Charts';
import StatCard from '../common/StatCard';
import ApprovalQueue from './ApprovalQueue';
import TeamStatistics from './TeamStatistics';
import type {
  TravelRequestDto,
  PaginationConfig,
  CommentDto,
} from '../../types';

interface TeamStatisticsData {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  disapprovedRequests: number;
  completedRequests: number;
  teamMembersCount: number;
  averageApprovalTime: number;
  approvalRate: number;
  thisMonthRequests: number;
  lastMonthRequests: number;
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
      id={`manager-tabpanel-${index}`}
      aria-labelledby={`manager-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const ManagerDashboard: React.FC = () => {
  const user = useAppSelector(selectUser);
  const [tabValue, setTabValue] = useState(0);

  // Notification state
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);
  const [unreadCount] = useState(0);
  const [hasUrgentNotifications] = useState(false);

  // State management
  const [teamRequests, setTeamRequests] = useState<TravelRequestDto[]>([]);
  const [statistics, setStatistics] = useState<TeamStatisticsData>({
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    disapprovedRequests: 0,
    completedRequests: 0,
    teamMembersCount: 0,
    averageApprovalTime: 0,
    approvalRate: 0,
    thisMonthRequests: 0,
    lastMonthRequests: 0,
  });
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>(
    '30d'
  );
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });
  const [pagination, setPagination] = useState<PaginationConfig>({
    page: 1,
    pageSize: 20,
    total: 0,
  });

  // Load manager data
  const loadManagerData = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Load manager-specific requests using manager API
      const managerRequests = await managerService.getPendingRequests(
        user.userId
      );
      setTeamRequests(managerRequests);

      // Calculate statistics from manager requests
      const stats = calculateStatistics(managerRequests);
      setStatistics(stats);
      setPendingApprovalsCount(stats.pendingRequests);
    } catch (error) {
      console.error('Failed to load manager data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadManagerData();
  }, [loadManagerData]);

  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Generate analytics data
  const generateAnalyticsData = () => {
    // Status distribution
    const statusData = {
      Pending: statistics.pendingRequests,
      Approved: statistics.approvedRequests,
      Completed: statistics.completedRequests,
      Rejected: statistics.disapprovedRequests,
      Booked: teamRequests.filter(r => r.status === 'Booked').length,
      'Returned to Employee': teamRequests.filter(
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

      const monthRequests = teamRequests.filter(r => {
        const createdDate = new Date(r.fromDate);
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
        pending: monthRequests.filter(r => r.status === 'Pending').length,
        disapproved: monthRequests.filter(r => r.status === 'Rejected').length,
      });
    }

    // Performance metrics
    const performanceMetrics = [
      {
        name: 'Approval Rate',
        value: statistics.approvalRate,
        target: 85,
        unit: '%',
        trend: { direction: 'up' as const, percentage: 5.2 },
      },
      {
        name: 'Avg Approval Time',
        value: statistics.averageApprovalTime,
        target: 24,
        unit: 'h',
        trend: { direction: 'down' as const, percentage: -12.3 },
      },
      {
        name: 'Team Productivity',
        value: statistics.totalRequests / statistics.teamMembersCount || 0,
        target: 5,
        unit: ' req/person',
        trend: { direction: 'up' as const, percentage: 8.7 },
      },
      {
        name: 'Response Time',
        value: statistics.averageApprovalTime * 0.8, // Assuming response is faster than approval
        target: 12,
        unit: 'h',
        trend: { direction: 'flat' as const, percentage: 0.5 },
      },
    ];

    // Department analytics (mock data for team members)
    const departmentData = [
      {
        departmentId: user?.department?.departmentId || 1,
        departmentName: user?.department?.departmentName || 'My Team',
        totalRequests: statistics.totalRequests,
        pendingRequests: statistics.pendingRequests,
        approvedRequests: statistics.approvedRequests,
        completedRequests: statistics.completedRequests,
        averageProcessingTime: statistics.averageApprovalTime,
        completionRate:
          statistics.totalRequests > 0
            ? (statistics.completedRequests / statistics.totalRequests) * 100
            : 0,
      },
    ];

    return { statusData, timeSeriesData, performanceMetrics, departmentData };
  };

  const analyticsData = generateAnalyticsData();

  // Calculate statistics from manager requests
  const calculateStatistics = (
    requests: TravelRequestDto[]
  ): TeamStatisticsData => {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const thisMonthRequests = requests.filter(
      r => new Date(r.fromDate) >= thisMonth
    ).length;
    const lastMonthRequestsCount = requests.filter(r => {
      const createdDate = new Date(r.fromDate);
      return createdDate >= lastMonth && createdDate <= lastMonthEnd;
    }).length;

    // Calculate average approval time (mock calculation since backend doesn't track this)
    const approvedRequests = requests.filter(
      r => r.status === 'Approved' || r.status === 'Completed'
    );
    const avgApprovalTime = approvedRequests.length > 0 ? 24 : 0; // Mock 24 hours average

    // Calculate approval rate
    const totalProcessed = requests.filter(r => r.status !== 'Pending').length;
    const approvalRate =
      totalProcessed > 0 ? (approvedRequests.length / totalProcessed) * 100 : 0;

    return {
      totalRequests: requests.length,
      pendingRequests: requests.filter(r => r.status === 'Pending').length,
      approvedRequests: requests.filter(r => r.status === 'Approved').length,
      disapprovedRequests: requests.filter(r => r.status === 'Rejected').length,
      completedRequests: requests.filter(r => r.status === 'Completed').length,
      teamMembersCount: new Set(requests.map(r => r.user?.userId)).size,
      averageApprovalTime: avgApprovalTime,
      approvalRate,
      thisMonthRequests,
      lastMonthRequests: lastMonthRequestsCount,
    };
  };

  // Handle request approval
  const handleApproveRequest = async (requestId: number, comments?: string) => {
    try {
      const commentDto: CommentDto = {
        comments: comments || 'Request approved by manager',
      };
      await managerService.approveRequest(requestId, commentDto);

      // Reload data to reflect changes
      await loadManagerData();

      setSnackbar({
        open: true,
        message: 'Request approved successfully',
        severity: 'success',
      });
    } catch (error) {
      console.error('Failed to approve request:', error);
      setSnackbar({
        open: true,
        message: 'Failed to approve request',
        severity: 'error',
      });
    }
  };

  // Handle request rejection
  const handleRejectRequest = async (requestId: number, comments?: string) => {
    try {
      const commentDto: CommentDto = {
        comments: comments || 'Request rejected by manager',
      };
      await managerService.rejectRequest(requestId, commentDto);

      // Reload data to reflect changes
      await loadManagerData();

      setSnackbar({
        open: true,
        message: 'Request rejected successfully',
        severity: 'success',
      });
    } catch (error) {
      console.error('Failed to reject request:', error);
      setSnackbar({
        open: true,
        message: 'Failed to reject request',
        severity: 'error',
      });
    }
  };

  return (
    <MainLayout title='Manager Dashboard'>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Box>
          <Typography variant='h5' gutterBottom>
            Welcome, {user?.firstName} {user?.lastName}!
          </Typography>
          <Typography variant='body1' color='text.secondary'>
            Manage your team's travel requests and view travel statistics.
          </Typography>
        </Box>

        {/* Notification Summary */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          {pendingApprovalsCount > 0 && (
            <Card sx={{ minWidth: 120 }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant='body2' color='text.secondary' gutterBottom>
                  Pending Approvals
                </Typography>
                <Badge
                  badgeContent={pendingApprovalsCount}
                  color='error'
                  max={99}
                >
                  <Typography variant='h6' color='primary'>
                    {pendingApprovalsCount}
                  </Typography>
                </Badge>
              </CardContent>
            </Card>
          )}

          {unreadCount > 0 && (
            <Card sx={{ minWidth: 120 }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant='body2' color='text.secondary' gutterBottom>
                  Unread Notifications
                </Typography>
                <Badge badgeContent={unreadCount} color='info' max={99}>
                  <Typography
                    variant='h6'
                    color={hasUrgentNotifications ? 'error' : 'info'}
                  >
                    {unreadCount}
                  </Typography>
                </Badge>
              </CardContent>
            </Card>
          )}
        </Box>
      </Box>

      {/* Dashboard Tabs */}
      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label='manager dashboard tabs'
          >
            <Tab icon={<DashboardIcon />} label='Overview' />
            <Tab icon={<AnalyticsIcon />} label='Analytics' />
            <Tab icon={<AssignmentIcon />} label='Approval Queue' />
            <Tab icon={<PeopleIcon />} label='Team Performance' />
          </Tabs>
        </Box>

        {/* Overview Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {/* KPI Cards */}
            <Box sx={{ flex: 1, minWidth: 250 }}>
              <StatCard
                title='Total Requests'
                value={statistics.totalRequests}
                icon={<AssignmentIcon />}
                iconColor='primary'
                loading={loading}
                trend={{
                  value:
                    statistics.lastMonthRequests > 0
                      ? ((statistics.thisMonthRequests -
                          statistics.lastMonthRequests) /
                          statistics.lastMonthRequests) *
                        100
                      : 0,
                  direction:
                    statistics.thisMonthRequests > statistics.lastMonthRequests
                      ? 'up'
                      : statistics.thisMonthRequests <
                          statistics.lastMonthRequests
                        ? 'down'
                        : 'flat',
                  period: 'last month',
                }}
                info='Total requests from your team'
              />
            </Box>

            <Box sx={{ flex: 1, minWidth: 250 }}>
              <StatCard
                title='Pending Approval'
                value={statistics.pendingRequests}
                icon={<AssignmentIcon />}
                iconColor='warning'
                loading={loading}
                info='Requests awaiting your approval'
                onClick={() => setTabValue(2)}
              />
            </Box>

            <Box sx={{ flex: 1, minWidth: 250 }}>
              <StatCard
                title='Approval Rate'
                value={statistics.approvalRate}
                icon={<TrendingUpIcon />}
                iconColor='success'
                loading={loading}
                format='percentage'
                info='Percentage of requests approved'
              />
            </Box>

            <Box sx={{ flex: 1, minWidth: 250 }}>
              <StatCard
                title='Avg Approval Time'
                value={statistics.averageApprovalTime}
                icon={<AssignmentIcon />}
                iconColor='info'
                loading={loading}
                format='time'
                info='Average time to approve requests'
              />
            </Box>

            {/* Team Statistics */}
            <Box sx={{ flex: 1, minWidth: 300 }}>
              <TeamStatistics statistics={statistics} loading={loading} />
            </Box>
          </Box>
        </TabPanel>

        {/* Analytics Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {/* Status Distribution */}
            <Box sx={{ flex: 1, minWidth: 300 }}>
              <StatusDistributionChart
                data={analyticsData.statusData}
                title='Team Request Status Distribution'
                height={400}
              />
            </Box>

            {/* Performance Metrics */}
            <Box sx={{ flex: 1, minWidth: 300 }}>
              <PerformanceMetricsChart
                metrics={analyticsData.performanceMetrics}
                title='Management Performance Metrics'
                height={400}
              />
            </Box>

            {/* Request Trend */}
            <Box sx={{ flex: 1, minWidth: 300 }}>
              <TimeSeriesChart
                data={analyticsData.timeSeriesData}
                title='Team Request Trend Analysis'
                height={400}
                timeRange={timeRange}
                onTimeRangeChange={setTimeRange}
                multiSeries={[
                  { key: 'value', name: 'Total Requests', color: '#2196F3' },
                  { key: 'approved', name: 'Approved', color: '#4CAF50' },
                  { key: 'pending', name: 'Pending', color: '#FF9800' },
                  { key: 'disapproved', name: 'Disapproved', color: '#F44336' },
                ]}
              />
            </Box>

            {/* Department Analytics */}
            <Box sx={{ flex: 1, minWidth: 300 }}>
              <DepartmentAnalyticsChart
                data={analyticsData.departmentData}
                title='Team Performance Analytics'
                height={400}
              />
            </Box>
          </Box>
        </TabPanel>

        {/* Approval Queue Tab */}
        <TabPanel value={tabValue} index={2}>
          <ApprovalQueue
            requests={teamRequests}
            loading={loading}
            pagination={pagination}
            onPaginationChange={setPagination}
            onApproveRequest={handleApproveRequest}
            onRejectRequest={handleRejectRequest}
          />
        </TabPanel>

        {/* Team Performance Tab */}
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            <Box sx={{ flex: 1, minWidth: 300 }}>
              <PerformanceMetricsChart
                metrics={analyticsData.performanceMetrics}
                title='Detailed Team Performance Analysis'
                height={500}
                showTrends={true}
              />
            </Box>
          </Box>
        </TabPanel>
      </Paper>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </MainLayout>
  );
};

export default ManagerDashboard;
