import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
  Skeleton,
  Avatar,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  TrendingFlat,
  InfoOutlined,
} from '@mui/icons-material';
import {
  formatDisplayValue,
  formatNumber,
  formatPercentage,
  formatDuration,
} from '../../utils/dataFormatters';

export interface StatCardProps {
  title: string;
  value: string | number | null | undefined;
  subtitle?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'flat';
    period?: string;
  };
  icon: React.ReactNode;
  iconColor?:
    | 'primary'
    | 'secondary'
    | 'success'
    | 'warning'
    | 'error'
    | 'info';
  loading?: boolean;
  onClick?: () => void;
  info?: string;
  format?: 'number' | 'percentage' | 'currency' | 'time';
  showZero?: boolean; // Whether to show "0" instead of "--" for zero values
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon,
  iconColor = 'primary',
  loading = false,
  onClick,
  info,
  format = 'number',
  showZero = false,
}) => {
  const theme = useTheme();

  const formatValue = (val: string | number | null | undefined): string => {
    if (loading) return '';

    // Handle null/undefined/empty values
    if (val === null || val === undefined || val === '') {
      return '--';
    }

    // Handle zero values
    if (val === 0 && !showZero) {
      return '--';
    }

    // Handle string values
    if (typeof val === 'string') {
      return formatDisplayValue(val, { showZero });
    }

    // Handle number values based on format
    switch (format) {
      case 'percentage':
        return formatPercentage(val, { showZero });
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(val);
      case 'time':
        return formatDuration(val, { showZero });
      case 'number':
      default:
        return formatNumber(val, { showZero });
    }
  };

  const getTrendIcon = () => {
    if (!trend) return null;

    switch (trend.direction) {
      case 'up':
        return <TrendingUp fontSize='small' />;
      case 'down':
        return <TrendingDown fontSize='small' />;
      case 'flat':
      default:
        return <TrendingFlat fontSize='small' />;
    }
  };

  const getTrendColor = () => {
    if (!trend) return 'default';

    switch (trend.direction) {
      case 'up':
        return 'success';
      case 'down':
        return 'error';
      case 'flat':
      default:
        return 'default';
    }
  };

  const displayValue = formatValue(value);

  return (
    <Card
      sx={{
        borderRadius: '16px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        transition: 'all 0.2s ease-in-out',
        cursor: onClick ? 'pointer' : 'default',
        border: '1px solid rgba(224, 224, 224, 0.5)',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
          borderColor: onClick
            ? 'rgba(0, 123, 255, 0.2)'
            : 'rgba(224, 224, 224, 0.5)',
          backgroundColor: alpha(theme.palette.primary.main, 0.04),
        },
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 3 }}>
        <Box
          display='flex'
          alignItems='center'
          justifyContent='space-between'
          mb={2}
        >
          <Box flex={1}>
            <Box display='flex' alignItems='center' gap={1} mb={1}>
              <Typography
                variant='body2'
                color='text.secondary'
                sx={{ fontWeight: 500 }}
              >
                {title}
              </Typography>
              {info && (
                <Tooltip title={info} arrow>
                  <IconButton size='small' sx={{ p: 0.5 }}>
                    <InfoOutlined fontSize='small' />
                  </IconButton>
                </Tooltip>
              )}
            </Box>

            {loading ? (
              <Skeleton variant='text' width={80} height={40} />
            ) : (
              <Typography
                variant='h4'
                component='div'
                sx={{
                  fontWeight: 600,
                  lineHeight: 1.2,
                  color:
                    displayValue === '--' ? 'text.secondary' : 'text.primary',
                  mb: subtitle ? 1 : 0,
                }}
              >
                {displayValue}
              </Typography>
            )}

            {subtitle && (
              <Typography variant='caption' color='text.secondary'>
                {subtitle}
              </Typography>
            )}
          </Box>

          <Avatar
            sx={{
              bgcolor: `${iconColor}.main`,
              width: 56,
              height: 56,
              '& svg': { fontSize: 28 },
            }}
          >
            {icon}
          </Avatar>
        </Box>

        {trend && !loading && (
          <Box display='flex' alignItems='center' gap={1}>
            <Chip
              icon={getTrendIcon() || undefined}
              label={`${trend.value > 0 ? '+' : ''}${trend.value.toFixed(1)}%`}
              size='small'
              color={getTrendColor()}
              variant='outlined'
              sx={{
                fontSize: '0.75rem',
                '& .MuiChip-icon': {
                  fontSize: '1rem',
                },
              }}
            />
            {trend.period && (
              <Typography variant='caption' color='text.secondary'>
                vs {trend.period}
              </Typography>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;
