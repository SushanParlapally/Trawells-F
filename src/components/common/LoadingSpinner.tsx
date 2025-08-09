import React from 'react';
import { CircularProgress, Box, Typography } from '@mui/material';

interface LoadingSpinnerProps {
  message?: string;
  size?: number;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading...',
  size = 40,
}) => {
  return (
    <Box
      display='flex'
      flexDirection='column'
      alignItems='center'
      justifyContent='center'
      minHeight='200px'
      gap={2}
    >
      <CircularProgress size={size} />
      <Typography variant='body2' color='textSecondary'>
        {message}
      </Typography>
      <Typography variant='caption' color='textSecondary'>
        ⚡ Waking up server... This may take 30 seconds on first load
      </Typography>
    </Box>
  );
};
