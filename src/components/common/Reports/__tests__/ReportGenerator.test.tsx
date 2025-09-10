import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import type { Mocked } from 'vitest';
import { ReportGenerator } from '../ReportGenerator';
import { travelRequestService } from '../../../../services/api/travelRequestService';
import { departmentService } from '../../../../services/api/departmentService';
import { projectService } from '../../../../services/api/projectService';
import type {
  Department,
  Project,
  DashboardDto,
  TravelRequestDto,
} from '../../../../types';

// Mock services with proper types
vi.mock('../../../../services/api/travelRequestService', () => ({
  travelRequestService: {
    getTravelRequests: vi.fn(),
    generateReport: vi.fn(),
  },
}));

vi.mock('../../../../services/api/departmentService', () => ({
  departmentService: {
    getAllDepartments: vi.fn(),
  },
}));

vi.mock('../../../../services/api/projectService', () => ({
  projectService: {
    getProjects: vi.fn(),
  },
}));

// Type-safe mock service instances
const mockTravelRequestService = travelRequestService as Mocked<
  typeof travelRequestService
>;
const mockDepartmentService = departmentService as Mocked<
  typeof departmentService
>;
const mockProjectService = projectService as Mocked<typeof projectService>;

// Mock MUI components
vi.mock('@mui/x-date-pickers', () => ({
  DatePicker: ({
    label,
    onChange,
    value,
  }: {
    label: string;
    onChange: (date: Date | null) => void;
    value: Date | null;
  }) => (
    <input
      data-testid={`date-picker-${label.toLowerCase().replace(' ', '-')}`}
      type='date'
      value={value?.toISOString().split('T')[0] || ''}
      onChange={e => onChange(new Date(e.target.value))}
      aria-label={label}
    />
  ),
  LocalizationProvider: ({ children }: { children: React.ReactNode }) =>
    children,
}));

vi.mock('@mui/x-date-pickers/AdapterDateFns', () => ({
  AdapterDateFns: vi.fn(),
}));

// Test data
const mockDepartments: Department[] = [
  {
    departmentId: 1,
    departmentName: 'IT',
    isActive: true,
    createdBy: 1,
    createdOn: new Date().toISOString(),
  },
  {
    departmentId: 2,
    departmentName: 'HR',
    isActive: true,
    createdBy: 1,
    createdOn: new Date().toISOString(),
  },
];

const mockProjects: Project[] = [
  {
    projectId: 1,
    projectName: 'Project A',
    createdBy: 1,
    isActive: true,
    createdOn: new Date().toISOString(),
  },
  {
    projectId: 2,
    projectName: 'Project B',
    createdBy: 1,
    isActive: true,
    createdOn: new Date().toISOString(),
  },
];

const mockTravelRequests: DashboardDto = {
  totalRequests: 1,
  pendingRequests: 0,
  totalUsers: 1,
  totalDepartments: 1,
  totalProjects: 1,
  requests: [
    {
      travelRequestId: 1,
      user: {
        userId: 1,
        firstName: 'John',
        lastName: 'Doe',
        department: { departmentId: 1, departmentName: 'IT' },
      },
      project: { projectId: 1, projectName: 'Project A' },
      reasonForTravel: 'Business meeting',
      fromLocation: 'New York',
      toLocation: 'Los Angeles',
      fromDate: '2024-01-15',
      toDate: '2024-01-17',
      status: 'Completed',
      comments: 'Test comment',
    },
  ] as unknown as TravelRequestDto[],
};

