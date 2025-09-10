import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  IconButton,
  Alert,
  Snackbar,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  People as PeopleIcon,
  Security as SecurityIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import { roleService } from '../../services/api/roleService';
import type { Role } from '../../types';

interface RoleManagementState {
  roles: Role[];
  loading: boolean;
  error: string | null;
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
}

export const RoleManagement: React.FC = () => {
  const [state, setState] = useState<RoleManagementState>({
    roles: [],
    loading: false,
    error: null,
  });

  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success',
  });

  const loadRoles = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Backend only supports GET all roles (excluding Admin)
      const roles = await roleService.getAllRoles();

      setState(prev => ({
        ...prev,
        roles,
        loading: false,
      }));
    } catch (error) {
      console.error('Failed to load roles:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to load roles',
        loading: false,
      }));
    }
  }, []);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  const handleCreateRole = () => {
    setSnackbar({
      open: true,
      message: 'Role creation is not supported by the backend',
      severity: 'warning',
    });
  };

  const handleEditRole = () => {
    setSnackbar({
      open: true,
      message: 'Role editing is not supported by the backend',
      severity: 'warning',
    });
  };

  const getRoleColor = (roleName: string) => {
    switch (roleName.toLowerCase()) {
      case 'admin':
        return 'error';
      case 'traveladmin':
        return 'warning';
      case 'manager':
        return 'info';
      case 'employee':
        return 'success';
      default:
        return 'default';
    }
  };

  const getRoleHierarchy = (roleName: string) => {
    const hierarchy = ['Admin', 'TravelAdmin', 'Manager', 'Employee'];
    return hierarchy.indexOf(roleName) + 1;
  };

  const getRoleDescription = (roleName: string) => {
    switch (roleName.toLowerCase()) {
      case 'admin':
        return 'Full system administration access';
      case 'traveladmin':
        return 'Manage travel bookings and arrangements';
      case 'manager':
        return 'Approve and manage team travel requests';
      case 'employee':
        return 'Create and submit travel requests';
      default:
        return 'Standard user role';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <Typography variant='h5' component='h1'>
            Role Management
          </Typography>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant='outlined'
              startIcon={<RefreshIcon />}
              onClick={loadRoles}
              disabled={state.loading}
            >
              Refresh
            </Button>

            <Button
              variant='contained'
              startIcon={<AddIcon />}
              onClick={handleCreateRole}
              disabled
              title='Role creation not supported by backend'
            >
              Add Role
            </Button>
          </Box>
        </Box>

        {/* Error Alert */}
        {state.error && (
          <Alert severity='error' sx={{ mb: 2 }}>
            {state.error}
          </Alert>
        )}

        {/* Role Hierarchy Info */}
        <Alert severity='info' sx={{ mb: 3 }}>
          <Typography variant='body2'>
            <strong>Role Hierarchy:</strong> Admin (1) → Travel Admin (2) →
            Manager (3) → Employee (4)
            <br />
            Higher-level roles inherit permissions from lower-level roles.
          </Typography>
        </Alert>

        {/* Roles Cards */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: 'repeat(2, 1fr)',
              lg: 'repeat(3, 1fr)',
            },
            gap: 3,
          }}
        >
          {state.roles.map(role => (
            <Card
              key={role.roleId}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                {/* Role Header */}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    mb: 2,
                  }}
                >
                  <Box>
                    <Typography variant='h6' component='h2' gutterBottom>
                      {role.roleName}
                    </Typography>
                    <Chip
                      label={`Level ${getRoleHierarchy(role.roleName)}`}
                      size='small'
                      color={
                        getRoleColor(role.roleName) as
                          | 'error'
                          | 'warning'
                          | 'info'
                          | 'success'
                          | 'default'
                      }
                      variant='outlined'
                    />
                  </Box>

                  <IconButton
                    size='small'
                    onClick={() => handleEditRole(role)}
                    color='primary'
                    disabled
                    title='Role editing not supported'
                  >
                    <EditIcon fontSize='small' />
                  </IconButton>
                </Box>

                {/* Role Description */}
                <Typography
                  variant='body2'
                  color='text.secondary'
                  sx={{ mb: 2 }}
                >
                  {getRoleDescription(role.roleName)}
                </Typography>

                {/* User Count */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: 2,
                  }}
                >
                  <PeopleIcon fontSize='small' color='action' />
                  <Typography variant='body2'>
                    {role.userCount || 0}{' '}
                    {role.userCount === 1 ? 'user' : 'users'}
                  </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Role Info */}
                <Box>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <SecurityIcon fontSize='small' color='action' />
                    <Typography variant='subtitle2'>Role Details</Typography>
                  </Box>

                  <List dense sx={{ maxHeight: 200, overflow: 'auto' }}>
                    <ListItem sx={{ py: 0.5, px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CheckIcon fontSize='small' color='success' />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant='body2'>
                            Role ID: {role.roleId}
                          </Typography>
                        }
                      />
                    </ListItem>
                    <ListItem sx={{ py: 0.5, px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CheckIcon fontSize='small' color='success' />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant='body2'>
                            Status: {role.isActive ? 'Active' : 'Inactive'}
                          </Typography>
                        }
                      />
                    </ListItem>
                    <ListItem sx={{ py: 0.5, px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CheckIcon fontSize='small' color='success' />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant='body2'>
                            Created:{' '}
                            {new Date(role.createdOn).toLocaleDateString()}
                          </Typography>
                        }
                      />
                    </ListItem>
                  </List>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Empty State */}
        {state.roles.length === 0 && !state.loading && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <SecurityIcon
              sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }}
            />
            <Typography variant='h6' color='text.secondary' gutterBottom>
              No roles found
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
              Roles are managed by the system administrator.
            </Typography>
          </Box>
        )}

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        >
          <Alert
            onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Paper>
    </Box>
  );
};

export default RoleManagement;
