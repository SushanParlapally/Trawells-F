import React from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Divider,
  Avatar,
  Collapse,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Approval as ApprovalIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  ExpandLess,
  ExpandMore,
  AccountCircle,
  Flight as FlightIcon,
  Assignment as AssignmentIcon,
  AdminPanelSettings as AdminIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../../store';
import { logoutUser } from '../../../store/slices/authSlice';
import type { UserRole } from '../../../types';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path?: string;
  roles: UserRole[];
  children?: NavigationItem[];
}

interface SidebarProps {
  onItemClick?: () => void;
}

const navigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <DashboardIcon />,
    path: '/dashboard',
    roles: ['Admin', 'TravelAdmin', 'Manager', 'Employee'],
  },
  {
    id: 'travel-requests',
    label: 'Travel Requests',
    icon: <FlightIcon />,
    roles: ['Employee', 'Manager', 'TravelAdmin'],
    children: [
      {
        id: 'my-requests',
        label: 'My Requests',
        icon: <AssignmentIcon />,
        path: '/employee/requests',
        roles: ['Employee'],
      },
      {
        id: 'create-request',
        label: 'Create Request',
        icon: <FlightIcon />,
        path: '/employee/requests/create',
        roles: ['Employee'],
      },
      {
        id: 'team-requests',
        label: 'Team Requests',
        icon: <ApprovalIcon />,
        path: '/manager/requests',
        roles: ['Manager'],
      },
      {
        id: 'approval-queue',
        label: 'Approval Queue',
        icon: <ApprovalIcon />,
        path: '/manager/approvals',
        roles: ['Manager'],
      },
      {
        id: 'booking-management',
        label: 'Booking Management',
        icon: <FlightIcon />,
        path: '/travel-admin/bookings',
        roles: ['TravelAdmin'],
      },
      {
        id: 'all-requests',
        label: 'All Requests',
        icon: <AssignmentIcon />,
        path: '/travel-admin/requests',
        roles: ['TravelAdmin'],
      },
    ],
  },
  {
    id: 'administration',
    label: 'Administration',
    icon: <AdminIcon />,
    roles: ['Admin'],
    children: [
      {
        id: 'user-management',
        label: 'User Management',
        icon: <PeopleIcon />,
        path: '/admin/users',
        roles: ['Admin'],
      },
      {
        id: 'department-management',
        label: 'Departments',
        icon: <BusinessIcon />,
        path: '/admin/departments',
        roles: ['Admin'],
      },
      {
        id: 'project-management',
        label: 'Projects',
        icon: <AssignmentIcon />,
        path: '/admin/projects',
        roles: ['Admin'],
      },
      {
        id: 'system-settings',
        label: 'System Settings',
        icon: <SettingsIcon />,
        path: '/admin/settings',
        roles: ['Admin'],
      },
    ],
  },
];

const Sidebar: React.FC<SidebarProps> = ({ onItemClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [expandedItems, setExpandedItems] = React.useState<string[]>([]);

  const userRole = user?.role?.roleName as UserRole;

  const handleItemClick = (item: NavigationItem) => {
    if (item.children && item.children.length > 0) {
      // If item has children, toggle expansion instead of navigating
      handleExpandClick(item.id);
      return;
    }

    let targetPath = item.path;
    if (item.path === '/dashboard') {
      switch (userRole) {
        case 'Employee':
          targetPath = '/employee/dashboard';
          break;
        case 'Manager':
          targetPath = '/manager/dashboard';
          break;
        case 'TravelAdmin':
          targetPath = '/travel-admin/dashboard';
          break;
        case 'Admin':
          targetPath = '/admin/dashboard';
          break;
        default:
          targetPath = '/login';
      }
    }

    // Only navigate if we have a valid path
    if (targetPath) {
      navigate(targetPath);
      onItemClick?.();
    }
  };

  const handleExpandClick = (itemId: string) => {
    setExpandedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      // Force navigation to login even if logout fails
      navigate('/login');
    }
  };

  const isItemActive = (item: NavigationItem): boolean => {
    if (item.path) {
      if (item.path === '/dashboard') {
        const roleDashboards = {
          Employee: '/employee/dashboard',
          Manager: '/manager/dashboard',
          TravelAdmin: '/travel-admin/dashboard',
          Admin: '/admin/dashboard',
        };
        return location.pathname === roleDashboards[userRole];
      }
      return location.pathname === item.path;
    }
    return false;
  };

  const hasAccess = (item: NavigationItem): boolean => {
    return userRole ? item.roles.includes(userRole) : false;
  };

  const renderNavigationItem = (item: NavigationItem, level = 0) => {
    if (!hasAccess(item)) return null;
    const isActive = isItemActive(item);
    const isExpanded = expandedItems.includes(item.id);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <React.Fragment key={item.id}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => handleItemClick(item)}
            selected={isActive}
            sx={{
              pl: 2 + level * 2,
              mx: 1,
              borderRadius: '8px',
              mb: 0.5,
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                backgroundColor: 'rgba(0, 123, 255, 0.08)',
                transform: 'translateX(4px)',
              },
              '&.Mui-selected': {
                backgroundColor: 'primary.main',
                color: 'primary.contrastText',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                  transform: 'translateX(4px)',
                },
                '& .MuiListItemIcon-root': {
                  color: 'primary.contrastText',
                },
                '& .MuiListItemText-primary': {
                  fontWeight: 600,
                },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{
                fontSize: level > 0 ? '0.875rem' : '1rem',
              }}
            />
            {hasChildren && (isExpanded ? <ExpandLess /> : <ExpandMore />)}
          </ListItemButton>
        </ListItem>
        {hasChildren && (
          <Collapse in={isExpanded} timeout='auto' unmountOnExit>
            <List component='div' disablePadding>
              {item.children!.map(child =>
                renderNavigationItem(child, level + 1)
              )}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  if (!user) return null;

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar>
        <Typography variant='h6' noWrap component='div'>
          Travel Desk
        </Typography>
      </Toolbar>
      <Divider />
      {/* User Profile Section */}
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Avatar sx={{ mx: 'auto', mb: 1, bgcolor: 'primary.main' }}>
          <AccountCircle />
        </Avatar>
        <Typography variant='subtitle2' noWrap>
          {user.firstName} {user.lastName}
        </Typography>
        <Typography variant='caption' color='text.secondary' noWrap>
          {user.role?.roleName}
        </Typography>
        <Typography
          variant='caption'
          color='text.secondary'
          display='block'
          noWrap
        >
          {user.department?.departmentName}
        </Typography>
      </Box>
      <Divider />
      {/* Navigation Items */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <List>{navigationItems.map(item => renderNavigationItem(item))}</List>
      </Box>
      <Divider />
      {/* Logout */}
      <List>
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              mx: 1,
              borderRadius: '8px',
              mb: 1,
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                backgroundColor: 'rgba(220, 53, 69, 0.08)',
                color: 'error.main',
                transform: 'translateX(4px)',
                '& .MuiListItemIcon-root': {
                  color: 'error.main',
                },
              },
            }}
          >
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary='Logout' />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );
};

export default Sidebar;
