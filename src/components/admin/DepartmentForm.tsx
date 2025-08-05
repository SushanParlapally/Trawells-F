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
} from '@mui/material';
import type {
  Department,
  DepartmentCreateRequest,
  DepartmentUpdateRequest,
} from '../../types';

interface DepartmentFormProps {
  department?: Department | null;
  onSubmit: (data: DepartmentCreateRequest | DepartmentUpdateRequest) => void;
  onCancel: () => void;
}

interface DepartmentFormData {
  departmentName: string;
  isActive: boolean;
}

const departmentSchema = yup.object({
  departmentName: yup
    .string()
    .required('Department name is required')
    .min(2, 'Department name must be at least 2 characters')
    .max(50, 'Department name must not exceed 50 characters'),
  isActive: yup.boolean().required(),
});

export const DepartmentForm: React.FC<DepartmentFormProps> = ({
  department,
  onSubmit,
  onCancel,
}) => {
  const [submitError, setSubmitError] = useState<string>('');

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<DepartmentFormData>({
    resolver: yupResolver(departmentSchema),
    defaultValues: {
      departmentName: '',
      isActive: true,
    },
  });

  useEffect(() => {
    if (department) {
      reset({
        departmentName: department.departmentName,
        isActive: department.isActive,
      });
    } else {
      reset({
        departmentName: '',
        isActive: true,
      });
    }
  }, [department, reset]);

  const onFormSubmit = async (data: DepartmentFormData) => {
    try {
      setSubmitError('');

      const submitData = department
        ? (data as DepartmentUpdateRequest)
        : ({
            ...data,
            createdBy: 1, // TODO: Get from current user
          } as DepartmentCreateRequest);

      await onSubmit(submitData);
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'An error occurred while saving the department'
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
        name='departmentName'
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label='Department Name'
            fullWidth
            margin='normal'
            error={!!errors.departmentName}
            helperText={errors.departmentName?.message}
            disabled={isSubmitting}
          />
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
            : department
              ? 'Update Department'
              : 'Create Department'}
        </Button>
      </Box>
    </Box>
  );
};

export default DepartmentForm;
