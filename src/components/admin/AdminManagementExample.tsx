import React from 'react';
import { Box, Typography, Alert } from '@mui/material';
import AdminManagement from './AdminManagement';
export const AdminManagementExample: React.FC = () => {
  return (
    <Box>
      <Alert severity='info' sx={{ mb: 3 }}>
        <Typography variant='h6' gutterBottom>
          Admin Management System
        </Typography>
        <Typography variant='body2'>
          This comprehensive admin interface provides:
        </Typography>
        <ul>
          <li>
            <strong>User Management:</strong> Create, edit, and manage user
            accounts with role assignments
          </li>
          <li>
            <strong>Department Management:</strong> Organize users into
            departments with CRUD operations
          </li>
          <li>
            <strong>Project Management:</strong> Manage projects with department
            assignments and tracking
          </li>
          <li>
            <strong>Role Management:</strong> Configure roles with granular
            permission control
          </li>
        </ul>
        <Typography variant='body2' sx={{ mt: 1 }}>
          <strong>Key Features:</strong> Bulk operations, advanced filtering,
          export capabilities, responsive design, and comprehensive validation.
        </Typography>
      </Alert>
      <AdminManagement />
    </Box>
  );
};

export default AdminManagementExample;
