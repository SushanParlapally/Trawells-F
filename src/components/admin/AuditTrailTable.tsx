import React, { useState, useEffect, useCallback } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  CircularProgress,
  Alert,
  TablePagination,
} from '@mui/material';
import { auditService } from '../../services/api/auditService';

interface AuditLog {
  id: number;
  userId: number;
  actionType: string;
  entityName: string;
  entityId: number;
  timestamp: string;
  changes: string | null;
}

const AuditTrailTable: React.FC = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const fetchAuditLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await auditService.getAuditLogs(page + 1, rowsPerPage);
      setAuditLogs(response.auditLogs);
      setTotalCount(response.totalCount);
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
      setError('Failed to load audit logs. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage]);

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 200,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity='error'>{error}</Alert>;
  }

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <Typography variant='h6' component='div' sx={{ p: 2 }}>
        Audit Trail
      </Typography>
      <TableContainer sx={{ maxHeight: 600 }}>
        <Table stickyHeader aria-label='audit log table'>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>User ID</TableCell>
              <TableCell>Action Type</TableCell>
              <TableCell>Entity Name</TableCell>
              <TableCell>Entity ID</TableCell>
              <TableCell>Timestamp</TableCell>
              <TableCell>Changes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {auditLogs.map(log => (
              <TableRow key={log.id}>
                <TableCell>{log.id}</TableCell>
                <TableCell>{log.userId}</TableCell>
                <TableCell>{log.actionType}</TableCell>
                <TableCell>{log.entityName}</TableCell>
                <TableCell>{log.entityId}</TableCell>
                <TableCell>
                  {new Date(log.timestamp).toLocaleString()}
                </TableCell>
                <TableCell sx={{ maxWidth: 300, wordBreak: 'break-all' }}>
                  <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
                    {log.changes}
                  </pre>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component='div'
        count={totalCount}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

export default AuditTrailTable;
