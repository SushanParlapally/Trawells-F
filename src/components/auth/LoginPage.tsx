import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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

const LoginPage: React.FC = () => {
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

  return <LoginForm onSubmit={handleLogin} loading={loading} error={error} />;
};

export default LoginPage;
