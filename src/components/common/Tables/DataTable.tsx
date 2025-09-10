import { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Box,
  Typography,
} from '@mui/material';
import type { TableProps, SortConfig } from '../../../types/table';
import { TableToolbar } from './TableToolbar';
import { Pagination } from './Pagination';

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  loading = false,
  pagination,
  onPaginationChange,
  onSort,
  searchable = false,
  searchPlaceholder = 'Search...',
  exportable = false,
  exportFileName = 'data',
  rowKey,
}: TableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;

    return data.filter(item =>
      Object.values(item).some(value =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [data, searchTerm]);

  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key as keyof T];
      const bValue = b[sortConfig.key as keyof T];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      const compareA = String(aValue).toLowerCase();
      const compareB = String(bValue).toLowerCase();

      if (compareA < compareB) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (compareA > compareB) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredData, sortConfig]);

  const handleSort = (columnKey: keyof T) => {
    const column = columns.find(col => col.key === columnKey);
    if (!column?.sortable) return;

    const newSortConfig: SortConfig = {
      key: String(columnKey),
      direction:
        sortConfig?.key === String(columnKey) && sortConfig.direction === 'asc'
          ? 'desc'
          : 'asc',
    };

    setSortConfig(newSortConfig);
    onSort?.(newSortConfig);
  };

  const handlePageChange = (page: number, pageSize: number) => {
    onPaginationChange?.(page, pageSize);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleExport = () => {
    const headers = columns.map(col => String(col.key)).join(',');
    const rows = sortedData
      .map(item => columns.map(col => String(item[col.key] || '')).join(','))
      .join('\n');

    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${exportFileName}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getSortDirection = (columnKey: string) => {
    if (sortConfig?.key === columnKey) {
      return sortConfig.direction;
    }
    return undefined;
  };

  if (loading) {
    return (
      <Box
        display='flex'
        justifyContent='center'
        alignItems='center'
        minHeight={200}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper>
      {(searchable || exportable) && (
        <TableToolbar
          onSearch={handleSearch}
          onExport={exportable ? handleExport : undefined}
          searchPlaceholder={searchPlaceholder}
        />
      )}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map(column => (
                <TableCell
                  key={String(column.key)}
                  align={column.align || 'left'}
                  sx={{
                    width: column.width,
                    cursor: column.sortable ? 'pointer' : 'default',
                    userSelect: 'none',
                  }}
                  sortDirection={getSortDirection(String(column.key))}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  {column.title}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align='center'>
                  <Typography variant='body2' color='text.secondary'>
                    No data available
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map((item, index) => (
                <TableRow key={String(item[rowKey])} hover>
                  {columns.map(column => (
                    <TableCell
                      key={String(column.key)}
                      align={column.align || 'left'}
                    >
                      {column.render
                        ? column.render(
                            item[column.key] as string | number | boolean,
                            item,
                            index
                          )
                        : String(item[column.key] || '')}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {pagination && (
        <Pagination
          page={pagination.page}
          pageSize={pagination.pageSize}
          total={pagination.total}
          onPageChange={handlePageChange}
        />
      )}
    </Paper>
  );
}
