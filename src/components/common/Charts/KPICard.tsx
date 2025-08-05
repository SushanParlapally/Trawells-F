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
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  TrendingFlat,
  InfoOutlined,
} from '@mui/icons-material';

export interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'flat';
    period: string;
  };
  icon?: React.ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  loading?: boolean;
  onClick?: () => void;
  info?: string;
  format?: 'number' | 'percentage' | 'currency' | 'time';
}

const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon,
  color = 'primary',
  loading = false,
  onClick,
  info,
  format = 'number',
}) => {
  const theme = useTheme();

  const formatValue = (val: string | number): string => {
    if (typeof val === 'string') return val;

    switch (format) {
      case 'percentage':
        return `${val.toFixed(1)}%`;
      case 'currency':
        return `$${val.toLocaleString()}`;
      case 'time':
        return `${val}h`;
      case 'number':
      default:
        return val.toLocaleString();
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

  return (
    <Card
      sx={{
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease-in-out',
        '&:hover': onClick
          ? {
              transform: 'translateY(-2px)',
              boxShadow: theme.shadows[4],
            }
          : {},
        background: `linear-gradient(135deg, ${alpha(
          theme.palette[color].main,
          0.05
        )} 0%, ${alpha(theme.palette[color].main, 0.02)} 100%)`,
        border: `1px solid ${alpha(theme.palette[color].main, 0.1)}`,
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 3 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            mb: 2,
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
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

            <Typography
              variant='h3'
              color={`${color}.main`}
              sx={{
                fontWeight: 700,
                lineHeight: 1.2,
                mb: subtitle ? 1 : 0,
              }}
            >
              {loading ? '...' : formatValue(value)}
            </Typography>

            {subtitle && (
              <Typography variant='caption' color='text.secondary'>
                {subtitle}
              </Typography>
            )}
          </Box>

          {icon && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 48,
                height: 48,
                borderRadius: 2,
                backgroundColor: alpha(theme.palette[color].main, 0.1),
                color: `${color}.main`,
                '& svg': { fontSize: 28 },
              }}
            >
              {icon}
            </Box>
          )}
        </Box>

        {trend && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              icon={getTrendIcon() || undefined}
              label={`${trend.value > 0 ? '+' : ''}${trend.value}%`}
              size='small'
              color={getTrendColor()}
              variant='outlined'
              sx={{ fontSize: '0.75rem' }}
            />
            <Typography variant='caption' color='text.secondary'>
              vs {trend.period}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default KPICard;
