import type { AxiosError, AxiosResponse } from 'axios';
import type { PaginatedResponse } from '../../types';
import type { ApiRequestConfig, PaginatedApiConfig } from './types';
import { apiClient } from './config';

/**
 * Base API service class with CRUD operations
 */
export abstract class BaseApiService<T> {
  protected baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Get all items
   */
  async getAll(
    params?: Record<string, string | number | boolean>,
    config?: ApiRequestConfig
  ): Promise<T[]> {
    try {
      const response = await apiClient.get<T[]>(`${this.baseUrl}`, {
        ...config,
        params,
      });
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  /**
   * Get item by ID
   */
  async getById(id: string | number, config?: ApiRequestConfig): Promise<T> {
    try {
      const response = await apiClient.get<T>(`${this.baseUrl}/${id}`, config);
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  /**
   * Create new item
   */
  async create(data: Partial<T>, config?: ApiRequestConfig): Promise<T> {
    try {
      const response = await apiClient.post<T>(`${this.baseUrl}`, data, config);
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  /**
   * Update existing item
   */
  async update(
    id: string | number,
    data: Partial<T>,
    config?: ApiRequestConfig
  ): Promise<void> {
    try {
      await apiClient.put(`${this.baseUrl}/${id}`, data, config);
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  /**
   * Delete item by ID
   */
  async delete(id: string | number, config?: ApiRequestConfig): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/${id}`, config);
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  protected async get<R>(
    path = '',
    params?: Record<string, string | number | boolean>,
    config?: ApiRequestConfig
  ): Promise<R> {
    try {
      const response = await apiClient.get<R>(`${this.baseUrl}/${path}`, {
        ...config,
        params,
      });
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected async post<R, D = any>(
    path = '',
    data?: D,
    config?: ApiRequestConfig
  ): Promise<R> {
    try {
      const response = await apiClient.post<R>(
        `${this.baseUrl}/${path}`,
        data,
        config
      );
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  protected async put<D = Record<string, string | number | boolean>>(
    path = '',
    data?: D,
    config?: ApiRequestConfig
  ): Promise<void> {
    try {
      await apiClient.put(`${this.baseUrl}/${path}`, data, config);
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  protected async deleteCustom(
    path = '',
    config?: ApiRequestConfig
  ): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/${path}`, config);
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  private handleResponse<R>(response: AxiosResponse<R>): R {
    // Backend returns data directly, not wrapped in ApiResponse
    return response.data;
  }

  private handleError(error: AxiosError): never {
    // Log detailed error information for debugging
    console.error('Full error object:', error);
    if (error.response) {
      console.error('API Error Details:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers,
        url: error.config?.url,
        method: error.config?.method,
        requestData: error.config?.data,
      });
    } else if (error.request) {
      console.error('Network Error:', error.request);
    } else {
      console.error('Error:', error.message);
    }
    throw error;
  }
}

/**
 * Extended service class with pagination support
 */
export abstract class PaginatedApiService<T> extends BaseApiService<T> {
  protected async getPaginated(
    path = '',
    config?: PaginatedApiConfig
  ): Promise<PaginatedResponse<T>> {
    const {
      page = 1,
      pageSize = 10,
      sortBy,
      sortOrder,
      ...restConfig
    } = config ?? {};

    const params: Record<string, string | number | boolean> = {
      page,
      pageSize,
      ...(sortBy && { sortBy, sortOrder: sortOrder ?? 'asc' }),
      ...restConfig.params,
    };

    return this.get<PaginatedResponse<T>>(path, params, restConfig);
  }
}
