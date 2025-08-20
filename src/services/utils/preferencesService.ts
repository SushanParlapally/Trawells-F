/**
 * Service for managing user preferences in localStorage
 */

interface UserPreferences {
  dismissedAlerts: string[];
  theme: 'light' | 'dark';
  sidebarCollapsed: boolean;
  dashboardLayout: 'grid' | 'list';
}

class PreferencesService {
  private static STORAGE_KEY = 'travel_desk_preferences';

  /**
   * Get all user preferences
   */
  static getPreferences(): UserPreferences {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : this.getDefaultPreferences();
    } catch (error) {
      console.error('Error loading preferences:', error);
      return this.getDefaultPreferences();
    }
  }

  /**
   * Get default preferences
   */
  private static getDefaultPreferences(): UserPreferences {
    return {
      dismissedAlerts: [],
      theme: 'light',
      sidebarCollapsed: false,
      dashboardLayout: 'grid',
    };
  }

  /**
   * Update user preferences
   */
  static updatePreferences(updates: Partial<UserPreferences>): void {
    try {
      const current = this.getPreferences();
      const updated = { ...current, ...updates };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  }

  /**
   * Dismiss an alert permanently
   */
  static dismissAlert(alertId: string): void {
    const preferences = this.getPreferences();
    if (!preferences.dismissedAlerts.includes(alertId)) {
      preferences.dismissedAlerts.push(alertId);
      this.updatePreferences(preferences);
    }
  }

  /**
   * Check if an alert has been dismissed
   */
  static isAlertDismissed(alertId: string): boolean {
    const preferences = this.getPreferences();
    return preferences.dismissedAlerts.includes(alertId);
  }

  /**
   * Clear all preferences (reset to defaults)
   */
  static clearPreferences(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing preferences:', error);
    }
  }

  /**
   * Get a specific preference value
   */
  static getPreference<K extends keyof UserPreferences>(
    key: K,
    defaultValue: UserPreferences[K]
  ): UserPreferences[K] {
    const preferences = this.getPreferences();
    return preferences[key] !== undefined ? preferences[key] : defaultValue;
  }

  /**
   * Set a specific preference value
   */
  static setPreference<K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ): void {
    const updates = { [key]: value };
    this.updatePreferences(updates as Partial<UserPreferences>);
  }
}

export default PreferencesService;
