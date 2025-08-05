import React, { useState } from 'react';
import Sidebar from '../Navigation/Sidebar';
import Breadcrumbs from '../Navigation/Breadcrumbs';
import LoadingIndicator from './LoadingIndicator';
import ErrorBoundary from './ErrorBoundary';

import PerformanceMonitor from '../PerformanceMonitor';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  IconButton,
  useTheme,
  useMediaQuery,
  CssBaseline,
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store';

const DRAWER_WIDTH = 280;

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
  loading?: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  title = 'Travel Desk Management System',
  loading = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(true);

  const { user } = useSelector((state: RootState) => state.auth);

  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setDesktopOpen(!desktopOpen);
    }
  };

  const handleMobileDrawerClose = () => {
    setMobileOpen(false);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      {/* App Bar */}
      <AppBar
        position='fixed'
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          ...(desktopOpen &&
            !isMobile && {
              marginLeft: DRAWER_WIDTH,
              width: `calc(100% - ${DRAWER_WIDTH}px)`,
              transition: theme.transitions.create(['width', 'margin'], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            }),
        }}
      >
        <Toolbar>
          <IconButton
            color='inherit'
            aria-label='toggle drawer'
            onClick={handleDrawerToggle}
            edge='start'
            sx={{ mr: 2 }}
          >
            {(isMobile ? mobileOpen : desktopOpen) ? (
              <ChevronLeftIcon />
            ) : (
              <MenuIcon />
            )}
          </IconButton>

          <Typography variant='h6' noWrap component='div' sx={{ flexGrow: 1 }}>
            {title}
          </Typography>

          {user && (
            <>
              <Typography variant='body2' sx={{ ml: 2 }}>
                Welcome, {user.firstName} {user.lastName}
              </Typography>
            </>
          )}
        </Toolbar>
      </AppBar>

      {/* Navigation Drawer */}
      <Box
        component='nav'
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant='temporary'
          open={mobileOpen}
          onClose={handleMobileDrawerClose}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
            },
          }}
        >
          <Sidebar onItemClick={handleMobileDrawerClose} />
        </Drawer>

        {/* Desktop drawer */}
        <Drawer
          variant='persistent'
          open={desktopOpen}
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
            },
          }}
        >
          <Sidebar />
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component='main'
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${desktopOpen ? DRAWER_WIDTH : 0}px)` },
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar />
        {/* Spacer for fixed app bar */}

        {/* Breadcrumbs */}
        <Box sx={{ mb: 2 }}>
          <Breadcrumbs />
        </Box>

        {/* Loading indicator */}
        {loading && <LoadingIndicator />}

        {/* Page content wrapped in error boundary */}
        <ErrorBoundary>{children}</ErrorBoundary>
      </Box>

      {/* Performance Monitor (development only) */}
      <PerformanceMonitor />
    </Box>
  );
};

export default MainLayout;
