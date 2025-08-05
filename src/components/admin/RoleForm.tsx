import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  FormControlLabel,
  Switch,
  Typography,
  Stack,
} from '@mui/material';
import type { Role } from '../../types';

interface RoleFormData {
  roleName: string;
  isActive: boolean;
}

interface RoleFormProps {
  role?: Role | null;
  onSubmit: (roleData: RoleFormData) => void;
  onCancel: () => void;
}

const RoleForm: React.FC<RoleFormProps> = ({ role, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<RoleFormData>({
    roleName: '',
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (role) {
      setFormData({
        roleName: role.roleName || '',
        isActive: role.isActive ?? true,
      });
    }
  }, [role]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData['roleName'].trim()) {
      newErrors['roleName'] = 'Role name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    field: keyof RoleFormData,
    value: string | boolean
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <Box component='form' onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Stack spacing={3}>
        {/* Basic Information */}
        <Typography variant='h6' gutterBottom>
          Role Information
        </Typography>

        <TextField
          fullWidth
          label='Role Name'
          value={formData['roleName']}
          onChange={e => handleInputChange('roleName', e.target.value)}
          error={!!errors['roleName']}
          helperText={errors['roleName']}
          required
        />

        {/* Note about backend limitations */}
        <Box sx={{ p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
          <Typography variant='body2' color='info.contrastText'>
            <strong>Note:</strong> The backend only supports basic role
            management. Role descriptions and permissions are managed at the
            system level.
          </Typography>
        </Box>

        {/* Status */}
        <FormControlLabel
          control={
            <Switch
              checked={formData.isActive}
              onChange={e => handleInputChange('isActive', e.target.checked)}
              color='primary'
            />
          }
          label='Active Role'
        />

        {/* Form Actions */}
        <Box
          sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}
        >
          <Button variant='outlined' onClick={onCancel}>
            Cancel
          </Button>
          <Button type='submit' variant='contained'>
            {role ? 'Update Role' : 'Create Role'}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
};

export default RoleForm;
