import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  LinearProgress,
  Alert,
  IconButton,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

export interface SessionWarningModalProps {
  open: boolean;
  remainingMinutes: number;
  onExtendSession: () => Promise<boolean>;
  onDismiss: () => void;
  onLogout?: () => void;
}

export const SessionWarningModal: React.FC<SessionWarningModalProps> = ({
  open,
  remainingMinutes,
  onExtendSession,
  onDismiss,
  onLogout,
}) => {
  const [isExtending, setIsExtending] = useState(false);
  const [countdown, setCountdown] = useState(remainingMinutes);
  const [error, setError] = useState<string | null>(null);

  // Update countdown when remainingMinutes changes
  useEffect(() => {
    setCountdown(remainingMinutes);
  }, [remainingMinutes]);

  // Countdown timer
  useEffect(() => {
    if (!open || countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown(prev => {
        const newCount = prev - 1;

        if (newCount <= 0) {
          // Auto-logout when countdown reaches 0
          if (onLogout) {
            onLogout();
          }
        }

        return Math.max(0, newCount);
      });
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [open, countdown, onLogout]);

  const handleExtendSession = async () => {
    setIsExtending(true);
    setError(null);

    try {
      const success = await onExtendSession();

      if (success) {
        onDismiss();
      } else {
        setError('Failed to extend session. Please try again.');
      }
    } catch (err) {
      setError('An error occurred while extending your session.');
      console.error('Session extension error: ', err);
    } finally {
      setIsExtending(false);
    }
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  const progressValue = (countdown / remainingMinutes) * 100;
  const isUrgent = countdown <= 2;

  return (
    <Dialog
      open={open}
      onClose={onDismiss}
      maxWidth='sm'
      fullWidth
      disableEscapeKeyDown
      PaperProps={{
        sx: { borderRadius: 2, boxShadow: 3 },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          backgroundColor: isUrgent ? 'error.light' : 'warning.light',
          color: isUrgent ? 'error.contrastText' : 'warning.contrastText',
        }}
      >
        <WarningIcon />
        <Typography variant='h6' component='span' sx={{ flexGrow: 1 }}>
          Session Expiring Soon
        </Typography>
        <IconButton onClick={onDismiss} size='small' sx={{ color: 'inherit' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant='body1' gutterBottom>
            Your session will expire in{' '}
            <strong style={{ color: isUrgent ? 'red' : 'orange' }}>
              {countdown} minute{countdown !== 1 ? 's' : ''}
            </strong>
            .
          </Typography>

          <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
            You will be automatically logged out when the timer reaches zero.
            Click "Stay Logged In" to extend your session.
          </Typography>

          <Box sx={{ mb: 2 }}>
            <LinearProgress
              variant='determinate'
              value={progressValue}
              color={isUrgent ? 'error' : 'warning'}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>

          {error && (
            <Alert severity='error' sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button
          onClick={handleLogout}
          variant='outlined'
          color='error'
          disabled={isExtending}
        >
          Logout Now
        </Button>

        <Button
          onClick={handleExtendSession}
          variant='contained'
          color='primary'
          disabled={isExtending}
          startIcon={isExtending ? undefined : <RefreshIcon />}
          sx={{ minWidth: 140 }}
        >
          {isExtending ? 'Extending...' : 'Stay Logged In'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SessionWarningModal;
