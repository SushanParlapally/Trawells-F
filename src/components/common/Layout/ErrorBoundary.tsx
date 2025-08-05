import React, { Component, type ReactNode } from 'react';
import { Box, Button, Paper, Typography, Collapse, Alert } from '@mui/material';
import {
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  BugReport as BugReportIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import type { ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Call the onError callback if provided
    this.props.onError?.(error, errorInfo);

    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught an error: ', error, errorInfo);
    }
    // In production, you might want to send this to an error reporting service
    // Example: Sentry.captureException(error, { contexts: { react: errorInfo } });
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  toggleDetails = () => {
    this.setState(prevState => ({
      showDetails: !prevState.showDetails,
    }));
  };

  override render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
            p: 3,
          }}
        >
          <Paper
            elevation={3}
            sx={{ p: 4, maxWidth: 600, width: '100%', textAlign: 'center' }}
          >
            <ErrorIcon color='error' sx={{ fontSize: 64, mb: 2 }} />
            <Typography variant='h5' gutterBottom color='error'>
              Oops! Something went wrong
            </Typography>

            <Typography variant='body1' color='text.secondary' sx={{ mb: 3 }}>
              We're sorry, but something unexpected happened. Please try
              refreshing the page or contact support if the problem persists.
            </Typography>

            <Box
              sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 3 }}
            >
              <Button
                variant='contained'
                startIcon={<RefreshIcon />}
                onClick={this.handleRetry}
                color='primary'
              >
                Try Again
              </Button>
              <Button variant='outlined' onClick={this.handleReload}>
                Reload Page
              </Button>
            </Box>

            {/* Error Details (Development/Debug) */}
            {(import.meta.env.DEV || this.state.showDetails) && (
              <>
                <Button
                  variant='text'
                  size='small'
                  startIcon={<BugReportIcon />}
                  endIcon={
                    this.state.showDetails ? (
                      <ExpandLessIcon />
                    ) : (
                      <ExpandMoreIcon />
                    )
                  }
                  onClick={this.toggleDetails}
                  sx={{ mb: 2 }}
                >
                  {this.state.showDetails ? 'Hide' : 'Show'} Error Details
                </Button>

                <Collapse in={this.state.showDetails}>
                  <Alert severity='error' sx={{ mb: 2 }}>
                    <Typography variant='body2' component='div'>
                      <strong>Error:</strong> {this.state.error?.message}
                    </Typography>
                    {this.state.error?.stack && (
                      <Typography
                        variant='body2'
                        component='pre'
                        sx={{
                          mt: 1,
                          fontSize: '0.75rem',
                          whiteSpace: 'pre-wrap',
                          overflow: 'auto',
                          maxHeight: 200,
                        }}
                      >
                        {this.state.error.stack}
                      </Typography>
                    )}
                  </Alert>

                  {this.state.errorInfo && (
                    <Alert severity='info'>
                      <Typography variant='body2' component='div'>
                        <strong>Component Stack:</strong>
                      </Typography>
                      <Typography
                        variant='body2'
                        component='pre'
                        sx={{
                          mt: 1,
                          fontSize: '0.75rem',
                          whiteSpace: 'pre-wrap',
                          overflow: 'auto',
                          maxHeight: 200,
                        }}
                      >
                        {this.state.errorInfo.componentStack}
                      </Typography>
                    </Alert>
                  )}
                </Collapse>
              </>
            )}
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

// HOC to wrap components with error boundary
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode,
  onError?: (error: Error, errorInfo: ErrorInfo) => void
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback} onError={onError}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
};

// Hook for error handling
export const useErrorHandler = () => {
  const [error, setError] = React.useState<Error | null>(null);

  const handleError = React.useCallback((error: Error) => {
    setError(error);
    console.error('Error caught by useErrorHandler:', error);
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  return { error, handleError, clearError };
};
