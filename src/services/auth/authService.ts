import { apiClient } from '../api/config';
import type {
  User,
  LoginCredentials,
  UserRole,
  LoginResponse,
} from '../../types';

interface TokenPayload {
  Email: string;
  userid: string;
  firstname: string;
  lastname?: string; // Can be null from backend
  departmentid: string;
  role: string;
  managerid?: string; // Can be null from backend
  roleId: string;
  exp: number;
  iat: number;
}

export class AuthService {
  private static readonly TOKEN_KEY = 'travel_desk_token';
  private static readonly USER_KEY = 'travel_desk_user';

  /**
   * Login user with credentials
   * POST: api/Login (matches backend exactly)
   */
  static async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      // Backend expects: { email: string, password: string }
      const response = await apiClient.post('/api/Login', credentials);

      // Backend returns: { token: string }
      const { token } = response.data;

      if (!token) {
        throw new Error('No token received from server');
      }

      // Store token
      this.setToken(token);

      // Decode token to get user info (backend puts user data in JWT claims)
      const userInfo = this.decodeToken(token);
      const user: User = {
        userId: parseInt(userInfo.userid),
        firstName: userInfo.firstname,
        lastName: userInfo.lastname || undefined, // Handle null from backend
        email: userInfo.Email,
        mobileNum: '', // Not available in token
        address: '', // Not available in token
        password: '', // Never store password
        roleId: parseInt(userInfo.roleId),
        departmentId: parseInt(userInfo.departmentid),
        managerId: userInfo.managerid
          ? parseInt(userInfo.managerid)
          : undefined,
        createdBy: 1, // Default value
        createdOn: new Date().toISOString(),
        isActive: true,
        role: {
          roleId: parseInt(userInfo.roleId),
          roleName: userInfo.role,
          createdBy: 1,
          createdOn: new Date().toISOString(),
          isActive: true,
        },
      };

