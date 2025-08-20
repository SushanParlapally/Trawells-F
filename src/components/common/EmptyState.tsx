import React from 'react';
import { Box, Typography, Button, Paper, useTheme, alpha } from '@mui/material';
import {
  Inbox as InboxIcon,
  Search as SearchIcon,
  Error as ErrorIcon,
  CloudOff as OfflineIcon,
  Add as AddIcon,
} from '@mui/icons-material';

export interface EmptyStateProps {
  type?: 'empty' | 'search' | 'error' | 'offline' | 'loading';
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'contained' | 'outlined' | 'text';
  };
  size?: 'small' | 'medium' | 'large';
}

const EmptyState: React.FC<EmptyStateProps> = ({
  type = 'empty',
  title,
  description,
  icon,
  action,
  size = 'medium',
}) => {
  const theme = useTheme();

  const getDefaultContent = () => {
    switch (type) {
      case 'search':
        return {
          icon: <SearchIcon />,
          title: 'No results found',
          description: 'Try adjusting your search criteria or filters.',
        };
      case 'error':
        return {
          icon: <ErrorIcon />,
          title: 'Something went wrong',
          description:
            'We encountered an error while loading the data. Please try again.',
        };
      case 'offline':
        return {
          icon: <OfflineIcon />,
          title: "You're offline",
          description: 'Please check your internet connection and try again.',
        };
      case 'loading':
        return {
          icon: <InboxIcon />,
          title: 'Loading...',
          description: 'Please wait while we fetch your data.',
        };
      case 'empty':
      default:
        return {
          icon: <InboxIcon />,
          title: 'No data available',
          description: "There's nothing to show here yet.",
        };
    }
  };

  const defaultContent = getDefaultContent();
  const displayIcon = icon || defaultContent.icon;
  const displayTitle = title || defaultContent.title;
  const displayDescription = description || defaultContent.description;

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          padding: theme.spacing(3),
          iconSize: 48,
          titleVariant: 'h6' as const,
          descriptionVariant: 'body2' as const,
        };
      case 'large':
        return {
          padding: theme.spacing(8),
          iconSize: 80,
          titleVariant: 'h4' as const,
          descriptionVariant: 'body1' as const,
        };
      case 'medium':
      default:
        return {
          padding: theme.spacing(6),
          iconSize: 64,
          titleVariant: 'h5' as const,
          descriptionVariant: 'body1' as const,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  const getIconColor = () => {
    switch (type) {
      case 'error':
        return theme.palette.error.main;
      case 'search':
        return theme.palette.info.main;
      case 'offline':
        return theme.palette.warning.main;
      default:
        return theme.palette.text.secondary;
    }
  };

  return (
    <Paper
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        p: sizeStyles.padding,
        backgroundColor: alpha(theme.palette.background.default, 0.5),
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: '16px',
        minHeight: size === 'large' ? 400 : size === 'medium' ? 300 : 200,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: sizeStyles.iconSize,
          height: sizeStyles.iconSize,
          borderRadius: '50%',
          backgroundColor: alpha(getIconColor(), 0.1),
          color: getIconColor(),
          mb: 3,
          '& svg': {
            fontSize: sizeStyles.iconSize * 0.6,
          },
        }}
      >
        {displayIcon}
      </Box>

      <Typography
        variant={sizeStyles.titleVariant}
        component='h3'
        gutterBottom
        sx={{
          fontWeight: 600,
          color: theme.palette.text.primary,
          mb: 1,
        }}
      >
        {displayTitle}
      </Typography>

      <Typography
        variant={sizeStyles.descriptionVariant}
        color='text.secondary'
        sx={{
          maxWidth: 400,
          mb: action ? 3 : 0,
          lineHeight: 1.6,
        }}
      >
        {displayDescription}
      </Typography>

      {action && (
        <Button
          variant={action.variant || 'contained'}
          onClick={action.onClick}
          startIcon={type === 'empty' ? <AddIcon /> : undefined}
          sx={{
            mt: 2,
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 500,
          }}
        >
          {action.label}
        </Button>
      )}
    </Paper>
  );
};

export default EmptyState;
