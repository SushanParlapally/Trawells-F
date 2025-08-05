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

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;

    return data.filter(item =>
      Object.values(item).some(value =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [data, searchTerm]);

  // Sort data based on sort configuration
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key] as unknown;
      const bValue = b[sortConfig.key] as unknown;

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredData, sortConfig]);

  const handleSort = (columnKey: string) => {
    const column = columns.find(col => col.key === columnKey);
    if (!column?.sortable) return;

    const newSortConfig: SortConfig = {
      key: columnKey,
      direction:
        sortConfig?.key === columnKey && sortConfig.direction === 'asc'
          ? 'desc'
          : 'asc',
    };

    setSortConfig(newSortConfig);
    onSort?.(newSortConfig);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleExport = () => {
    // Simple CSV export
    const headers = columns.map(col => col.key).join(',');
    const rows = sortedData
      .map(item =>
        columns
          .map(col => String((item as Record<string, unknown>)[col.key] || ''))
          .join(',')
      )
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
      <TableToolbar
        searchable={searchable}
        searchValue={searchTerm}
        onSearch={handleSearch}
        searchPlaceholder={searchPlaceholder}
        exportable={exportable}
        onExport={handleExport}
        selectedCount={0}
      />

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map(column => (
                <TableCell
                  key={column.key}
                  align={column.align || 'left'}
                  style={{ width: column.width }}
                  sortDirection={getSortDirection(column.key)}
                  onClick={() => handleSort(column.key)}
                  sx={{
                    cursor: column.sortable ? 'pointer' : 'default',
                    userSelect: 'none',
                  }}
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
                <TableRow
                  key={
                    String((item as Record<string, unknown>)[rowKey]) || index
                  }
                  hover
                >
                  {columns.map(column => (
                    <TableCell key={column.key} align={column.align || 'left'}>
                      {column.render
                        ? column.render(
                            (item as Record<string, unknown>)[column.key] as
                              | string
                              | number
                              | boolean,
                            item,
                            index
                          )
                        : String(
                            (item as Record<string, unknown>)[column.key] || ''
                          )}
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
          onPageChange={(page, pageSize) =>
            onPaginationChange?.(page, pageSize)
          }
        />
      )}
    </Paper>
  );
}

export default DataTable;
