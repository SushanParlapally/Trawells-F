import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, Alert } from '@mui/material';
import { MainLayout } from '../common/Layout';
import {
  TravelRequestForm,
  type TravelRequestFormData,
} from './TravelRequestForm';
import { travelRequestService } from '../../services/api/travelRequestService';
import { useAppSelector } from '../../hooks/redux';
import { selectUser } from '../../store/slices/authSlice';

const TravelRequestPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useAppSelector(selectUser);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (data: TravelRequestFormData) => {
    console.log('TravelRequestPage received form data:', data);

    if (!user) {
      setError('User information not available');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Format data according to backend TravelRequest model
      const travelRequestData = {
        userId: user.userId,
        projectId: data.project.projectId,
        departmentId: data.department.departmentId,
        reasonForTravel: data.reasonForTravel,
        fromDate: new Date(data.fromDate).toISOString(),
        toDate: new Date(data.toDate).toISOString(),
        fromLocation: data.fromLocation,
        toLocation: data.toLocation,
        createdOn: new Date().toISOString(),
        isActive: true,
        // Backend will automatically set:
        // - Status = "Pending"
        // - Comments = null
      };

      console.log('Sending travel request data to backend:', travelRequestData);
      const response =
        await travelRequestService.createTravelRequest(travelRequestData);
      console.log('Travel request created successfully:', response);

      setSuccess(true);

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate('/employee/dashboard');
      }, 2000);
    } catch (err) {
      console.error('Failed to create travel request:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to create travel request'
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <MainLayout title='Travel Request Created'>
        <Box sx={{ p: 3 }}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Alert severity='success' sx={{ mb: 2 }}>
              Travel request created successfully!
            </Alert>
            <Typography variant='body1' color='text.secondary'>
              Redirecting to dashboard...
            </Typography>
          </Paper>
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout title='Create Travel Request'>
      <Box sx={{ p: 3 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant='h4' gutterBottom>
            Create New Travel Request
          </Typography>

          {error && (
            <Alert severity='error' sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TravelRequestForm onSubmit={handleSubmit} loading={loading} />
        </Paper>
      </Box>
    </MainLayout>
  );
};

export default TravelRequestPage;
