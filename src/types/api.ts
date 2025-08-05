// API-related type definitions

export interface ApiResponse<T = Record<string, string | number | boolean>> {
  data: T;
  message?: string;
  success: boolean;
  timestamp: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
  details?: Record<string, string | number | boolean> | string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  totalCount: number;
}

export interface ApiRequestConfig {
  timeout?: number;
  retries?: number;
  cache?: boolean;
}

export interface CrudOperations<T, CreateT = Partial<T>, UpdateT = Partial<T>> {
  getAll(params?: Record<string, string | number | boolean>): Promise<T[]>;
  getById(id: string | number): Promise<T>;
  create(data: CreateT): Promise<T>;
  update(id: string | number, data: UpdateT): Promise<T>;
  delete(id: string | number): Promise<void>;
}

export interface FilterParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: string | number | boolean | undefined;
}

export interface UploadResponse {
  fileId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  url: string;
  uploadedAt: string;
}

export interface BulkOperationResponse {
  successful: number;
  failed: number;
  errors?: Array<{
    id: string | number;
    error: string;
  }>;
}

export interface PaginatedApiConfig extends ApiRequestConfig {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  params?: Record<string, string | number | boolean>;
}
