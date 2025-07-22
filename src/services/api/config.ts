import axios from 'axios';

// Create axios instance with base configuration
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://localhost:7000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for authentication
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('travel_desk_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('travel_desk_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
