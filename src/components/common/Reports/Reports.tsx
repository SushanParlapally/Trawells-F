import React from 'react';
import { Box, Typography } from '@mui/material';
import { ReportGenerator } from './ReportGenerator';

interface ReportsProps {
  userRole: string;
  userId?: number;
  managerId?: number;
}

export const Reports: React.FC<ReportsProps> = ({
  userRole,
  userId,
  managerId,
}) => {
  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant='h4' gutterBottom>
        Travel Request Reports
      </Typography>

      <Typography variant='body1' color='text.secondary' sx={{ mb: 3 }}>
        View and export travel request data using existing backend APIs. No
        backend changes required.
      </Typography>

      <ReportGenerator
        userRole={userRole}
        userId={userId}
        managerId={managerId}
      />
    </Box>
  );
};
