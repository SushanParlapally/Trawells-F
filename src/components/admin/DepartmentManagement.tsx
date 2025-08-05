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
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Close as DeactivateIcon,
  CheckCircle as ActivateIcon,
} from '@mui/icons-material';
import { departmentService } from '../../services/api/departmentService';
import DataTable from '../common/Tables/DataTable';
import type {
  Department,
  TableColumn,
  PaginationConfig,
  SortConfig,
} from '../../types';

interface DepartmentManagementState {
  departments: Department[];
  loading: boolean;
  error: string | null;
  pagination: PaginationConfig;
  sortConfig: SortConfig | null;
  anchorEl: HTMLElement | null;
  menuDepartment: Department | null;
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
}

export const DepartmentManagement: React.FC = () => {
  const [state, setState] = useState<DepartmentManagementState>({
    departments: [],
    loading: false,
    error: null,
    pagination: { page: 1, pageSize: 20, total: 0 },
    sortConfig: null,
    anchorEl: null,
    menuDepartment: null,
  });

  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success',
  });

  const loadDepartments = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Backend only supports GET all departments - no pagination or sorting
      const response = await departmentService.getAllDepartments();

      setState(prev => ({
        ...prev,
        departments: response,
        pagination: {
          ...prev.pagination,
          total: response.length,
        },
        loading: false,
      }));
    } catch (error) {
      console.error('Failed to load departments:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to load departments',
        loading: false,
      }));
    }
  }, []);

  useEffect(() => {
    loadDepartments();
  }, [loadDepartments]);

  const handleCreateDepartment = () => {
    setSnackbar({
      open: true,
      message: 'Department creation is not supported by the backend',
      severity: 'warning',
    });
  };

  const handleEditDepartment = (_department: Department) => {
    setSnackbar({
      open: true,
      message: 'Department editing is not supported by the backend',
      severity: 'warning',
    });
    setState(prev => ({ ...prev, anchorEl: null, menuDepartment: null }));
  };

  const handleToggleDepartmentStatus = async (_department: Department) => {
    setSnackbar({
      open: true,
      message: 'Department status toggle is not supported by the backend',
      severity: 'warning',
    });
    setState(prev => ({ ...prev, anchorEl: null, menuDepartment: null }));
  };

  const handleDeleteDepartment = async (_department: Department) => {
    setSnackbar({
      open: true,
      message: 'Department deletion is not supported by the backend',
      severity: 'warning',
    });
    setState(prev => ({ ...prev, anchorEl: null, menuDepartment: null }));
  };

  const handlePaginationChange = (page: number, pageSize: number) => {
    setState(prev => ({
      ...prev,
      pagination: { ...prev.pagination, page, pageSize },
    }));
  };

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    department: Department
  ) => {
    setState(prev => ({
      ...prev,
      anchorEl: event.currentTarget,
      menuDepartment: department,
    }));
  };

  const handleMenuClose = () => {
    setState(prev => ({ ...prev, anchorEl: null, menuDepartment: null }));
  };

  const columns: TableColumn<Department>[] = [
    {
      key: 'departmentName',
      title: 'Department Name',
      sortable: true,
      render: (_, department) => (
        <Box>
          <Typography variant='body2' fontWeight='medium'>
            {department.departmentName}
          </Typography>
          <Typography variant='caption' color='text.secondary'>
            ID: {department.departmentId}
          </Typography>
        </Box>
      ),
    },
    {
      key: 'isActive',
      title: 'Status',
      sortable: true,
      render: (_, department) => (
        <Chip
          label={department.isActive ? 'Active' : 'Inactive'}
          size='small'
          color={department.isActive ? 'success' : 'default'}
          variant={department.isActive ? 'filled' : 'outlined'}
        />
      ),
    },
    {
      key: 'userCount',
      title: 'Users',
      render: (_, department) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PeopleIcon fontSize='small' color='action' />
          <Typography variant='body2'>{department.userCount || 0}</Typography>
        </Box>
      ),
    },
    {
      key: 'projectCount',
      title: 'Projects',
      render: (_, department) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AssignmentIcon fontSize='small' color='action' />
          <Typography variant='body2'>
            {department.projectCount || 0}
          </Typography>
        </Box>
      ),
    },
    {
      key: 'createdOn',
      title: 'Created',
      sortable: true,
      render: (_, department) =>
        new Date(department.createdOn).toLocaleDateString(),
    },
    {
      key: 'actions',
      title: 'Actions',
      align: 'center',
      render: (_, department) => (
        <Box>
          <IconButton size='small' onClick={e => handleMenuOpen(e, department)}>
            <MoreVertIcon fontSize='small' />
          </IconButton>
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
            Department Management
          </Typography>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant='outlined'
              startIcon={<RefreshIcon />}
              onClick={loadDepartments}
              disabled={state.loading}
            >
              Refresh
            </Button>

            <Button
              variant='contained'
              startIcon={<AddIcon />}
              onClick={handleCreateDepartment}
              disabled
              title='Department creation not supported by backend'
            >
              Add Department
            </Button>
          </Box>
        </Box>

        {/* Error Alert */}
        {state.error && (
          <Alert severity='error' sx={{ mb: 2 }}>
            {state.error}
          </Alert>
        )}

        {/* Data Table */}
        <DataTable
          columns={columns as unknown as TableColumn<Record<string, unknown>>[]}
          data={state.departments as unknown as Record<string, unknown>[]}
          loading={state.loading}
          pagination={state.pagination}
          onPaginationChange={handlePaginationChange}
          searchable
          searchPlaceholder='Search departments...'
          exportable
          exportFileName='departments'
          rowKey='departmentId'
        />

        {/* Context Menu */}
        <Menu
          anchorEl={state.anchorEl}
          open={Boolean(state.anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem
            onClick={() =>
              state.menuDepartment && handleEditDepartment(state.menuDepartment)
            }
            disabled
          >
            <ListItemIcon>
              <EditIcon fontSize='small' />
            </ListItemIcon>
            <ListItemText>Edit (Not Supported)</ListItemText>
          </MenuItem>

          <MenuItem
            onClick={() =>
              state.menuDepartment &&
              handleToggleDepartmentStatus(state.menuDepartment)
            }
            disabled
          >
            <ListItemIcon>
              {state.menuDepartment?.isActive ? (
                <DeactivateIcon fontSize='small' />
              ) : (
                <ActivateIcon fontSize='small' />
              )}
            </ListItemIcon>
            <ListItemText>
              {state.menuDepartment?.isActive ? 'Deactivate' : 'Activate'} (Not
              Supported)
            </ListItemText>
          </MenuItem>

          <MenuItem
            onClick={() =>
              state.menuDepartment &&
              handleDeleteDepartment(state.menuDepartment)
            }
            disabled
            sx={{ color: 'text.disabled' }}
          >
            <ListItemIcon>
              <DeleteIcon fontSize='small' />
            </ListItemIcon>
            <ListItemText>Delete (Not Supported)</ListItemText>
          </MenuItem>
        </Menu>

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

export default DepartmentManagement;
