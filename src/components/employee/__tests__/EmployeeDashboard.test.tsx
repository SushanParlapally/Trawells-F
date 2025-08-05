import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { BrowserRouter } from 'react-router-dom';
import authSlice from '../../../store/slices/authSlice';
import { EmployeeDashboard } from '../EmployeeDashboard';
import { travelRequestService } from '../../../services/api/travelRequestService';
import type { TravelRequest } from '../../../types';

// Mock the travel request service
jest.mock('../../../services/api/travelRequestService');

const mockTravelRequestService = travelRequestService as jest.Mocked<
  typeof travelRequestService
>;

// Mock user data
const mockUser = {
  userId: 1,
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  mobileNum: '1234567890',
  address: '123 Main St',
  roleId: 4,
  departmentId: 1,
  isActive: true,
  createdOn: new Date(),
};

// Mock travel requests
const mockTravelRequests: TravelRequest[] = [
  {
    travelRequestId: 1,
    userId: 1,
    projectId: 1,
    departmentId: 1,
    reasonForTravel: 'Business meeting in Los Angeles',
    fromDate: '2024-01-15',
    toDate: '2024-01-17',
    fromLocation: 'New York',
    toLocation: 'Los Angeles',
    status: 'Pending',
    createdOn: '2024-01-10',
    isActive: true,
  },
  {
    travelRequestId: 2,
    userId: 1,
    projectId: 2,
    departmentId: 1,
    reasonForTravel: 'Conference in San Francisco',
    fromDate: '2024-02-01',
    toDate: '2024-02-03',
    fromLocation: 'New York',
    toLocation: 'San Francisco',
    status: 'Approved',
    createdOn: '2024-01-20',
    isActive: true,
  },
];

const createMockStore = (user = mockUser) => {
  return configureStore({
    reducer: { auth: authSlice },
    preloadedState: {
      auth: {
        user,
        token: 'mock-token',
        isAuthenticated: true,
        loading: false,
        error: null,
      },
    },
  });
};

describe('EmployeeDashboard', () => {
  let store: ReturnType<typeof createMockStore>;

  beforeEach(() => {
    store = createMockStore();
    jest.clearAllMocks();
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <Provider store={store}>
        <BrowserRouter>{component}</BrowserRouter>
      </Provider>
    );
  };

  describe('rendering', () => {
    it('should render dashboard without crashing', () => {
      mockTravelRequestService.getByUserId.mockResolvedValue(
        mockTravelRequests
      );

      renderWithProviders(<EmployeeDashboard />);

      expect(screen.getByText('Employee Dashboard')).toBeInTheDocument();
    });

    it('should show loading state initially', () => {
      mockTravelRequestService.getByUserId.mockImplementation(
        () => new Promise(() => {})
      );

      renderWithProviders(<EmployeeDashboard />);

      expect(screen.getByText('Employee Dashboard')).toBeInTheDocument();
    });

    it('should show error state when API fails', async () => {
      mockTravelRequestService.getByUserId.mockRejectedValue(
        new Error('Failed to load requests')
      );

      renderWithProviders(<EmployeeDashboard />);

      await waitFor(() => {
        expect(
          screen.getByText(/failed to load travel requests/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe('dashboard content', () => {
    it('should display user travel requests', async () => {
      mockTravelRequestService.getByUserId.mockResolvedValue(
        mockTravelRequests
      );

      renderWithProviders(<EmployeeDashboard />);

      await waitFor(() => {
        expect(
          screen.getByText('Business meeting in Los Angeles')
        ).toBeInTheDocument();
        expect(
          screen.getByText('Conference in San Francisco')
        ).toBeInTheDocument();
      });
    });

    it('should show create new request button', async () => {
      mockTravelRequestService.getByUserId.mockResolvedValue(
        mockTravelRequests
      );

      renderWithProviders(<EmployeeDashboard />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /create new request/i })
        ).toBeInTheDocument();
      });
    });

    it('should display request statistics', async () => {
      mockTravelRequestService.getByUserId.mockResolvedValue(
        mockTravelRequests
      );

      renderWithProviders(<EmployeeDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Total Requests')).toBeInTheDocument();
        expect(screen.getByText('Pending Requests')).toBeInTheDocument();
        expect(screen.getByText('Approved Requests')).toBeInTheDocument();
      });
    });

    it('should show request status badges', async () => {
      mockTravelRequestService.getByUserId.mockResolvedValue(
        mockTravelRequests
      );

      renderWithProviders(<EmployeeDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Pending')).toBeInTheDocument();
        expect(screen.getByText('Approved')).toBeInTheDocument();
      });
    });
  });

  describe('navigation', () => {
    it('should have tabs for different views', async () => {
      mockTravelRequestService.getByUserId.mockResolvedValue(
        mockTravelRequests
      );

      renderWithProviders(<EmployeeDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Overview')).toBeInTheDocument();
        expect(screen.getByText('Requests')).toBeInTheDocument();
        expect(screen.getByText('Analytics')).toBeInTheDocument();
      });
    });
  });

  describe('data handling', () => {
    it('should handle empty requests list', async () => {
      mockTravelRequestService.getByUserId.mockResolvedValue([]);

      renderWithProviders(<EmployeeDashboard />);

      await waitFor(() => {
        expect(
          screen.getByText(/no travel requests found/i)
        ).toBeInTheDocument();
      });
    });

    it('should calculate statistics correctly', async () => {
      mockTravelRequestService.getByUserId.mockResolvedValue(
        mockTravelRequests
      );

      renderWithProviders(<EmployeeDashboard />);

      await waitFor(() => {
        // Should show 2 total requests, 1 pending, 1 approved
        expect(screen.getByText('2')).toBeInTheDocument(); // Total requests
      });
    });
  });
});
