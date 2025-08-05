import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Box,
  Button,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Typography,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import type { TravelRequest } from '../../types';

interface TravelRequestFormProps {
  initialData?: Partial<TravelRequest>;
  onSubmit: (data: TravelRequestFormData) => void;
  readonly?: boolean;
  loading?: boolean;
}

export interface TravelRequestFormData {
  reasonForTravel: string;
  project: { projectId: number; projectName: string };
  department: { departmentId: number; departmentName: string };
  fromDate: string;
  toDate: string;
  fromLocation: string;
  toLocation: string;
}

const travelRequestSchema = yup.object({
  reasonForTravel: yup
    .string()
    .min(10, 'Reason must be at least 10 characters')
    .max(500, 'Reason must be less than 500 characters')
    .required('Reason is required'),
  project: yup
    .object({
      projectId: yup.number().required('Project is required'),
      projectName: yup.string().required('Project name is required'),
    })
    .required('Project is required'),
  department: yup
    .object({
      departmentId: yup.number().required('Department is required'),
      departmentName: yup.string().required('Department name is required'),
    })
    .required('Department is required'),
  fromDate: yup.string().required('From date is required'),
  toDate: yup
    .string()
    .required('To date is required')
    .test('is-after-from', 'To date must be after from date', function (value) {
      const { fromDate } = this.parent;
      if (!fromDate || !value) return true;

      const fromDateObj = new Date(fromDate);
      const toDateObj = new Date(value);

      return toDateObj > fromDateObj;
    }),
  fromLocation: yup.string().required('From location is required'),
  toLocation: yup.string().required('To location is required'),
});

