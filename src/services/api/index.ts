// Export all API services
export {
  loginService,
  type LoginRequest,
  type LoginResponse,
  type LoginModel,
} from './loginService';
export {
  userService,
  type AdminStatistics,
  type UserActivity,
} from './userService';
export { travelRequestService } from './travelRequestService';
export {
  managerService,
  type ManagerStatistics,
  type TeamMember,
} from './managerService';
export {
  travelAdminService,
  type TravelAdminStatistics,
} from './travelAdminService';
export {
  departmentService,
  type DepartmentStatistics,
  type DepartmentDetail,
  type DepartmentUser,
  type DepartmentTravelRequest,
} from './departmentService';
export {
  projectService,
  type ProjectStatistics,
  type ProjectDetail,
  type ProjectTravelRequest,
} from './projectService';
export { roleService } from './roleService';

// Export base service for custom implementations
export { BaseApiService } from './baseService';

// Export types
export type { ApiRequestConfig } from '../../types';
