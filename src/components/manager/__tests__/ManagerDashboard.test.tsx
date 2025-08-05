import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import ManagerDashboard from '../ManagerDashboard';
import { travelRequestService } from '../../../../services/api/travelRequestService';
import { departmentService } from '../../../../services/api/departmentService';
import { projectService } from '../../../../services/api/projectService';

// Mock services
vi.mock('../../../../services/api/travelRequestService');
vi.mock('../../../../services/api/departmentService');
vi.mock('../../../../services/api/projectService');

// Mock Redux store
const mockStore = configureStore({
  reducer: {
    auth: {
      user: {
        userId: 1,
        firstName: 'Manager',
        lastName: 'User',
        email: 'manager@example.com',
        role: 'Manager',
      },
    },
  },
});

const mockTravelRequestService = travelRequestService as any;
const mockDepartmentService = departmentService as any;
const mockProjectService = projectService as any;

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
      status: 'Pending',
      comments: 'Test comment',
    },
  ],
};

const mockDepartments = [
  { departmentId: 1, departmentName: 'IT', isActive: true },
  { departmentId: 2, departmentName: 'HR', isActive: true },
];

const mockProjects = [
  { projectId: 1, projectName: 'Project A', departmentId: 1, isActive: true },
  { projectId: 2, projectName: 'Project B', departmentId: 2, isActive: true },
];

describe('ManagerDashboard', () => {
  beforeEach(() => {
    mockTravelRequestService.getTravelRequests.mockResolvedValue(
      mockTravelRequests
    );
    mockDepartmentService.getAllDepartments.mockResolvedValue(mockDepartments);
    mockProjectService.getProjects.mockResolvedValue(mockProjects);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render without crashing', async () => {
    render(
      <Provider store={mockStore}>
        <ManagerDashboard />
      </Provider>
    );

    expect(screen.getByText('Manager Dashboard')).toBeInTheDocument();
  });

  it('should display team travel requests', async () => {
    render(
      <Provider store={mockStore}>
        <ManagerDashboard />
      </Provider>
    );

    await waitFor(() => {
      expect(mockTravelRequestService.getTravelRequests).toHaveBeenCalled();
    });

    expect(screen.getByText('Travel Requests')).toBeInTheDocument();
  });

  it('should show approval queue tab', async () => {
    render(
      <Provider store={mockStore}>
        <ManagerDashboard />
      </Provider>
    );

    await waitFor(() => {
      expect(mockTravelRequestService.getTravelRequests).toHaveBeenCalled();
    });

    expect(screen.getByText('Approval Queue')).toBeInTheDocument();
  });

  it('should display team statistics', async () => {
    render(
      <Provider store={mockStore}>
        <ManagerDashboard />
      </Provider>
    );

    await waitFor(() => {
      expect(mockTravelRequestService.getTravelRequests).toHaveBeenCalled();
    });

    expect(screen.getByText('Team Statistics')).toBeInTheDocument();
  });

  it('should show backend limitation alerts', async () => {
    render(
      <Provider store={mockStore}>
        <ManagerDashboard />
      </Provider>
    );

    await waitFor(() => {
      expect(mockTravelRequestService.getTravelRequests).toHaveBeenCalled();
    });

    // Check for backend limitation messages
    expect(
      screen.getByText(/not yet implemented in backend/)
    ).toBeInTheDocument();
  });

  it('should handle API errors gracefully', async () => {
    mockTravelRequestService.getTravelRequests.mockRejectedValue(
      new Error('API Error')
    );

    render(
      <Provider store={mockStore}>
        <ManagerDashboard />
      </Provider>
    );

    await waitFor(() => {
      expect(mockTravelRequestService.getTravelRequests).toHaveBeenCalled();
    });

    // Should still render the dashboard even with API errors
    expect(screen.getByText('Manager Dashboard')).toBeInTheDocument();
  });
});
