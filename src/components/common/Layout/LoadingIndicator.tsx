import React from 'react';
import {
  Box,
  CircularProgress,
  LinearProgress,
  Typography,
  Backdrop,
  Paper,
} from '@mui/material';

interface LoadingIndicatorProps {
  type?: 'circular' | 'linear' | 'overlay' | 'inline';
  message?: string;
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary' | 'inherit';
  fullScreen?: boolean;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  type = 'circular',
  message = 'Loading...',
  size = 'medium',
  color = 'primary',
  fullScreen = false,
}) => {
  const getCircularSize = () => {
    switch (size) {
      case 'small':
        return 24;
      case 'large':
        return 60;
      default:
        return 40;
    }
  };

  const renderCircularProgress = () => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        p: 3,
      }}
    >
      <CircularProgress color={color} size={getCircularSize()} thickness={4} />
      {message && (
        <Typography variant='body2' color='text.secondary' textAlign='center'>
          {message}
        </Typography>
      )}
    </Box>
  );

  const renderLinearProgress = () => (
    <Box sx={{ width: '100%', mb: 2 }}>
      {message && (
        <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
          {message}
        </Typography>
      )}
      <LinearProgress color={color} />
    </Box>
  );

  const renderInlineProgress = () => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1 }}>
      <CircularProgress color={color} size={20} thickness={4} />
      {message && (
        <Typography variant='body2' color='text.secondary'>
          {message}
        </Typography>
      )}
    </Box>
  );

  const renderOverlayProgress = () => (
    <Backdrop
      sx={{
        color: '#fff',
        zIndex: theme => theme.zIndex.drawer + 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      }}
      open={true}
    >
      <Paper
        elevation={3}
        sx={{ p: 4, borderRadius: 2, backgroundColor: 'background.paper' }}
      >
        {renderCircularProgress()}
      </Paper>
    </Backdrop>
  );

  const getContent = () => {
    switch (type) {
      case 'linear':
        return renderLinearProgress();
      case 'overlay':
        return renderOverlayProgress();
      case 'inline':
        return renderInlineProgress();
      default:
        return renderCircularProgress();
    }
  };

  if (fullScreen) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          zIndex: 9999,
        }}
      >
        {renderCircularProgress()}
      </Box>
    );
  }

  return getContent();
};

export default LoadingIndicator;

// Specialized loading components for common use cases
export const PageLoader: React.FC<{ message?: string }> = ({
  message = 'Loading page...',
}) => <LoadingIndicator type='circular' message={message} size='large' />;

export const ButtonLoader: React.FC = () => (
  <CircularProgress size={20} color='inherit' />
);

export const TableLoader: React.FC = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
    <CircularProgress />
  </Box>
);

export const FormLoader: React.FC<{ message?: string }> = ({
  message = 'Saving...',
}) => <LoadingIndicator type='linear' message={message} />;

export const OverlayLoader: React.FC<{ message?: string }> = ({
  message = 'Processing...',
}) => <LoadingIndicator type='overlay' message={message} />;
