import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  PersonOff as DeactivateIcon,
  Person as ActivateIcon,
} from '@mui/icons-material';
import { DataTable } from '../common/Tables/DataTable';
import { UserFilters } from './UserFilters';
import UserForm from './UserForm';
import { userService } from '../../services/api/userService';
import type {
  UserCreateData,
  UserUpdateData,
} from '../../services/api/userService';
import { roleService } from '../../services/api/roleService';
import { departmentService } from '../../services/api/departmentService';
import type {
  User,
  Role,
  Department,
  TableColumn,
  PaginationConfig,
  SortConfig,
} from '../../types';

interface UserFiltersType {
  search?: string;
  roleId?: number;
  departmentId?: number;
  isActive?: boolean;
}

interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  mobileNum: string;
  address: string;
  password?: string;
  roleId: number | '';
  departmentId: number | '';
  managerId?: number | '';
  isActive: boolean;
}

interface UserManagementState {
  users: User[];
  roles: Role[];
  departments: Department[];
  loading: boolean;
  error: string | null;
  selectedUser: User | null;
  showUserForm: boolean;
  showFilters: boolean;
  pagination: PaginationConfig;
  filters: UserFiltersType;
  sortConfig: { key: string; direction: 'asc' | 'desc' } | null;
}

export const UserManagement: React.FC = () => {
  const [state, setState] = useState<UserManagementState>({
    users: [],
    roles: [],
    departments: [],
    loading: false,
    error: null,
    selectedUser: null,
    showUserForm: false,
    showFilters: false,
    pagination: { page: 1, pageSize: 20, total: 0 },
    filters: {},
    sortConfig: null,
  });

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const loadUsers = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Backend doesn't support filtering/pagination yet
      const response = await userService.getUsers();

      setState(prev => ({
        ...prev,
        users: response,
        pagination: { ...prev.pagination, total: response.length },
        loading: false,
      }));
    } catch {
      setState(prev => ({
        ...prev,
        error: 'Failed to load users',
        loading: false,
      }));
    }
  }, []);

  const loadInitialData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const [rolesData, departmentsData] = await Promise.all([
        roleService.getAll(),
        departmentService.getAll(),
      ]);

      setState(prev => ({
        ...prev,
        roles: rolesData,
        departments: departmentsData,
      }));

      await loadUsers();
    } catch {
      setState(prev => ({
        ...prev,
        error: 'Failed to load initial data',
        loading: false,
      }));
    }
  }, [loadUsers]);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Load users when dependencies change
  useEffect(() => {
    if (state.roles.length > 0 && state.departments.length > 0) {
      loadUsers();
    }
  }, [loadUsers, state.roles.length, state.departments.length]);

  const handleCreateUser = () => {
    setState(prev => ({ ...prev, selectedUser: null, showUserForm: true }));
  };

  const handleEditUser = (user: User) => {
    setState(prev => ({ ...prev, selectedUser: user, showUserForm: true }));
  };

  const handleDeactivateUser = async (user: User) => {
    if (
      !window.confirm(
        `Are you sure you want to ${user.isActive ? 'deactivate' : 'activate'} ${user.firstName} ${user.lastName}?`
      )
    ) {
      return;
    }

    try {
      // Backend only supports soft delete (deactivation)
      if (user.isActive) {
        await userService.deleteUser(user.userId);
        setSnackbar({
          open: true,
          message: 'User deactivated successfully',
          severity: 'success',
        });
      } else {
        setSnackbar({
          open: true,
          message: 'User activation is not supported by the backend',
          severity: 'warning',
        });
        return;
      }

      await loadUsers();
    } catch {
      setSnackbar({
        open: true,
        message: `Failed to ${user.isActive ? 'deactivate' : 'activate'} user`,
        severity: 'error',
      });
    }
  };

  const handleUserFormSubmit = async (userData: UserFormData) => {
    try {
      if (state.selectedUser) {
        // Note: Backend only supports updating firstName, lastName, password, and address
        // But we need to include all required fields to pass validation
        const updateData: UserUpdateData = {
          userId: state.selectedUser.userId, // Backend requires userId in request body
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: state.selectedUser.email, // Include existing email to pass validation
          mobileNum: state.selectedUser.mobileNum, // Include existing mobile to pass validation
          address: userData.address.replace(/\n/g, ' ').substring(0, 100),
          roleId: state.selectedUser.roleId, // Include existing roleId to pass validation
          departmentId: state.selectedUser.departmentId, // Include existing departmentId to pass validation
          ...(userData.password && { password: userData.password }), // Only include password if provided
        };

        console.log('Update data being sent:', updateData);
        console.log('Selected user:', state.selectedUser);

        await userService.updateUser(state.selectedUser.userId, updateData);
        setSnackbar({
          open: true,
          message:
            'User updated successfully (limited fields due to backend constraints)',
          severity: 'success',
        });
      } else {
        const createData: UserCreateData = {
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email.toLowerCase(), // Ensure email is lowercase
          mobileNum: userData.mobileNum,
          address: userData.address.replace(/\n/g, ' ').substring(0, 100), // Remove newlines and truncate to 100 chars
          password: 'defaultPassword123', // TODO: Generate or get from form - 17 chars, well within 100 limit
          roleId: userData.roleId as number,
          departmentId: userData.departmentId as number,
          managerId:
            userData.managerId && String(userData.managerId) !== ''
              ? Number(userData.managerId)
              : undefined,
          createdBy: 1, // TODO: Get from current user
          isActive: userData.isActive,
        };
        await userService.createUser(createData);
        setSnackbar({
          open: true,
          message: 'User created successfully',
          severity: 'success',
        });
      }

      setState(prev => ({
        ...prev,
        showUserForm: false,
        selectedUser: null,
      }));

      await loadUsers();
    } catch {
      setSnackbar({
        open: true,
        message: `Failed to ${state.selectedUser ? 'update' : 'create'} user`,
        severity: 'error',
      });
    }
  };

  const handleFiltersChange = (newFilters: UserFiltersType) => {
    setState(prev => ({
      ...prev,
      filters: newFilters,
      pagination: { ...prev.pagination, page: 1 },
    }));
  };

  const handlePaginationChange = (page: number, pageSize: number) => {
    setState(prev => ({
      ...prev,
      pagination: { ...prev.pagination, page, pageSize },
    }));
  };

  const handleSort = (sortConfig: SortConfig) => {
    setState(prev => ({
      ...prev,
      sortConfig: sortConfig.direction
        ? {
            key: sortConfig.key,
            direction: sortConfig.direction,
          }
        : null,
    }));
  };

  const getRoleName = (roleId: number) => {
    const role = state.roles.find(r => r.roleId === roleId);
    return role?.roleName || 'Unknown';
  };

  const getDepartmentName = (departmentId: number) => {
    const department = state.departments.find(
      d => d.departmentId === departmentId
    );
    return department?.departmentName || 'Unknown';
  };

  const columns: TableColumn<User>[] = [
    {
      key: 'firstName',
      title: 'Name',
      sortable: true,
      render: (_, user) => (
        <Box>
          <Typography variant='body2' fontWeight='medium'>
            {user.firstName} {user.lastName}
          </Typography>
          <Typography variant='caption' color='text.secondary'>
            {user.email}
          </Typography>
        </Box>
      ),
    },
    {
      key: 'role',
      title: 'Role',
      sortable: true,
      render: (_, user) => (
        <Chip
          label={getRoleName(user.roleId)}
          size='small'
          color='primary'
          variant='outlined'
        />
      ),
    },
    {
      key: 'department',
      title: 'Department',
      sortable: true,
      render: (_, user) => getDepartmentName(user.departmentId),
    },
    {
      key: 'mobileNum',
      title: 'Mobile',
      render: (_, user) => user.mobileNum,
    },
    {
      key: 'isActive',
      title: 'Status',
      sortable: true,
      render: (_, user) => (
        <Chip
          label={user.isActive ? 'Active' : 'Inactive'}
          size='small'
          color={user.isActive ? 'success' : 'default'}
          variant={user.isActive ? 'filled' : 'outlined'}
        />
      ),
    },
    {
      key: 'createdOn',
      title: 'Created',
      sortable: true,
      render: (_, user) => new Date(user.createdOn).toLocaleDateString(),
    },
    {
      key: 'actions',
      title: 'Actions',
      align: 'center',
      render: (_, user) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title='Edit User'>
            <IconButton
              size='small'
              onClick={() => handleEditUser(user)}
              color='primary'
            >
              <EditIcon fontSize='small' />
            </IconButton>
          </Tooltip>
          <Tooltip title={user.isActive ? 'Deactivate User' : 'Activate User'}>
            <IconButton
              size='small'
              onClick={() => handleDeactivateUser(user)}
              color={user.isActive ? 'warning' : 'success'}
            >
              {user.isActive ? (
                <DeactivateIcon fontSize='small' />
              ) : (
                <ActivateIcon fontSize='small' />
              )}
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

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
            User Management
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant='outlined'
              startIcon={<RefreshIcon />}
              onClick={loadUsers}
              disabled={state.loading}
            >
              Refresh
            </Button>
            <Button
              variant='contained'
              startIcon={<AddIcon />}
              onClick={handleCreateUser}
            >
              Add User
            </Button>
          </Box>
        </Box>

        {/* Error Alert */}
        {state.error && (
          <Alert severity='error' sx={{ mb: 2 }}>
            {state.error}
          </Alert>
        )}

        {/* Filters */}
        <UserFilters
          roles={state.roles}
          departments={state.departments}
          filters={state.filters}
          onFiltersChange={handleFiltersChange}
          sx={{ mb: 2 }}
        />

        {/* Data Table */}
        <DataTable
          columns={columns as unknown as TableColumn<Record<string, unknown>>[]}
          data={state.users as unknown as Record<string, unknown>[]}
          loading={state.loading}
          pagination={state.pagination}
          onPaginationChange={handlePaginationChange}
          onSort={handleSort}
          searchable
          searchPlaceholder='Search users by name or email...'
          exportable
          exportFileName='users'
          rowKey='userId'
        />

        {/* User Form Dialog */}
        <Dialog
          open={state.showUserForm}
          onClose={() =>
            setState(prev => ({
              ...prev,
              showUserForm: false,
              selectedUser: null,
            }))
          }
          maxWidth='md'
          fullWidth
        >
          <DialogTitle>
            {state.selectedUser ? 'Edit User' : 'Create New User'}
          </DialogTitle>
          <DialogContent>
            <UserForm
              user={state.selectedUser}
              roles={state.roles}
              departments={state.departments}
              onSubmit={handleUserFormSubmit}
              onCancel={() =>
                setState(prev => ({
                  ...prev,
                  showUserForm: false,
                  selectedUser: null,
                }))
              }
            />
          </DialogContent>
        </Dialog>

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

export default UserManagement;
