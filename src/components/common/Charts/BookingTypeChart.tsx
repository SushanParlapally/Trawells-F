import React from 'react';
import type { TooltipProps, LabelProps } from '../../../types/charts';
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
  Grid,
  Card,
  CardContent,
  useTheme,
} from '@mui/material';
import {
  Flight,
  Hotel,
  FlightTakeoff,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  ViewModule,
} from '@mui/icons-material';
import type { RequestStatus } from '../../../types';

interface StatusData {
  status: RequestStatus;
  count: number;
  percentage: number;
  averageCost?: number;
  averageProcessingTime?: number;
}

interface StatusDistributionChartProps {
  data: { [key in RequestStatus]: number };
  title?: string;
  height?: number;
  showCosts?: boolean;
  showProcessingTime?: boolean;
  costData?: { [key in RequestStatus]: number };
  processingTimeData?: { [key in RequestStatus]: number };
}

const STATUS_CONFIG = {
  Pending: {
    label: 'Pending',
    icon: <Flight />,
    color: '#FF9800',
  },
  Approved: {
    label: 'Approved',
    icon: <Hotel />,
    color: '#4CAF50',
  },
  Rejected: {
    label: 'Rejected',
    icon: <FlightTakeoff />,
    color: '#F44336',
  },
  Booked: {
    label: 'Booked',
    icon: <FlightTakeoff />,
    color: '#2196F3',
  },
  'Returned to Employee': {
    label: 'Returned to Employee',
    icon: <FlightTakeoff />,
    color: '#9C27B0',
  },
  Completed: {
    label: 'Completed',
    icon: <FlightTakeoff />,
    color: '#8BC34A',
  },
};

const StatusDistributionChart: React.FC<StatusDistributionChartProps> = ({
  data,
  title = 'Request Status Distribution',
  height = 400,
  showCosts = false,
  showProcessingTime = false,
  costData,
  processingTimeData,
}) => {
  const theme = useTheme();
  const [viewType, setViewType] = React.useState<'pie' | 'bar' | 'cards'>(
    'pie'
  );

  const total = Object.values(data).reduce((sum, count) => sum + count, 0);

  const chartData: StatusData[] = Object.entries(data)
    .filter(([_, count]) => count > 0)
    .map(([status, count]) => ({
      status: status as RequestStatus,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0,
      averageCost: costData?.[status as RequestStatus],
      averageProcessingTime: processingTimeData?.[status as RequestStatus],
    }))
    .sort((a, b) => b.count - a.count);

  const handleViewTypeChange = (
    _: React.MouseEvent<HTMLElement>,
    newType: 'pie' | 'bar' | 'cards' | null
  ) => {
    if (newType !== null) {
      setViewType(newType);
    }
  };

  const CustomTooltip = ({ active, payload }: TooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload as unknown as StatusData;

      if (!data) return null;

      const config = STATUS_CONFIG[data['status'] as RequestStatus];

      return (
        <Paper sx={{ p: 2, boxShadow: theme.shadows[8] }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            {config.icon}
            <Typography variant='body2' fontWeight='medium'>
              {config.label}
            </Typography>
          </Box>
          <Typography variant='body2' color='text.secondary'>
            Count: {(data['count'] as number).toLocaleString()}
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            Percentage: {(data['percentage'] as number).toFixed(1)}%
          </Typography>
          {showCosts && data['averageCost'] && (
            <Typography variant='body2' color='text.secondary'>
              Avg Cost: ${(data['averageCost'] as number).toLocaleString()}
            </Typography>
          )}
          {showProcessingTime && data['averageProcessingTime'] && (
            <Typography variant='body2' color='text.secondary'>
              Avg Processing:{' '}
              {(data['averageProcessingTime'] as number).toFixed(1)}h
            </Typography>
          )}
        </Paper>
      );
    }
    return null;
  };

  const CustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: LabelProps) => {
    if (!percent || percent < 0.05) return null; // Don't show labels for slices smaller than 5%
    if (!cx || !cy || !midAngle || !innerRadius || !outerRadius) return null;

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
  };

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
    switch (viewType) {
      case 'cards':
        return (
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {chartData.map(item => {
              const config = STATUS_CONFIG[item.status];
              return (
                <Box key={item.status} sx={{ width: '100%', mb: 2 }}>
                  <Card
                    sx={{
                      height: '100%',
                      background: `linear-gradient(135deg, ${config.color}15 0%, ${config.color}05 100%)`,
                      border: `1px solid ${config.color}30`,
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
                            backgroundColor: `${config.color}20`,
                            color: config.color,
                          }}
                        >
                          {config.icon}
                        </Box>
                        <Box>
                          <Typography variant='h6' color={config.color}>
                            {item.count.toLocaleString()}
                          </Typography>
                          <Typography variant='body2' color='text.secondary'>
                            {config.label}
                          </Typography>
                        </Box>
                      </Box>
                      <Typography
                        variant='body2'
                        color='text.secondary'
                        gutterBottom
                      >
                        {item.percentage.toFixed(1)}% of total requests
                      </Typography>
                      {showCosts && item.averageCost && (
                        <Typography variant='body2' color='text.secondary'>
                          Avg Cost: ${item.averageCost.toLocaleString()}
                        </Typography>
                      )}
                      {showProcessingTime && item.averageProcessingTime && (
                        <Typography variant='body2' color='text.secondary'>
                          Avg Processing:{' '}
                          {item.averageProcessingTime.toFixed(1)}h
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Box>
              );
            })}
          </Grid>
        );

      case 'bar':
        return (
          <ResponsiveContainer width='100%' height={height - 100}>
            <BarChart
              data={chartData.map(item => ({
                ...item,
                name: STATUS_CONFIG[item.status].label,
              }))}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='name' fontSize={12} />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey='count' radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={STATUS_CONFIG[entry.status].color}
                  />
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
                data={chartData.map(item => ({
                  ...item,
                  name: STATUS_CONFIG[item.status].label,
                }))}
                cx='50%'
                cy='50%'
                labelLine={false}
                label={CustomLabel}
                outerRadius={Math.min(height / 4, 120)}
                fill='#8884d8'
                dataKey='count'
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={STATUS_CONFIG[entry.status].color}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign='bottom'
                height={36}
                formatter={(value, entry) => (
                  <span style={{ color: entry.color }}>
                    {value} ({(entry.payload as StatusData)['count']})
                  </span>
                )}
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
          value={viewType}
          exclusive
          onChange={handleViewTypeChange}
          size='small'
        >
          <ToggleButton value='pie' aria-label='pie chart'>
            <PieChartIcon fontSize='small' />
          </ToggleButton>
          <ToggleButton value='bar' aria-label='bar chart'>
            <BarChartIcon fontSize='small' />
          </ToggleButton>
          <ToggleButton value='cards' aria-label='card view'>
            <ViewModule fontSize='small' />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
      {renderContent()}
    </Paper>
  );
};

export default StatusDistributionChart;
