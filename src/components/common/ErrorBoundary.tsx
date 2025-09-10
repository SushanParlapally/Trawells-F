import React, { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Alert, Container } from '@mui/material';
import { Refresh as RefreshIcon, Home as HomeIcon } from '@mui/icons-material';
import { captureComponentError } from '../../services/monitoring';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  eventId?: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Capture error with monitoring service
    captureComponentError(error, errorInfo);

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    this.setState({ error, errorInfo });

    // Log error in development
    if (import.meta.env.DEV) {
      console.error('Error Boundary caught an error: ', error, errorInfo);
    }
  }

  private handleRefresh = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleResetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  override render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <Container maxWidth='md' sx={{ mt: 4 }}>
          <Box
            display='flex'
            flexDirection='column'
            alignItems='center'
            justifyContent='center'
            minHeight='60vh'
            textAlign='center'
          >
            <Alert severity='error' sx={{ mb: 3, width: '100%' }}>
              <Typography variant='h6' gutterBottom>
                Oops! Something went wrong
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                We&apos;re sorry for the inconvenience. The error has been
                reported and we&apos;re working to fix it.
              </Typography>
            </Alert>

            {import.meta.env.DEV && this.state.error && (
              <Box
                sx={{
                  mb: 3,
                  p: 2,
                  bgcolor: 'grey.100',
                  borderRadius: 1,
                  width: '100%',
                }}
              >
                <Typography variant='subtitle2' gutterBottom>
                  Error Details (Development Mode):
                </Typography>
                <Typography
                  variant='body2'
                  component='pre'
                  sx={{ fontSize: '0.75rem', overflow: 'auto' }}
                >
                  {this.state.error.toString()}
                </Typography>
                {this.state.errorInfo && (
                  <Typography
                    variant='body2'
                    component='pre'
                    sx={{ fontSize: '0.75rem', overflow: 'auto', mt: 1 }}
                  >
                    {this.state.errorInfo.componentStack}
                  </Typography>
                )}
              </Box>
            )}

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant='contained'
                startIcon={<RefreshIcon />}
                onClick={this.handleRefresh}
              >
                Refresh Page
              </Button>
              <Button
                variant='outlined'
                startIcon={<HomeIcon />}
                onClick={this.handleGoHome}
              >
                Go Home
              </Button>
              {import.meta.env.DEV && (
                <Button variant='outlined' onClick={this.handleResetError}>
                  Reset Error (Dev)
                </Button>
              )}
            </Box>
          </Box>
        </Container>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for functional components
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  fallback?: ReactNode,
  onError?: (error: Error, errorInfo: ErrorInfo) => void
) {
  const WrappedComponentWithBoundary = class extends Component<P, State> {
    static displayName = `withErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

    constructor(props: P) {
      super(props);
      this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
      return { hasError: true, error };
    }

    override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
      captureComponentError(error, errorInfo);
      if (onError) {
        onError(error, errorInfo);
      }
      this.setState({ error, errorInfo });
    }

    override render() {
      if (this.state.hasError) {
        return (
          fallback || <ErrorBoundary fallback={fallback} onError={onError} />
        );
      }
      return <WrappedComponent {...this.props} />;
    }
  };
  return WrappedComponentWithBoundary;
}

// Hook for functional components
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  const handleError = React.useCallback((error: Error) => {
    setError(error);
    captureComponentError(error, { componentStack: '' });
  }, []);

  return { error, handleError };
}

export default ErrorBoundary;
