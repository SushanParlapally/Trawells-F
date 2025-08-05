import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer,
} from 'recharts';
import { Box, Typography, Paper } from '@mui/material';
import type {
  User,
  Department,
  Project,
  TravelRequestDto,
} from '../../../types';

interface SystemStatsChartsProps {
  users: User[];
  departments: Department[];
  projects: Project[];
  requests: TravelRequestDto[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const SystemStatsCharts: React.FC<SystemStatsChartsProps> = ({
  users,
  departments,
  projects,
  requests,
}) => {
  // Prepare data for charts from actual backend data
  const statusData = requests.reduce((acc: Record<string, number>, request) => {
    acc[request.status] = (acc[request.status] || 0) + 1;
    return acc;
  }, {});

  const statusChartData = Object.entries(statusData).map(([status, count]) => ({
    status: status.charAt(0).toUpperCase() + status.slice(1),
    count,
  }));

  const departmentData = departments.map(dept => ({
    department: dept.departmentName,
    count: requests.filter(
      req => req.user.department.departmentId === dept.departmentId
    ).length,
  }));

  // Create monthly data from requests
  const monthlyData = requests.reduce(
    (acc: Record<string, number>, request) => {
      const month = new Date(request.fromDate).toLocaleDateString('en-US', {
        month: 'short',
        year: '2-digit',
      });
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    },
    {}
  );

  const monthlyChartData = Object.entries(monthlyData).map(
    ([month, count]) => ({
      month,
      count,
    })
  );

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
        gap: 3,
      }}
    >
      {/* Request Status Distribution */}
      <Paper sx={{ p: 3, height: 400 }}>
        <Typography variant='h6' gutterBottom>
          Requests by Status
        </Typography>
        <ResponsiveContainer width='100%' height={300}>
          <PieChart>
            <Pie
              data={statusChartData}
              cx='50%'
              cy='50%'
              labelLine={false}
              label={({ status, percent }) =>
                `${status} ${((percent || 0) * 100).toFixed(0)}%`
              }
              outerRadius={80}
              fill='#8884d8'
              dataKey='count'
            >
              {statusChartData.map((_entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </Paper>

      {/* Department Distribution */}
      <Paper sx={{ p: 3, height: 400 }}>
        <Typography variant='h6' gutterBottom>
          Requests by Department
        </Typography>
        <ResponsiveContainer width='100%' height={300}>
          <BarChart data={departmentData}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis
              dataKey='department'
              angle={-45}
              textAnchor='end'
              height={80}
            />
            <YAxis />
            <Tooltip />
            <Bar dataKey='count' fill='#8884d8' />
          </BarChart>
        </ResponsiveContainer>
      </Paper>

      {/* Monthly Trend */}
      <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
        <Paper sx={{ p: 3, height: 400 }}>
          <Typography variant='h6' gutterBottom>
            Monthly Request Trend
          </Typography>
          <ResponsiveContainer width='100%' height={300}>
            <LineChart data={monthlyChartData}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='month' />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type='monotone'
                dataKey='count'
                stroke='#8884d8'
                strokeWidth={2}
                dot={{ fill: '#8884d8' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Paper>
      </Box>

      {/* Top Departments */}
      <Paper sx={{ p: 3, height: 400 }}>
        <Typography variant='h6' gutterBottom>
          Top Departments by Requests
        </Typography>
        <ResponsiveContainer width='100%' height={300}>
          <BarChart data={departmentData.slice(0, 5)} layout='horizontal'>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis type='number' />
            <YAxis dataKey='department' type='category' width={100} />
            <Tooltip />
            <Bar dataKey='count' fill='#00C49F' />
          </BarChart>
        </ResponsiveContainer>
      </Paper>

      {/* Key Metrics */}
      <Paper sx={{ p: 3, height: 400 }}>
        <Typography variant='h6' gutterBottom>
          Key Performance Metrics
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant='body2' color='text.secondary'>
              Total Users
            </Typography>
            <Typography variant='h4' color='primary'>
              {users.length}
            </Typography>
          </Box>
          <Box sx={{ mb: 3 }}>
            <Typography variant='body2' color='text.secondary'>
              Total Requests
            </Typography>
            <Typography variant='h4' color='primary'>
              {requests.length}
            </Typography>
          </Box>
          <Box sx={{ mb: 3 }}>
            <Typography variant='body2' color='text.secondary'>
              Active Projects
            </Typography>
            <Typography variant='h4' color='success.main'>
              {projects.length}
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default SystemStatsCharts;
