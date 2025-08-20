import React from 'react';
import {
  Box,
  CircularProgress,
  LinearProgress,
  Typography,
  Skeleton,
  Card,
  CardContent,
} from '@mui/material';

export interface LoadingIndicatorProps {
  type?: 'circular' | 'linear' | 'skeleton' | 'card' | 'overlay';
  size?: 'small' | 'medium' | 'large';
  message?: string;
  progress?: number; // For linear progress (0-100)
  rows?: number; // For skeleton type
  fullScreen?: boolean;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  type = 'circular',
  size = 'medium',
  message,
  progress,
  rows = 3,
  fullScreen = false,
}) => {
  const getSizeValue = () => {
    switch (size) {
      case 'small':
        return 24;
      case 'large':
        return 60;
      case 'medium':
      default:
        return 40;
    }
  };

  const renderCircularLoader = () => (
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
      <CircularProgress size={getSizeValue()} />
      {message && (
        <Typography variant='body2' color='text.secondary' textAlign='center'>
          {message}
        </Typography>
      )}
    </Box>
  );

  const renderLinearLoader = () => (
    <Box sx={{ width: '100%', p: 2 }}>
      {message && (
        <Typography variant='body2' color='text.secondary' gutterBottom>
          {message}
        </Typography>
      )}
      <LinearProgress
        variant={progress !== undefined ? 'determinate' : 'indeterminate'}
        value={progress}
        sx={{
          borderRadius: '4px',
          height: size === 'small' ? 4 : size === 'large' ? 8 : 6,
        }}
      />
      {progress !== undefined && (
        <Typography variant='caption' color='text.secondary' sx={{ mt: 1 }}>
          {Math.round(progress)}%
        </Typography>
      )}
    </Box>
  );

  const renderSkeletonLoader = () => (
    <Box sx={{ p: 2 }}>
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton
          key={index}
          variant='text'
          height={size === 'small' ? 20 : size === 'large' ? 32 : 24}
          sx={{ mb: 1 }}
          animation='wave'
        />
      ))}
    </Box>
  );

  const renderCardLoader = () => (
    <Card sx={{ borderRadius: '16px' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Skeleton variant='circular' width={40} height={40} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant='text' width='60%' height={24} />
            <Skeleton variant='text' width='40%' height={20} />
          </Box>
        </Box>
        <Skeleton
          variant='rectangular'
          height={120}
          sx={{ borderRadius: '8px' }}
        />
      </CardContent>
    </Card>
  );

  const renderOverlayLoader = () => (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(2px)',
        zIndex: 1000,
        borderRadius: 'inherit',
      }}
    >
      {renderCircularLoader()}
    </Box>
  );

  const getContent = () => {
    switch (type) {
      case 'linear':
        return renderLinearLoader();
      case 'skeleton':
        return renderSkeletonLoader();
      case 'card':
        return renderCardLoader();
      case 'overlay':
        return renderOverlayLoader();
      case 'circular':
      default:
        return renderCircularLoader();
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
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
        }}
      >
        {renderCircularLoader()}
      </Box>
    );
  }

  return getContent();
};

export default LoadingIndicator;
