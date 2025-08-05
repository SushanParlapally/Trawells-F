import type { PaginatedResponse } from '../../types/api';
import type { AxiosRequestConfig } from 'axios';

export interface ApiRequestConfig extends Omit<AxiosRequestConfig, 'params'> {
  params?: Record<string, string | number | boolean>;
}

export interface PaginatedApiConfig extends ApiRequestConfig {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, string | number | boolean>;
}

export interface ApiService<T> {
  getAll(config?: ApiRequestConfig): Promise<T[]>;
  getById(id: number, config?: ApiRequestConfig): Promise<T>;
  create<R = Partial<T>>(data: R, config?: ApiRequestConfig): Promise<T>;
  update<R = Partial<T>>(
    id: number,
    data: R,
    config?: ApiRequestConfig
  ): Promise<T>;
  delete(id: number, config?: ApiRequestConfig): Promise<void>;
}

export interface PaginatedApiService<T> extends ApiService<T> {
  getPaginated(config?: PaginatedApiConfig): Promise<PaginatedResponse<T>>;
}
