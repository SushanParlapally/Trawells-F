import React from 'react';
import type {
  TooltipProps,
  PieTooltipProps,
  DepartmentDataPoint,
} from '../../../types/charts';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Paper,
  Typography,
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  useTheme,
} from '@mui/material';
import {
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  TableChart,
} from '@mui/icons-material';

interface DepartmentAnalyticsChartProps {
  data: DepartmentDataPoint[];
  title?: string;
  height?: number;
  showProcessingTime?: boolean;
  showCompletionRate?: boolean;
}

interface ChartPayload {
  total: number;
  departmentName: string;
  value: number;
}

const COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#8884D8',
  '#82CA9D',
  '#FFC658',
  '#FF7C7C',
  '#8DD1E1',
  '#D084D0',
];

const DepartmentAnalyticsChart: React.FC<DepartmentAnalyticsChartProps> = ({
  data,
  title = 'Department Analytics',
  height = 500,
  showProcessingTime = true,
  showCompletionRate = true,
}) => {
  const theme = useTheme();
  const [viewType, setViewType] = React.useState<'bar' | 'pie' | 'table'>(
    'bar'
  );

  const handleViewTypeChange = (
    _: React.MouseEvent<HTMLElement>,
    newType: 'bar' | 'pie' | 'table' | null
  ) => {
    if (newType !== null) {
      setViewType(newType);
    }
  };

  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload as unknown as DepartmentDataPoint;

      if (!data) return null;

      return (
        <Paper sx={{ p: 2, boxShadow: theme.shadows[8] }}>
          <Typography variant='body2' fontWeight='medium' gutterBottom>
            {label}
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            Total Requests: {(data['totalRequests'] as number).toLocaleString()}
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            Pending: {data['pendingRequests'] as number}
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            Approved: {data['approvedRequests'] as number}
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            Completed: {data['completedRequests'] as number}
          </Typography>
          {showCompletionRate && (
            <Typography variant='body2' color='text.secondary'>
              Completion Rate: {(data['completionRate'] as number).toFixed(1)}%
            </Typography>
          )}
          {showProcessingTime && (
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

  const PieTooltip = ({ active, payload }: PieTooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0];

      if (!data) return null;

      return (
        <Paper sx={{ p: 2, boxShadow: theme.shadows[8] }}>
          <Typography variant='body2' fontWeight='medium'>
            {data.name}
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            Requests: {(data.value as number).toLocaleString()}
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            Percentage:{' '}
            {(
              ((data.value as number) /
                ((data.payload as ChartPayload).total as number)) *
              100
            ).toFixed(1)}
            %
          </Typography>
        </Paper>
      );
    }
    return null;
  };

  const getCompletionRateColor = (rate: number) => {
    if (rate >= 90) return 'success';
    if (rate >= 70) return 'warning';
    return 'error';
  };

  const getProcessingTimeColor = (time: number) => {
    if (time <= 24) return 'success';
    if (time <= 48) return 'warning';
    return 'error';
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
          <Typography>No department data available</Typography>
        </Box>
      </Paper>
    );
  }

  const renderContent = () => {
    switch (viewType) {
      case 'table':
        return (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Department</TableCell>
                  <TableCell align='right'>Total</TableCell>
                  <TableCell align='right'>Pending</TableCell>
                  <TableCell align='right'>Approved</TableCell>
                  <TableCell align='right'>Completed</TableCell>
                  {showCompletionRate && (
                    <TableCell align='right'>Completion Rate</TableCell>
                  )}
                  {showProcessingTime && (
                    <TableCell align='right'>Avg Processing</TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map(row => (
                  <TableRow key={row.departmentId}>
                    <TableCell>{row.departmentName}</TableCell>
                    <TableCell align='right'>
                      {row.totalRequests.toLocaleString()}
                    </TableCell>
                    <TableCell align='right'>{row.pendingRequests}</TableCell>
                    <TableCell align='right'>{row.approvedRequests}</TableCell>
                    <TableCell align='right'>{row.completedRequests}</TableCell>
                    {showCompletionRate && (
                      <TableCell align='right'>
                        <Chip
                          label={`${row.completionRate.toFixed(1)}%`}
                          color={getCompletionRateColor(row.completionRate)}
                          size='small'
                        />
                      </TableCell>
                    )}
                    {showProcessingTime && (
                      <TableCell align='right'>
                        <Chip
                          label={`${row.averageProcessingTime.toFixed(1)}h`}
                          color={getProcessingTimeColor(
                            row.averageProcessingTime
                          )}
                          size='small'
                        />
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width='100%' height={height - 100}>
            <PieChart>
              <Pie
                data={data}
                cx='50%'
                cy='50%'
                labelLine={false}
                outerRadius={Math.min(height / 4, 120)}
                fill='#8884d8'
                dataKey='totalRequests'
                nameKey='departmentName'
              >
                {data.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'bar':
      default:
        return (
          <ResponsiveContainer width='100%' height={height - 100}>
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='departmentName' fontSize={12} />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar
                dataKey='totalRequests'
                fill={COLORS[0]}
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey='pendingRequests'
                fill={COLORS[1]}
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey='approvedRequests'
                fill={COLORS[2]}
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey='completedRequests'
                fill={COLORS[3]}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
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
          <ToggleButton value='bar' aria-label='bar chart'>
            <BarChartIcon fontSize='small' />
          </ToggleButton>
          <ToggleButton value='pie' aria-label='pie chart'>
            <PieChartIcon fontSize='small' />
          </ToggleButton>
          <ToggleButton value='table' aria-label='table view'>
            <TableChart fontSize='small' />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
      {renderContent()}
    </Paper>
  );
};

export default DepartmentAnalyticsChart;
