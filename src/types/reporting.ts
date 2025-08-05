/**
 * Reporting and analytics type definitions
 */

export interface ReportFilters {
  startDate: Date;
  endDate: Date;
  departments?: number[];
  projects?: number[];
  status?: string[];
  users?: number[];
  // Removed bookingType - not supported by backend
}

export interface TravelRequestReportItem {
  requestId: number;
  employeeName: string;
  employeeEmail: string;
  department: string;
  project: string;
  reasonForTravel: string;
  fromLocation: string;
  toLocation: string;
  fromDate: Date;
  toDate: Date;
  requestType: string; // Changed from bookingType - not supported by backend
  status: string;
  submittedDate: Date;
  approvedDate?: Date;
  completedDate?: Date;
  totalDays: number;
  managerName?: string;
  comments?: string;
}

export interface ReportSummary {
  totalRequests: number;
  totalTravelDays: number;
  requestsByStatus: Record<string, number>;
  requestsByDepartment: Record<string, number>;
  requestsByProject: Record<string, number>;
  // Removed requestsByBookingType - not supported by backend
  averageProcessingTime: number;
}

export interface ReportData {
  summary: ReportSummary;
  items: TravelRequestReportItem[];
  generatedAt: Date;
  filters: ReportFilters;
}

export interface ExportOptions {
  format: 'csv' | 'pdf' | 'excel';
  fileName?: string;
  includeCharts?: boolean;
  includeSummary?: boolean;
}

export interface ScheduledReport {
  reportId: number;
  name: string;
  description?: string;
  filters: ReportFilters;
  schedule: {
    frequency: 'daily' | 'weekly' | 'monthly';
    dayOfWeek?: number;
    dayOfMonth?: number;
    time: string;
  };
  recipients: string[];
  format: 'csv' | 'pdf' | 'excel';
  isActive: boolean;
  createdBy: number;
  createdDate: Date;
  lastRun?: Date;
  nextRun: Date;
}

// Backend-aligned types based on C# DTOs
export interface TravelRequestDto {
  travelRequestId: number;
  user: UserDto;
  project: ProjectDto;
  reasonForTravel: string;
  fromDate: string; // Backend sends as string, frontend converts to Date
  toDate: string; // Backend sends as string, frontend converts to Date
  fromLocation: string;
  toLocation: string;
  status: string;
  comments?: string;
}

export interface UserDto {
  userId: number;
  firstName: string;
  lastName: string;
  department: DepartmentDto;
}

export interface DepartmentDto {
  departmentId: number;
  departmentName: string;
}

export interface ProjectDto {
  projectId: number;
  projectName: string;
}

export interface DashboardDto {
  Requests: TravelRequestDto[];
}