describe('ReportGenerator', () => {
  beforeEach(() => {
    mockDepartmentService.getAllDepartments.mockResolvedValue(mockDepartments);
    mockProjectService.getProjects.mockResolvedValue(mockProjects);
    mockTravelRequestService.getTravelRequests.mockResolvedValue(
      mockTravelRequests
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render report generator form with accessibility features', async () => {
    render(<ReportGenerator userRole='Admin' />);

    expect(
      screen.getByRole('heading', { name: 'Travel Request Reports' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Report Filters' })
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Start Date')).toBeInTheDocument();
    expect(screen.getByLabelText('End Date')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Load Travel Requests' })
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(mockDepartmentService.getAllDepartments).toHaveBeenCalled();
      expect(mockProjectService.getProjects).toHaveBeenCalled();
    });
  });

  it('should generate report when form is submitted', async () => {
    render(<ReportGenerator userRole='Admin' />);

    await waitFor(() => {
      expect(mockDepartmentService.getAllDepartments).toHaveBeenCalled();
    });

    const submitButton = screen.getByRole('button', {
      name: 'Load Travel Requests',
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockTravelRequestService.getTravelRequests).toHaveBeenCalled();
    });

    expect(
      screen.getByRole('heading', { name: 'Report Results' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Export CSV' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Export Text' })
    ).toBeInTheDocument();
  });

  it('should display error message when API call fails', async () => {
    const error = new Error('API Error');
    mockTravelRequestService.getTravelRequests.mockRejectedValue(error);

    render(<ReportGenerator userRole='Admin' />);

    await waitFor(() => {
      expect(mockDepartmentService.getAllDepartments).toHaveBeenCalled();
    });

    const submitButton = screen.getByRole('button', {
      name: 'Load Travel Requests',
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText('Failed to generate report. Please try again.')
      ).toBeInTheDocument();
      expect(screen.getByText(error.message)).toBeInTheDocument();
    });
  });

  it('should display backend limitation alert', () => {
    render(<ReportGenerator userRole='Admin' />);

    expect(
      screen.getByText(/Note: Reports are generated from travel request data/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /The backend currently only supports viewing travel requests/
      )
    ).toBeInTheDocument();
  });

  it('should show summary statistics when data is loaded', async () => {
    render(<ReportGenerator userRole='Admin' />);

    await waitFor(() => {
      expect(mockDepartmentService.getAllDepartments).toHaveBeenCalled();
    });

    const submitButton = screen.getByRole('button', {
      name: 'Load Travel Requests',
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockTravelRequestService.getTravelRequests).toHaveBeenCalled();
    });

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('Total Requests')).toBeInTheDocument();
    expect(screen.getByText('Status Types')).toBeInTheDocument();
    expect(screen.getByText('Departments')).toBeInTheDocument();
    expect(screen.getByText('Records Found')).toBeInTheDocument();
  });

  it('should handle empty data gracefully', async () => {
    mockTravelRequestService.getTravelRequests.mockResolvedValue({
      ...mockTravelRequests,
      requests: [],
      totalRequests: 0,
    });

    render(<ReportGenerator userRole='Admin' />);

    await waitFor(() => {
      expect(mockDepartmentService.getAllDepartments).toHaveBeenCalled();
    });

    const submitButton = screen.getByRole('button', {
      name: 'Load Travel Requests',
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockTravelRequestService.getTravelRequests).toHaveBeenCalled();
    });

    expect(
      screen.queryByRole('heading', { name: 'Report Results' })
    ).not.toBeInTheDocument();
    expect(screen.getByText('No records found')).toBeInTheDocument();
  });

  it('should handle filter changes correctly', async () => {
    render(<ReportGenerator userRole='Admin' />);

    await waitFor(() => {
      expect(mockDepartmentService.getAllDepartments).toHaveBeenCalled();
    });

    // Select department
    const departmentSelect = screen.getByLabelText('Department');
    fireEvent.change(departmentSelect, { target: { value: '1' } });

    // Set date range
    const startDate = screen.getByLabelText('Start Date');
    const endDate = screen.getByLabelText('End Date');

    fireEvent.change(startDate, { target: { value: '2024-01-01' } });
    fireEvent.change(endDate, { target: { value: '2024-01-31' } });

    const submitButton = screen.getByRole('button', {
      name: 'Load Travel Requests',
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockTravelRequestService.getTravelRequests).toHaveBeenCalledWith(
        expect.objectContaining({
          departmentId: 1,
          fromDate: '2024-01-01',
          toDate: '2024-01-31',
        })
      );
    });
  });
});
