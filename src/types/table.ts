import React from 'react';

// Table-specific type definitions

export interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
  };
  onPaginationChange?: (page: number, pageSize: number) => void;
  onSort?: (sortConfig: SortConfig) => void;
  searchable?: boolean;
  searchPlaceholder?: string;
  exportable?: boolean;
  exportFileName?: string;
  rowKey: keyof T;
  selectable?: boolean;
  selectedRows?: string[] | number[];
  onSelectionChange?: (selectedRows: string[] | number[]) => void;
  emptyText?: string;
}

export interface TableColumn<T> {
  key: keyof T;
  title: React.ReactNode;
  sortable?: boolean;
  width?: number;
  align?: 'left' | 'center' | 'right';
  render?: (
    value: string | number | boolean,
    item: T,
    index: number
  ) => React.ReactNode;
  fixed?: 'left' | 'right';
}

export interface PaginationConfig {
  page: number;
  pageSize: number;
  total: number;
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
  showTotal?: boolean;
  pageSizeOptions?: number[];
}

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

export interface FilterConfig {
  key: string;
  value: string | number | boolean;
  operator:
    | 'eq'
    | 'ne'
    | 'gt'
    | 'lt'
    | 'gte'
    | 'lte'
    | 'contains'
    | 'startsWith'
    | 'endsWith';
}

export interface TableState<T> {
  loading: boolean;
  data: T[];
  pagination: PaginationConfig;
  sortConfig: SortConfig | null;
  filters: FilterConfig[];
  selectedRows: string[] | number[];
  searchTerm: string;
}

export interface TableAction<T> {
  key: string;
  label: string;
  icon?: React.ReactNode;
  onClick: (record: T) => void;
  disabled?: (record: T) => boolean;
  visible?: (record: T) => boolean;
  type?: 'primary' | 'default' | 'danger';
}

export interface BulkAction<T> {
  key: string;
  label: string;
  icon?: React.ReactNode;
  onClick: (selectedRows: T[]) => void;
  disabled?: (selectedRows: T[]) => boolean;
  type?: 'primary' | 'default' | 'danger';
}

export interface TableToolbarProps<T> {
  title?: string;
  actions?: React.ReactNode;
  bulkActions?: BulkAction<T>[];
  selectedCount?: number;
  searchable?: boolean;
  searchValue?: string;
  onSearch?: (value: string) => void;
  exportable?: boolean;
  onExport?: () => void;
  refreshable?: boolean;
  onRefresh?: () => void;
}

export interface VirtualTableProps<T> extends TableProps<T> {
  height: number;
  itemHeight: number;
  overscan?: number;
}
