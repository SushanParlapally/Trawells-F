import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { ReportGenerator } from '../ReportGenerator';
import { travelRequestService } from '../../../../services/api/travelRequestService';
import { departmentService } from '../../../../services/api/departmentService';
import { projectService } from '../../../../services/api/projectService';

// Mock services
vi.mock('../../../../services/api/travelRequestService');
vi.mock('../../../../services/api/departmentService');
vi.mock('../../../../services/api/projectService');

// Mock date picker
vi.mock('@mui/x-date-pickers', () => ({
  DatePicker: ({ label, onChange, value }: any) => (
    <input
      data-testid={`date-picker-${label.toLowerCase().replace(' ', '-')}`}
      type='date'
      value={value?.toISOString().split('T')[0] || ''}
      onChange={e => onChange(new Date(e.target.value))}
    />
  ),
  LocalizationProvider: ({ children }: any) => children,
}));

vi.mock('@mui/x-date-pickers/AdapterDateFns', () => ({
  AdapterDateFns: vi.fn(),
}));

const mockTravelRequestService = travelRequestService as any;
const mockDepartmentService = departmentService as any;
const mockProjectService = projectService as any;

const mockDepartments = [
  {
    departmentId: 1,
    departmentName: 'IT',
    isActive: true,
    createdOn: new Date(),
  },
  {
    departmentId: 2,
    departmentName: 'HR',
    isActive: true,
    createdOn: new Date(),
  },
];

const mockProjects = [
  {
    projectId: 1,
    projectName: 'Project A',
    departmentId: 1,
    isActive: true,
    createdOn: new Date(),
  },
  {
    projectId: 2,
    projectName: 'Project B',
    departmentId: 2,
    isActive: true,
    createdOn: new Date(),
  },
];

const mockTravelRequests = {
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
  ],
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

  it('should render report generator form', async () => {
    render(<ReportGenerator userRole='Admin' />);

    expect(screen.getByText('Travel Request Reports')).toBeInTheDocument();
    expect(screen.getByText('Report Filters')).toBeInTheDocument();
    expect(screen.getByTestId('date-picker-start-date')).toBeInTheDocument();
    expect(screen.getByTestId('date-picker-end-date')).toBeInTheDocument();
    expect(screen.getByText('Load Travel Requests')).toBeInTheDocument();

    // Wait for departments and projects to load
    await waitFor(() => {
      expect(mockDepartmentService.getAllDepartments).toHaveBeenCalled();
      expect(mockProjectService.getProjects).toHaveBeenCalled();
    });
  });

  it('should generate report when form is submitted', async () => {
    render(<ReportGenerator userRole='Admin' />);

    // Wait for initial data to load
    await waitFor(() => {
      expect(mockDepartmentService.getAllDepartments).toHaveBeenCalled();
    });

    // Submit the form
    const submitButton = screen.getByText('Load Travel Requests');
    fireEvent.click(submitButton);

    // Wait for the report to be generated
    await waitFor(() => {
      expect(mockTravelRequestService.getTravelRequests).toHaveBeenCalled();
    });

    // Check that the report results are displayed
    expect(screen.getByText('Report Results')).toBeInTheDocument();
    expect(screen.getByText('Export CSV')).toBeInTheDocument();
    expect(screen.getByText('Export Text')).toBeInTheDocument();
  });

  it('should display error message when API call fails', async () => {
    mockTravelRequestService.getTravelRequests.mockRejectedValue(
      new Error('API Error')
    );

    render(<ReportGenerator userRole='Admin' />);

    // Wait for initial data to load
    await waitFor(() => {
      expect(mockDepartmentService.getAllDepartments).toHaveBeenCalled();
    });

    // Submit the form
    const submitButton = screen.getByText('Load Travel Requests');
    fireEvent.click(submitButton);

    // Wait for error to be displayed
    await waitFor(() => {
      expect(
        screen.getByText('Failed to generate report. Please try again.')
      ).toBeInTheDocument();
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

    // Wait for initial data to load
    await waitFor(() => {
      expect(mockDepartmentService.getAllDepartments).toHaveBeenCalled();
    });

    // Submit the form
    const submitButton = screen.getByText('Load Travel Requests');
    fireEvent.click(submitButton);

    // Wait for the report to be generated
    await waitFor(() => {
      expect(mockTravelRequestService.getTravelRequests).toHaveBeenCalled();
    });

    // Check summary statistics
    expect(screen.getByText('1')).toBeInTheDocument(); // Total requests
    expect(screen.getByText('Total Requests')).toBeInTheDocument();
    expect(screen.getByText('Status Types')).toBeInTheDocument();
    expect(screen.getByText('Departments')).toBeInTheDocument();
    expect(screen.getByText('Records Found')).toBeInTheDocument();
  });

  it('should handle empty data gracefully', async () => {
    mockTravelRequestService.getTravelRequests.mockResolvedValue({
      requests: [],
    });

    render(<ReportGenerator userRole='Admin' />);

    // Wait for initial data to load
    await waitFor(() => {
      expect(mockDepartmentService.getAllDepartments).toHaveBeenCalled();
    });

    // Submit the form
    const submitButton = screen.getByText('Load Travel Requests');
    fireEvent.click(submitButton);

    // Wait for the report to be generated
    await waitFor(() => {
      expect(mockTravelRequestService.getTravelRequests).toHaveBeenCalled();
    });

    // Check that no results are shown
    expect(screen.queryByText('Report Results')).not.toBeInTheDocument();
  });
});
