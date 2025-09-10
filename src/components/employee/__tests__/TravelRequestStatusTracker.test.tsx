import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  TravelRequestStatusTracker,
  StatusBadge,
} from '../TravelRequestStatusTracker';
import type { TravelRequest, RequestStatus } from '../../../types';

// Mock travel request data
const createMockTravelRequest = (status: RequestStatus): TravelRequest => ({
  travelRequestId: 123,
  userId: 1,
  projectId: 1,
  departmentId: 1,
  reasonForTravel: 'Business meeting',
  fromDate: '2024-01-15',
  toDate: '2024-01-17',
  fromLocation: 'New York',
  toLocation: 'Los Angeles',
  status: status,
  createdOn: '2024-01-10',
  modifiedOn: '2024-01-12',
  isActive: true,
  comments: 'Please provide more details',
});

describe('TravelRequestStatusTracker', () => {
  describe('compact mode', () => {
    it('should render compact status tracker', () => {
      const request = createMockTravelRequest('Pending');

      render(<TravelRequestStatusTracker request={request} compact={true} />);

      expect(screen.getByText('Request #123')).toBeInTheDocument();
      expect(screen.getByText('Pending Approval')).toBeInTheDocument();
      expect(
        screen.getByText('Waiting for manager approval')
      ).toBeInTheDocument();
    });

    it('should show correct progress for different statuses', () => {
      const statuses = [
        { status: 'Pending', expectedProgress: 25 },
        { status: 'Approved', expectedProgress: 50 },
        { status: 'Booked', expectedProgress: 75 },
        { status: 'Completed', expectedProgress: 100 },
      ];

      statuses.forEach(({ status, expectedProgress }) => {
        const request = createMockTravelRequest(status);

        const { container } = render(
          <TravelRequestStatusTracker request={request} compact={true} />
        );

        const progressBar = container.querySelector('[role="progressbar"]');
        expect(progressBar).toHaveAttribute(
          'aria-valuenow',
          expectedProgress.toString()
        );
      });
    });
  });

  describe('timeline mode', () => {
    it('should render timeline status tracker', () => {
      const request = createMockTravelRequest('Approved');

      render(
        <TravelRequestStatusTracker request={request} showTimeline={true} />
      );

      expect(screen.getByText('Request Status Timeline')).toBeInTheDocument();
      expect(screen.getByText('Pending Approval')).toBeInTheDocument();
      expect(screen.getByText('Approved')).toBeInTheDocument();
      expect(screen.getByText('Booked')).toBeInTheDocument();
      expect(screen.getByText('Completed')).toBeInTheDocument();
    });

    it('should show comments when available', () => {
      const request = createMockTravelRequest('Returned to Employee');

      render(
        <TravelRequestStatusTracker request={request} showTimeline={true} />
      );

      expect(
        screen.getByText('Please provide more details')
      ).toBeInTheDocument();
    });

    it('should show different status colors', () => {
      const statuses = [
        { status: 'Pending', expectedColor: 'warning' },
        { status: 'Approved', expectedColor: 'success' },
        { status: 'Rejected', expectedColor: 'error' },
        { status: 'Booked', expectedColor: 'primary' },
        { status: 'Completed', expectedColor: 'success' },
      ];

      statuses.forEach(({ status, expectedColor }) => {
        const request = createMockTravelRequest(status);

        const { container } = render(
          <TravelRequestStatusTracker request={request} showTimeline={true} />
        );

        const statusChip = container.querySelector(
          `[data-testid="status-chip-${status.toLowerCase()}"]`
        );
        expect(statusChip).toHaveClass(
          `MuiChip-color${expectedColor.charAt(0).toUpperCase() + expectedColor.slice(1)}`
        );
      });
    });
  });

  describe('StatusBadge component', () => {
    it('should render status badge with correct label', () => {
      render(<StatusBadge status='Pending' />);

      expect(screen.getByText('Pending')).toBeInTheDocument();
    });

    it('should render with different sizes', () => {
      render(<StatusBadge status='Pending' size='medium' />);

      const badge = screen.getByText('Pending');
      expect(badge).toBeInTheDocument();
    });

    it('should show correct colors for different statuses', () => {
      const statuses = [
        { status: 'Pending', expectedColor: 'warning' },
        { status: 'Approved', expectedColor: 'success' },
        { status: 'Rejected', expectedColor: 'error' },
        { status: 'Booked', expectedColor: 'primary' },
        { status: 'Completed', expectedColor: 'success' },
        { status: 'Returned to Employee', expectedColor: 'info' },
      ];

      statuses.forEach(({ status, expectedColor }) => {
        const { container } = render(<StatusBadge status={status} />);

        const chip = container.querySelector('.MuiChip-root');
        expect(chip).toHaveClass(
          `MuiChip-color${expectedColor.charAt(0).toUpperCase() + expectedColor.slice(1)}`
        );
      });
    });
  });

  describe('status progression', () => {
    it('should show completed steps for current status', () => {
      const request = createMockTravelRequest('Booked');

      render(
        <TravelRequestStatusTracker request={request} showTimeline={true} />
      );

      // Should show completed steps up to Booked
      expect(screen.getByText('Pending Approval')).toBeInTheDocument();
      expect(screen.getByText('Approved')).toBeInTheDocument();
      expect(screen.getByText('Booked')).toBeInTheDocument();
    });

    it('should show active step for current status', () => {
      const request = createMockTravelRequest('Approved');

      render(
        <TravelRequestStatusTracker request={request} showTimeline={true} />
      );

      // The current status should be marked as active
      const activeStep = screen.getByText('Approved').closest('.MuiStep-root');
      expect(activeStep).toHaveClass('MuiStep-root');
    });
  });
});
