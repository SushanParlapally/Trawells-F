import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:7075';

interface AuditLog {
  id: number;
  userId: number;
  actionType: string;
  entityName: string;
  entityId: number;
  timestamp: string;
  changes: string | null;
}

interface AuditLogsResponse {
  auditLogs: AuditLog[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export const auditService = {
  getAuditLogs: async (
    pageNumber: number = 1,
    pageSize: number = 10
  ): Promise<AuditLogsResponse> => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/api/Audit`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        pageNumber,
        pageSize,
      },
    });

    const totalCount = parseInt(response.headers['x-total-count'] || '0', 10);
    const currentPageNumber = parseInt(
      response.headers['x-page-number'] || '1',
      10
    );
    const currentPageSize = parseInt(
      response.headers['x-page-size'] || '10',
      10
    );

    return {
      auditLogs: response.data,
      totalCount: totalCount,
      pageNumber: currentPageNumber,
      pageSize: currentPageSize,
    };
  },
};
