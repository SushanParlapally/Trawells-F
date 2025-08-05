import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import {
  checkAuthStatus,
  selectIsAuthenticated,
} from '../../store/slices/authSlice';
import { sessionManager } from '../../services/auth/sessionManager';
import { AuthService } from '../../services/auth/authService';

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  useEffect(() => {
    // Validate authentication state on app initialization
    const isValid = AuthService.validateAndCleanAuthState();
    if (!isValid) {
      console.warn('Invalid authentication state detected and cleaned');
    }

    // Check authentication status on app initialization
    dispatch(checkAuthStatus());
  }, [dispatch]);

  useEffect(() => {
    // Initialize session management when user is authenticated
    if (isAuthenticated) {
      sessionManager.startSession();
    } else {
      sessionManager.endSession();
    }

    // Cleanup on unmount
    return () => {
      sessionManager.endSession();
    };
  }, [isAuthenticated]);

  return <>{children}</>;
};

export default AuthProvider;
