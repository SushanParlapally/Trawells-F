import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TravelRequestCancellation } from '../TravelRequestCancellation';
import { travelRequestService } from '../../../services/api/travelRequestService';
import type { TravelRequest } from '../../../types';

// Mock the travel request service
jest.mock('../../../services/api/travelRequestService');

const mockTravelRequestService = travelRequestService as jest.Mocked<
  typeof travelRequestService
>;

// Mock travel request data
const createMockTravelRequest = (status: string): TravelRequest => ({
  travelRequestId: 123,
  userId: 1,
  projectId: 1,
  departmentId: 1,
  reasonForTravel: 'Business meeting',
  fromDate: '2024-01-15',
  toDate: '2024-01-17',
  fromLocation: 'New York',
  toLocation: 'Los Angeles',
  status: status as any,
  createdOn: '2024-01-10',
  isActive: true,
});

describe('TravelRequestCancellation', () => {
  let mockOnCancel: jest.Mock;
  let mockOnError: jest.Mock;

  beforeEach(() => {
    mockOnCancel = jest.fn();
    mockOnError = jest.fn();
    jest.clearAllMocks();
  });

  describe('cancellable requests', () => {
    it('should render cancel button for pending requests', () => {
      const request = createMockTravelRequest('Pending');

      render(
        <TravelRequestCancellation
          request={request}
          onCancel={mockOnCancel}
          onError={mockOnError}
        />
      );

      expect(
        screen.getByRole('button', { name: /cancel request/i })
      ).toBeInTheDocument();
    });

    it('should render cancel button for approved requests', () => {
      const request = createMockTravelRequest('Approved');

      render(
        <TravelRequestCancellation
          request={request}
          onCancel={mockOnCancel}
          onError={mockOnError}
        />
      );

      expect(
        screen.getByRole('button', { name: /cancel request/i })
      ).toBeInTheDocument();
    });

    it('should render cancel button for returned requests', () => {
      const request = createMockTravelRequest('Returned to Employee');

      render(
        <TravelRequestCancellation
          request={request}
          onCancel={mockOnCancel}
          onError={mockOnError}
        />
      );

      expect(
        screen.getByRole('button', { name: /cancel request/i })
      ).toBeInTheDocument();
    });
  });

  describe('non-cancellable requests', () => {
    it('should not render cancel button for booked requests', () => {
      const request = createMockTravelRequest('Booked');

      render(
        <TravelRequestCancellation
          request={request}
          onCancel={mockOnCancel}
          onError={mockOnError}
        />
      );

      expect(
        screen.queryByRole('button', { name: /cancel request/i })
      ).not.toBeInTheDocument();
    });

    it('should not render cancel button for completed requests', () => {
      const request = createMockTravelRequest('Completed');

      render(
        <TravelRequestCancellation
          request={request}
          onCancel={mockOnCancel}
          onError={mockOnError}
        />
      );

      expect(
        screen.queryByRole('button', { name: /cancel request/i })
      ).not.toBeInTheDocument();
    });
  });

  describe('cancellation dialog', () => {
    it('should open dialog when cancel button is clicked', async () => {
      const request = createMockTravelRequest('Pending');

      render(
        <TravelRequestCancellation
          request={request}
          onCancel={mockOnCancel}
          onError={mockOnError}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /cancel request/i }));

      await waitFor(() => {
        expect(screen.getByText('Cancel Travel Request')).toBeInTheDocument();
      });

      expect(
        screen.getByText('Are you sure you want to cancel this travel request?')
      ).toBeInTheDocument();
    });

    it('should show appropriate warnings based on request status', async () => {
      const request = createMockTravelRequest('Approved');

      render(
        <TravelRequestCancellation
          request={request}
          onCancel={mockOnCancel}
          onError={mockOnError}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /cancel request/i }));

      await waitFor(() => {
        expect(screen.getByText('Cancel Travel Request')).toBeInTheDocument();
      });

      // Should show warnings for approved requests
      expect(
        screen.getByText(/travel admin will be notified/i)
      ).toBeInTheDocument();
    });

    it('should require cancellation reason', async () => {
      const user = userEvent.setup();
      const request = createMockTravelRequest('Pending');

      render(
        <TravelRequestCancellation
          request={request}
          onCancel={mockOnCancel}
          onError={mockOnError}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /cancel request/i }));

      await waitFor(() => {
        expect(screen.getByText('Cancel Travel Request')).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole('button', {
        name: /cancel request/i,
      });

      expect(cancelButton).toBeDisabled();

      // Try to submit without reason
      const reasonInput = screen.getByLabelText(/reason for cancellation/i);
      await user.type(reasonInput, 'Short');

      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(
          screen.getByText(/must be at least 10 characters/i)
        ).toBeInTheDocument();
      });
    });

    it('should handle backend not supported error', async () => {
      const user = userEvent.setup();
      const request = createMockTravelRequest('Pending');

      // Mock the service to throw error (backend not supported)
      mockTravelRequestService.cancel.mockRejectedValue(
        new Error('Cancel functionality is not supported by the backend')
      );

      render(
        <TravelRequestCancellation
          request={request}
          onCancel={mockOnCancel}
          onError={mockOnError}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /cancel request/i }));

      await waitFor(() => {
        expect(screen.getByText('Cancel Travel Request')).toBeInTheDocument();
      });

      const reasonInput = screen.getByLabelText(/reason for cancellation/i);
      await user.type(
        reasonInput,
        'Change of plans due to urgent project requirements'
      );

      const cancelButton = screen.getByRole('button', {
        name: /cancel request/i,
      });

      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith(
          expect.stringContaining(
            'Cancel functionality is not supported by the backend'
          )
        );
      });
    });

    it('should close dialog when cancel is clicked', async () => {
      const request = createMockTravelRequest('Pending');

      render(
        <TravelRequestCancellation
          request={request}
          onCancel={mockOnCancel}
          onError={mockOnError}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /cancel request/i }));

      await waitFor(() => {
        expect(screen.getByText('Cancel Travel Request')).toBeInTheDocument();
      });

      const closeButton = screen.getByRole('button', { name: /close/i });
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(
          screen.queryByText('Cancel Travel Request')
        ).not.toBeInTheDocument();
      });
    });
  });
});
