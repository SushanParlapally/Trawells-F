import React from 'react';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Collapse,
  IconButton,
  Typography,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

export interface ErrorDisplayProps {
  error: string | Error | null;
  severity?: 'error' | 'warning' | 'info' | 'success';
  title?: string;
  onClose?: () => void;
  onRetry?: () => void;
  showDetails?: boolean;
  dismissible?: boolean;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  severity = 'error',
  title,
  onClose,
  onRetry,
  showDetails = false,
  dismissible = true,
}) => {
  const [expanded, setExpanded] = React.useState(false);

  if (!error) return null;

  const errorMessage = typeof error === 'string' ? error : error.message;
  const errorStack =
    typeof error === 'object' && error.stack ? error.stack : null;

  const getTitle = () => {
    if (title) return title;

    switch (severity) {
      case 'error':
        return 'Error';
      case 'warning':
        return 'Warning';
      case 'info':
        return 'Information';
      case 'success':
        return 'Success';
      default:
        return 'Notification';
    }
  };

  return (
    <Alert
      severity={severity}
      sx={{
        borderRadius: '8px',
        mb: 2,
        '& .MuiAlert-message': {
          width: '100%',
        },
      }}
      action={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {onRetry && (
            <IconButton
              color='inherit'
              size='small'
              onClick={onRetry}
              title='Retry'
            >
              <RefreshIcon fontSize='small' />
            </IconButton>
          )}
          {showDetails && errorStack && (
            <IconButton
              color='inherit'
              size='small'
              onClick={() => setExpanded(!expanded)}
              title='Show details'
              sx={{
                transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease-in-out',
              }}
            >
              <ExpandMoreIcon fontSize='small' />
            </IconButton>
          )}
          {dismissible && onClose && (
            <IconButton
              color='inherit'
              size='small'
              onClick={onClose}
              title='Dismiss'
            >
              <CloseIcon fontSize='small' />
            </IconButton>
          )}
        </Box>
      }
    >
      <AlertTitle sx={{ fontWeight: 600 }}>{getTitle()}</AlertTitle>
      <Typography
        variant='body2'
        sx={{ mb: showDetails && errorStack ? 1 : 0 }}
      >
        {errorMessage}
      </Typography>

      {showDetails && errorStack && (
        <Collapse in={expanded}>
          <Box
            sx={{
              mt: 2,
              p: 2,
              backgroundColor: 'rgba(0, 0, 0, 0.05)',
              borderRadius: '4px',
              border: '1px solid rgba(0, 0, 0, 0.1)',
            }}
          >
            <Typography
              variant='caption'
              component='pre'
              sx={{
                fontFamily: 'monospace',
                fontSize: '0.75rem',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                color: 'text.secondary',
              }}
            >
              {errorStack}
            </Typography>
          </Box>
        </Collapse>
      )}

      {onRetry && (
        <Box sx={{ mt: 2 }}>
          <Button
            size='small'
            variant='outlined'
            startIcon={<RefreshIcon />}
            onClick={onRetry}
            sx={{
              borderRadius: '6px',
              textTransform: 'none',
              fontWeight: 500,
            }}
          >
            Try Again
          </Button>
        </Box>
      )}
    </Alert>
  );
};

export default ErrorDisplay;