export const TravelRequestForm: React.FC<TravelRequestFormProps> = ({
  initialData,
  onSubmit,
  readonly = false,
  loading = false,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [projects, setProjects] = useState<
    Array<{ projectId: number; projectName: string }>
  >([]);
  const [departments, setDepartments] = useState<
    Array<{ departmentId: number; departmentName: string }>
  >([]);
  const [selectedProject, setSelectedProject] = useState<{
    projectId: number;
    projectName: string;
  } | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<{
    departmentId: number;
    departmentName: string;
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      // Mock data - in real app, these would be API calls
      setProjects([
        { projectId: 1, projectName: 'Project Alpha' },
        { projectId: 2, projectName: 'Project Beta' },
        { projectId: 3, projectName: 'Project Gamma' },
      ]);
      setDepartments([
        { departmentId: 1, departmentName: 'Engineering' },
        { departmentId: 2, departmentName: 'Sales' },
        { departmentId: 3, departmentName: 'Marketing' },
        { departmentId: 4, departmentName: 'HR' },
      ]);
    };

    fetchData();
  }, []);

  const {
    handleSubmit,
    trigger,
    register,
    setValue,
    formState: { errors },
  } = useForm<TravelRequestFormData>({
    resolver: yupResolver(travelRequestSchema),
    defaultValues: {
      reasonForTravel: initialData?.reasonForTravel || '',
      project: initialData?.project || { projectId: 0, projectName: '' },
      department: { departmentId: 0, departmentName: '' }, // Default department since it's not in TravelRequest
      fromDate: initialData?.fromDate
        ? new Date(initialData.fromDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      toDate: initialData?.toDate
        ? new Date(initialData.toDate).toISOString().split('T')[0]
        : new Date(Date.now() + 86400000).toISOString().split('T')[0],
      fromLocation: initialData?.fromLocation || '',
      toLocation: initialData?.toLocation || '',
    },
    mode: 'onChange',
  });

  const projectOptions = projects.map(project => ({
    value: JSON.stringify(project),
    label: project.projectName,
  }));

  const departmentOptions = departments.map(department => ({
    value: JSON.stringify(department),
    label: department.departmentName,
  }));

  const handleNext = async () => {
    const fieldsToValidate = getFieldsForStep(activeStep);
    const isStepValid = await trigger(fieldsToValidate);

    if (isStepValid) {
      setActiveStep(prevActiveStep => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1);
  };

  const handleFormSubmit = (data: TravelRequestFormData) => {
    console.log('Form submitted with data:', data);
    onSubmit(data);
  };

  const getFieldsForStep = (step: number): (keyof TravelRequestFormData)[] => {
    switch (step) {
      case 0:
        return ['reasonForTravel', 'project', 'department'];
      case 1:
        return ['fromDate', 'toDate', 'fromLocation', 'toLocation'];
      case 2:
        return [];
      default:
        return [];
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return renderBasicInformation();
      case 1:
        return renderTravelDetails();
      case 2:
        return renderReviewAndSubmit();
      default:
        return null;
    }
  };

  const renderBasicInformation = () => (
    <Box>
      <Box sx={{ mb: 3 }}>
        <TextField
          {...register('reasonForTravel')}
          fullWidth
          multiline
          rows={4}
          label='Reason for Travel'
          required
          placeholder='Please provide a detailed reason for your travel request...'
          disabled={readonly}
          error={!!errors.reasonForTravel}
          helperText={
            errors.reasonForTravel?.message ||
            'Minimum 10 characters, maximum 500 characters'
          }
        />
      </Box>

      <Box
        sx={{
          display: 'flex',
          gap: 2,
          flexDirection: { xs: 'column', md: 'row' },
        }}
      >
        <Box sx={{ flex: 1 }}>
          <FormControl fullWidth error={!!errors.project}>
            <InputLabel>Project</InputLabel>
            <Select
              label='Project'
              disabled={readonly}
              value={selectedProject ? JSON.stringify(selectedProject) : ''}
              onChange={e => {
                const value = e.target.value;
                if (value) {
                  const project = JSON.parse(value);
                  setSelectedProject(project);
                  setValue('project', project);
                } else {
                  setSelectedProject(null);
                  setValue('project', { projectId: 0, projectName: '' });
                }
              }}
            >
              <MenuItem value='' disabled>
                Select a project
              </MenuItem>
              {projectOptions.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {errors.project && (
              <Typography variant='caption' color='error'>
                {errors.project.message}
              </Typography>
            )}
          </FormControl>
        </Box>
        <Box sx={{ flex: 1 }}>
          <FormControl fullWidth error={!!errors.department}>
            <InputLabel>Department</InputLabel>
            <Select
              label='Department'
              disabled={readonly}
              value={
                selectedDepartment ? JSON.stringify(selectedDepartment) : ''
              }
              onChange={e => {
                const value = e.target.value;
                if (value) {
                  const department = JSON.parse(value);
                  setSelectedDepartment(department);
                  setValue('department', department);
                } else {
                  setSelectedDepartment(null);
                  setValue('department', {
                    departmentId: 0,
                    departmentName: '',
                  });
                }
              }}
            >
              <MenuItem value='' disabled>
                Select a department
              </MenuItem>
              {departmentOptions.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {errors.department && (
              <Typography variant='caption' color='error'>
                {errors.department.message}
              </Typography>
            )}
          </FormControl>
        </Box>
      </Box>
    </Box>
  );

  const renderTravelDetails = () => (
    <Box>
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          flexDirection: { xs: 'column', md: 'row' },
          mb: 3,
        }}
      >
        <Box sx={{ flex: 1 }}>
          <TextField
            {...register('fromLocation')}
            fullWidth
            label='From Location'
            required
            placeholder='Enter departure location...'
            disabled={readonly}
            error={!!errors.fromLocation}
            helperText={errors.fromLocation?.message}
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <TextField
            {...register('toLocation')}
            fullWidth
            label='To Location'
            required
            placeholder='Enter destination location...'
            disabled={readonly}
            error={!!errors.toLocation}
            helperText={errors.toLocation?.message}
          />
        </Box>
      </Box>

      <Box
        sx={{
          display: 'flex',
          gap: 2,
          flexDirection: { xs: 'column', md: 'row' },
        }}
      >
        <Box sx={{ flex: 1 }}>
          <TextField
            {...register('fromDate')}
            fullWidth
            label='From Date'
            required
            type='date'
            disabled={readonly}
            error={!!errors.fromDate}
            helperText={errors.fromDate?.message}
            InputLabelProps={{ shrink: true }}
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <TextField
            {...register('toDate')}
            fullWidth
            label='To Date'
            required
            type='date'
            disabled={readonly}
            error={!!errors.toDate}
            helperText={errors.toDate?.message}
            InputLabelProps={{ shrink: true }}
          />
        </Box>
      </Box>
    </Box>
  );

  const renderReviewAndSubmit = () => (
    <Box>
      <Typography variant='h6' gutterBottom>
        Review Your Request
      </Typography>
      <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
        <Typography variant='body2' color='text.secondary'>
          Please review your travel request details before submitting.
        </Typography>
      </Paper>
    </Box>
  );

  const steps = [
    {
      label: 'Basic Information',
      description: 'Provide the reason and select project/department',
    },
    {
      label: 'Travel Details',
      description: 'Enter travel locations and dates',
    },
    {
      label: 'Review & Submit',
      description: 'Review your request and submit',
    },
  ];

  return (
    <Box component='form' onSubmit={handleSubmit(handleFormSubmit)}>
      <Stepper activeStep={activeStep} orientation='vertical'>
        {steps.map((step, index) => (
          <Step key={step.label}>
            <StepLabel>
              <Typography variant='h6'>{step.label}</Typography>
              <Typography variant='body2' color='text.secondary'>
                {step.description}
              </Typography>
            </StepLabel>
            <StepContent>
              <Box sx={{ mb: 2 }}>
                {renderStepContent(index)}
                <Box sx={{ mt: 2 }}>
                  <Button
                    type={index === steps.length - 1 ? 'submit' : 'button'}
                    variant='contained'
                    onClick={
                      index === steps.length - 1 ? undefined : handleNext
                    }
                    disabled={loading}
                    sx={{ mr: 1 }}
                  >
                    {index === steps.length - 1 ? 'Submit Request' : 'Continue'}
                  </Button>
                  <Button
                    type='button'
                    disabled={index === 0}
                    onClick={handleBack}
                    sx={{ mr: 1 }}
                  >
                    Back
                  </Button>
                  {index === steps.length - 1 && (
                    <Button
                      type='button'
                      variant='outlined'
                      onClick={() => {
                        console.log('Test button clicked');
                        const today = new Date();
                        const tomorrow = new Date(today);
                        tomorrow.setDate(tomorrow.getDate() + 1);

                        // Ensure we get valid YYYY-MM-DD format strings
                        const formatDate = (date: Date): string => {
                          const year = date.getFullYear();
                          const month = String(date.getMonth() + 1).padStart(
                            2,
                            '0'
                          );
                          const day = String(date.getDate()).padStart(2, '0');
                          return `${year}-${month}-${day}`;
                        };

                        const formData: TravelRequestFormData = {
                          reasonForTravel: 'Test reason for travel request',
                          project: {
                            projectId: 1,
                            projectName: 'Project Alpha',
                          },
                          department: {
                            departmentId: 1,
                            departmentName: 'Engineering',
                          },
                          fromDate: formatDate(today),
                          toDate: formatDate(tomorrow),
                          fromLocation: 'New York',
                          toLocation: 'Los Angeles',
                        };
                        console.log('Test form data:', formData);
                        onSubmit(formData);
                      }}
                      sx={{ ml: 1 }}
                    >
                      Test Submit
                    </Button>
                  )}
                </Box>
              </Box>
            </StepContent>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
};
