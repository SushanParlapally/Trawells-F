import axios, { type AxiosError } from 'axios';
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { AuthService } from '../auth/authService';
import { sessionManager } from '../auth/sessionManager';

// Simple API error handling
export interface ApiErrorDetails {
  message: string;
  code?: string;
  details?: Record<string, string | number | boolean> | string;
}

export class ApiErrorException extends Error {
  constructor(public apiError: ApiErrorDetails) {
    super(apiError.message);
    this.name = 'ApiErrorException';
  }
}

export function handleApiError(error: Error | AxiosError): ApiErrorDetails {
  if (axios.isAxiosError(error)) {
    return {
      message:
        error.response?.data?.message || error.message || 'An error occurred',
      code: error.response?.status?.toString(),
      details: error.response?.data,
    };
  }
  return {
    message: error instanceof Error ? error.message : 'Unknown error occurred',
  };
}

// Get the base URL with debugging
const getBaseURL = () => {
  const envURL = import.meta.env['VITE_API_BASE_URL'];
  const fallbackURL = 'https://trawells.onrender.com';
  const baseURL = envURL || fallbackURL;

  // Debug logging
  console.log('🔧 API Configuration:', {
    envURL,
    fallbackURL,
    finalBaseURL: baseURL,
    isDev: import.meta.env.DEV,
  });

  return baseURL;
};

// Create axios instance with base configuration
export const apiClient = axios.create({
  baseURL: getBaseURL(),
  timeout: 45000, // Increased to 45 seconds for worst-case cold starts
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for authentication and logging
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Skip auth for login and public endpoints
    const publicEndpoints = ['/api/Login', '/health'];
    const isPublicEndpoint = publicEndpoints.some(endpoint =>
      config.url?.includes(endpoint)
    );

    if (!isPublicEndpoint) {
      const token = AuthService.getToken();

      if (!token) {
        // This is a critical error, as a token should be present for protected routes.
        // It indicates a logic error in routing or state management.
        console.error(
          'CRITICAL: No auth token found for a protected API endpoint.',
          {
            url: config.url,
          }
        );
        // Rejecting the request to prevent further errors.
        // A global error handler could catch this and redirect to a login or error page.
        return Promise.reject(new Error('Authentication token is missing.'));
      }

      // Add the token to headers
      if (config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Update session activity
      sessionManager.updateActivity();
    }

    // Log request in development
    if (import.meta.env.DEV) {
      console.log(
        `🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`,
        {
          params: config.params,
          data: config.data,
          hasAuth: !!config.headers?.Authorization,
        }
      );
    }

    return config;
  },
  error => {
    console.error('❌ Request Error: ', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and logging
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Update session activity on successful response
    sessionManager.updateActivity();

    // Log response in development
    if (import.meta.env.DEV) {
      console.log(
        `✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`,
        {
          status: response.status,
          data: response.data,
        }
      );
    }

    return response;
  },
  async error => {
    // Debug: Log the URL to see what we're matching against
    if (import.meta.env.DEV && error.response?.status === 404) {
      console.log('🔍 Debug 404 URL:', error.config?.url);
    }

    // Special handling for 404 errors on travel request user endpoint
    // These are expected when a user has no travel requests
    if (
      error.response?.status === 404 &&
      error.config?.url?.includes('TravelRequest/user/')
    ) {
      // Don't log or convert 404 errors for travel request user endpoint
      // Let the calling method handle it silently
      console.log('✅ Silently handling 404 for travel request user endpoint');
      return Promise.reject(error);
    }

    // Log error in development (only for non-404 travel request user errors)
    if (import.meta.env.DEV) {
      console.error(
        `❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
        error
      );
    }

    // Handle authentication errors (matches backend response format)
    if (error.response?.status === 401) {
      console.log('Authentication error detected, cleaning up session');

      // End session management
      sessionManager.endSession();

      // Clear all authentication data
      AuthService.removeToken();
      AuthService.removeUser();

      // Only redirect if not already on login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    // Handle forbidden errors (403)
    if (error.response?.status === 403) {
      console.warn('Access forbidden - insufficient permissions');
      // Could trigger a notification or redirect to appropriate page
    }

    // Handle server errors (5xx)
    if (error.response?.status >= 500) {
      console.error('Server error detected: ', error.response.status);
      // Could trigger error reporting or fallback behavior
    }

    // Convert to standardized error format
    const apiError = handleApiError(error);
    return Promise.reject(new ApiErrorException(apiError));
  }
);
