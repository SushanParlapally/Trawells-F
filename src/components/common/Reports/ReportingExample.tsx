import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { Reports } from './Reports';

/**
 * Example component showing how to integrate the reporting functionality
 * into different dashboard views based on user roles
 */
export const ReportingExample: React.FC = () => {
  // This would typically come from your auth context or props
  const currentUser = {
    userId: 1,
    role: 'Admin', // Can be 'Admin', 'TravelAdmin', 'Manager', 'Employee'
    managerId: undefined,
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant='h4' gutterBottom>
        Travel Request Reports
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant='h6' gutterBottom>
            Features Implemented:
          </Typography>

          <ul>
            <li>
              <strong>Travel Request Reports:</strong> View and filter travel
              requests using existing backend APIs
            </li>
            <li>
              <strong>Date Range Filtering:</strong> Filter requests by date
              range
            </li>
            <li>
              <strong>Status Filtering:</strong> Filter by request status
              (pending, approved, etc.)
            </li>
            <li>
              <strong>Department/Project Filtering:</strong> Filter by
              department and project
            </li>
            <li>
              <strong>CSV Export:</strong> Export filtered data to CSV format
            </li>
            <li>
              <strong>Text Export:</strong> Export data as text file
            </li>
            <li>
              <strong>Summary Statistics:</strong> Display key metrics and
              counts
            </li>
            <li>
              <strong>No Backend Changes:</strong> Uses existing
              TravelRequestController API
            </li>
          </ul>
        </CardContent>
      </Card>

      <Reports
        userRole={currentUser.role}
        userId={currentUser.userId}
        managerId={currentUser.managerId}
      />
    </Box>
  );
};

/**
 * Usage examples for different roles:
 *
 * // For Employee Dashboard
 * <Reports userRole="Employee" userId={employeeId} />
 *
 * // For Manager Dashboard
 * <Reports userRole="Manager" managerId={managerId} />
 *
 * // For Travel Admin Dashboard
 * <Reports userRole="TravelAdmin" />
 *
 * // For Admin Dashboard
 * <Reports userRole="Admin" />
 */
