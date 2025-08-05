import React from 'react';
import type { TooltipProps, TimeSeriesDataPoint } from '../../../types/charts';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from 'recharts';
import {
  Paper,
  Typography,
  Box,
  ToggleButton,
  ToggleButtonGroup,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
} from '@mui/material';
import {
  ShowChart,
  AreaChart as AreaChartIcon,
  BarChart as BarChartIcon,
} from '@mui/icons-material';

interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

interface TimeSeriesChartProps {
  data: TimeSeriesDataPoint[];
  title?: string;
  height?: number;
  xAxisKey?: string;
  yAxisKey?: string;
  color?: string;
  showGrid?: boolean;
  showLegend?: boolean;
  timeRange?: '7d' | '30d' | '90d' | '1y';
  onTimeRangeChange?: (range: '7d' | '30d' | '90d' | '1y') => void;
  multiSeries?: {
    key: string;
    name: string;
    color: string;
  }[];
}

const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({
  data,
  title = 'Time Series Analysis',
  height = 400,
  xAxisKey = 'period',
  yAxisKey = 'value',
  color,
  showGrid = true,
  showLegend = true,
  timeRange = '30d',
  onTimeRangeChange,
  multiSeries,
}) => {
  const theme = useTheme();
  const [chartType, setChartType] = React.useState<'line' | 'area' | 'bar'>(
    'line'
  );

  const defaultColor = color || theme.palette.primary.main;

  const handleChartTypeChange = (
    _: React.MouseEvent<HTMLElement>,
    newType: 'line' | 'area' | 'bar' | null
  ) => {
    if (newType !== null) {
      setChartType(newType);
    }
  };

  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0] as { payload: ChartDataPoint };
      return (
        <Paper sx={{ p: 2, border: '1px solid #ccc' }}>
          <Typography variant='body2' color='text.primary'>
            Date: {label}
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            Value: {data.payload.value.toLocaleString()}
          </Typography>
          {data.payload.label && (
            <Typography variant='body2' color='text.secondary'>
              {data.payload.label}
            </Typography>
          )}
        </Paper>
      );
    }
    return null;
  };

  const formatXAxisLabel = (tickItem: string) => {
    // Try to parse as date and format appropriately
    const date = new Date(tickItem);

    if (!isNaN(date.getTime())) {
      switch (timeRange) {
        case '7d':
          return date.toLocaleDateString('en-US', { weekday: 'short' });
        case '30d':
          return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          });
        case '90d':
          return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          });
        case '1y':
          return date.toLocaleDateString('en-US', {
            month: 'short',
            year: '2-digit',
          });
        default:
          return date.toLocaleDateString();
      }
    }

    return tickItem;
  };

  const handleTimeRangeChange = (
    event: React.ChangeEvent<HTMLSelectElement>
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
          <Typography>No time series data available</Typography>
        </Box>
      </Paper>
    );
  }

  const renderContent = () => {
    const commonProps = {
      data,
      margin: { top: 20, right: 30, left: 20, bottom: 5 },
    };

    switch (chartType) {
      case 'area':
        return (
          <ResponsiveContainer width='100%' height={height - 100}>
            <AreaChart {...commonProps}>
              {showGrid && <CartesianGrid strokeDasharray='3 3' />}
              <XAxis
                dataKey={xAxisKey}
                fontSize={12}
                tickFormatter={formatXAxisLabel}
                angle={-45}
                textAnchor='end'
                height={80}
              />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              {showLegend && <Legend />}
              {multiSeries ? (
                multiSeries.map(series => (
                  <Area
                    key={series.key}
                    type='monotone'
                    dataKey={series.key}
                    stackId='1'
                    stroke={series.color}
                    fill={series.color}
                    fillOpacity={0.6}
                    name={series.name}
                  />
                ))
              ) : (
                <Area
                  type='monotone'
                  dataKey={yAxisKey}
                  stroke={defaultColor}
                  fill={defaultColor}
                  fillOpacity={0.6}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width='100%' height={height - 100}>
            <BarChart {...commonProps}>
              {showGrid && <CartesianGrid strokeDasharray='3 3' />}
              <XAxis
                dataKey={xAxisKey}
                fontSize={12}
                tickFormatter={formatXAxisLabel}
                angle={-45}
                textAnchor='end'
                height={80}
              />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              {showLegend && <Legend />}
              {multiSeries ? (
                multiSeries.map(series => (
                  <Bar
                    key={series.key}
                    dataKey={series.key}
                    fill={series.color}
                    radius={[4, 4, 0, 0]}
                    name={series.name}
                  />
                ))
              ) : (
                <Bar
                  dataKey={yAxisKey}
                  fill={defaultColor}
                  radius={[4, 4, 0, 0]}
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
      default:
        return (
          <ResponsiveContainer width='100%' height={height - 100}>
            <LineChart {...commonProps}>
              {showGrid && <CartesianGrid strokeDasharray='3 3' />}
              <XAxis
                dataKey={xAxisKey}
                fontSize={12}
                tickFormatter={formatXAxisLabel}
                angle={-45}
                textAnchor='end'
                height={80}
              />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              {showLegend && <Legend />}
              {multiSeries ? (
                multiSeries.map(series => (
                  <Line
                    key={series.key}
                    type='monotone'
                    dataKey={series.key}
                    stroke={series.color}
                    strokeWidth={2}
                    dot={{ fill: series.color, strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: series.color, strokeWidth: 2 }}
                    name={series.name}
                  />
                ))
              ) : (
                <Line
                  type='monotone'
                  dataKey={yAxisKey}
                  stroke={defaultColor}
                  strokeWidth={2}
                  dot={{ fill: defaultColor, strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: defaultColor, strokeWidth: 2 }}
                />
              )}
            </LineChart>
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
          <ToggleButtonGroup
            value={chartType}
            exclusive
            onChange={handleChartTypeChange}
            size='small'
          >
            <ToggleButton value='line' aria-label='line chart'>
              <ShowChart fontSize='small' />
            </ToggleButton>
            <ToggleButton value='area' aria-label='area chart'>
              <AreaChartIcon fontSize='small' />
            </ToggleButton>
            <ToggleButton value='bar' aria-label='bar chart'>
              <BarChartIcon fontSize='small' />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>
      {renderContent()}
    </Paper>
  );
};

export default TimeSeriesChart;
