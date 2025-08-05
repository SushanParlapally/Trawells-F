import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
import type { TableColumn } from '../../../types/table';

interface VirtualizedTableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  rowHeight?: number;
  containerHeight?: number;
  overscan?: number;
  loading?: boolean;
  emptyText?: string;
  onRowClick?: (record: T, index: number) => void;
  rowKey?: string | ((record: T) => string | number);
}

const VirtualizedTable = <T extends Record<string, unknown>>({
  columns,
  data,
  rowHeight = 52,
  containerHeight = 400,
  overscan = 5,
  loading = false,
  emptyText = 'No data available',
  onRowClick,
  rowKey = 'id',
}: VirtualizedTableProps<T>) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const startIndex = Math.max(
      0,
      Math.floor(scrollTop / rowHeight) - overscan
    );
    const endIndex = Math.min(
      data.length - 1,
      Math.ceil((scrollTop + containerHeight) / rowHeight) + overscan
    );
    return { startIndex, endIndex };
  }, [scrollTop, rowHeight, containerHeight, overscan, data.length]);

  // Get visible items
  const visibleItems = useMemo(() => {
    return data.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
  }, [data, visibleRange]);

  // Handle scroll
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  // Get row key
  const getRowKey = useCallback(
    (record: T, index: number): string | number => {
      if (typeof rowKey === 'function') {
        return rowKey(record);
      }
      const value = (record as Record<string, unknown>)[rowKey];
      return value !== undefined ? String(value) : index;
    },
    [rowKey]
  );

  // Render cell content
  const renderCell = useCallback(
    (column: TableColumn<T>, record: T, index: number) => {
      const value = (record as Record<string, unknown>)[column.key];
      if (column.render) {
        return column.render(value as string | number | boolean, record, index);
      }
      return value as React.ReactNode;
    },
    []
  );

  // Total height of all rows
  const totalHeight = data.length * rowHeight;
  // Offset for visible items
  const offsetY = visibleRange.startIndex * rowHeight;

  if (loading) {
    return (
      <Paper sx={{ height: containerHeight }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
          }}
        >
          <CircularProgress />
        </Box>
      </Paper>
    );
  }

  if (data.length === 0) {
    return (
      <Paper sx={{ height: containerHeight }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
          }}
        >
          <Typography color='text.secondary'>{emptyText}</Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper sx={{ height: containerHeight, overflow: 'hidden' }}>
      <TableContainer
        ref={containerRef}
        sx={{ height: '100%', overflow: 'auto' }}
        onScroll={handleScroll}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map(column => (
                <TableCell
                  key={column.key}
                  align={column.align || 'left'}
                  sx={{
                    fontWeight: 600,
                    ...(column.width && { width: column.width }),
                  }}
                >
                  {column.title}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {/* Spacer for rows above visible area */}
            {offsetY > 0 && (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  sx={{ height: offsetY, padding: 0, border: 'none' }}
                />
              </TableRow>
            )}
            {/* Visible rows */}
            {visibleItems.map((record, index) => {
              const actualIndex = visibleRange.startIndex + index;
              const key = getRowKey(record, actualIndex);

              return (
                <TableRow
                  key={key}
                  hover={!!onRowClick}
                  sx={{
                    height: rowHeight,
                    cursor: onRowClick ? 'pointer' : 'default',
                  }}
                  onClick={() => onRowClick?.(record, actualIndex)}
                >
                  {columns.map(column => (
                    <TableCell
                      key={column.key}
                      align={column.align || 'left'}
                      sx={{ height: rowHeight }}
                    >
                      {renderCell(column, record, actualIndex)}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
            {/* Spacer for rows below visible area */}
            {totalHeight - offsetY - visibleItems.length * rowHeight > 0 && (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  sx={{
                    height:
                      totalHeight - offsetY - visibleItems.length * rowHeight,
                    padding: 0,
                    border: 'none',
                  }}
                />
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default VirtualizedTable;
