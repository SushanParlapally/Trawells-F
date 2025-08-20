/**
 * Utility functions for formatting data display values
 */

/**
 * Format a value for display, showing "--" for zero, null, or undefined values
 */
export const formatDisplayValue = (
  value: string | number | null | undefined,
  options?: {
    showZero?: boolean; // If true, shows "0" instead of "--" for zero values
    fallback?: string; // Custom fallback text instead of "--"
  }
): string => {
  const { showZero = false, fallback = '--' } = options || {};

  // Handle null, undefined, or empty string
  if (value === null || value === undefined || value === '') {
    return fallback;
  }

  // Handle zero values
  if (value === 0 && !showZero) {
    return fallback;
  }

  // Handle string values
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed === '' || (trimmed === '0' && !showZero)) {
      return fallback;
    }
    return trimmed;
  }

  // Handle number values
  if (typeof value === 'number') {
    if (value === 0 && !showZero) {
      return fallback;
    }
    return value.toString();
  }

  return String(value);
};

/**
 * Format a number for display with proper formatting
 */
export const formatNumber = (
  value: number | null | undefined,
  options?: {
    decimals?: number;
    showZero?: boolean;
    fallback?: string;
  }
): string => {
  const { decimals = 0, showZero = false, fallback = '--' } = options || {};

  if (value === null || value === undefined) {
    return fallback;
  }

  if (value === 0 && !showZero) {
    return fallback;
  }

  return value.toFixed(decimals);
};

/**
 * Format a percentage for display
 */
export const formatPercentage = (
  value: number | null | undefined,
  options?: {
    decimals?: number;
    showZero?: boolean;
    fallback?: string;
  }
): string => {
  const { decimals = 1, showZero = false, fallback = '--' } = options || {};

  if (value === null || value === undefined) {
    return fallback;
  }

  if (value === 0 && !showZero) {
    return fallback;
  }

  return `${value.toFixed(decimals)}%`;
};

/**
 * Format currency for display
 */
export const formatCurrency = (
  value: number | null | undefined,
  options?: {
    currency?: string;
    showZero?: boolean;
    fallback?: string;
  }
): string => {
  const { currency = 'USD', showZero = false, fallback = '--' } = options || {};

  if (value === null || value === undefined) {
    return fallback;
  }

  if (value === 0 && !showZero) {
    return fallback;
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(value);
};

/**
 * Format time duration for display
 */
export const formatDuration = (
  hours: number | null | undefined,
  options?: {
    showZero?: boolean;
    fallback?: string;
  }
): string => {
  const { showZero = false, fallback = '--' } = options || {};

  if (hours === null || hours === undefined) {
    return fallback;
  }

  if (hours === 0 && !showZero) {
    return fallback;
  }

  if (hours < 1) {
    return `${Math.round(hours * 60)}m`;
  }

  if (hours < 24) {
    return `${hours.toFixed(1)}h`;
  }

  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;

  if (remainingHours === 0) {
    return `${days}d`;
  }

  return `${days}d ${remainingHours.toFixed(1)}h`;
};

/**
 * Format a date for display with fallback
 */
export const formatDate = (
  date: string | Date | null | undefined,
  options?: {
    format?: 'short' | 'long' | 'medium';
    fallback?: string;
  }
): string => {
  const { format = 'short', fallback = '--' } = options || {};

  if (!date) {
    return fallback;
  }

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) {
      return fallback;
    }

    switch (format) {
      case 'long':
        return dateObj.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      case 'medium':
        return dateObj.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
      case 'short':
      default:
        return dateObj.toLocaleDateString();
    }
  } catch (error) {
    console.error('Error formatting date:', error);
    return fallback;
  }
};
