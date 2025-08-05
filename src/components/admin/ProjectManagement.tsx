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
  Alert,
  Snackbar,
  Checkbox,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  Close as DeactivateIcon,
  CheckCircle as ActivateIcon,
} from '@mui/icons-material';
import { projectService } from '../../services/api/projectService';
import { departmentService } from '../../services/api/departmentService';
import { DataTable } from '../common/Tables/DataTable';
import { ProjectForm } from './ProjectForm';
import type {
  Project,
  Department,
  TableColumn,
  PaginationConfig,
  SortConfig,
  ProjectCreateData,
  ProjectUpdateData,
} from '../../types';

interface ProjectManagementState {
  projects: Project[];
  departments: Department[];
  loading: boolean;
  error: string | null;
  selectedProject: Project | null;
  showProjectForm: boolean;
  pagination: PaginationConfig;
  sortConfig: SortConfig | null;
  selectedProjects: number[];
  anchorEl: HTMLElement | null;
  menuProject: Project | null;
  departmentFilter: number | '';
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
}

export const ProjectManagement: React.FC = () => {
  const [state, setState] = useState<ProjectManagementState>({
    projects: [],
    departments: [],
    loading: false,
    error: null,
    selectedProject: null,
    showProjectForm: false,
    pagination: { page: 1, pageSize: 20, total: 0 },
    sortConfig: null,
    selectedProjects: [],
    anchorEl: null,
    menuProject: null,
    departmentFilter: '',
  });

  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success',
  });

  const loadProjects = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Backend doesn't support filtering/pagination yet
      const response = await projectService.getProjects();

      setState(prev => ({
        ...prev,
        projects: response,
        pagination: {
          ...prev.pagination,
          total: response.length,
        },
        loading: false,
      }));
    } catch (error) {
      console.error('Failed to load projects:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to load projects',
        loading: false,
      }));
    }
  }, []);

  const loadDepartments = useCallback(async () => {
    try {
      const response = await departmentService.getAll({
        page: 1,
        pageSize: 100,
      });
      setState(prev => ({
        ...prev,
        departments: response,
      }));
    } catch (error) {
      console.error('Failed to load departments:', error);
    }
  }, []);

  useEffect(() => {
    loadProjects();
    loadDepartments();
  }, [loadProjects, loadDepartments]);

  const handleCreateProject = () => {
    setState(prev => ({
      ...prev,
      selectedProject: null,
      showProjectForm: true,
    }));
  };

  const handleEditProject = (project: Project) => {
    setState(prev => ({
      ...prev,
      selectedProject: project,
      showProjectForm: true,
      anchorEl: null,
      menuProject: null,
    }));
  };

  const handleToggleProjectStatus = async () => {
    try {
      // Backend doesn't support project status toggle
      setSnackbar({
        open: true,
        message: 'Project status toggle is not supported by the backend',
        severity: 'warning',
      });
    } catch (error) {
      console.error('Failed to toggle project status:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update project status',
        severity: 'error',
      });
    }

    setState(prev => ({ ...prev, anchorEl: null, menuProject: null }));
  };

  const handleDeleteProject = async (project: Project) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${project.projectName}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await projectService.delete(project.projectId);

      setSnackbar({
        open: true,
        message: 'Project deleted successfully',
        severity: 'success',
      });

      await loadProjects();
    } catch (error) {
      console.error('Failed to delete project:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete project',
        severity: 'error',
      });
    }

    setState(prev => ({ ...prev, anchorEl: null, menuProject: null }));
  };

  const handleProjectFormSubmit = async (
    projectData: ProjectCreateData | ProjectUpdateData
  ) => {
    try {
      if (state.selectedProject) {
        await projectService.update(
          state.selectedProject.projectId,
          projectData as ProjectUpdateData
        );
        setSnackbar({
          open: true,
          message: 'Project updated successfully',
          severity: 'success',
        });
      } else {
        await projectService.create(projectData as ProjectCreateData);
        setSnackbar({
          open: true,
          message: 'Project created successfully',
          severity: 'success',
        });
      }

      setState(prev => ({
        ...prev,
        showProjectForm: false,
        selectedProject: null,
      }));
      await loadProjects();
    } catch (error) {
      console.error('Failed to save project:', error);
      setSnackbar({
        open: true,
        message: `Failed to ${state.selectedProject ? 'update' : 'create'} project`,
        severity: 'error',
      });
    }
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
        ? { key: sortConfig.key, direction: sortConfig.direction }
        : null,
    }));
  };

  const handleSelectProject = (projectId: number, selected: boolean) => {
    setState(prev => ({
      ...prev,
      selectedProjects: selected
        ? [...prev.selectedProjects, projectId]
        : prev.selectedProjects.filter(id => id !== projectId),
    }));
  };

  const handleSelectAllProjects = (selected: boolean) => {
    setState(prev => ({
      ...prev,
      selectedProjects: selected ? prev.projects.map(p => p.projectId) : [],
    }));
  };

  const handleBulkActivate = async () => {
    setSnackbar({
      open: true,
      message: 'Bulk activate is not supported by the backend',
      severity: 'warning',
    });
    setState(prev => ({ ...prev, selectedProjects: [] }));
  };

  const handleBulkDeactivate = async () => {
    setSnackbar({
      open: true,
      message: 'Bulk deactivate is not supported by the backend',
      severity: 'warning',
    });
    setState(prev => ({ ...prev, selectedProjects: [] }));
  };

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    project: Project
  ) => {
    setState(prev => ({
      ...prev,
      anchorEl: event.currentTarget,
      menuProject: project,
    }));
  };

  const handleMenuClose = () => {
    setState(prev => ({ ...prev, anchorEl: null, menuProject: null }));
  };

  const handleDepartmentFilterChange = (
    event: SelectChangeEvent<number | ''>
  ) => {
    const value = event.target.value;
    setState(prev => ({
      ...prev,
      departmentFilter: value === '' ? '' : Number(value),
      pagination: { ...prev.pagination, page: 1 },
    }));
  };

  const columns: TableColumn<Project>[] = [
    {
      key: 'select',
      title: (
        <Checkbox
          checked={
            state.selectedProjects.length === state.projects.length &&
            state.projects.length > 0
          }
          indeterminate={
            state.selectedProjects.length > 0 &&
            state.selectedProjects.length < state.projects.length
          }
          onChange={e => handleSelectAllProjects(e.target.checked)}
        />
      ),
      width: 50,
      render: (_, project) => (
        <Checkbox
          checked={state.selectedProjects.includes(project.projectId)}
          onChange={e =>
            handleSelectProject(project.projectId, e.target.checked)
          }
        />
      ),
    },
    {
      key: 'projectName',
      title: 'Project Name',
      sortable: true,
      render: (_, project) => (
        <Box>
          <Typography variant='body2' fontWeight='medium'>
            {project.projectName}
          </Typography>
        </Box>
      ),
    },
    {
      key: 'department',
      title: 'Department',
      sortable: true,
      render: () => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BusinessIcon fontSize='small' color='action' />
          <Typography variant='body2'>N/A</Typography>
        </Box>
      ),
    },
    {
      key: 'isActive',
      title: 'Status',
      sortable: true,
      render: (_, project) => (
        <Chip
          label={project.isActive ? 'Active' : 'Inactive'}
          size='small'
          color={project.isActive ? 'success' : 'default'}
          variant={project.isActive ? 'filled' : 'outlined'}
        />
      ),
    },
    {
      key: 'userCount',
      title: 'Users',
      render: () => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PeopleIcon fontSize='small' color='action' />
          <Typography variant='body2'>N/A</Typography>
        </Box>
      ),
    },
    {
      key: 'createdOn',
      title: 'Created',
      sortable: true,
      render: (_, project) => new Date(project.createdOn).toLocaleDateString(),
    },
    {
      key: 'actions',
      title: 'Actions',
      align: 'center',
      render: (_, project) => (
        <Box>
          <IconButton size='small' onClick={e => handleMenuOpen(e, project)}>
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
            Project Management
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {/* Department Filter */}
            <FormControl size='small' sx={{ minWidth: 150 }}>
              <InputLabel>Department</InputLabel>
              <Select
                value={state.departmentFilter}
                label='Department'
                onChange={handleDepartmentFilterChange}
              >
                <MenuItem value=''>All Departments</MenuItem>
                {state.departments.map(dept => (
                  <MenuItem key={dept.departmentId} value={dept.departmentId}>
                    {dept.departmentName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {state.selectedProjects.length > 0 && (
              <>
                <Button
                  variant='outlined'
                  startIcon={<ActivateIcon />}
                  onClick={handleBulkActivate}
                  size='small'
                >
                  Activate ({state.selectedProjects.length})
                </Button>

                <Button
                  variant='outlined'
                  startIcon={<DeactivateIcon />}
                  onClick={handleBulkDeactivate}
                  size='small'
                >
                  Deactivate ({state.selectedProjects.length})
                </Button>
              </>
            )}

            <Button
              variant='outlined'
              startIcon={<RefreshIcon />}
              onClick={loadProjects}
              disabled={state.loading}
            >
              Refresh
            </Button>

            <Button
              variant='contained'
              startIcon={<AddIcon />}
              onClick={handleCreateProject}
            >
              Add Project
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
          data={state.projects as unknown as Record<string, unknown>[]}
          loading={state.loading}
          pagination={state.pagination}
          onPaginationChange={handlePaginationChange}
          onSort={handleSort}
          searchable
          searchPlaceholder='Search projects...'
          exportable
          exportFileName='projects'
          rowKey='projectId'
        />

        {/* Project Form Dialog */}
        <Dialog
          open={state.showProjectForm}
          onClose={() =>
            setState(prev => ({
              ...prev,
              showProjectForm: false,
              selectedProject: null,
            }))
          }
          maxWidth='sm'
          fullWidth
        >
          <DialogTitle>
            {state.selectedProject ? 'Edit Project' : 'Create New Project'}
          </DialogTitle>

          <DialogContent>
            <ProjectForm
              project={state.selectedProject}
              departments={state.departments}
              onSubmit={handleProjectFormSubmit}
              onCancel={() =>
                setState(prev => ({
                  ...prev,
                  showProjectForm: false,
                  selectedProject: null,
                }))
              }
            />
          </DialogContent>
        </Dialog>

        {/* Context Menu */}
        <Menu
          anchorEl={state.anchorEl}
          open={Boolean(state.anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem
            onClick={() =>
              state.menuProject && handleEditProject(state.menuProject)
            }
          >
            <ListItemIcon>
              <EditIcon fontSize='small' />
            </ListItemIcon>
            <ListItemText>Edit</ListItemText>
          </MenuItem>

          <MenuItem
            onClick={() => state.menuProject && handleToggleProjectStatus()}
          >
            <ListItemIcon>
              {state.menuProject?.isActive ? (
                <DeactivateIcon fontSize='small' />
              ) : (
                <ActivateIcon fontSize='small' />
              )}
            </ListItemIcon>
            <ListItemText>
              {state.menuProject?.isActive ? 'Deactivate' : 'Activate'}
            </ListItemText>
          </MenuItem>

          <MenuItem
            onClick={() =>
              state.menuProject && handleDeleteProject(state.menuProject)
            }
            sx={{ color: 'error.main' }}
          >
            <ListItemIcon>
              <DeleteIcon fontSize='small' color='error' />
            </ListItemIcon>
            <ListItemText>Delete</ListItemText>
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

export default ProjectManagement;
