import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  Assignment as ProjectIcon,
  Settings as SettingsIcon,
  Assessment as ReportIcon,
} from '@mui/icons-material';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'info';
  onClick: () => void;
}

interface QuickActionsProps {
  onCreateUser?: () => void;
  onCreateDepartment?: () => void;
  onCreateProject?: () => void;
  onViewReports?: () => void;
  onSystemSettings?: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({
  onCreateUser,
  onCreateDepartment,
  onCreateProject,
  onViewReports,
  onSystemSettings,
}) => {
  const primaryActions: QuickAction[] = [
    {
      id: 'create-user',
      title: 'Create User',
      description: 'Add a new user to the system',
      icon: <AddIcon />,
      color: 'primary',
      onClick: onCreateUser || (() => {}),
    },
    {
      id: 'manage-users',
      title: 'Manage Users',
      description: 'View and edit user accounts',
      icon: <PeopleIcon />,
      color: 'info',
      onClick: onCreateUser || (() => {}),
    },
    {
      id: 'create-department',
      title: 'Create Department',
      description: 'Add a new department',
      icon: <BusinessIcon />,
      color: 'secondary',
      onClick: onCreateDepartment || (() => {}),
    },
    {
      id: 'create-project',
      title: 'Create Project',
      description: 'Add a new project',
      icon: <ProjectIcon />,
      color: 'success',
      onClick: onCreateProject || (() => {}),
    },
  ];

  const secondaryActions: QuickAction[] = [
    {
      id: 'view-reports',
      title: 'View Reports',
      description: 'Generate system reports',
      icon: <ReportIcon />,
      color: 'warning',
      onClick: onViewReports || (() => {}),
    },
    {
      id: 'system-settings',
      title: 'System Settings',
      description: 'Configure system settings',
      icon: <SettingsIcon />,
      color: 'info',
      onClick: onSystemSettings || (() => {}),
    },
  ];

  return (
    <Card>
      <CardContent>
        <Typography variant='h6' gutterBottom>
          Quick Actions
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            gap: 2,
            mb: 3,
          }}
        >
          {primaryActions.map(action => (
            <Tooltip key={action.id} title={action.description}>
              <Button
                variant='outlined'
                color={action.color}
                startIcon={action.icon}
                onClick={action.onClick}
                fullWidth
                sx={{ justifyContent: 'flex-start', p: 2 }}
              >
                <Box sx={{ textAlign: 'left' }}>
                  <Typography variant='subtitle2'>{action.title}</Typography>
                  <Typography variant='caption' color='text.secondary'>
                    {action.description}
                  </Typography>
                </Box>
              </Button>
            </Tooltip>
          ))}
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant='subtitle1' gutterBottom>
          System Actions
        </Typography>

        <Stack direction='row' spacing={1} flexWrap='wrap'>
          {secondaryActions.map(action => (
            <Tooltip key={action.id} title={action.description}>
              <Button
                variant='text'
                color={action.color}
                startIcon={action.icon}
                onClick={action.onClick}
                size='small'
              >
                {action.title}
              </Button>
            </Tooltip>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
