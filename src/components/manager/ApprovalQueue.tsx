import React, { useState, useCallback } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip,
  Stack,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Visibility as ViewIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';

import { DataTable } from '../common/Tables';
import type {
  TravelRequestDto,
  TableColumn,
  PaginationConfig,
} from '../../types';

interface ApprovalQueueProps {
  requests: TravelRequestDto[];
  loading: boolean;
  pagination: PaginationConfig;
  onPaginationChange: (pagination: PaginationConfig) => void;
  onApproveRequest: (requestId: number, comments?: string) => Promise<void>;
  onRejectRequest: (requestId: number, comments?: string) => Promise<void>;
}

const ApprovalQueue: React.FC<ApprovalQueueProps> = ({
  requests,
  loading,
  pagination,
  onPaginationChange,
  onApproveRequest,
  onRejectRequest,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [approvingRequest, setApprovingRequest] = useState<number | null>(null);
  const [rejectingRequest, setRejectingRequest] = useState<number | null>(null);

  // Filter requests based on search and filters
  const filteredRequests = requests.filter(request => {
    const matchesSearch =
      !searchTerm ||
      request.user?.firstName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      request.user?.lastName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      request.project?.projectName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      request.reasonForTravel?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || request.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setStatusFilter('all');
  }, []);

  // Handle approve request
  const handleApprove = async (requestId: number) => {
    setApprovingRequest(requestId);
    try {
      await onApproveRequest(requestId);
    } finally {
      setApprovingRequest(null);
    }
  };

  // Handle reject request
  const handleReject = async (requestId: number) => {
    setRejectingRequest(requestId);
    try {
      await onRejectRequest(requestId);
    } finally {
      setRejectingRequest(null);
    }
  };

  // Get status chip color
  const getStatusColor = (
    status: string
  ):
    | 'default'
    | 'primary'
    | 'secondary'
    | 'error'
    | 'info'
    | 'success'
    | 'warning' => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'warning';
      case 'approved':
        return 'success';
      case 'rejected':
      case 'disapproved':
        return 'error';
      case 'returned to employee':
        return 'info';
      case 'completed':
      case 'booked':
        return 'default';
      default:
        return 'default';
    }
  };

  // Table columns configuration
  const columns: TableColumn<TravelRequestDto>[] = [
    {
      key: 'travelRequestId',
      title: 'Request ID',
      sortable: true,
      width: 120,
    },
    {
      key: 'employeeName',
      title: 'Employee',
      render: (_, record) => (
        <Box>
          <Typography variant='body2' fontWeight='medium'>
            {record.user?.firstName} {record.user?.lastName}
          </Typography>
          <Typography variant='caption' color='text.secondary'>
            {record.user?.department?.departmentName || 'N/A'}
          </Typography>
        </Box>
      ),
      width: 200,
    },
    {
      key: 'project',
      title: 'Project',
      render: (_, record) => record.project?.projectName || 'N/A',
      sortable: true,
      width: 150,
    },
    {
      key: 'reasonForTravel',
      title: 'Reason',
      render: (_, record) => (
        <Typography variant='body2' noWrap title={record.reasonForTravel}>
          {record.reasonForTravel}
        </Typography>
      ),
      width: 200,
    },
    {
      key: 'travelDates',
      title: 'Travel Dates',
      render: (_, record) => (
        <Box>
          <Typography variant='body2'>
            {new Date(record.fromDate).toLocaleDateString()}
          </Typography>
          <Typography variant='caption' color='text.secondary'>
            to {new Date(record.toDate).toLocaleDateString()}
          </Typography>
        </Box>
      ),
      width: 140,
    },
    {
      key: 'locations',
      title: 'Locations',
      render: (_, record) => (
        <Box>
          <Typography variant='body2'>
            {record.fromLocation} → {record.toLocation}
          </Typography>
        </Box>
      ),
      width: 150,
    },
    {
      key: 'status',
      title: 'Status',
      render: (_, record) => (
        <Chip
          label={record.status.toUpperCase()}
          size='small'
          color={getStatusColor(record.status)}
        />
      ),
      sortable: true,
      width: 100,
    },
    {
      key: 'createdOn',
      title: 'Submitted',
      render: (_, record) => {
        // Use fromDate as fallback since TravelRequestDto doesn't have createdOn
        const dateToShow = record.fromDate;
        return dateToShow ? new Date(dateToShow).toLocaleDateString() : 'N/A';
      },
      sortable: true,
      width: 100,
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_, record) => (
        <Stack direction='row' spacing={1}>
          <Tooltip title='View Details'>
            <IconButton size='small'>
              <ViewIcon fontSize='small' />
            </IconButton>
          </Tooltip>
          {record.status === 'Pending' && (
            <>
              <Tooltip title='Approve Request'>
                <IconButton
                  size='small'
                  onClick={() => handleApprove(record.travelRequestId)}
                  disabled={approvingRequest === record.travelRequestId}
                >
                  <CheckCircleIcon fontSize='small' color='success' />
                </IconButton>
              </Tooltip>
              <Tooltip title='Reject Request'>
                <IconButton
                  size='small'
                  onClick={() => handleReject(record.travelRequestId)}
                  disabled={rejectingRequest === record.travelRequestId}
                >
                  <CancelIcon fontSize='small' color='error' />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Stack>
      ),
      width: 100,
    },
  ];

  return (
    <Card>
      <CardContent>
        <Box
          display='flex'
          justifyContent='space-between'
          alignItems='center'
          mb={2}
        >
          <Box>
            <Typography variant='h6' gutterBottom>
              Travel Requests
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Review and approve/reject travel requests from your team members.
            </Typography>
          </Box>
          <Typography variant='body2' color='text.secondary'>
            {filteredRequests.length} of {requests.length} requests
          </Typography>
        </Box>

        {/* Filters */}
        <Box display='flex' gap={2} mb={3} flexWrap='wrap'>
          <TextField
            size='small'
            placeholder='Search by employee, project, or reason...'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <SearchIcon fontSize='small' />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 300 }}
          />
          <FormControl size='small' sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label='Status'
              onChange={e => setStatusFilter(e.target.value)}
            >
              <MenuItem value='all'>All Status</MenuItem>
              <MenuItem value='Pending'>Pending</MenuItem>
              <MenuItem value='Approved'>Approved</MenuItem>
              <MenuItem value='Rejected'>Rejected</MenuItem>
              <MenuItem value='Returned to Employee'>
                Returned to Employee
              </MenuItem>
              <MenuItem value='Completed'>Completed</MenuItem>
              <MenuItem value='Booked'>Booked</MenuItem>
            </Select>
          </FormControl>
          {(searchTerm || statusFilter !== 'all') && (
            <Button
              size='small'
              startIcon={<ClearIcon />}
              onClick={clearFilters}
              variant='outlined'
            >
              Clear Filters
            </Button>
          )}
        </Box>

        <DataTable<TravelRequestDto>
          columns={columns}
          data={filteredRequests}
          loading={loading}
          pagination={pagination}
          onPaginationChange={(page, pageSize) =>
            onPaginationChange({
              page,
              pageSize,
              total: filteredRequests.length,
            })
          }
          exportable
          exportFileName='travel-requests'
          rowKey='travelRequestId'
          emptyText='No travel requests found'
        />
      </CardContent>
    </Card>
  );
};

export default ApprovalQueue;
