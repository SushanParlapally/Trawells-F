import React from 'react';
import type { TooltipProps } from '../../../types/charts';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import {
  Paper,
  Typography,
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Card,
  CardContent,
  LinearProgress,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Radar as RadarIcon,
  ShowChart,
  AreaChart as AreaChartIcon,
  Speed,
  TrendingUp,
} from '@mui/icons-material';

interface PerformanceMetric {
  name: string;
  value: number;
  target: number;
  unit: string;
  trend?: {
    direction: 'up' | 'down' | 'flat';
    percentage: number;
  };
}

interface PerformanceMetricsChartProps {
  metrics: PerformanceMetric[];
  title?: string;
  height?: number;
  showTrends?: boolean;
  timeSeriesData?: { period: string; [key: string]: unknown }[];
}

const PerformanceMetricsChart: React.FC<PerformanceMetricsChartProps> = ({
  metrics,
  title = 'Performance Metrics',
  height = 500,
  showTrends = true,
  timeSeriesData = [],
}) => {
  const theme = useTheme();
  const [viewType, setViewType] = React.useState<
    'radar' | 'line' | 'area' | 'cards'
  >('radar');

  const handleViewTypeChange = (
    _: React.MouseEvent<HTMLElement>,
    newType: 'radar' | 'line' | 'area' | 'cards' | null
  ) => {
    if (newType !== null) {
      setViewType(newType);
    }
  };

  const getPerformanceColor = (value: number, target: number) => {
    const percentage = (value / target) * 100;
    if (percentage >= 90) return theme.palette.success.main;
    if (percentage >= 70) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  const getPerformanceStatus = (value: number, target: number) => {
    const percentage = (value / target) * 100;
    if (percentage >= 90) return 'Excellent';
    if (percentage >= 70) return 'Good';
    if (percentage >= 50) return 'Fair';
    return 'Poor';
  };

  const getTrendIcon = (trend?: {
    direction: 'up' | 'down' | 'flat';
    percentage: number;
  }) => {
    if (!trend) return null;

    const color =
      trend.direction === 'up'
        ? 'success'
        : trend.direction === 'down'
          ? 'error'
          : 'text';

    return (
      <TrendingUp
        sx={{
          color:
            color === 'text'
              ? theme.palette.text.primary
              : theme.palette[color].main,
          transform: trend.direction === 'down' ? 'rotate(180deg)' : 'none',
        }}
        fontSize='small'
      />
    );
  };

  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload as unknown as PerformanceMetric;

      if (!data) return null;

      return (
        <Paper sx={{ p: 2, boxShadow: theme.shadows[8] }}>
          <Typography variant='body2' fontWeight='medium' gutterBottom>
            {label}
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            Value: {data.value} {data.unit}
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            Target: {data.target} {data.unit}
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            Performance: {getPerformanceStatus(data.value, data.target)}
          </Typography>
          {data.trend && (
            <Typography variant='body2' color='text.secondary'>
              Trend: {data.trend.percentage}% {data.trend.direction}
            </Typography>
          )}
        </Paper>
      );
    }
    return null;
  };

  if (metrics.length === 0) {
    return (
      <Paper sx={{ p: 3, height }}>
        <Typography variant='h6' gutterBottom>
          {title}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: height - 100,
            color: 'text.secondary',
          }}
        >
          <Typography>No performance data available</Typography>
        </Box>
      </Paper>
    );
  }

  const radarData = metrics.map(metric => ({
    name: metric.name,
    value: metric.value,
    target: metric.target,
    unit: metric.unit,
    trend: metric.trend,
  }));

  const renderContent = () => {
    switch (viewType) {
      case 'cards':
        return (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: 2,
              mt: 1,
            }}
          >
            {metrics.map(metric => {
              const percentage = (metric.value / metric.target) * 100;
              const color = getPerformanceColor(metric.value, metric.target);
              const status = getPerformanceStatus(metric.value, metric.target);

              return (
                <Box key={metric.name}>
                  <Card
                    sx={{
                      height: '100%',
                      background: `linear-gradient(135deg, ${alpha(color, 0.05)} 0%, ${alpha(color, 0.02)} 100%)`,
                      border: `1px solid ${alpha(color, 0.1)}`,
                    }}
                  >
                    <CardContent>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          mb: 2,
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 48,
                            height: 48,
                            borderRadius: 2,
                            backgroundColor: alpha(color, 0.1),
                            color: color,
                          }}
                        >
                          <Speed />
                        </Box>
                        <Box>
                          <Typography variant='h6' color={color}>
                            {metric.value} {metric.unit}
                          </Typography>
                          <Typography variant='body2' color='text.secondary'>
                            {metric.name}
                          </Typography>
                        </Box>
                      </Box>

                      <Typography
                        variant='body2'
                        color='text.secondary'
                        gutterBottom
                      >
                        Target: {metric.target} {metric.unit}
                      </Typography>

                      <Box sx={{ mb: 2 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            mb: 1,
                          }}
                        >
                          <Typography variant='caption' color='text.secondary'>
                            Performance
                          </Typography>
                          <Typography variant='caption' color='text.secondary'>
                            {percentage.toFixed(1)}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant='determinate'
                          value={Math.min(percentage, 100)}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: alpha(color, 0.2),
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: color,
                            },
                          }}
                        />
                      </Box>

                      <Typography
                        variant='body2'
                        color='text.secondary'
                        gutterBottom
                      >
                        Status: {status}
                      </Typography>

                      {showTrends && metric.trend && (
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                          {getTrendIcon(metric.trend)}
                          <Typography variant='caption' color='text.secondary'>
                            {metric.trend.percentage}% {metric.trend.direction}
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Box>
              );
            })}
          </Box>
        );

      case 'line':
        return (
          <ResponsiveContainer width='100%' height={height - 100}>
            <LineChart
              data={timeSeriesData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='period' fontSize={12} />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {metrics.map(metric => (
                <Line
                  key={metric.name}
                  type='monotone'
                  dataKey={metric.name}
                  stroke={theme.palette.primary.main}
                  strokeWidth={2}
                  dot={{
                    fill: theme.palette.primary.main,
                    strokeWidth: 2,
                    r: 4,
                  }}
                  activeDot={{
                    r: 6,
                    stroke: theme.palette.primary.main,
                    strokeWidth: 2,
                  }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width='100%' height={height - 100}>
            <AreaChart
              data={timeSeriesData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='period' fontSize={12} />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {metrics.map(metric => (
                <Area
                  key={metric.name}
                  type='monotone'
                  dataKey={metric.name}
                  stackId='1'
                  stroke={theme.palette.primary.main}
                  fill={alpha(theme.palette.primary.main, 0.3)}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'radar':
      default:
        return (
          <ResponsiveContainer width='100%' height={height - 100}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey='name' />
              <PolarRadiusAxis angle={30} domain={[0, 'dataMax']} />
              <Radar
                name='Performance'
                dataKey='value'
                stroke={theme.palette.primary.main}
                fill={alpha(theme.palette.primary.main, 0.3)}
                fillOpacity={0.6}
              />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <Paper sx={{ p: 3, height }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Typography variant='h6'>{title}</Typography>
        <ToggleButtonGroup
          value={viewType}
          exclusive
          onChange={handleViewTypeChange}
          size='small'
        >
          <ToggleButton value='radar' aria-label='radar chart'>
            <RadarIcon fontSize='small' />
          </ToggleButton>
          <ToggleButton value='line' aria-label='line chart'>
            <ShowChart fontSize='small' />
          </ToggleButton>
          <ToggleButton value='area' aria-label='area chart'>
            <AreaChartIcon fontSize='small' />
          </ToggleButton>
          <ToggleButton value='cards' aria-label='card view'>
            <Speed fontSize='small' />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
      {renderContent()}
    </Paper>
  );
};

export default PerformanceMetricsChart;
