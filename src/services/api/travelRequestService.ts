import { BaseApiService } from './baseService';
import type {
  TravelRequest,
  TravelRequestDto,
  DashboardDto,
  ApiRequestConfig,
} from '../../types';
import { toPascalCase } from '../../utils/apiTransformers';
import { apiClient } from './config';

export interface TravelRequestCreateData {
  userId: number;
  projectId: number;
  departmentId: number;
  reasonForTravel: string;
  fromDate: string;
  toDate: string;
  fromLocation: string;
  toLocation: string;
  createdOn: string;
  isActive: boolean;
}

/**
 * Service for managing travel requests
 * Aligned with backend TravelRequestController
 *
 * Supported endpoints:
 * - GET: api/TravelRequest - Get all requests with dashboard data
 * - POST: api/TravelRequest - Create new travel request
 * - GET: api/TravelRequest/user/{userId} - Get travel requests by user ID
 */
class TravelRequestService extends BaseApiService<TravelRequest> {
  constructor() {
    super('api/TravelRequest');
  }

  /**
   * Get all travel requests with dashboard data
   * GET: api/TravelRequest
   */
  async getTravelRequests(config?: ApiRequestConfig): Promise<DashboardDto> {
    return this.get<DashboardDto>('', undefined, config);
  }

  /**
   * Create new travel request
   * POST: api/TravelRequest
   */
  async createTravelRequest(
    data: TravelRequestCreateData,
    config?: ApiRequestConfig
  ): Promise<TravelRequest> {
    // Transform the data to PascalCase for C# backend compatibility
    const transformedData = toPascalCase(data);
    return this.post<TravelRequest, TravelRequestCreateData>(
      '',
      transformedData,
      config
    );
  }

  /**
   * Update existing travel request (NOT SUPPORTED BY BACKEND)
   */
  async updateTravelRequest(): Promise<void> {
    throw new Error('Update travel request not supported by backend');
  }

  /**
   * Delete travel request (NOT SUPPORTED BY BACKEND)
   */
  async deleteTravelRequest(): Promise<void> {
    throw new Error('Delete travel request not supported by backend');
  }

  /**
   * Get travel requests by user ID
   * GET: api/TravelRequest/user/{userId}
   */
  async getTravelRequestsByUserId(
    userId: number,
    config?: ApiRequestConfig
  ): Promise<TravelRequestDto[]> {
    return this.get<TravelRequestDto[]>(`user/${userId}`, undefined, config);
  }

  /**
   * Get travel requests by user ID (alias for getTravelRequestsByUserId)
   * GET: api/TravelRequest/user/{userId}
   */
  async getByUserId(
    userId: number,
    config?: ApiRequestConfig
  ): Promise<TravelRequest[]> {
    try {
      const response = await apiClient.get<TravelRequestDto[]>(
        `${this.baseUrl}/user/${userId}`,
        config
      );
      const requests = response.data;

      // Convert TravelRequestDto[] to TravelRequest[] by mapping the structure
      return requests.map((dto: TravelRequestDto) => ({
        travelRequestId: dto.travelRequestId,
        user: {
          userId: dto.user.userId,
          firstName: dto.user.firstName,
          lastName: dto.user.lastName,
          address: '',
          email: '',
          mobileNum: '',
          password: '',
          roleId: 0,
          departmentId: dto.user.department.departmentId,
          createdBy: 0,
          createdOn: '',
          isActive: true,
          department: {
            departmentId: dto.user.department.departmentId,
            departmentName: dto.user.department.departmentName,
            createdBy: 0,
            createdOn: '',
            isActive: true,
          },
        },
        project: {
          projectId: dto.project.projectId,
          projectName: dto.project.projectName,
          createdBy: 0,
          createdOn: '',
          isActive: true,
        },
        reasonForTravel: dto.reasonForTravel,
        fromDate: dto.fromDate,
        toDate: dto.toDate,
        fromLocation: dto.fromLocation,
        toLocation: dto.toLocation,
        status: dto.status,
        comments: dto.comments,
      })) as TravelRequest[];
    } catch (error: unknown) {
      // Changed from any to unknown
      if (
        error instanceof Error &&
        'response' in error &&
        typeof error.response === 'object' &&
        error.response &&
        'status' in error.response &&
        error.response.status === 404
      ) {
        console.log(
          '✅ getByUserId: Handling 404 silently, returning empty array'
        );
        return [];
      }
      console.log('❌ getByUserId: Re-throwing non-404 error:', error);
      throw error;
    }
  }

  /**
   * Create new travel request (alias for createTravelRequest)
   * POST: api/TravelRequest
   */
  override async create(
    data: TravelRequestCreateData,
    config?: ApiRequestConfig
  ): Promise<TravelRequest> {
    return this.createTravelRequest(data, config);
  }

  // Note: The following methods are not supported by the backend
  // They are commented out in the TravelRequestController
  // These methods throw errors to indicate they're not available

  /**
   * Get travel request by ID (NOT AVAILABLE)
   */
  override async getById(): Promise<TravelRequest> {
    throw new Error('Individual request loading is not available');
  }

  /**
   * Update travel request (NOT AVAILABLE)
   */
  override async update(): Promise<void> {
    throw new Error('Edit functionality is not available');
  }

  /**
   * Cancel travel request (NOT AVAILABLE)
   */
  async cancel(): Promise<TravelRequest> {
    throw new Error('Cancel functionality is not available');
  }

  /**
   * Resubmit travel request (NOT AVAILABLE)
   */
  async resubmit(): Promise<TravelRequest> {
    throw new Error('Resubmit functionality is not available');
  }

  /**
   * Take action on travel request (NOT AVAILABLE)
   */
  async takeAction(): Promise<TravelRequest> {
    throw new Error('Action functionality is not available');
  }

  /**
   * Get travel requests by manager ID (NOT AVAILABLE)
   */
  async getByManagerId(): Promise<TravelRequest[]> {
    throw new Error('Manager-specific requests are not available');
  }
}

// Export singleton instance
export const travelRequestService = new TravelRequestService();
export default travelRequestService;
