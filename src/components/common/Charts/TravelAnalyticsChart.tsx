import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Chip,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface TravelAnalyticsData {
  name: string;
  value: number;
  color: string;
}

interface ChartDataPoint {
  name: string;
  value: number;
  color: string;
}

interface TravelAnalyticsChartProps {
  data?: TravelAnalyticsData[];
  title?: string;
  height?: number;
  onMetricChange?: (metric: string) => void;
  onTimeRangeChange?: (range: '7d' | '30d' | '90d' | '1y') => void;
}

const TravelAnalyticsChart: React.FC<TravelAnalyticsChartProps> = ({
  data = [],
  title = 'Travel Analytics',
  height = 400,
  onMetricChange,
  onTimeRangeChange,
}) => {
  const [selectedMetric, setSelectedMetric] =
    useState<keyof typeof metrics>('requests');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>(
    '30d'
  );

  const metrics = {
    requests: 'Travel Requests',
    processing: 'Processing Time',
    rates: 'Approval Rates',
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

  const handleMetricChange = (
    event: SelectChangeEvent<keyof typeof metrics>
  ) => {
    const selectedMetric = event.target.value as keyof typeof metrics;
    setSelectedMetric(selectedMetric);
    onMetricChange?.(selectedMetric);
  };

  const handleTimeRangeChange = (
    event: SelectChangeEvent<'7d' | '30d' | '90d' | '1y'>
  ) => {
    const newRange = event.target.value as '7d' | '30d' | '90d' | '1y';
    setTimeRange(newRange);
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
          <Typography>No analytics data available</Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3, height }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant='h6'>{title}</Typography>
        <Stack direction='row' spacing={2}>
          <FormControl size='small' sx={{ minWidth: 120 }}>
            <InputLabel>Metric</InputLabel>
            <Select
              value={selectedMetric}
              label='Metric'
              onChange={handleMetricChange}
            >
              {Object.entries(metrics).map(([key, label]) => (
                <MenuItem key={key} value={key}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
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
        </Stack>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Chip label={`Total: ${data.length}`} size='small' />
        <Chip
          label={`Average: ${(
            data.reduce((sum, item) => sum + item.value, 0) / data.length
          ).toFixed(1)}`}
          size='small'
        />
      </Box>

      <ResponsiveContainer width='100%' height={height - 150}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray='3 3' />
          <XAxis
            dataKey='name'
            fontSize={12}
            tickFormatter={formatXAxisLabel}
            angle={-45}
            textAnchor='end'
            height={80}
          />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar dataKey='value' fill='#8884d8' />
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export default TravelAnalyticsChart;
