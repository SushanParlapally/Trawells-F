import { BaseApiService } from './baseService';
import type { User, ApiRequestConfig } from '../../types';
import { toPascalCase } from '../../utils/apiTransformers';

export interface UserCreateData {
  firstName: string;
  lastName?: string;
  email: string;
  mobileNum: string;
  address: string;
  password: string;
  roleId: number;
  departmentId: number;
  managerId?: number | undefined;
  createdBy: number;
  isActive?: boolean;
}

export interface UserUpdateData {
  userId: number; // Required by backend for validation
  firstName?: string;
  lastName?: string;
  email?: string;
  mobileNum?: string;
  password?: string;
  address?: string;
  roleId?: number;
  departmentId?: number;
  modifiedBy?: string;
}

// Admin statistics response types
export interface AdminStatistics {
  users: {
    total: number;
    managers: number;
    employees: number;
    travelAdmins: number;
    byDepartment: Array<{
      department: string;
      count: number;
    }>;
  };
  travelRequests: {
    total: number;
    pending: number;
    approved: number;
    completed: number;
    recent: number;
  };
  system: {
    departments: number;
    projects: number;
  };
}

export interface UserActivity {
  recentRequests: Array<{
    travelRequestId: number;
    status: string;
    createdOn: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
    department: string;
  }>;
  activeUsers: Array<{
    userId: number;
    firstName: string;
    lastName: string;
    requestCount: number;
  }>;
}

/**
 * Service for managing users
 * Aligned with backend UserController
 */
class UserService extends BaseApiService<User> {
  constructor() {
    super('api/user');
  }

  /**
   * Get all users (excluding Admin role)
   * GET: api/user/users
   */
  async getUsers(config?: ApiRequestConfig): Promise<User[]> {
    return this.get<User[]>('users', undefined, config);
  }

  /**
   * Get system-wide statistics for admin dashboard
   * GET: api/user/statistics
   */
  async getSystemStatistics(
    config?: ApiRequestConfig
  ): Promise<AdminStatistics> {
    return this.get<AdminStatistics>('statistics', undefined, config);
  }

  /**
   * Get user activity statistics
   * GET: api/user/activity
   */
  async getUserActivity(config?: ApiRequestConfig): Promise<UserActivity> {
    return this.get<UserActivity>('activity', undefined, config);
  }

  /**
   * Get users by role
   * GET: api/user/by-role/{roleId}
   */
  async getUsersByRole(
    roleId: number,
    config?: ApiRequestConfig
  ): Promise<User[]> {
    return this.get<User[]>(`by-role/${roleId}`, undefined, config);
  }

  /**
   * Get users by department
   * GET: api/user/by-department/{departmentId}
   */
  async getUsersByDepartment(
    departmentId: number,
    config?: ApiRequestConfig
  ): Promise<User[]> {
    return this.get<User[]>(`by-department/${departmentId}`, undefined, config);
  }

  /**
   * Create new user
   * POST: api/user/users
   */
  async createUser(
    data: UserCreateData,
    config?: ApiRequestConfig
  ): Promise<User> {
    // Transform the data to PascalCase for C# backend compatibility
    const transformedData = toPascalCase(data) as UserCreateData;
    console.log('Original data:', data);
    console.log('Transformed data:', transformedData);
    return this.post<User>('users', transformedData, config);
  }

  /**
   * Update existing user
   * PUT: api/user/users/{id}
   */
  async updateUser(
    id: number,
    data: UserUpdateData,
    config?: ApiRequestConfig
  ): Promise<void> {
    // Transform the data to PascalCase for C# backend compatibility
    const transformedData = toPascalCase(data) as UserUpdateData;
    console.log('Update original data:', data);
    console.log('Update transformed data:', transformedData);
    return this.put(`users/${id}`, transformedData, config);
  }

  /**
   * Delete user (soft delete - set IsActive to false)
   * DELETE: api/user/users/{id}
   */
  async deleteUser(id: number, config?: ApiRequestConfig): Promise<void> {
    return this.deleteCustom(`users/${id}`, config);
  }

  /**
   * Get managers (users with RoleId = 3)
   * GET: api/user/managers
   */
  async getManagers(config?: ApiRequestConfig): Promise<User[]> {
    return this.get<User[]>('managers', undefined, config);
  }

  /**
   * Toggle user status
   */
  async toggleUserStatus(
    userId: number,
    isActive: boolean,
    config?: ApiRequestConfig
  ): Promise<void> {
    if (!isActive) {
      return this.deleteUser(userId, config);
    }
    // For activation, we would need a separate endpoint in the backend
    throw new Error('User activation not implemented in backend');
  }
}

export const userService = new UserService();
