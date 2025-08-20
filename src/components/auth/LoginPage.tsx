import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Grid, Box, Typography, Link } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import {
  loginUser,
  selectIsAuthenticated,
  selectAuthLoading,
  selectAuthError,
  clearError,
  selectUserRole,
} from '../../store/slices/authSlice';
import type { LoginCredentials } from '../../types';
import { AuthService } from '../../services/auth/authService';
import LoginForm from './LoginForm';

const LoginPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const loading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);
  const userRole = useAppSelector(selectUserRole);

  // Clear any existing errors when component mounts
  useEffect(() => {
    dispatch(clearError());
    // Clear any stale data when accessing login page
    if (!isAuthenticated) {
      AuthService.removeToken();
      AuthService.removeUser();
    }
  }, [dispatch, isAuthenticated]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && userRole) {
      const from = (location.state as { from?: { pathname: string } })?.from
        ?.pathname;
      if (from && from !== '/login') {
        navigate(from, { replace: true });
      } else {
        const dashboardRoute = AuthService.getDashboardRoute();
        navigate(dashboardRoute, { replace: true });
      }
    }
  }, [isAuthenticated, userRole, navigate, location.state]);

  const handleLogin = async (credentials: LoginCredentials) => {
    try {
      // Backend expects: { email: string, password: string }
      // Backend returns: { token: string }
      const result = await dispatch(loginUser(credentials));
      if (loginUser.fulfilled.match(result)) {
        // Login successful - navigation will be handled by the useEffect above
        console.log('Login successful');
      }
    } catch (error) {
      console.error('Login error: ', error);
    }
  };

  return (
    <Grid container sx={{ minHeight: '100vh' }}>
      {/* Visual Panel */}
      <Grid
        item
        xs={false}
        sm={4}
        md={6}
        sx={{
          background: 'linear-gradient(45deg, #007BFF 30%, #FFB300 90%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box textAlign='center' color='white' p={4}>
          <Typography variant='h3' gutterBottom fontWeight={700}>
            Travel Desk
          </Typography>
          <Typography variant='h6' sx={{ opacity: 0.9 }}>
            Your corporate travel companion
          </Typography>
        </Box>
      </Grid>

      {/* Form Panel */}
      <Grid
        item
        xs={12}
        sm={8}
        md={6}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
          p: 2,
        }}
      >
        <Box sx={{ maxWidth: 400, width: '100%' }}>
          <LoginForm onSubmit={handleLogin} loading={loading} error={error} />
          <Box textAlign='center' mt={2}>
            <Link href='#' variant='body2' color='primary'>
              Forgot Password?
            </Link>
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
};

export default LoginPage;
