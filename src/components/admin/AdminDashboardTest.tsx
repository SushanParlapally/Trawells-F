import React from 'react';
import { Typography, Paper, Stack } from '@mui/material';

const AdminDashboardTest: React.FC = () => {
  return (
    <Stack spacing={3}>
      <Paper sx={{ p: 3 }}>
        <Typography variant='h4' gutterBottom>
          Admin Dashboard Test
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          This is a test component to verify the admin dashboard structure
          works.
        </Typography>
      </Paper>
    </Stack>
  );
};

export default AdminDashboardTest;