      this.setUser(user);
      return { token };
    } catch (error) {
      console.error('Login failed:', error);
      // Clear any partial data
      this.removeToken();
      this.removeUser();
      throw error;
    }
  }

  /**
   * Logout user
   */
  static async logout(): Promise<void> {
    try {
      // Backend doesn't have a logout endpoint, so we just clear local data
      // If backend adds logout endpoint later, we can call it here
      // await apiClient.post('/api/logout');
    } catch (error) {
      // Continue with local logout even if API call fails
      console.warn('Logout API call failed: ', error);
    } finally {
      // Always clear all storage
      this.removeToken();
      this.removeUser();
    }
  }

  /**
   * Get current user from stored data or token
   */
  static getCurrentUser(): User | null {
    return this.getUser();
  }

  /**
   * Store JWT token
   */
  static setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  /**
   * Get JWT token
   */
  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Remove JWT token
   */
  static removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  /**
   * Store user data
   */
  static setUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  /**
   * Get user data
   */
  static getUser(): User | null {
    const userData = localStorage.getItem(this.USER_KEY);
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch (error) {
        console.error('Failed to parse user data: ', error);
        return null;
      }
    }
    return null;
  }

  /**
   * Remove user data
   */
  static removeUser(): void {
    localStorage.removeItem(this.USER_KEY);
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    const token = this.getToken();
    return token ? !this.isTokenExpired(token) : false;
  }

  /**
   * Check if token is expired
   */
  static isTokenExpired(token: string): boolean {
    try {
      const payload = this.decodeToken(token);
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch {
      return true;
    }
  }

  /**
   * Decode JWT token (matches backend JWT structure exactly)
   */
  static decodeToken(token: string): TokenPayload {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid token format');
      }

      const base64Url = parts[1];
      if (!base64Url) {
        throw new Error('Invalid token payload');
      }

      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      const payload = JSON.parse(jsonPayload);

      // Validate required fields (matches backend JWT claims exactly)
      if (!payload.Email || !payload.userid || !payload.role) {
        throw new Error('Token missing required user information');
      }

      return payload;
    } catch (error) {
      console.error('Token decoding failed:', error);
      throw new Error('Invalid or corrupted authentication token');
    }
  }

  /**
   * Get user role from token or stored user data
   */
  static getUserRole(): UserRole | null {
    const token = this.getToken();
    if (token && !this.isTokenExpired(token)) {
      try {
        const payload = this.decodeToken(token);
        return payload.role as UserRole;
      } catch {
        // Fallback to stored user data
        const user = this.getUser();
        return (user?.role?.roleName as UserRole) || null;
      }
    }
    // Fallback to stored user data when no valid token
    const user = this.getUser();
    return (user?.role?.roleName as UserRole) || null;
  }

  /**
   * Get user ID from token or stored user data
   */
  static getUserId(): number | null {
    const token = this.getToken();
    if (token && !this.isTokenExpired(token)) {
      try {
        const payload = this.decodeToken(token);
        return parseInt(payload.userid);
      } catch {
        // Fallback to stored user data
        const user = this.getUser();
        return user?.userId || null;
      }
    }
    // Fallback to stored user data when no valid token
    const user = this.getUser();
    return user?.userId || null;
  }

  /**
   * Check if user has specific role
   */
  static hasRole(role: UserRole): boolean {
    const userRole = this.getUserRole();
    return userRole === role;
  }

  /**
   * Check if user has any of the specified roles
   */
  static hasAnyRole(roles: UserRole[]): boolean {
    const userRole = this.getUserRole();
    return userRole ? roles.includes(userRole) : false;
  }

  /**
   * Get appropriate dashboard route based on user role
   */
  static getDashboardRoute(): string {
    const role = this.getUserRole();
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
  }

  /**
   * Refresh token if needed (backend doesn't have refresh endpoint yet)
   */
  static async refreshTokenIfNeeded(): Promise<boolean> {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = this.decodeToken(token);
      const currentTime = Date.now() / 1000;
      const timeUntilExpiry = payload.exp - currentTime;

      // If backend adds refresh endpoint later, we can call it here
      // For now, just return true if token is still valid
      if (timeUntilExpiry < 300) {
        // Token expires in less than 5 minutes, but no refresh endpoint
        console.warn(
          'Token will expire soon, but no refresh endpoint available'
        );
        return timeUntilExpiry > 0;
      }
      return true;
    } catch (error) {
      console.error('Token refresh check failed: ', error);
      this.removeToken();
      this.removeUser();
      return false;
    }
  }

  /**
   * Get token expiration time in minutes from now
   */
  static getTokenExpirationMinutes(token: string): number | undefined {
    try {
      const payload = this.decodeToken(token);
      const currentTime = Date.now() / 1000;
      const timeUntilExpiry = payload.exp - currentTime;
      return Math.max(0, Math.floor(timeUntilExpiry / 60));
    } catch (error) {
      console.error('Failed to get token expiration: ', error);
      return undefined;
    }
  }

  /**
   * Force refresh authentication state by clearing all cached data
   * This is useful when switching between different user accounts
   */
  static forceRefreshAuth(): void {
    this.removeToken();
    this.removeUser();
    // Force a page reload to clear any cached state
    window.location.reload();
  }

  /**
   * Check if current authentication state is consistent
   * Returns true if token and user data match, false otherwise
   */
  static isAuthStateConsistent(): boolean {
    try {
      const token = this.getToken();
      const user = this.getUser();

      if (!token || !user) {
        return false;
      }

      if (this.isTokenExpired(token)) {
        return false;
      }

      const tokenPayload = this.decodeToken(token);
      return tokenPayload.userid === user.userId.toString();
    } catch (error) {
      console.warn('Auth state consistency check failed:', error);
      return false;
    }
  }

  /**
   * Recover from inconsistent authentication state
   * This method should be called when authentication state is corrupted
   */
  static recoverAuthState(): void {
    console.warn('Recovering from inconsistent authentication state');
    this.removeToken();
    this.removeUser();
    // Redirect to login to force fresh authentication
    window.location.href = '/login';
  }

  /**
   * Validate and clean authentication state
   * Returns true if state is valid, false if cleanup was needed
   */
  static validateAndCleanAuthState(): boolean {
    try {
      const token = this.getToken();
      const user = this.getUser();

      // If no token or user data, state is clean
      if (!token && !user) {
        return true;
      }

      // If only one exists, clean up
      if (!token || !user) {
        this.removeToken();
        this.removeUser();
        return false;
      }

      // Check if token is expired
      if (this.isTokenExpired(token)) {
        this.removeToken();
        this.removeUser();
        return false;
      }

      // Check if token and user data match
      const tokenPayload = this.decodeToken(token);
      if (tokenPayload.userid !== user.userId.toString()) {
        this.removeToken();
        this.removeUser();
        return false;
      }

      return true;
    } catch (error) {
      console.error('Auth state validation failed:', error);
      this.removeToken();
      this.removeUser();
      return false;
    }
  }
}
