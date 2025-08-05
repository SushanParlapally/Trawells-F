import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Pagination from '../Pagination';

const theme = createTheme();

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider theme={theme}>{children}</ThemeProvider>
);

describe('Pagination', () => {
  const defaultProps = {
    page: 1,
    pageSize: 20,
    total: 100,
    onPageChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders pagination info correctly', () => {
    render(
      <TestWrapper>
        <Pagination {...defaultProps} />
      </TestWrapper>
    );

    expect(
      screen.getByText('Showing 1 to 20 of 100 entries')
    ).toBeInTheDocument();
  });

  it('renders page numbers correctly', () => {
    render(
      <TestWrapper>
        <Pagination {...defaultProps} page={3} />
      </TestWrapper>
    );

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('handles page change', async () => {
    const user = userEvent.setup();
    const onPageChange = jest.fn();

    render(
      <TestWrapper>
        <Pagination {...defaultProps} onPageChange={onPageChange} />
      </TestWrapper>
    );

    const page2Button = screen.getByText('2');
    await user.click(page2Button);

    expect(onPageChange).toHaveBeenCalledWith(2, 20);
  });

  it('handles page size change', async () => {
    const user = userEvent.setup();
    const onPageChange = jest.fn();

    render(
      <TestWrapper>
        <Pagination {...defaultProps} onPageChange={onPageChange} />
      </TestWrapper>
    );

    const pageSizeSelect = screen.getByRole('combobox');
    await user.click(pageSizeSelect);

    const option50 = screen.getByText('50');
    await user.click(option50);

    expect(onPageChange).toHaveBeenCalledWith(1, 50);
  });

  it('disables previous button on first page', () => {
    render(
      <TestWrapper>
        <Pagination {...defaultProps} page={1} />
      </TestWrapper>
    );

    const prevButton = screen.getByTitle('Go to previous page');
    expect(prevButton).toBeDisabled();
  });

  it('disables next button on last page', () => {
    render(
      <TestWrapper>
        <Pagination {...defaultProps} page={5} total={100} pageSize={20} />
      </TestWrapper>
    );

    const nextButton = screen.getByTitle('Go to next page');
    expect(nextButton).toBeDisabled();
  });

  it('shows first and last page buttons for large page counts', () => {
    render(
      <TestWrapper>
        <Pagination {...defaultProps} total={1000} pageSize={10} />
      </TestWrapper>
    );

    expect(screen.getByTitle('Go to first page')).toBeInTheDocument();
    expect(screen.getByTitle('Go to last page')).toBeInTheDocument();
  });

  it('handles first page navigation', async () => {
    const user = userEvent.setup();
    const onPageChange = jest.fn();

    render(
      <TestWrapper>
        <Pagination {...defaultProps} page={5} onPageChange={onPageChange} />
      </TestWrapper>
    );

    const firstPageButton = screen.getByTitle('Go to first page');
    await user.click(firstPageButton);

    expect(onPageChange).toHaveBeenCalledWith(1, 20);
  });

  it('handles last page navigation', async () => {
    const user = userEvent.setup();
    const onPageChange = jest.fn();

    render(
      <TestWrapper>
        <Pagination {...defaultProps} onPageChange={onPageChange} />
      </TestWrapper>
    );

    const lastPageButton = screen.getByTitle('Go to last page');
    await user.click(lastPageButton);

    expect(onPageChange).toHaveBeenCalledWith(5, 20);
  });

  it('handles custom page size options', () => {
    const customPageSizeOptions = [5, 10, 25, 50];

    render(
      <TestWrapper>
        <Pagination {...defaultProps} pageSizeOptions={customPageSizeOptions} />
      </TestWrapper>
    );

    const pageSizeSelect = screen.getByRole('combobox');
    fireEvent.mouseDown(pageSizeSelect);

    customPageSizeOptions.forEach(option => {
      expect(screen.getByText(option.toString())).toBeInTheDocument();
    });
  });

  it('hides page size changer when disabled', () => {
    render(
      <TestWrapper>
        <Pagination {...defaultProps} showSizeChanger={false} />
      </TestWrapper>
    );

    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });
});
