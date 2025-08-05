import React from 'react';
import {
  Breadcrumbs as MuiBreadcrumbs,
  Link,
  Typography,
  Box,
} from '@mui/material';
import { Home as HomeIcon } from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store';
import type { UserRole } from '../../../types';

interface BreadcrumbItem {
  label: string;
  path?: string;
  icon?: React.ReactNode;
}

const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const userRole = user?.role?.roleName as UserRole;

  const getBreadcrumbsFromPath = (): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    // Always start with Home/Dashboard
    const dashboardPaths = {
      Employee: '/employee/dashboard',
      Manager: '/manager/dashboard',
      TravelAdmin: '/travel-admin/dashboard',
      Admin: '/admin/dashboard',
    };

    breadcrumbs.push({
      label: 'Dashboard',
      path: userRole ? dashboardPaths[userRole] : '/login',
      icon: <HomeIcon sx={{ mr: 0.5, fontSize: 16 }} />,
    });

    // Handle specific routes
    if (pathSegments.length === 0 || location.pathname === '/') {
      return breadcrumbs;
    }

    // Route-specific breadcrumb mapping
    const routeMap: Record<string, BreadcrumbItem[]> = {
      // Employee routes
      '/employee/dashboard': [],
      '/employee/requests': [{ label: 'My Requests' }],
      '/employee/requests/create': [
        { label: 'My Requests', path: '/employee/requests' },
        { label: 'Create Request' },
      ],
      '/employee/requests/edit': [
        { label: 'My Requests', path: '/employee/requests' },
        { label: 'Edit Request' },
      ],

      // Manager routes
      '/manager/dashboard': [],
      '/manager/requests': [{ label: 'Team Requests' }],
      '/manager/approvals': [{ label: 'Approval Queue' }],

      // Travel Admin routes
      '/travel-admin/dashboard': [],
      '/travel-admin/bookings': [{ label: 'Booking Management' }],
      '/travel-admin/requests': [{ label: 'All Requests' }],

      // Admin routes
      '/admin/dashboard': [],
      '/admin/users': [
        { label: 'Administration', path: '/admin' },
        { label: 'User Management' },
      ],
      '/admin/users/create': [
        { label: 'Administration', path: '/admin' },
        { label: 'User Management', path: '/admin/users' },
        { label: 'Create User' },
      ],
      '/admin/users/edit': [
        { label: 'Administration', path: '/admin' },
        { label: 'User Management', path: '/admin/users' },
        { label: 'Edit User' },
      ],
      '/admin/departments': [
        { label: 'Administration', path: '/admin' },
        { label: 'Departments' },
      ],
      '/admin/departments/create': [
        { label: 'Administration', path: '/admin' },
        { label: 'Departments', path: '/admin/departments' },
        { label: 'Create Department' },
      ],
      '/admin/projects': [
        { label: 'Administration', path: '/admin' },
        { label: 'Projects' },
      ],
      '/admin/projects/create': [
        { label: 'Administration', path: '/admin' },
        { label: 'Projects', path: '/admin/projects' },
        { label: 'Create Project' },
      ],
      '/admin/settings': [
        { label: 'Administration', path: '/admin' },
        { label: 'System Settings' },
      ],
    };

    // Check for exact match first
    if (routeMap[location.pathname]) {
      const routeBreadcrumbs = routeMap[location.pathname];
      if (routeBreadcrumbs) {
        breadcrumbs.push(...routeBreadcrumbs);
      }
      return breadcrumbs;
    }

    // Handle dynamic routes (with IDs)
    const pathWithoutId = pathSegments.slice(0, -1).join('/');
    const lastSegment = pathSegments[pathSegments.length - 1];

    // Check if last segment is a number (ID)
    if (lastSegment && /^\d+$/.test(lastSegment)) {
      const baseRoute = `/${pathWithoutId}`;

      if (routeMap[baseRoute]) {
        const baseRouteBreadcrumbs = routeMap[baseRoute];
        if (baseRouteBreadcrumbs) {
          breadcrumbs.push(...baseRouteBreadcrumbs);
        }

        // Add specific item breadcrumb based on route
        if (baseRoute.includes('/requests')) {
          breadcrumbs.push({ label: `Request #${lastSegment}` });
        } else if (baseRoute.includes('/users')) {
          breadcrumbs.push({ label: `User #${lastSegment}` });
        } else if (baseRoute.includes('/departments')) {
          breadcrumbs.push({ label: `Department #${lastSegment}` });
        } else if (baseRoute.includes('/projects')) {
          breadcrumbs.push({ label: `Project #${lastSegment}` });
        }
      }
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbsFromPath();

  const handleBreadcrumbClick = (path?: string) => {
    if (path) {
      navigate(path);
    }
  };

  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <Box sx={{ mb: 2 }}>
      <MuiBreadcrumbs
        aria-label='breadcrumb'
        separator='›'
        sx={{
          '& .MuiBreadcrumbs-separator': {
            color: 'text.secondary',
          },
        }}
      >
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;

          if (isLast) {
            return (
              <Typography
                key={index}
                color='text.primary'
                variant='body2'
                sx={{ display: 'flex', alignItems: 'center' }}
              >
                {item.icon}
                {item.label}
              </Typography>
            );
          }

          return (
            <Link
              key={index}
              color='inherit'
              href='#'
              onClick={e => {
                e.preventDefault();
                if (item.path) {
                  handleBreadcrumbClick(item.path);
                }
              }}
              sx={{
                display: 'flex',
                alignItems: 'center',
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </MuiBreadcrumbs>
    </Box>
  );
};

export default Breadcrumbs;
