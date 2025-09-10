import { AuthService } from './authService';

interface SessionConfig {
  timeoutMinutes: number;
  warningMinutes: number;
}

interface SessionState {
  isActive: boolean;
  lastActivity: number;
  timeUntilExpiry: number;
}

type WarningCallback = (remainingMinutes: number) => void;
type TimeoutCallback = () => void;

class SessionManager {
  private sessionTimer: number | null = null;
  private warningTimer: number | null = null;
  private lastActivity: number = Date.now();
  private warningCallbacks: WarningCallback[] = [];
  private timeoutCallbacks: TimeoutCallback[] = [];

  private readonly DEFAULT_CONFIG: SessionConfig = {
    timeoutMinutes: 30,
    warningMinutes: 5,
  };

  private config: SessionConfig = this.DEFAULT_CONFIG;

  /**
   * Configure session manager
   */
  configure(config: Partial<SessionConfig>): void {
    this.config = { ...this.DEFAULT_CONFIG, ...config };
  }

  /**
   * Start session management
   */
  startSession(): void {
    this.updateActivity();
    this.startSessionTimer();
  }

  /**
   * End session management
   */
  endSession(): void {
    this.clearTimers();
  }

  /**
   * Update last activity timestamp
   */
  updateActivity(): void {
    this.lastActivity = Date.now();
    this.restartTimers();
  }

  /**
   * Start session timeout timer
   */
  private startSessionTimer(): void {
    this.clearTimers();

    const timeoutMs = this.config.timeoutMinutes * 60 * 1000;
    const warningMs = this.config.warningMinutes * 60 * 1000;

    // Set warning timer
    this.warningTimer = setTimeout(() => {
      const timeSinceLastActivity = Date.now() - this.lastActivity;
      if (timeSinceLastActivity >= timeoutMs - warningMs) {
        this.handleSessionWarning();
      }
    }, timeoutMs - warningMs);

    // Set session timeout timer
    this.sessionTimer = setTimeout(() => {
      const timeSinceLastActivity = Date.now() - this.lastActivity;
      if (timeSinceLastActivity >= timeoutMs) {
        this.handleSessionExpiry();
      } else {
        // Restart timer for remaining time
        this.startSessionTimer();
      }
    }, timeoutMs);
  }

  /**
   * Clear all timers
   */
  private clearTimers(): void {
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
      this.sessionTimer = null;
    }
    if (this.warningTimer) {
      clearTimeout(this.warningTimer);
      this.warningTimer = null;
    }
  }

  /**
   * Restart timers after activity
   */
  private restartTimers(): void {
    this.startSessionTimer();
  }

  /**
   * Handle session warning
   */
  private handleSessionWarning(): void {
    const remainingMinutes = this.getTimeUntilExpiry() / (60 * 1000);
    this.warningCallbacks.forEach(callback => callback(remainingMinutes));
  }

  /**
   * Handle session expiry
   */
  private handleSessionExpiry(): void {
    console.log('Session expired due to inactivity');
    this.timeoutCallbacks.forEach(callback => callback());

    // Clear session data and redirect to login
    AuthService.removeToken();
    AuthService.removeUser();
    window.location.href = '/login';
  }

  /**
   * Get time until session expires
   */
  getTimeUntilExpiry(): number {
    const timeSinceLastActivity = Date.now() - this.lastActivity;
    const timeoutMs = this.config.timeoutMinutes * 60 * 1000;
    return Math.max(0, timeoutMs - timeSinceLastActivity);
  }

  /**
   * Check if session is active
   */
  isSessionActive(): boolean {
    const timeSinceLastActivity = Date.now() - this.lastActivity;
    const timeoutMs = this.config.timeoutMinutes * 60 * 1000;
    return timeSinceLastActivity < timeoutMs;
  }

  /**
   * Get session configuration
   */
  getConfig(): SessionConfig {
    return { ...this.config };
  }

  /**
   * Get current session state
   */
  getState(): SessionState {
    return {
      isActive: this.isSessionActive(),
      lastActivity: this.lastActivity,
      timeUntilExpiry: this.getTimeUntilExpiry(),
    };
  }

  /**
   * Register warning callback
   */
  onWarning(callback: WarningCallback): void {
    this.warningCallbacks.push(callback);
  }

  /**
   * Register timeout callback
   */
  onTimeout(callback: TimeoutCallback): void {
    this.timeoutCallbacks.push(callback);
  }

  /**
   * Remove warning callback
   */
  offWarning(callback: WarningCallback): void {
    const index = this.warningCallbacks.indexOf(callback);
    if (index > -1) {
      this.warningCallbacks.splice(index, 1);
    }
  }

  /**
   * Remove timeout callback
   */
  offTimeout(callback: TimeoutCallback): void {
    const index = this.timeoutCallbacks.indexOf(callback);
    if (index > -1) {
      this.timeoutCallbacks.splice(index, 1);
    }
  }

  /**
   * Extend session by updating activity
   */
  extendSession(): boolean {
    if (this.isSessionActive()) {
      this.updateActivity();
      return true;
    }
    return false;
  }
}

export const sessionManager = new SessionManager();
