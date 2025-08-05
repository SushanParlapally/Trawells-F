import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Divider,
} from '@mui/material';
import {
  Assignment as RequestIcon,
  CheckCircle as ApprovedIcon,
  Cancel as RejectedIcon,
  Pending as PendingIcon,
} from '@mui/icons-material';

import type { TravelRequestDto } from '../../types';

interface RecentActivitiesProps {
  requests: TravelRequestDto[];
  maxItems?: number;
}

const RecentActivities: React.FC<RecentActivitiesProps> = ({
  requests,
  maxItems = 10,
}) => {
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return <ApprovedIcon />;
      case 'rejected':
        return <RejectedIcon />;
      case 'pending':
        return <PendingIcon />;
      default:
        return <RequestIcon />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusChip = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pending', color: 'warning' as const },
      approved: { label: 'Approved', color: 'success' as const },
      rejected: { label: 'Rejected', color: 'error' as const },
      completed: { label: 'Completed', color: 'info' as const },
    };

    const config = statusConfig[
      status.toLowerCase() as keyof typeof statusConfig
    ] || { label: status, color: 'default' as const };
    return <Chip label={config.label} color={config.color} size='small' />;
  };

  const formatTimestamp = (dateString: string) => {
    const timestamp = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return timestamp.toLocaleDateString();
  };

  // Sort requests by date and take the most recent
  const sortedRequests = [...requests]
    .sort(
      (a, b) => new Date(b.fromDate).getTime() - new Date(a.fromDate).getTime()
    )
    .slice(0, maxItems);

  return (
    <Card>
      <CardContent>
        <Typography variant='h6' gutterBottom>
          Recent Activities
        </Typography>

        {sortedRequests.length === 0 ? (
          <Typography
            variant='body2'
            color='text.secondary'
            sx={{ py: 4, textAlign: 'center' }}
          >
            No recent travel requests to display
          </Typography>
        ) : (
          <List disablePadding>
            {sortedRequests.map((request, index) => (
              <React.Fragment key={request.travelRequestId}>
                <ListItem alignItems='flex-start' sx={{ px: 0 }}>
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        bgcolor: `${getStatusColor(request.status)}.main`,
                        width: 40,
                        height: 40,
                      }}
                    >
                      {getStatusIcon(request.status)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          mb: 0.5,
                        }}
                      >
                        <Typography variant='subtitle2' component='span'>
                          Travel Request #{request.travelRequestId}
                        </Typography>
                        {getStatusChip(request.status)}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography
                          variant='body2'
                          color='text.secondary'
                          sx={{ mb: 0.5 }}
                        >
                          {request.fromLocation} → {request.toLocation}
                        </Typography>
                        <Typography
                          variant='body2'
                          color='text.secondary'
                          sx={{ mb: 0.5 }}
                        >
                          {request.reasonForTravel}
                        </Typography>
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                          <Typography variant='caption' color='text.secondary'>
                            by {request.user.firstName} {request.user.lastName}
                          </Typography>
                          <Typography variant='caption' color='text.secondary'>
                            {formatTimestamp(request.fromDate)}
                          </Typography>
                        </Box>
                      </Box>
                    }
                  />
                </ListItem>
                {index < sortedRequests.length - 1 && (
                  <Divider variant='inset' component='li' />
                )}
              </React.Fragment>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivities;
