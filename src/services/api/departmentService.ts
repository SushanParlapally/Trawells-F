import { BaseApiService } from './baseService';
import type { Department, ApiRequestConfig } from '../../types';

// Department statistics response type
export interface DepartmentStatistics {
  totalDepartments: number;
  activeDepartments: number;
  usersByDepartment: Array<{
    department: string;
    userCount: number;
  }>;
  requestsByDepartment: Array<{
    department: string;
    requestCount: number;
  }>;
}

// Department detail response type
export interface DepartmentDetail {
  departmentId: number;
  departmentName: string;
  isActive: boolean;
  userCount: number;
  requestCount: number;
}

// Department user response type
export interface DepartmentUser {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  role: {
    roleId: number;
    roleName: string;
  };
  manager?: {
    userId: number;
    firstName: string;
    lastName: string;
  };
}

// Department travel request response type
export interface DepartmentTravelRequest {
  travelRequestId: number;
  status: string;
  fromDate: string;
  toDate: string;
  fromLocation: string;
  toLocation: string;
  reasonForTravel: string;
  createdOn: string;
  user: {
    userId: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  project: {
    projectId: number;
    projectName: string;
  };
}

/**
 * Service for managing departments
 * Aligned with backend DepartmentController
 *
 * Supported endpoints:
 * - GET: api/department - Get all departments
 */
class DepartmentService extends BaseApiService<Department> {
  constructor() {
    super('api/department');
  }

  /**
   * Get all departments
   * GET: api/department
   */
  async getAllDepartments(config?: ApiRequestConfig): Promise<Department[]> {
    return this.getAll(undefined, config);
  }

  /**
   * Get department statistics
   * GET: api/department/statistics
   */
  async getStatistics(
    config?: ApiRequestConfig
  ): Promise<DepartmentStatistics> {
    return this.get<DepartmentStatistics>('statistics', undefined, config);
  }

  /**
   * Get department by ID with details
   * GET: api/department/{id}
   */
  async getDepartmentById(
    id: number,
    config?: ApiRequestConfig
  ): Promise<DepartmentDetail> {
    return this.get<DepartmentDetail>(`${id}`, undefined, config);
  }

  /**
   * Get users in a specific department
   * GET: api/department/{id}/users
   */
  async getDepartmentUsers(
    id: number,
    config?: ApiRequestConfig
  ): Promise<DepartmentUser[]> {
    return this.get<DepartmentUser[]>(`${id}/users`, undefined, config);
  }

  /**
   * Get travel requests for a specific department
   * GET: api/department/{id}/travel-requests
   */
  async getDepartmentTravelRequests(
    id: number,
    config?: ApiRequestConfig
  ): Promise<DepartmentTravelRequest[]> {
    return this.get<DepartmentTravelRequest[]>(
      `${id}/travel-requests`,
      undefined,
      config
    );
  }

  // Note: The following methods are not supported by the backend
  // DepartmentController only has GET endpoints

  /**
   * Create new department (NOT SUPPORTED BY BACKEND)
   */
  async createDepartment(): Promise<Department> {
    throw new Error('Create department not supported by backend');
  }

  /**
   * Update existing department (NOT SUPPORTED BY BACKEND)
   */
  async updateDepartment(): Promise<void> {
    throw new Error('Update department not supported by backend');
  }

  /**
   * Delete department (NOT SUPPORTED BY BACKEND)
   */
  async deleteDepartment(): Promise<void> {
    throw new Error('Delete department not supported by backend');
  }

  /**
   * Toggle department status (NOT SUPPORTED BY BACKEND)
   */
  async toggleStatus(): Promise<void> {
    throw new Error('Toggle department status not supported by backend');
  }
}

// Export singleton instance
export const departmentService = new DepartmentService();
export default departmentService;
