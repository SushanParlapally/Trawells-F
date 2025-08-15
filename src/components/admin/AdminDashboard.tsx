import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography,
  Paper,
  Box,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Snackbar,
  Stack,
} from '@mui/material';
import { useAppSelector } from '../../hooks/redux';
import { selectUser } from '../../store/slices/authSlice';
import { MainLayout } from '../common/Layout';
import SystemStatsCharts from './charts/SystemStatsCharts';
import SystemHealthIndicator from './SystemHealthIndicator';
import RecentActivities from './RecentActivities';
import QuickActions from './QuickActions';
import { UserManagement } from './UserManagement';
import { DepartmentManagement } from './DepartmentManagement';
import { RoleManagement } from './RoleManagement';

import { travelRequestService } from '../../services/api/travelRequestService';
import type { DashboardDto } from '../../types';
// --- FIX: STEP 1 ---
// Import the AuthService to check the authentication status directly.
import { AuthService } from '../../services/auth/authService';

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
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const AdminDashboard: React.FC = React.memo(() => {
  const user = useAppSelector(selectUser);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage] = useState('');

  // State for dashboard data - only keep what's actually used
  const [dashboardData, setDashboardData] = useState<DashboardDto | null>(null);

  const loadDashboardData = useCallback(async () => {
    // --- FIX: STEP 2 ---
    // This guard clause prevents the API call from running if the token is not yet
    // available, solving the race condition for the entire dashboard.
    if (!AuthService.isAuthenticated()) {
      console.warn('loadDashboardData aborted: User is not yet authenticated.');
      setError('Initializing session, please wait...'); // Display a user-friendly message
      setLoading(false); // Stop the loading spinner
      return; // Exit the function immediately.
    }
    // --- END OF FIX ---

    try {
      setLoading(true);
      setError(null);

      // Only load travel data for system overview
      const travelData = await travelRequestService.getTravelRequests();
      setDashboardData(travelData);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleTabChange = useCallback(
    (_event: React.SyntheticEvent, newValue: number) => {
      setTabValue(newValue);
    },
    []
  );

  if (loading) {
    return (
      <MainLayout title='Admin Dashboard'>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 400,
          }}
        >
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout title='Admin Dashboard'>
      <Stack spacing={3}>
        {/* Welcome Section */}
        <Paper sx={{ p: 3 }}>
          <Typography variant='h4' gutterBottom>
            Welcome, {user?.firstName} {user?.lastName}!
          </Typography>
          <Typography variant='body1' color='text.secondary'>
            Monitor system performance, manage users, and oversee travel desk
            operations.
          </Typography>
        </Paper>

        {/* Error Alert */}
        {error && (
          <Alert severity='error' onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* System Health - Using actual data */}
        <SystemHealthIndicator
          usersCount={dashboardData?.requests?.length || 0}
          departmentsCount={dashboardData?.requests?.length || 0}
          projectsCount={dashboardData?.requests?.length || 0}
          requestsCount={dashboardData?.requests?.length || 0}
        />

        {/* Dashboard Tabs */}
        <Paper sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label='admin dashboard tabs'
            >
              <Tab label='System Overview' />
              <Tab label='Analytics' />
              <Tab label='User Management' />
              <Tab label='Department Management' />
              <Tab label='Role Management' />
              <Tab label='Quick Actions' />
            </Tabs>
          </Box>

          {/* System Overview Tab */}
          <TabPanel value={tabValue} index={0}>
            <Stack spacing={3}>
              <SystemStatsCharts
                users={[]}
                departments={[]}
                projects={[]}
                requests={dashboardData?.requests || []}
              />
              <RecentActivities requests={dashboardData?.requests || []} />
            </Stack>
          </TabPanel>

          {/* Analytics Tab */}
          <TabPanel value={tabValue} index={1}>
            <Typography variant='h6'>Analytics Dashboard</Typography>
            <Typography variant='body2' color='text.secondary'>
              Analytics features coming soon...
            </Typography>
          </TabPanel>

          {/* User Management Tab */}
          <TabPanel value={tabValue} index={2}>
            <UserManagement />
          </TabPanel>

          {/* Department Management Tab */}
          <TabPanel value={tabValue} index={3}>
            <DepartmentManagement />
          </TabPanel>

          {/* Role Management Tab */}
          <TabPanel value={tabValue} index={4}>
            <RoleManagement />
          </TabPanel>

          {/* Quick Actions Tab */}
          <TabPanel value={tabValue} index={5}>
            <QuickActions />
          </TabPanel>
        </Paper>
      </Stack>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </MainLayout>
  );
});

AdminDashboard.displayName = 'AdminDashboard';

export default AdminDashboard;
