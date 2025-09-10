import React, { useMemo, useCallback } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import {
  Paper,
  Typography,
  Box,
  ToggleButton,
  ToggleButtonGroup,
  useTheme,
} from '@mui/material';
import {
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
} from '@mui/icons-material';
import type { RequestStatus } from '../../../types';
import type {
  TooltipProps,
  LabelProps,
  StatusDataPoint,
} from '../../../types/charts';

interface StatusDistributionChartProps {
  data: { [key in RequestStatus]: number };
  title?: string;
  height?: number;
  showPercentages?: boolean;
}

const STATUS_COLORS = {
  Pending: '#FF9800',
  Approved: '#4CAF50',
  Rejected: '#F44336',
  Booked: '#2196F3',
  'Returned to Employee': '#9C27B0',
  Completed: '#8BC34A',
};

const STATUS_LABELS = {
  Pending: 'Pending',
  Approved: 'Approved',
  Rejected: 'Rejected',
  Booked: 'Booked',
  'Returned to Employee': 'Returned to Employee',
  Completed: 'Completed',
};

const StatusDistributionChart: React.FC<StatusDistributionChartProps> =
  React.memo(
    ({
      data,
      title = 'Request Status Distribution',
      height = 400,
      showPercentages = true,
    }) => {
      // Note: Using default percentage display - showPercentages functionality can be extended as needed
      const theme = useTheme();
      const [chartType, setChartType] = React.useState<'pie' | 'bar'>('pie');

      const total = useMemo(
        () => Object.values(data).reduce((sum, count) => sum + count, 0),
        [data]
      );

      const chartData: StatusDataPoint[] = useMemo(
        () =>
          Object.entries(data)
            .filter(([, count]) => count > 0)
            .map(([status, count]) => ({
              status: STATUS_LABELS[status as RequestStatus] || status,
              count,
              percentage: total > 0 ? (count / total) * 100 : 0,
              color:
                STATUS_COLORS[status as RequestStatus] ||
                theme.palette.grey[500],
            }))
            .sort((a, b) => b.count - a.count),
        [data, total, theme.palette.grey]
      );

      const handleChartTypeChange = useCallback(
        (_: React.MouseEvent<HTMLElement>, newType: 'pie' | 'bar' | null) => {
          if (newType !== null) {
            setChartType(newType);
          }
        },
        []
      );

      const CustomTooltip = useCallback(
        ({ active, payload }: TooltipProps) => {
          if (active && payload && payload.length) {
            const data = payload[0]?.payload as unknown as StatusDataPoint;

            if (!data) return null;

            return (
              <Paper sx={{ p: 2, boxShadow: theme.shadows[8] }}>
                <Typography variant='body2' fontWeight='medium' gutterBottom>
                  {data.status}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Count: {data.count.toLocaleString()}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Percentage: {data.percentage.toFixed(1)}%
                </Typography>
              </Paper>
            );
          }
          return null;
        },
        [theme.shadows]
      );

      const CustomLabel = useCallback(
        (props: LabelProps) => {
          const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;

          // Only show labels if showPercentages is true
          if (!showPercentages) return null;

          // Type guard to ensure all required properties exist
          if (!percent || percent < 0.05) return null;
          if (
            typeof cx !== 'number' ||
            typeof cy !== 'number' ||
            typeof midAngle !== 'number' ||
            typeof innerRadius !== 'number' ||
            typeof outerRadius !== 'number'
          )
            return null;

          const RADIAN = Math.PI / 180;
          const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
          const x = cx + radius * Math.cos(-midAngle * RADIAN);
          const y = cy + radius * Math.sin(-midAngle * RADIAN);

          return (
            <text
              x={x}
              y={y}
              fill='white'
              textAnchor={x > cx ? 'start' : 'end'}
              dominantBaseline='central'
              fontSize='12'
              fontWeight='bold'
            >
              {`${(percent * 100).toFixed(0)}%`}
            </text>
          );
        },
        [showPercentages]
      );

      if (chartData.length === 0) {
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
              <Typography>No status data available</Typography>
            </Box>
          </Paper>
        );
      }

      const renderContent = () => {
        switch (chartType) {
          case 'bar':
            return (
              <ResponsiveContainer width='100%' height={height - 100}>
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='status' fontSize={12} />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey='count' radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            );

          case 'pie':
          default:
            return (
              <ResponsiveContainer width='100%' height={height - 100}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx='50%'
                    cy='50%'
                    labelLine={false}
                    label={CustomLabel}
                    outerRadius={Math.min(height / 4, 120)}
                    fill='#8884d8'
                    dataKey='count'
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign='bottom'
                    height={36}
                    formatter={(value, entry) => {
                      // Type guard to ensure entry has required properties
                      if (
                        entry &&
                        typeof entry === 'object' &&
                        'color' in entry &&
                        'payload' in entry
                      ) {
                        const payload = entry.payload as StatusDataPoint;
                        return (
                          <span style={{ color: entry.color as string }}>
                            {value} ({payload.count})
                          </span>
                        );
                      }
                      return <span>{value}</span>;
                    }}
                  />
                </PieChart>
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
              value={chartType}
              exclusive
              onChange={handleChartTypeChange}
              size='small'
            >
              <ToggleButton value='pie' aria-label='pie chart'>
                <PieChartIcon fontSize='small' />
              </ToggleButton>
              <ToggleButton value='bar' aria-label='bar chart'>
                <BarChartIcon fontSize='small' />
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
          {renderContent()}
        </Paper>
      );
    }
  );

StatusDistributionChart.displayName = 'StatusDistributionChart';

export default StatusDistributionChart;
