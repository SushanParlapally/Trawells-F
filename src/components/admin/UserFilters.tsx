import React, { useState } from 'react';
import {
  Box,
  Paper,
  Button,
  Collapse,
  IconButton,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
} from '@mui/material';
import {
  FilterList as FilterIcon,
  Clear as ClearIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import type { Role, Department } from '../../types';
import type { SxProps, Theme } from '@mui/material';

interface UserFiltersType {
  search?: string;
  roleId?: number;
  departmentId?: number;
  isActive?: boolean;
}

interface UserFiltersProps {
  roles: Role[];
  departments: Department[];
  filters: UserFiltersType;
  onFiltersChange: (filters: UserFiltersType) => void;
  sx?: SxProps<Theme>;
}

export const UserFilters: React.FC<UserFiltersProps> = ({
  roles,
  departments,
  filters,
  onFiltersChange,
  sx,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [localFilters, setLocalFilters] = useState<UserFiltersType>(filters);

  const handleFilterChange = (
    key: keyof UserFiltersType,
    value: string | number | boolean | undefined
  ) => {
    const newFilters = {
      ...localFilters,
      [key]: value,
    };
    setLocalFilters(newFilters);
  };

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters: UserFiltersType = {};
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(
      value => value !== undefined && value !== null && value !== ''
    ).length;
  };

  const getFilterChips = () => {
    const chips: React.ReactNode[] = [];

    if (filters.search) {
      chips.push(
        <Chip
          key='search'
          label={`Search: ${filters.search}`}
          size='small'
          onDelete={() => handleFilterChange('search', '')}
          color='primary'
          variant='outlined'
        />
      );
    }

    if (filters.roleId) {
      const role = roles.find(r => r.roleId === filters.roleId);
      chips.push(
        <Chip
          key='role'
          label={`Role: ${role?.roleName || 'Unknown'}`}
          size='small'
          onDelete={() => handleFilterChange('roleId', undefined)}
          color='primary'
          variant='outlined'
        />
      );
    }

    if (filters.departmentId) {
      const department = departments.find(
        d => d.departmentId === filters.departmentId
      );
      chips.push(
        <Chip
          key='department'
          label={`Department: ${department?.departmentName || 'Unknown'}`}
          size='small'
          onDelete={() => handleFilterChange('departmentId', undefined)}
          color='primary'
          variant='outlined'
        />
      );
    }

    if (filters.isActive !== undefined) {
      chips.push(
        <Chip
          key='status'
          label={`Status: ${filters.isActive ? 'Active' : 'Inactive'}`}
          size='small'
          onDelete={() => handleFilterChange('isActive', undefined)}
          color='primary'
          variant='outlined'
        />
      );
    }

    return chips;
  };

  const activeFiltersCount = getActiveFiltersCount();
  const filterChips = getFilterChips();

  return (
    <Paper sx={{ p: 2, ...sx }}>
      {/* Filter Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterIcon color='action' />
          <Typography variant='subtitle2'>
            Filters
            {activeFiltersCount > 0 && (
              <Chip
                label={activeFiltersCount}
                size='small'
                color='primary'
                sx={{ ml: 1, height: 20, fontSize: '0.75rem' }}
              />
            )}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {activeFiltersCount > 0 && (
            <Button
              size='small'
              startIcon={<ClearIcon />}
              onClick={handleClearFilters}
              color='secondary'
            >
              Clear All
            </Button>
          )}
          <IconButton
            size='small'
            onClick={() => setExpanded(!expanded)}
            aria-label={expanded ? 'Collapse filters' : 'Expand filters'}
          >
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
      </Box>

      {/* Active Filter Chips */}
      {filterChips.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {filterChips}
        </Box>
      )}

      {/* Filter Controls */}
      <Collapse in={expanded}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: '1fr 1fr',
              md: '1fr 1fr 1fr 1fr',
            },
            gap: 2,
          }}
        >
          {/* Search */}
          <TextField
            fullWidth
            size='small'
            label='Search'
            placeholder='Search by name or email'
            value={localFilters.search || ''}
            onChange={e => handleFilterChange('search', e.target.value)}
          />

          {/* Role Filter */}
          <FormControl fullWidth size='small'>
            <InputLabel>Role</InputLabel>
            <Select
              value={localFilters.roleId || ''}
              label='Role'
              onChange={e =>
                handleFilterChange('roleId', e.target.value || undefined)
              }
            >
              <MenuItem value=''>All Roles</MenuItem>
              {roles.map(role => (
                <MenuItem key={role.roleId} value={role.roleId}>
                  {role.roleName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Department Filter */}
          <FormControl fullWidth size='small'>
            <InputLabel>Department</InputLabel>
            <Select
              value={localFilters.departmentId || ''}
              label='Department'
              onChange={e =>
                handleFilterChange('departmentId', e.target.value || undefined)
              }
            >
              <MenuItem value=''>All Departments</MenuItem>
              {departments.map(department => (
                <MenuItem
                  key={department.departmentId}
                  value={department.departmentId}
                >
                  {department.departmentName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Status Filter */}
          <FormControl fullWidth size='small'>
            <InputLabel>Status</InputLabel>
            <Select
              value={
                localFilters.isActive !== undefined
                  ? localFilters.isActive
                    ? 'active'
                    : 'inactive'
                  : ''
              }
              label='Status'
              onChange={e => {
                const value = e.target.value as string;
                if (!value) {
                  handleFilterChange('isActive', undefined);
                } else {
                  handleFilterChange('isActive', value === 'active');
                }
              }}
            >
              <MenuItem value=''>All Status</MenuItem>
              <MenuItem value='active'>Active</MenuItem>
              <MenuItem value='inactive'>Inactive</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Filter Actions */}
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            justifyContent: 'flex-end',
            mt: 2,
          }}
        >
          <Button
            variant='outlined'
            size='small'
            onClick={handleClearFilters}
            disabled={activeFiltersCount === 0}
          >
            Clear
          </Button>
          <Button variant='contained' size='small' onClick={handleApplyFilters}>
            Apply Filters
          </Button>
        </Box>
      </Collapse>
    </Paper>
  );
};

export default UserFilters;
