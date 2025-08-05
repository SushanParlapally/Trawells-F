import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
} from '@mui/material';
import {
  People as PeopleIcon,
  Business as DepartmentIcon,
} from '@mui/icons-material';

import type { User, Department, Role } from '../../types';

interface UserStatisticsProps {
  users: User[];
  departments: Department[];
  roles: Role[];
}

const UserStatistics: React.FC<UserStatisticsProps> = ({
  users,
  departments,
  roles,
}) => {
  // Calculate statistics from actual data
  const totalUsers = users.length;
  const activeUsers = users.filter(user => user.isActive).length;
  const inactiveUsers = totalUsers - activeUsers;

  // Calculate users by role
  const usersByRole = roles.reduce(
    (acc, role) => {
      acc[role.roleName] = users.filter(
        user => user.roleId === role.roleId
      ).length;
      return acc;
    },
    {} as Record<string, number>
  );

  // Calculate users by department
  const usersByDepartment = departments.reduce(
    (acc, dept) => {
      acc[dept.departmentName] = users.filter(
        user => user.departmentId === dept.departmentId
      ).length;
      return acc;
    },
    {} as Record<string, number>
  );

  // Create top departments array
  const topDepartments = departments
    .map(dept => ({
      name: dept.departmentName,
      userCount: users.filter(user => user.departmentId === dept.departmentId)
        .length,
      percentage:
        (users.filter(user => user.departmentId === dept.departmentId).length /
          totalUsers) *
        100,
    }))
    .sort((a, b) => b.userCount - a.userCount)
    .slice(0, 5);

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
        gap: 3,
      }}
    >
      {/* Overview Cards */}
      <Card>
        <CardContent>
          <Typography variant='h6' gutterBottom>
            User Overview
          </Typography>

          <Stack spacing={3}>
            <Box>
              <Box
                sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}
              >
                <PeopleIcon color='primary' />
                <Typography variant='h4' color='primary'>
                  {totalUsers.toLocaleString()}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Total Users
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip
                  label={`${activeUsers} Active`}
                  color='success'
                  size='small'
                />
                <Chip
                  label={`${inactiveUsers} Inactive`}
                  color='default'
                  size='small'
                />
              </Box>
            </Box>

            <Box>
              <Box
                sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}
              >
                <DepartmentIcon color='info' />
                <Typography variant='h5' color='info.main'>
                  {departments.length}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Departments
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant='body2' color='text.secondary'>
                  {roles.length} roles configured
                </Typography>
              </Box>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Users by Role */}
      <Card>
        <CardContent>
          <Typography variant='h6' gutterBottom>
            Users by Role
          </Typography>

          <Stack spacing={2}>
            {Object.entries(usersByRole).map(([role, count]) => {
              const percentage =
                totalUsers > 0 ? (count / totalUsers) * 100 : 0;
              return (
                <Box key={role}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mb: 0.5,
                    }}
                  >
                    <Typography variant='body2'>{role}</Typography>
                    <Typography variant='body2' color='text.secondary'>
                      {count} ({percentage.toFixed(1)}%)
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant='determinate'
                    value={percentage}
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </Box>
              );
            })}
          </Stack>
        </CardContent>
      </Card>

      {/* Top Departments */}
      <Card sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
        <CardContent>
          <Typography variant='h6' gutterBottom>
            Users by Department
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 2,
            }}
          >
            {Object.entries(usersByDepartment).map(
              ([departmentName, count]) => {
                const percentage =
                  totalUsers > 0 ? (count / totalUsers) * 100 : 0;
                return (
                  <Box key={departmentName}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        mb: 0.5,
                      }}
                    >
                      <Typography variant='body2'>{departmentName}</Typography>
                      <Typography variant='body2' color='text.secondary'>
                        {count}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant='determinate'
                      value={percentage}
                      sx={{ height: 4, borderRadius: 2 }}
                    />
                  </Box>
                );
              }
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Top Departments List */}
      <Card sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
        <CardContent>
          <Typography variant='h6' gutterBottom>
            Top Departments by User Count
          </Typography>

          <List disablePadding>
            {topDepartments.map((department, index) => (
              <ListItem key={department.name} sx={{ px: 0 }}>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <DepartmentIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={department.name}
                  secondary={`${department.userCount} users (${department.percentage.toFixed(
                    1
                  )}%)`}
                />
                <Chip
                  label={`#${index + 1}`}
                  size='small'
                  color={index === 0 ? 'primary' : 'default'}
                />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </Box>
  );
};

export default UserStatistics;
