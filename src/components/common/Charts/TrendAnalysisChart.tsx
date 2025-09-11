import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Brush,
} from 'recharts';
import {
  Paper,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  useTheme,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import {
  TrendingUp,
  TrendingDown,
  TrendingFlat,
  ShowChart,
  Timeline,
} from '@mui/icons-material';

interface TrendDataPoint {
  period: string;
  value: number;
  prediction?: number;
  upperBound?: number;
  lowerBound?: number;
  [key: string]: unknown;
}

interface TrendAnalysis {
  direction: 'up' | 'down' | 'flat';
  strength: 'strong' | 'moderate' | 'weak';
  percentage: number;
  significance: number; // 0-1 scale
}

interface TrendAnalysisChartProps {
  data: TrendDataPoint[];
  title?: string;
  height?: number;
  showPrediction?: boolean;
  showConfidenceInterval?: boolean;
  trendAnalysis?: TrendAnalysis;
  metric?: string;
  timeRange?: '7d' | '30d' | '90d' | '1y';
  onTimeRangeChange?: (range: '7d' | '30d' | '90d' | '1y') => void;
  onMetricChange?: (metric: string) => void;
  availableMetrics?: string[];
}

interface ChartDataPoint {
  name: string;
  value: number;
  color: string;
}

const TrendAnalysisChart: React.FC<TrendAnalysisChartProps> = ({
  data,
  title = 'Trend Analysis',
  height = 400,
  showPrediction = false,
  showConfidenceInterval = false,
  trendAnalysis,
  metric = 'value',
  timeRange = '30d',
  onTimeRangeChange,
  onMetricChange,
  availableMetrics = ['value'],
}) => {
  const theme = useTheme();
  const [showBrush, setShowBrush] = useState(false);

  const getTrendColor = (direction: 'up' | 'down' | 'flat') => {
    switch (direction) {
      case 'up':
        return theme.palette.success.main;
      case 'down':
        return theme.palette.error.main;
      case 'flat':
      default:
        return theme.palette.warning.main;
    }
  };

  const getTrendIcon = (direction: 'up' | 'down' | 'flat') => {
    switch (direction) {
      case 'up':
        return <TrendingUp fontSize='small' />;
      case 'down':
        return <TrendingDown fontSize='small' />;
      case 'flat':
      default:
        return <TrendingFlat fontSize='small' />;
    }
  };

  const getStrengthColor = (strength: 'strong' | 'moderate' | 'weak') => {
    switch (strength) {
      case 'strong':
        return 'success';
      case 'moderate':
        return 'warning';
      case 'weak':
      default:
        return 'default';
    }
  };

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{ payload: ChartDataPoint }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0] as { payload: ChartDataPoint };
      return (
        <Paper sx={{ p: 2, border: '1px solid #ccc' }}>
          <Typography variant='body2' color='text.primary'>
            {label}
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            {data.payload.name}: {data.payload.value.toLocaleString()}
          </Typography>
        </Paper>
      );
    }
    return null;
  };

  const formatXAxisLabel = (tickItem: string) => {
    if (tickItem.length > 10) {
      return tickItem.substring(0, 10) + '...';
    }
    return tickItem;
  };

  const handleMetricChange = (event: SelectChangeEvent<string>) => {
    const selectedMetric = event.target.value as string;
    onMetricChange?.(selectedMetric);
  };

  const handleTimeRangeChange = (
    event: SelectChangeEvent<'7d' | '30d' | '90d' | '1y'>
  ) => {
    const newRange = event.target.value as '7d' | '30d' | '90d' | '1y';
    onTimeRangeChange?.(newRange);
  };

  if (data.length === 0) {
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
          <Typography>No trend data available</Typography>
        </Box>
      </Paper>
    );
  }

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
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {onTimeRangeChange && (
            <FormControl size='small' sx={{ minWidth: 120 }}>
              <InputLabel>Time Range</InputLabel>
              <Select
                value={timeRange}
                label='Time Range'
                onChange={handleTimeRangeChange}
              >
                <MenuItem value='7d'>Last 7 Days</MenuItem>
                <MenuItem value='30d'>Last 30 Days</MenuItem>
                <MenuItem value='90d'>Last 90 Days</MenuItem>
                <MenuItem value='1y'>Last Year</MenuItem>
              </Select>
            </FormControl>
          )}
          {onMetricChange && availableMetrics.length > 1 && (
            <FormControl size='small' sx={{ minWidth: 120 }}>
              <InputLabel>Metric</InputLabel>
              <Select
                value={metric}
                label='Metric'
                onChange={handleMetricChange}
              >
                {availableMetrics.map(m => (
                  <MenuItem key={m} value={m}>
                    {m}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          <ToggleButtonGroup
            value={showBrush ? 'brush' : 'chart'}
            exclusive
            onChange={(_, newValue) => setShowBrush(newValue === 'brush')}
            size='small'
          >
            <ToggleButton value='chart' aria-label='chart view'>
              <ShowChart fontSize='small' />
            </ToggleButton>
            <ToggleButton value='brush' aria-label='brush view'>
              <Timeline fontSize='small' />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      {trendAnalysis && (
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <Chip
            icon={getTrendIcon(trendAnalysis.direction)}
            label={`${trendAnalysis.percentage > 0 ? '+' : ''}${trendAnalysis.percentage.toFixed(1)}%`}
            color={getStrengthColor(trendAnalysis.strength)}
            variant='outlined'
            size='small'
          />
          <Chip
            label={`${trendAnalysis.strength} trend`}
            color={getStrengthColor(trendAnalysis.strength)}
            variant='outlined'
            size='small'
          />
          <Chip
            label={`${(trendAnalysis.significance * 100).toFixed(0)}% confidence`}
            color={
              trendAnalysis.significance > 0.8
                ? 'success'
                : trendAnalysis.significance > 0.6
                  ? 'warning'
                  : 'default'
            }
            variant='outlined'
            size='small'
          />
        </Box>
      )}

      <ResponsiveContainer width='100%' height={height - 100}>
        <LineChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray='3 3' />
          <XAxis
            dataKey='period'
            fontSize={12}
            tickFormatter={formatXAxisLabel}
            angle={-45}
            textAnchor='end'
            height={80}
          />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Legend />

          {/* Actual data line */}
          <Line
            type='monotone'
            dataKey={metric}
            stroke={theme.palette.primary.main}
            strokeWidth={2}
            dot={{ fill: theme.palette.primary.main, strokeWidth: 2, r: 4 }}
            activeDot={{
              r: 6,
              stroke: theme.palette.primary.main,
              strokeWidth: 2,
            }}
            name='Actual'
          />

          {/* Prediction line */}
          {showPrediction && (
            <Line
              type='monotone'
              dataKey='prediction'
              stroke={theme.palette.secondary.main}
              strokeWidth={2}
              strokeDasharray='5 5'
              dot={{ fill: theme.palette.secondary.main, strokeWidth: 2, r: 4 }}
              name='Prediction'
            />
          )}

          {/* Confidence interval */}
          {showConfidenceInterval && (
            <>
              <Line
                type='monotone'
                dataKey='upperBound'
                stroke={theme.palette.grey[400]}
                strokeWidth={1}
                strokeDasharray='3 3'
                dot={false}
                name='Upper Bound'
              />
              <Line
                type='monotone'
                dataKey='lowerBound'
                stroke={theme.palette.grey[400]}
                strokeWidth={1}
                strokeDasharray='3 3'
                dot={false}
                name='Lower Bound'
              />
            </>
          )}

          {/* Reference line for trend analysis */}
          {trendAnalysis && (
            <ReferenceLine
              y={(data[data.length - 1]?.[metric] as number) || 0}
              stroke={getTrendColor(trendAnalysis.direction)}
              strokeDasharray='3 3'
              strokeWidth={1}
            />
          )}

          {showBrush && (
            <Brush
              dataKey='period'
              height={30}
              stroke={theme.palette.primary.main}
              fill={theme.palette.primary.light}
              fillOpacity={0.1}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export default TrendAnalysisChart;
