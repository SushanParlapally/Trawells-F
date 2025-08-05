import { BaseApiService } from './baseService';
import type { Project, ApiRequestConfig } from '../../types';

// Project statistics response type
export interface ProjectStatistics {
  totalProjects: number;
  activeProjects: number;
  requestsByProject: Array<{
    project: string;
    requestCount: number;
  }>;
  topProjects: Array<{
    projectId: number;
    projectName: string;
    requestCount: number;
  }>;
}

// Project detail response type
export interface ProjectDetail {
  projectId: number;
  projectName: string;
  isActive: boolean;
  requestCount: number;
  recentRequests: Array<{
    travelRequestId: number;
    status: string;
    createdOn: string;
    user: {
      firstName: string;
      lastName: string;
    };
  }>;
}

// Project travel request response type
export interface ProjectTravelRequest {
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
  department: {
    departmentId: number;
    departmentName: string;
  };
}

/**
 * Service for managing projects
 * Aligned with backend ProjectController
 *
 * Supported endpoints:
 * - GET: api/Project - Get all projects
 * - GET: api/Project/{id} - Get project by ID
 */
class ProjectService extends BaseApiService<Project> {
  constructor() {
    super('api/Project');
  }

  /**
   * Get all projects
   * GET: api/Project
   */
  async getProjects(config?: ApiRequestConfig): Promise<Project[]> {
    return this.getAll(undefined, config);
  }

  /**
   * Get project by ID
   * GET: api/Project/{id}
   */
  async getProjectById(
    id: number,
    config?: ApiRequestConfig
  ): Promise<Project> {
    return this.getById(id, config);
  }

  /**
   * Get project statistics
   * GET: api/Project/statistics
   */
  async getStatistics(config?: ApiRequestConfig): Promise<ProjectStatistics> {
    return this.get<ProjectStatistics>('statistics', undefined, config);
  }

  /**
   * Get project details with recent requests
   * GET: api/Project/{id}/details
   */
  async getProjectDetails(
    id: number,
    config?: ApiRequestConfig
  ): Promise<ProjectDetail> {
    return this.get<ProjectDetail>(`${id}/details`, undefined, config);
  }

  /**
   * Get travel requests for a specific project
   * GET: api/Project/{id}/travel-requests
   */
  async getProjectTravelRequests(
    id: number,
    config?: ApiRequestConfig
  ): Promise<ProjectTravelRequest[]> {
    return this.get<ProjectTravelRequest[]>(
      `${id}/travel-requests`,
      undefined,
      config
    );
  }

  /**
   * Get projects by status (active/inactive)
   * GET: api/Project/by-status/{isActive}
   */
  async getProjectsByStatus(
    isActive: boolean,
    config?: ApiRequestConfig
  ): Promise<Project[]> {
    return this.get<Project[]>(`by-status/${isActive}`, undefined, config);
  }

  // Note: The following methods are not supported by the backend
  // ProjectController only has GET endpoints

  /**
   * Create new project (NOT SUPPORTED BY BACKEND)
   */
  async createProject(
    _data: Project,
    _config?: ApiRequestConfig
  ): Promise<Project> {
    throw new Error('Create project not supported by backend');
  }

  /**
   * Update existing project (NOT SUPPORTED BY BACKEND)
   */
  async updateProject(
    _id: number,
    _data: Partial<Project>,
    _config?: ApiRequestConfig
  ): Promise<void> {
    throw new Error('Update project not supported by backend');
  }

  /**
   * Delete project (NOT SUPPORTED BY BACKEND)
   */
  async deleteProject(_id: number, _config?: ApiRequestConfig): Promise<void> {
    throw new Error('Delete project not supported by backend');
  }
}

// Export singleton instance
export const projectService = new ProjectService();
export default projectService;
