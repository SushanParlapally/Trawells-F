import { useEffect, useCallback, useState } from 'react';
import { useAppDispatch } from './redux';
import { sessionManager } from '../services/auth/sessionManager';
import { logoutUser } from '../store/slices/authSlice';

interface SessionWarningState {
  isWarningVisible: boolean;
  remainingMinutes: number;
}

interface UseSessionManagerReturn {
  sessionWarning: SessionWarningState;
  extendSession: () => Promise<boolean>;
  dismissWarning: () => void;
  getRemainingTime: () => number;
  isSessionActive: () => boolean;
}

/**
 * Hook for managing user session with automatic timeout and warning handling
 * Aligned with backend JWT token system (120-minute expiry)
 */
export const useSessionManager = (): UseSessionManagerReturn => {
  const dispatch = useAppDispatch();

  const [sessionWarning, setSessionWarning] = useState<SessionWarningState>({
    isWarningVisible: false,
    remainingMinutes: 0,
  });

  /**
   * Handle session warning display
   */
  const handleSessionWarning = useCallback((remainingMinutes: number) => {
    setSessionWarning({ isWarningVisible: true, remainingMinutes });
  }, []);

  /**
   * Handle session timeout - aligns with backend JWT expiry
   */
  const handleSessionTimeout = useCallback(async () => {
    console.log('Session timeout detected in useSessionManager');

    try {
      // Backend doesn't have logout endpoint, so we just clear local state
      dispatch(logoutUser());
    } catch (error) {
      console.error('Error during session timeout logout:', error);
    }
  }, [dispatch]);

  /**
   * Extend the current session by updating activity
   * Note: Backend doesn't support session extension, this is client-side only
   */
  const extendSession = useCallback(async (): Promise<boolean> => {
    try {
      const extended = sessionManager.extendSession();

      if (extended) {
        setSessionWarning({ isWarningVisible: false, remainingMinutes: 0 });
      }

      return extended;
    } catch (error) {
      console.error('Failed to extend session:', error);
      return false;
    }
  }, []);

  /**
   * Dismiss the session warning without extending
   */
  const dismissWarning = useCallback(() => {
    setSessionWarning({ isWarningVisible: false, remainingMinutes: 0 });
  }, []);

  /**
   * Get remaining session time based on JWT token expiry
   */
  const getRemainingTime = useCallback((): number => {
    return sessionManager.getTimeUntilExpiry();
  }, []);

  /**
   * Check if session is active based on JWT token validity
   */
  const isSessionActive = useCallback((): boolean => {
    return sessionManager.getState().isActive;
  }, []);

  /**
   * Initialize session manager callbacks
   */
  useEffect(() => {
    // Set up session manager callbacks
    sessionManager.onWarning(handleSessionWarning);
    sessionManager.onTimeout(handleSessionTimeout);

    // Cleanup on unmount
    return () => {
      sessionManager.offWarning(handleSessionWarning);
      sessionManager.offTimeout(handleSessionTimeout);
    };
  }, [handleSessionWarning, handleSessionTimeout]);

  return {
    sessionWarning,
    extendSession,
    dismissWarning,
    getRemainingTime,
    isSessionActive,
  };
};

/**
 * Hook for tracking user activity and updating session
 * Works with backend JWT token system
 */
export const useSessionActivity = (isActive = true): void => {
  useEffect(() => {
    if (!isActive) return;

    const updateActivity = () => {
      sessionManager.updateActivity();
    };

    // Update activity on user interactions
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
    ];

    events.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity, true);
      });
    };
  }, [isActive]);
};

/**
 * Hook for getting session information
 * Aligned with backend JWT token system
 */
export const useSessionInfo = (): {
  config: {
    timeoutMinutes: number;
    warningMinutes: number;
  };
  state: {
    isActive: boolean;
    lastActivity: number;
    timeUntilExpiry: number;
  };
} => {
  const [sessionInfo, setSessionInfo] = useState(() => ({
    config: sessionManager.getConfig(),
    state: sessionManager.getState(),
  }));

  useEffect(() => {
    const updateSessionInfo = () => {
      setSessionInfo({
        config: sessionManager.getConfig(),
        state: sessionManager.getState(),
      });
    };

    // Update session info periodically
    const interval = setInterval(updateSessionInfo, 1000);

    return () => clearInterval(interval);
  }, []);

  return sessionInfo;
};
