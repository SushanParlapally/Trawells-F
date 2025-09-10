import { BaseApiService } from './baseService';
import type { BookingDetails, ApiRequestConfig } from '../../types';

// Travel Admin specific response type based on backend TravelAdminController
export interface TravelAdminRequestResponse {
  travelRequestId: number;
  status: string;
  comments?: string;
  fromDate: string;
  toDate: string;
  reasonForTravel: string;
  fromLocation: string;
  toLocation: string;
  ticketUrl?: string;
  user: {
    userId: number;
    firstName: string;
    lastName: string;
    email: string; // Backend includes email in the response
  };
  project: {
    projectId: number;
    projectName: string;
  };
  department: {
    departmentId: number;
    departmentName: string;
  };
}

// Statistics response types
export interface TravelAdminStatistics {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  bookedRequests: number;
  completedRequests: number;
  returnedRequests: number;
  requestsByDepartment: Array<{
    department: string;
    count: number;
  }>;
  recentRequestsByStatus: Array<{
    status: string;
    count: number;
  }>;
}

/**
 * Service for travel admin operations
 * Aligned with backend TravelAdminController
 */
class TravelAdminService extends BaseApiService<TravelAdminRequestResponse> {
  constructor() {
    super('api/travel-requests');
  }

  /**
   * Get all travel requests for travel admin
   * GET: api/travel-requests
   */
  async getAllRequests(
    config?: ApiRequestConfig
  ): Promise<TravelAdminRequestResponse[]> {
    return this.getAll(undefined, config);
  }

  /**
   * Get travel admin statistics
   * GET: api/travel-requests/statistics
   */
  async getStatistics(
    config?: ApiRequestConfig
  ): Promise<TravelAdminStatistics> {
    return this.get<TravelAdminStatistics>('statistics', undefined, config);
  }

  /**
   * Get travel requests by status
   * GET: api/travel-requests/by-status/{status}
   */
  async getRequestsByStatus(
    status: string,
    config?: ApiRequestConfig
  ): Promise<TravelAdminRequestResponse[]> {
    return this.get<TravelAdminRequestResponse[]>(
      'by-status/' + status,
      undefined,
      config
    );
  }

  /**
   * Get travel requests by department
   * GET: api/travel-requests/by-department/{departmentId}
   */
  async getRequestsByDepartment(
    departmentId: number,
    config?: ApiRequestConfig
  ): Promise<TravelAdminRequestResponse[]> {
    return this.get<TravelAdminRequestResponse[]>(
      'by-department/' + departmentId,
      undefined,
      config
    );
  }

  /**
   * Get travel requests by date range
   * GET: api/travel-requests/by-date-range?startDate={startDate}&endDate={endDate}
   */
  async getRequestsByDateRange(
    startDate: string,
    endDate: string,
    config?: ApiRequestConfig
  ): Promise<TravelAdminRequestResponse[]> {
    const params = {
      startDate,
      endDate,
    };
    return this.get<TravelAdminRequestResponse[]>(
      'by-date-range',
      params,
      config
    );
  }

  /**
   * Get single travel request by ID
   * GET: api/travel-requests/{travelRequestId}
   */
  async getRequestById(
    travelRequestId: number,
    config?: ApiRequestConfig
  ): Promise<TravelAdminRequestResponse> {
    return this.getById(travelRequestId, config);
  }

  /**
   * Book a ticket for a travel request
   * POST: api/travel-requests/{travelRequestId}/book
   */
  async bookTicket(
    travelRequestId: number,
    bookingDetails: BookingDetails,
    config?: ApiRequestConfig
  ): Promise<string> {
    return this.post<string>(`${travelRequestId}/book`, bookingDetails, config);
  }

  /**
   * Return a travel request to manager
   * POST: api/travel-requests/{travelRequestId}/return-to-manager
   */
  async returnToManager(
    travelRequestId: number,
    bookingDetails: BookingDetails,
    config?: ApiRequestConfig
  ): Promise<string> {
    return this.post<string>(
      `${travelRequestId}/return-to-manager`,
      bookingDetails,
      config
    );
  }

  /**
   * Generate PDF ticket for a travel request and get Supabase download URL
   * GET: api/travel-requests/{travelRequestId}/ticket-pdf
   */
  async generateTicketPdf(
    travelRequestId: number
  ): Promise<{ downloadUrl: string; message: string; fileName: string }> {
    try {
      // Get the auth token
      const token = localStorage.getItem('authToken');

      // Get base URL and ensure no double slashes
      const baseURL =
        import.meta.env['VITE_API_BASE_URL'] || 'https://trawells.onrender.com';
      const cleanBaseURL = baseURL.endsWith('/')
        ? baseURL.slice(0, -1)
        : baseURL;

      const response = await fetch(
        `${cleanBaseURL}/api/travel-requests/${travelRequestId}/ticket-pdf`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      throw new Error(
        `Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Generate secure download link for a ticket
   * GET: api/travel-requests/{travelRequestId}/secure-download-link
   */
  async generateSecureDownloadLink(
    travelRequestId: number,
    config?: ApiRequestConfig
  ): Promise<{
    downloadUrl: string;
    expiresAt: string;
    message: string;
  }> {
    return this.get<{
      downloadUrl: string;
      expiresAt: string;
      message: string;
    }>(`${travelRequestId}/secure-download-link`, undefined, config);
  }

  /**
   * Download ticket PDF using secure link (public endpoint)
   * GET: api/travel-requests/{travelRequestId}/download-ticket
   */
  async downloadTicketPdf(
    travelRequestId: number,
    token?: string
  ): Promise<{ downloadUrl: string; message: string }> {
    try {
      const baseURL =
        import.meta.env['VITE_API_BASE_URL'] || 'https://trawells.onrender.com';
      const cleanBaseURL = baseURL.endsWith('/')
        ? baseURL.slice(0, -1)
        : baseURL;

      let url = `${cleanBaseURL}/api/travel-requests/${travelRequestId}/download-ticket`;
      if (token) {
        url += `?token=${token}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      throw new Error(
        `Failed to download PDF: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Return a travel request to employee
   * POST: api/travel-requests/{travelRequestId}/return-to-employee
   */
  async returnToEmployee(
    travelRequestId: number,
    bookingDetails: BookingDetails,
    config?: ApiRequestConfig
  ): Promise<string> {
    return this.post<string>(
      `${travelRequestId}/return-to-employee`,
      bookingDetails,
      config
    );
  }

  /**
   * Close a travel request as completed
   * POST: api/travel-requests/{travelRequestId}/close
   */
  async closeRequest(
    travelRequestId: number,
    bookingDetails: BookingDetails,
    config?: ApiRequestConfig
  ): Promise<string> {
    return this.post<string>(
      `${travelRequestId}/close`,
      bookingDetails,
      config
    );
  }
}

// Export singleton instance
export const travelAdminService = new TravelAdminService();
export default travelAdminService;
