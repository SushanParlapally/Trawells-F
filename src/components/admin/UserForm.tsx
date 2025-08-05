import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  FormControlLabel,
  Switch,
  Typography,
  Stack,
  Alert,
} from '@mui/material';
import type { User, Role, Department } from '../../types';
import { userService } from '../../services/api/userService';

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

interface UserFormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  mobileNum?: string;
  address?: string;
  roleId?: string;
  departmentId?: string;
}

interface UserFormProps {
  user?: User | null;
  roles: Role[];
  departments: Department[];
  onSubmit: (userData: UserFormData) => void;
  onCancel: () => void;
}

const UserForm: React.FC<UserFormProps> = ({
  user,
  roles,
  departments,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<UserFormData>({
    firstName: '',
    lastName: '',
    email: '',
    mobileNum: '',
    address: '',
    roleId: '',
    departmentId: '',
    managerId: '',
    isActive: true,
  });

  const [errors, setErrors] = useState<UserFormErrors>({});
  const [loading, setLoading] = useState(false);
  const [managers, setManagers] = useState<User[]>([]);

  // Fetch managers when component mounts
  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const managersData = await userService.getManagers();
        setManagers(managersData);
      } catch (error) {
        console.error('Failed to fetch managers:', error);
      }
    };

    fetchManagers();
  }, []);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        mobileNum: user.mobileNum || '',
        address: user.address || '',
        roleId: user.roleId || '',
        departmentId: user.departmentId || '',
        managerId: user.managerId || '',
        isActive: user.isActive,
      });
    }
  }, [user]);

  const validateForm = (): boolean => {
    const newErrors: UserFormErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.mobileNum.trim()) {
      newErrors.mobileNum = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(formData.mobileNum.replace(/\D/g, ''))) {
      newErrors.mobileNum = 'Please enter a valid 10-digit mobile number';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.roleId) {
      newErrors.roleId = 'Role is required';
    }

    if (!formData.departmentId) {
      newErrors.departmentId = 'Department is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    field: keyof UserFormData,
    value: string | number | boolean
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field as keyof UserFormErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component='form' onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Stack spacing={3}>
        {user && (
          <Alert severity='info' sx={{ mb: 2 }}>
            Note: When editing a user, only First Name, Last Name, Address, and
            Password can be updated due to backend limitations.
          </Alert>
        )}

        {/* Personal Information */}
        <Typography variant='h6' gutterBottom>
          Personal Information
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            gap: 2,
          }}
        >
          <TextField
            fullWidth
            label='First Name'
            value={formData.firstName}
            onChange={e => handleInputChange('firstName', e.target.value)}
            error={!!errors.firstName}
            helperText={errors.firstName}
            required
          />

          <TextField
            fullWidth
            label='Last Name'
            value={formData.lastName}
            onChange={e => handleInputChange('lastName', e.target.value)}
            error={!!errors.lastName}
            helperText={errors.lastName}
          />

          <TextField
            fullWidth
            label='Email'
            type='email'
            value={formData.email}
            onChange={e => handleInputChange('email', e.target.value)}
            error={!!errors.email}
            helperText={errors.email}
            required
            disabled={!!user} // Disable when editing (backend doesn't support email updates)
          />

          <TextField
            fullWidth
            label='Mobile Number'
            value={formData.mobileNum}
            onChange={e => handleInputChange('mobileNum', e.target.value)}
            error={!!errors.mobileNum}
            helperText={errors.mobileNum}
            required
            disabled={!!user} // Disable when editing (backend doesn't support mobile updates)
          />
        </Box>

        <TextField
          fullWidth
          label='Address'
          multiline
          rows={3}
          value={formData.address}
          onChange={e => handleInputChange('address', e.target.value)}
          error={!!errors.address}
          helperText={errors.address}
          required
        />

        {/* Password field - only show when editing */}
        {user && (
          <TextField
            fullWidth
            label='New Password (Optional)'
            type='password'
            value={formData.password || ''}
            onChange={e => handleInputChange('password', e.target.value)}
            helperText='Leave blank to keep current password'
          />
        )}

        {/* Role and Department */}
        <Typography variant='h6' gutterBottom sx={{ mt: 2 }}>
          Role and Department
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            gap: 2,
          }}
        >
          <FormControl fullWidth error={!!errors.roleId} required>
            <InputLabel>Role</InputLabel>
            <Select
              value={formData.roleId}
              label='Role'
              onChange={e => handleInputChange('roleId', e.target.value)}
              disabled={!!user} // Disable when editing (backend doesn't support role updates)
            >
              {roles.map(role => (
                <MenuItem key={role.roleId} value={role.roleId}>
                  {role.roleName}
                </MenuItem>
              ))}
            </Select>
            {errors.roleId && (
              <Typography
                variant='caption'
                color='error'
                sx={{ mt: 0.5, ml: 1.5 }}
              >
                {errors.roleId}
              </Typography>
            )}
          </FormControl>

          <FormControl fullWidth error={!!errors.departmentId} required>
            <InputLabel>Department</InputLabel>
            <Select
              value={formData.departmentId}
              label='Department'
              onChange={e => handleInputChange('departmentId', e.target.value)}
              disabled={!!user} // Disable when editing (backend doesn't support department updates)
            >
              {departments.map(department => (
                <MenuItem
                  key={department.departmentId}
                  value={department.departmentId}
                >
                  {department.departmentName}
                </MenuItem>
              ))}
            </Select>
            {errors.departmentId && (
              <Typography
                variant='caption'
                color='error'
                sx={{ mt: 0.5, ml: 1.5 }}
              >
                {errors.departmentId}
              </Typography>
            )}
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Manager (Optional)</InputLabel>
            <Select
              value={formData.managerId || ''}
              label='Manager (Optional)'
              onChange={e => handleInputChange('managerId', e.target.value)}
              disabled={!!user} // Disable when editing (backend doesn't support manager updates)
            >
              <MenuItem value=''>No Manager</MenuItem>
              {managers.map(manager => (
                <MenuItem key={manager.userId} value={manager.userId}>
                  {manager.firstName} {manager.lastName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControlLabel
            control={
              <Switch
                checked={formData.isActive}
                onChange={e => handleInputChange('isActive', e.target.checked)}
                color='primary'
              />
            }
            label='Active User'
            sx={{ alignSelf: 'center' }}
          />
        </Box>

        {/* Form Actions */}
        <Box
          sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}
        >
          <Button variant='outlined' onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type='submit' variant='contained' disabled={loading}>
            {loading ? 'Saving...' : user ? 'Update User' : 'Create User'}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
};

export default UserForm;
