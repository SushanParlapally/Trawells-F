import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import AuthProvider from './components/auth/AuthProvider';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Lazy load components for code splitting
const LoginPage = lazy(() => import('./components/auth/LoginPage'));
const EmployeeDashboard = lazy(
  () => import('./components/employee/EmployeeDashboard')
);
const TravelRequestPage = lazy(
  () => import('./components/employee/TravelRequestPage')
);
const ManagerDashboard = lazy(
  () => import('./components/manager/ManagerDashboard')
);
const TravelAdminDashboard = lazy(
  () => import('./components/travelAdmin/TravelAdminDashboard')
);
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard'));

// Loading component for suspense fallback
const LoadingFallback = () => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      flexDirection: 'column',
      gap: 2,
    }}
  >
    <CircularProgress size={40} />
    <Box sx={{ color: 'text.secondary' }}>Loading...</Box>
  </Box>
);

function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public Routes */}
          <Route
            path='/login'
            element={
              <ProtectedRoute requireAuth={false}>
                <LoginPage />
              </ProtectedRoute>
            }
          />

          {/* Protected Routes */}
          {/* Employee Routes */}
          <Route
            path='/employee/dashboard'
            element={
              <ProtectedRoute allowedRoles={['Employee']}>
                <EmployeeDashboard />
              </ProtectedRoute>
            }
          />

          {/* Travel Request Form */}
          <Route
            path='/employee/travel-request/new'
            element={
              <ProtectedRoute allowedRoles={['Employee']}>
                <TravelRequestPage />
              </ProtectedRoute>
            }
          />

          {/* Manager Routes */}
          <Route
            path='/manager/dashboard'
            element={
              <ProtectedRoute allowedRoles={['Manager']}>
                <ManagerDashboard />
              </ProtectedRoute>
            }
          />

          {/* Travel Admin Routes */}
          <Route
            path='/travel-admin/dashboard'
            element={
              <ProtectedRoute allowedRoles={['TravelAdmin']}>
                <TravelAdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path='/admin/dashboard'
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Default Route - Redirect to login */}
          <Route path='/' element={<Navigate to='/login' replace />} />

          {/* Catch all route - Redirect to login */}
          <Route path='*' element={<Navigate to='/login' replace />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}

export default App;
