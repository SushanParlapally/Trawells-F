import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Typography, Button } from '@mui/material';
import { useAppSelector } from '../../hooks/redux';
import {
  selectIsAuthenticated,
  selectAuthLoading,
  selectUserRole,
} from '../../store/slices/authSlice';
import { type UserRole } from '../../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requireAuth?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles = [],
  requireAuth = true,
}) => {
  const location = useLocation();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const loading = useAppSelector(selectAuthLoading);
  const userRole = useAppSelector(selectUserRole);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          gap: 2,
        }}
      >
        <CircularProgress size={40} />
        <Typography variant='body1' color='text.secondary'>
          Checking authentication...
        </Typography>
      </Box>
    );
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to='/login' state={{ from: location }} replace />;
  }

  // If user is authenticated but trying to access login page
  if (!requireAuth && isAuthenticated) {
    const from = location.state?.from?.pathname;
    if (from && from !== '/login') {
      return <Navigate to={from} replace />;
    }
    const dashboardRoute = getDashboardRouteByRole(userRole);
    return <Navigate to={dashboardRoute} replace />;
  }

  // Check role-based access
  if (requireAuth && allowedRoles.length > 0 && userRole) {
    if (!allowedRoles.includes(userRole)) {
      const correctDashboard = getDashboardRouteByRole(userRole);
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            textAlign: 'center',
            p: 3,
          }}
        >
          <Typography variant='h4' color='error' gutterBottom>
            Access Denied
          </Typography>
          <Typography variant='body1' color='text.secondary' sx={{ mb: 2 }}>
            You don&apos;t have permission to access this page.
          </Typography>
          <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
            Required roles: {allowedRoles.join(', ')}
          </Typography>
          <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
            Your role: {userRole}
          </Typography>
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            <Button
              variant='contained'
              onClick={() => (window.location.href = correctDashboard)}
              color='primary'
            >
              Go to Your Dashboard
            </Button>
            <Button
              variant='outlined'
              onClick={() => (window.location.href = '/login')}
            >
              Switch Account
            </Button>
          </Box>
        </Box>
      );
    }
  }

  // If role-based access is required but no role is available yet, show loading
  if (requireAuth && allowedRoles.length > 0 && !userRole && isAuthenticated) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          gap: 2,
        }}
      >
        <CircularProgress size={40} />
        <Typography variant='body1' color='text.secondary'>
          Loading user permissions...
        </Typography>
      </Box>
    );
  }

  return <>{children}</>;
};

/**
 * Get dashboard route based on user role
 */
const getDashboardRouteByRole = (role: UserRole | null): string => {
  switch (role) {
    case 'Admin':
      return '/admin/dashboard';
    case 'TravelAdmin':
      return '/travel-admin/dashboard';
    case 'Manager':
      return '/manager/dashboard';
    case 'Employee':
      return '/employee/dashboard';
    default:
      return '/login';
  }
};

export default ProtectedRoute;
