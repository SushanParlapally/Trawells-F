import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { travelRequestService } from '../../../services/api/travelRequestService';
import { departmentService } from '../../../services/api/departmentService';
import { projectService } from '../../../services/api/projectService';
import type { TravelRequestDto, Department, Project } from '../../../types';

const validationSchema = yup.object({
  startDate: yup.date().required('Start date is required'),
  endDate: yup
    .date()
    .required('End date is required')
    .min(yup.ref('startDate'), 'End date must be after start date'),
  status: yup.mixed().optional(),
  departments: yup.mixed().optional(),
  projects: yup.mixed().optional(),
});

interface ReportGeneratorProps {
  userRole: string;
  userId?: number;
  managerId?: number;
}

interface FormData {
  startDate: Date;
  endDate: Date;
  status?: string[];
  departments?: number[];
  projects?: number[];
}

const statusOptions = [
  'Pending',
  'Approved',
  'Rejected',
  'Booked',
  'Completed',
  'Returned to Employee',
];

export const ReportGenerator: React.FC<ReportGeneratorProps> = () => {
  const [loading, setLoading] = useState(false);
  const [travelRequests, setTravelRequests] = useState<TravelRequestDto[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      endDate: new Date(),
      status: [],
      departments: [],
      projects: [],
    },
  });

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [departmentsData, projectsData] = await Promise.all([
          departmentService.getAllDepartments(),
          projectService.getProjects(),
        ]);
        setDepartments(departmentsData);
        setProjects(projectsData);
      } catch (err) {
        console.error('Error loading departments and projects:', err);
        setError('Failed to load initial data');
      }
    };

    loadInitialData();
  }, []);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);
    try {
      // Use existing travel request service to get data
      const response = await travelRequestService.getTravelRequests();

      // Filter the data on the frontend based on form criteria
      let filteredRequests = response.requests || [];

      // Apply date filters
      if (data.startDate && data.endDate) {
        filteredRequests = filteredRequests.filter(
          (request: TravelRequestDto) => {
            const requestDate = new Date(request.fromDate);
            return (
              requestDate >= data.startDate! && requestDate <= data.endDate!
            );
          }
        );
      }

      // Apply status filters
      if (data.status && data.status.length > 0) {
        filteredRequests = filteredRequests.filter(
          (request: TravelRequestDto) => data.status!.includes(request.status)
        );
      }

      // Apply department filters
      if (data.departments && data.departments.length > 0) {
        filteredRequests = filteredRequests.filter(
          (request: TravelRequestDto) =>
            data.departments!.includes(request.user.department.departmentId)
        );
      }

      // Apply project filters
      if (data.projects && data.projects.length > 0) {
        filteredRequests = filteredRequests.filter(
          (request: TravelRequestDto) =>
            data.projects!.includes(request.project.projectId)
        );
      }

      setTravelRequests(filteredRequests);
    } catch (err) {
      console.error('Error generating report:', err);
      setError('Failed to generate report. Please try again.');
    }
  };

  const handleExport = async (format: 'csv' | 'txt') => {
    if (travelRequests.length === 0) {
      setError('No data to export. Please generate a report first.');
      return;
    }

    try {
      let content = '';
      let filename = `travel-requests-${new Date().toISOString().split('T')[0]}`;

      if (format === 'csv') {
        // Generate CSV content
        const headers = [
          'Employee',
          'Department',
          'Project',
          'From',
          'To',
          'Status',
          'Reason',
        ];
        const rows = travelRequests.map(request => [
          `${request.user.firstName} ${request.user.lastName}`,
          request.user.department.departmentName,
          request.project.projectName,
          request.fromLocation,
          request.toLocation,
          request.status,
          request.reasonForTravel,
        ]);

        content = [headers, ...rows]
          .map(row => row.map(cell => `"${cell}"`).join(','))
          .join('\n');

        filename += '.csv';
      } else {
        // Create a simple text representation
        content = travelRequests
          .map(
            request =>
              `${request.user.firstName} ${request.user.lastName} - ${request.project.projectName} - ${request.status}`
          )
          .join('\n');

        filename += '.txt';
      }

      // Create download
      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting report:', err);
      setError('Failed to export report. Please try again.');
    }
  };

  const getSummaryStats = () => {
    const totalRequests = travelRequests.length;
    const requestsByStatus = travelRequests.reduce(
      (acc, request) => {
        acc[request.status] = (acc[request.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const requestsByDepartment = travelRequests.reduce(
      (acc, request) => {
        const deptName = request.user.department.departmentName;
        acc[deptName] = (acc[deptName] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      totalRequests,
      requestsByStatus,
      requestsByDepartment,
    };
  };

  const stats = getSummaryStats();

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant='h5' gutterBottom>
        Travel Request Reports
      </Typography>

      <Alert severity='info' sx={{ mb: 2 }}>
        Note: Reports are generated from travel request data. The backend
        currently only supports viewing travel requests.
      </Alert>

      {error && (
        <Alert severity='error' sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant='h6' gutterBottom>
            Report Filters
          </Typography>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <Controller
                    name='startDate'
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        label='Start Date'
                        value={field.value}
                        onChange={field.onChange}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            error: !!errors.startDate,
                            helperText: errors.startDate?.message,
                          },
                        }}
                      />
                    )}
                  />
                </LocalizationProvider>
              </Box>

              <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <Controller
                    name='endDate'
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        label='End Date'
                        value={field.value}
                        onChange={field.onChange}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            error: !!errors.endDate,
                            helperText: errors.endDate?.message,
                          },
                        }}
                      />
                    )}
                  />
                </LocalizationProvider>
              </Box>

              <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
                <Controller
                  name='status'
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Status</InputLabel>
                      <Select
                        multiple
                        value={field.value || []}
                        onChange={field.onChange}
                        renderValue={selected => (
                          <Box
                            sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}
                          >
                            {(selected as string[]).map(value => (
                              <Chip key={value} label={value} size='small' />
                            ))}
                          </Box>
                        )}
                      >
                        {statusOptions.map(status => (
                          <MenuItem key={status} value={status}>
                            {status}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Box>

              <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
                <Controller
                  name='departments'
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Departments</InputLabel>
                      <Select
                        multiple
                        value={field.value || []}
                        onChange={field.onChange}
                        renderValue={selected => (
                          <Box
                            sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}
                          >
                            {(selected as number[]).map(value => {
                              const dept = departments.find(
                                d => d.departmentId === value
                              );
                              return (
                                <Chip
                                  key={value}
                                  label={dept?.departmentName || value}
                                  size='small'
                                />
                              );
                            })}
                          </Box>
                        )}
                      >
                        {departments.map(dept => (
                          <MenuItem
                            key={dept.departmentId}
                            value={dept.departmentId}
                          >
                            {dept.departmentName}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Box>

              <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
                <Controller
                  name='projects'
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Projects</InputLabel>
                      <Select
                        multiple
                        value={field.value || []}
                        onChange={field.onChange}
                        renderValue={selected => (
                          <Box
                            sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}
                          >
                            {(selected as number[]).map(value => {
                              const proj = projects.find(
                                p => p.projectId === value
                              );
                              return (
                                <Chip
                                  key={value}
                                  label={proj?.projectName || value}
                                  size='small'
                                />
                              );
                            })}
                          </Box>
                        )}
                      >
                        {projects.map(proj => (
                          <MenuItem key={proj.projectId} value={proj.projectId}>
                            {proj.projectName}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Box>

              <Box sx={{ flex: '1 1 100%' }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    type='submit'
                    variant='contained'
                    disabled={loading}
                    startIcon={
                      loading ? <CircularProgress size={20} /> : <RefreshIcon />
                    }
                  >
                    {loading ? 'Loading...' : 'Load Travel Requests'}
                  </Button>
                </Box>
              </Box>
            </Box>
          </form>
        </CardContent>
      </Card>

      {travelRequests.length > 0 && (
        <Card>
          <CardContent>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
              }}
            >
              <Typography variant='h6'>Report Results</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant='outlined'
                  size='small'
                  onClick={() => handleExport('csv')}
                  startIcon={<DownloadIcon />}
                >
                  Export CSV
                </Button>
                <Button
                  variant='outlined'
                  size='small'
                  onClick={() => handleExport('txt')}
                  startIcon={<DownloadIcon />}
                >
                  Export Text
                </Button>
              </Box>
            </Box>

            <Divider sx={{ mb: 2 }} />

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              <Box sx={{ flex: '1 1 200px', minWidth: 0 }}>
                <Card variant='outlined'>
                  <CardContent>
                    <Typography variant='h4' color='primary'>
                      {stats.totalRequests}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      Total Requests
                    </Typography>
                  </CardContent>
                </Card>
              </Box>

              <Box sx={{ flex: '1 1 200px', minWidth: 0 }}>
                <Card variant='outlined'>
                  <CardContent>
                    <Typography variant='h4' color='primary'>
                      {Object.keys(stats.requestsByStatus).length}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      Status Types
                    </Typography>
                  </CardContent>
                </Card>
              </Box>

              <Box sx={{ flex: '1 1 200px', minWidth: 0 }}>
                <Card variant='outlined'>
                  <CardContent>
                    <Typography variant='h4' color='primary'>
                      {Object.keys(stats.requestsByDepartment).length}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      Departments
                    </Typography>
                  </CardContent>
                </Card>
              </Box>

              <Box sx={{ flex: '1 1 200px', minWidth: 0 }}>
                <Card variant='outlined'>
                  <CardContent>
                    <Typography variant='h4' color='primary'>
                      {travelRequests.length}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      Records Found
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Box>

            <Typography variant='body2' color='text.secondary' sx={{ mt: 2 }}>
              Report generated on {new Date().toLocaleString()}
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};
