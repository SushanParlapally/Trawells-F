import { BaseApiService } from './baseService';
import type { ApiRequestConfig } from '../../types';

// Login request/response types based on backend LoginController
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

// Backend LoginModel from ViewModel
export interface LoginModel {
  email: string;
  password: string;
  roleName?: string;
}

/**
 * Service for authentication operations
 * Aligned with backend LoginController
 */
class LoginService extends BaseApiService<LoginResponse> {
  constructor() {
    super('api/login');
  }

  /**
   * Authenticate user with credentials
   * POST: api/login
   */
  async login(
    credentials: LoginRequest,
    config?: ApiRequestConfig
  ): Promise<LoginResponse> {
    return this.post<LoginResponse, LoginRequest>('', credentials, config);
  }
}

// Export singleton instance
export const loginService = new LoginService();
export default loginService;
