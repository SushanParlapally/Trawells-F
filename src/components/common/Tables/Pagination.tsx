import React from 'react';
import { Box, TablePagination, Typography } from '@mui/material';

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number, pageSize: number) => void;
  pageSizeOptions?: number[];
  showSizeChanger?: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({
  page,
  pageSize,
  total,
  onPageChange,
  pageSizeOptions = [10, 20, 50, 100],
  showSizeChanger = true,
}) => {
  const handleChangePage = (_event: unknown, newPage: number) => {
    onPageChange(newPage + 1, pageSize); // MUI uses 0-based indexing
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newPageSize = parseInt(event.target.value, 10);
    onPageChange(1, newPageSize); // Reset to first page when changing page size
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: 1,
      }}
    >
      <Typography variant='body2' color='text.secondary'>
        Showing {Math.min((page - 1) * pageSize + 1, total)} to{' '}
        {Math.min(page * pageSize, total)} of {total} entries
      </Typography>

      <TablePagination
        component='div'
        count={total}
        page={page - 1} // MUI uses 0-based indexing
        onPageChange={handleChangePage}
        rowsPerPage={pageSize}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={showSizeChanger ? pageSizeOptions : []}
        showFirstButton
        showLastButton
      />
    </Box>
  );
};

export default Pagination;
