import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Box,
  TextField,
  Button,
  FormControlLabel,
  Switch,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from '@mui/material';
import type {
  Project,
  Department,
  ProjectCreateData,
  ProjectUpdateData,
} from '../../types';
import { AuthService } from '../../services/auth/authService';

interface ProjectFormProps {
  project?: Project | null;
  departments: Department[];
  onSubmit: (data: ProjectCreateData | ProjectUpdateData) => void;
  onCancel: () => void;
}

interface ProjectFormData {
  projectName: string;
  description: string;
  departmentId: number;
  isActive: boolean;
}

const projectSchema = yup.object({
  projectName: yup
    .string()
    .required('Project name is required')
    .min(2, 'Project name must be at least 2 characters')
    .max(100, 'Project name must not exceed 100 characters'),
  description: yup
    .string()
    .required('Description is required')
    .max(500, 'Description must not exceed 500 characters'),
  departmentId: yup
    .number()
    .required('Department is required')
    .positive('Please select a valid department'),
  isActive: yup.boolean().required(),
});

export const ProjectForm: React.FC<ProjectFormProps> = ({
  project,
  departments,
  onSubmit,
  onCancel,
}) => {
  const [submitError, setSubmitError] = useState<string>('');

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ProjectFormData>({
    resolver: yupResolver(projectSchema),
    defaultValues: {
      projectName: '',
      description: '',
      departmentId: 0,
      isActive: true,
    },
  });

  useEffect(() => {
    if (project) {
      reset({
        projectName: project.projectName,
        description: '',
        departmentId: 0,
        isActive: project.isActive,
      });
    } else {
      reset({
        projectName: '',
        description: '',
        departmentId: 0,
        isActive: true,
      });
    }
  }, [project, reset]);

  const onFormSubmit = async (data: ProjectFormData) => {
    try {
      setSubmitError('');

      const currentUserId = AuthService.getUserId();
      if (!currentUserId) {
        throw new Error('User not authenticated');
      }

      const submitData = project
        ? ({ ...data, projectId: project.projectId } as ProjectUpdateData)
        : ({ ...data, createdBy: currentUserId } as ProjectCreateData);

      await onSubmit(submitData);
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'An error occurred while saving the project'
      );
    }
  };

  return (
    <Box component='form' onSubmit={handleSubmit(onFormSubmit)} sx={{ mt: 2 }}>
      {submitError && (
        <Alert severity='error' sx={{ mb: 2 }}>
          {submitError}
        </Alert>
      )}

      <Controller
        name='projectName'
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label='Project Name'
            fullWidth
            margin='normal'
            error={!!errors.projectName}
            helperText={errors.projectName?.message}
            disabled={isSubmitting}
          />
        )}
      />

      <Controller
        name='description'
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label='Description'
            fullWidth
            multiline
            rows={3}
            margin='normal'
            error={!!errors.description}
            helperText={errors.description?.message}
            disabled={isSubmitting}
          />
        )}
      />

      <Controller
        name='departmentId'
        control={control}
        render={({ field }) => (
          <FormControl fullWidth margin='normal' error={!!errors.departmentId}>
            <InputLabel>Department</InputLabel>
            <Select {...field} label='Department' disabled={isSubmitting}>
              <MenuItem value={0} disabled>
                Select a department
              </MenuItem>
              {departments
                .filter(dept => dept.isActive)
                .map(dept => (
                  <MenuItem key={dept.departmentId} value={dept.departmentId}>
                    {dept.departmentName}
                  </MenuItem>
                ))}
            </Select>
            {errors.departmentId && (
              <FormHelperText>{errors.departmentId.message}</FormHelperText>
            )}
          </FormControl>
        )}
      />

      <Controller
        name='isActive'
        control={control}
        render={({ field }) => (
          <FormControlLabel
            control={
              <Switch
                checked={field.value}
                onChange={field.onChange}
                disabled={isSubmitting}
              />
            }
            label='Active'
            sx={{ mt: 2, mb: 2 }}
          />
        )}
      />

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
        <Button
          type='button'
          variant='outlined'
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type='submit' variant='contained' disabled={isSubmitting}>
          {isSubmitting
            ? 'Saving...'
            : project
              ? 'Update Project'
              : 'Create Project'}
        </Button>
      </Box>
    </Box>
  );
};

export default ProjectForm;
