import React, { useState } from 'react';
import { Box, Paper, Typography, Tabs, Tab } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import BusinessIcon from '@mui/icons-material/Business';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SecurityIcon from '@mui/icons-material/Security';
import { MainLayout } from '../common/Layout';
import UserManagement from './UserManagement';
import DepartmentManagement from './DepartmentManagement';
import ProjectManagement from './ProjectManagement';
import RoleManagement from './RoleManagement';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`admin-management-tabpanel-${index}`}
      aria-labelledby={`admin-management-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `admin-management-tab-${index}`,
    'aria-controls': `admin-management-tabpanel-${index}`,
  };
}

export const AdminManagement: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <MainLayout title='System Management'>
      <Box sx={{ width: '100%' }}>
        <Paper sx={{ width: '100%' }}>
          {/* Header */}
          <Box sx={{ p: 3, pb: 0 }}>
            <Typography variant='h4' component='h1' gutterBottom>
              System Management
            </Typography>
            <Typography variant='body1' color='text.secondary' sx={{ mb: 2 }}>
              Manage users, departments, projects, and roles from this
              centralized administration panel.
            </Typography>
          </Box>

          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label='admin management tabs'
              variant='scrollable'
              scrollButtons='auto'
            >
              <Tab
                icon={<PeopleIcon />}
                label='Users'
                {...a11yProps(0)}
                sx={{ minHeight: 72 }}
              />
              <Tab
                icon={<BusinessIcon />}
                label='Departments'
                {...a11yProps(1)}
                sx={{ minHeight: 72 }}
              />
              <Tab
                icon={<AssignmentIcon />}
                label='Projects'
                {...a11yProps(2)}
                sx={{ minHeight: 72 }}
              />
              <Tab
                icon={<SecurityIcon />}
                label='Roles & Permissions'
                {...a11yProps(3)}
                sx={{ minHeight: 72 }}
              />
            </Tabs>
          </Box>

          {/* Tab Panels */}
          <TabPanel value={tabValue} index={0}>
            <UserManagement />
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <DepartmentManagement />
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <ProjectManagement />
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <RoleManagement />
          </TabPanel>
        </Paper>
      </Box>
    </MainLayout>
  );
};

export default AdminManagement;
