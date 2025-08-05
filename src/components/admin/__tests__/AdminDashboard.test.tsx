import { screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import AdminDashboard from '../AdminDashboard';
import { renderWithProviders } from '../../../test/utils';

describe('AdminDashboard', () => {
  it('should render without crashing', () => {
    renderWithProviders(<AdminDashboard />);
    expect(screen.getByText(/admin dashboard/i)).toBeInTheDocument();
  });

  it('should display welcome message', () => {
    renderWithProviders(<AdminDashboard />);
    expect(screen.getByText(/welcome/i)).toBeInTheDocument();
  });

  it('should render dashboard tabs', () => {
    renderWithProviders(<AdminDashboard />);
    expect(screen.getByText(/system overview/i)).toBeInTheDocument();
    expect(screen.getByText(/analytics/i)).toBeInTheDocument();
    expect(screen.getByText(/user management/i)).toBeInTheDocument();
    expect(screen.getByText(/quick actions/i)).toBeInTheDocument();
  });
});
