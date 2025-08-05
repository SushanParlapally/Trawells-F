import { BaseApiService } from './baseService';
import type {
  TravelRequestDto,
  CommentDto,
  ApiRequestConfig,
} from '../../types';

// Manager statistics response type
export interface ManagerStatistics {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  completedRequests: number;
  teamMembersCount: number;
  recentRequestsByStatus: Array<{
    status: string;
    count: number;
  }>;
  requestsByDepartment: Array<{
    department: string;
    count: number;
  }>;
}

// Team member response type
export interface TeamMember {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  department: {
    departmentId: number;
    departmentName: string;
  };
  role: {
    roleId: number;
    roleName: string;
  };
}

/**
 * Service for manager operations
 * Aligned with backend ManagerController
 */
class ManagerService extends BaseApiService<TravelRequestDto> {
  constructor() {
    super('api/manager');
  }

  /**
   * Get pending requests for a manager
   * GET: api/manager/{managerId}/Requests
   */
  async getPendingRequests(
    managerId: number,
    config?: ApiRequestConfig
  ): Promise<TravelRequestDto[]> {
    return this.get<TravelRequestDto[]>(
      `${managerId}/Requests`,
      undefined,
      config
    );
  }

  /**
   * Get all requests for a manager (not just pending)
   * GET: api/manager/{managerId}/all-requests
   */
  async getAllRequests(
    managerId: number,
    config?: ApiRequestConfig
  ): Promise<TravelRequestDto[]> {
    return this.get<TravelRequestDto[]>(
      `${managerId}/all-requests`,
      undefined,
      config
    );
  }

  /**
   * Get requests by status for a manager
   * GET: api/manager/{managerId}/requests-by-status/{status}
   */
  async getRequestsByStatus(
    managerId: number,
    status: string,
    config?: ApiRequestConfig
  ): Promise<TravelRequestDto[]> {
    return this.get<TravelRequestDto[]>(
      `${managerId}/requests-by-status/${status}`,
      undefined,
      config
    );
  }

  /**
   * Get manager statistics
   * GET: api/manager/{managerId}/statistics
   */
  async getStatistics(
    managerId: number,
    config?: ApiRequestConfig
  ): Promise<ManagerStatistics> {
    return this.get<ManagerStatistics>(
      `${managerId}/statistics`,
      undefined,
      config
    );
  }

  /**
   * Get team members for a manager
   * GET: api/manager/{managerId}/team-members
   */
  async getTeamMembers(
    managerId: number,
    config?: ApiRequestConfig
  ): Promise<TeamMember[]> {
    return this.get<TeamMember[]>(
      `${managerId}/team-members`,
      undefined,
      config
    );
  }

  /**
   * Approve a travel request
   * PUT: api/manager/ApproveRequest/{requestId}
   */
  async approveRequest(
    requestId: number,
    commentDto: CommentDto,
    config?: ApiRequestConfig
  ): Promise<void> {
    return this.put(`ApproveRequest/${requestId}`, commentDto, config);
  }

  /**
   * Reject a travel request
   * PUT: api/manager/RejectRequest/{requestId}
   */
  async rejectRequest(
    requestId: number,
    commentDto: CommentDto,
    config?: ApiRequestConfig
  ): Promise<void> {
    return this.put(`RejectRequest/${requestId}`, commentDto, config);
  }
}

// Export singleton instance
export const managerService = new ManagerService();
export default managerService;
