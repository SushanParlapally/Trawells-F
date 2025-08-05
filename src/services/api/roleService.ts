import { BaseApiService } from './baseService';
import type { Role, ApiRequestConfig } from '../../types';

/**
 * Service for role operations
 * Aligned with backend RoleController
 */
class RoleService extends BaseApiService<Role> {
  constructor() {
    super('api/Role');
  }

  /**
   * Get all roles
   * GET: api/Role
   */
  async getAllRoles(config?: ApiRequestConfig): Promise<Role[]> {
    return this.getAll(undefined, config);
  }

  /**
   * Get role by ID
   * GET: api/Role/{id}
   */
  async getRoleById(id: number, config?: ApiRequestConfig): Promise<Role> {
    return this.getById(id, config);
  }
}

// Export singleton instance
export const roleService = new RoleService();
export default roleService;
