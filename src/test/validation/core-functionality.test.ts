import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthService } from '../../services/auth/authService';
import type { User } from '../../types';

describe('Core Functionality Validation', () => {
  const mockUser: User = {
    userId: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    mobileNum: '1234567890',
    address: '123 Main St',
    password: 'password123',
    roleId: 1,
    role: {
      roleId: 1,
      roleName: 'Employee',
      createdBy: 1,
      createdOn: '2025-01-01',
      isActive: true,
    },
    departmentId: 1,
    department: {
      departmentId: 1,
      departmentName: 'IT',
      createdBy: 1,
      createdOn: '2025-01-01',
      isActive: true,
    },
    createdBy: 1,
    createdOn: '2025-01-01',
    isActive: true,
  };

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  describe('Authentication Service', () => {
    it('should handle user data serialization correctly', () => {
      // Store user data
      AuthService.setUser(mockUser);

      // Retrieve user
      const retrievedUser = AuthService.getUser();

      expect(retrievedUser).toBeTruthy();
      expect(retrievedUser?.userId).toBe(mockUser.userId);
      expect(retrievedUser?.firstName).toBe(mockUser.firstName);
      expect(retrievedUser?.role?.roleName).toBe(mockUser.role?.roleName);
    });

    it('should handle role detection with fallback', () => {
      // Store user data
      AuthService.setUser(mockUser);

      // Should get role from stored user data when no token
      const role = AuthService.getUserRole();
      expect(role).toBe('Employee');

      const userId = AuthService.getUserId();
      expect(userId).toBe(1);
    });

    it('should provide correct dashboard routes', () => {
      const testCases = [
        { role: 'Admin', expectedRoute: '/admin/dashboard' },
        { role: 'TravelAdmin', expectedRoute: '/travel-admin/dashboard' },
        { role: 'Manager', expectedRoute: '/manager/dashboard' },
        { role: 'Employee', expectedRoute: '/employee/dashboard' },
      ];

      testCases.forEach(({ role, expectedRoute }) => {
        const userWithRole = {
          ...mockUser,
          role: { ...mockUser.role!, roleName: role },
        };

        AuthService.setUser(userWithRole);
        const route = AuthService.getDashboardRoute();
        expect(route).toBe(expectedRoute);
      });
    });
  });

  describe('Token Handling', () => {
    it('should handle token storage and retrieval', () => {
      const testToken = 'test.jwt.token';

      AuthService.setToken(testToken);
      const retrievedToken = AuthService.getToken();

      expect(retrievedToken).toBe(testToken);

      AuthService.removeToken();
      const removedToken = AuthService.getToken();

      expect(removedToken).toBeNull();
    });

    it('should handle authentication state correctly', () => {
      // Should not be authenticated initially
      expect(AuthService.isAuthenticated()).toBe(false);

      // Should handle invalid tokens gracefully
      expect(() => {
        AuthService.isTokenExpired('invalid-token');
      }).not.toThrow();
    });
  });

  describe('Integration Validation', () => {
    it('should handle complete authentication flow', () => {
      // 1. User data storage and retrieval
      AuthService.setUser(mockUser);
      const storedUser = AuthService.getUser();
      expect(storedUser?.userId).toBe(mockUser.userId);

      // 2. Role-based routing
      const dashboardRoute = AuthService.getDashboardRoute();
      expect(dashboardRoute).toBe('/employee/dashboard');

      // 3. Cleanup
      AuthService.removeUser();
      const removedUser = AuthService.getUser();
      expect(removedUser).toBeNull();
    });

    it('should handle error scenarios gracefully', () => {
      // Test invalid token handling
      expect(() => {
        AuthService.isTokenExpired('invalid-token');
      }).not.toThrow();

      // Test user data handling with null values
      expect(() => {
        AuthService.removeUser();
        AuthService.getUserRole();
        AuthService.getUserId();
      }).not.toThrow();
    });
  });

  describe('Requirements Validation', () => {
    it('should meet authentication requirements', () => {
      // Requirement 1.1: Login page display - handled by components
      // Requirement 1.2: JWT authentication - AuthService handles tokens
      // Requirement 1.3: Role-based redirect - getDashboardRoute provides this
      const roles = ['Admin', 'TravelAdmin', 'Manager', 'Employee'];

      roles.forEach(role => {
        const userWithRole = {
          ...mockUser,
          role: { ...mockUser.role!, roleName: role },
        };

        AuthService.setUser(userWithRole);
        const route = AuthService.getDashboardRoute();

        // Handle special case for TravelAdmin
        const expectedPath =
          role === 'TravelAdmin' ? 'travel-admin' : role.toLowerCase();
        expect(route).toContain(expectedPath);
      });
    });

    it('should handle user roles correctly', () => {
      const testRoles = ['Admin', 'TravelAdmin', 'Manager', 'Employee'];

      testRoles.forEach(roleName => {
        const userWithRole = {
          ...mockUser,
          role: { ...mockUser.role!, roleName },
        };

        AuthService.setUser(userWithRole);
        expect(AuthService.hasRole(roleName as any)).toBe(true);
        expect(AuthService.hasAnyRole([roleName as any])).toBe(true);
      });
    });
  });
});
