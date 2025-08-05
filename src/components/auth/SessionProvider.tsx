import React from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { useSessionManager } from '../../hooks/useSessionManager';
import {
  logoutUser,
  selectIsAuthenticated,
} from '../../store/slices/authSlice';
import SessionWarningModal from './SessionWarningModal';

export interface SessionProviderProps {
  children: React.ReactNode;
}

/**
 * SessionProvider component that manages user session across the entire application
 * Handles session warnings, timeouts, and automatic logout
 */
export const SessionProvider: React.FC<SessionProviderProps> = ({
  children,
}) => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const { sessionWarning, extendSession, dismissWarning } = useSessionManager();

  /**
   * Handle logout when session times out or user chooses to logout
   */
  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
    } catch (error) {
      console.error('Error during logout: ', error);
      // Force redirect to login even if logout fails
      window.location.href = '/login';
    }
  };

  /**
   * Handle session extension
   */
  const handleExtendSession = async (): Promise<boolean> => {
    try {
      const success = await extendSession();

      if (success) {
        console.log('Session extended successfully');
        return true;
      } else {
        console.warn('Failed to extend session');
        return false;
      }
    } catch (error) {
      console.error('Error extending session: ', error);
      return false;
    }
  };

  // Only render session management for authenticated users
  if (!isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      <SessionWarningModal
        open={sessionWarning.isWarningVisible}
        remainingMinutes={sessionWarning.remainingMinutes}
        onExtendSession={handleExtendSession}
        onDismiss={dismissWarning}
        onLogout={handleLogout}
      />
    </>
  );
};

export default SessionProvider;
