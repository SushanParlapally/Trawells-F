import type { SortConfig, FilterConfig, TableColumn } from '../types/table';

// Table-specific export options
interface TableExportOptions {
  filename?: string;
  includeHeaders?: boolean;
}

/**
 * Sort data based on sort configuration
 */
export function sortData<T>(data: T[], sortConfig: SortConfig): T[] {
  if (!sortConfig.direction || !sortConfig.key) {
    return data;
  }

  return [...data].sort((a, b) => {
    const aValue = getNestedValue(a, sortConfig.key);
    const bValue = getNestedValue(b, sortConfig.key);

    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;

    let comparison = 0;
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      comparison = aValue.localeCompare(bValue);
    } else if (typeof aValue === 'number' && typeof bValue === 'number') {
      comparison = aValue - bValue;
    } else if (aValue instanceof Date && bValue instanceof Date) {
      comparison = aValue.getTime() - bValue.getTime();
    } else {
      comparison = String(aValue).localeCompare(String(bValue));
    }

    return sortConfig.direction === 'desc' ? -comparison : comparison;
  });
}

/**
 * Filter data based on filter configuration
 */
export function filterData<T>(data: T[], filters: FilterConfig): T[] {
  return data.filter(item => {
    return Object.entries(filters).every(([key, value]) => {
      if (value === null || value === undefined || value === '') {
        return true;
      }

      const itemValue = getNestedValue(item, key);
      if (typeof value === 'string') {
        return String(itemValue).toLowerCase().includes(value.toLowerCase());
      }

      return itemValue === value;
    });
  });
}

/**
 * Search data based on search term across all searchable columns
 */
export function searchData<T>(
  data: T[],
  searchTerm: string,
  columns: TableColumn<T>[]
): T[] {
  if (!searchTerm.trim()) {
    return data;
  }

  const searchLower = searchTerm.toLowerCase();
  return data.filter(item => {
    return columns.some(column => {
      const value = getNestedValue(item, column.key);
      return String(value).toLowerCase().includes(searchLower);
    });
  });
}

/**
 * Get nested value from object using dot notation
 */
export function getNestedValue(obj: unknown, path: string): unknown {
  return path.split('.').reduce((current, key) => {
    if (current && typeof current === 'object' && key in current) {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

/**
 * Paginate data
 */
export function paginateData<T>(
  data: T[],
  page: number,
  pageSize: number
): T[] {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  return data.slice(startIndex, endIndex);
}

/**
 * Export data to CSV format
 */
export function exportToCSV<T>(
  data: T[],
  columns: TableColumn<T>[],
  options: TableExportOptions = {}
): void {
  const { filename = 'export.csv', includeHeaders = true } = options;
  const exportColumns = columns.filter(col => !col.render);

  let csvContent = '';

  // Add headers
  if (includeHeaders) {
    const headers = exportColumns.map(col => `"${col.title}"`).join(',');
    csvContent += headers + '\n';
  }

  // Add data rows
  data.forEach(row => {
    const values = exportColumns.map(col => {
      const value = getNestedValue(row, col.key);
      return `"${String(value || '').replace(/"/g, '""')}"`;
    });
    csvContent += values.join(',') + '\n';
  });

  // Download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Format cell value for display
 */
export function formatCellValue(
  value: unknown,
  _column: TableColumn<unknown>
): string {
  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number') {
    return value.toString();
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  if (value instanceof Date) {
    return value.toLocaleDateString();
  }

  if (Array.isArray(value)) {
    return value.join(', ');
  }

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  return String(value);
}

/**
 * Get responsive columns based on screen size
 */
export function getResponsiveColumns<T>(
  columns: TableColumn<T>[]
): TableColumn<T>[] {
  // Simplified responsive handling - return all columns
  // Backend doesn't support responsive column configuration
  return columns;
}

/**
 * Calculate pagination info
 */
export function calculatePaginationInfo(
  page: number,
  pageSize: number,
  total: number
) {
  const startIndex = (page - 1) * pageSize + 1;
  const endIndex = Math.min(page * pageSize, total);
  const totalPages = Math.ceil(total / pageSize);

  return {
    startIndex,
    endIndex,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

/**
 * Generate page numbers for pagination
 */
export function generatePageNumbers(
  currentPage: number,
  totalPages: number,
  maxVisible: number = 5
): number[] {
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const half = Math.floor(maxVisible / 2);
  let start = Math.max(1, currentPage - half);
  const end = Math.min(totalPages, start + maxVisible - 1);

  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }

  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}
