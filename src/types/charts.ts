// Chart type definitions for Recharts components

// Recharts tooltip types
export interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    dataKey: string;
    name: string;
    color: string;
    payload: Record<string, unknown>;
  }>;
  label?: string;
}

export interface PieTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    dataKey: string;
    name: string;
    color: string;
    payload: Record<string, unknown>;
  }>;
}

export interface LabelProps {
  cx?: number;
  cy?: number;
  midAngle?: number;
  innerRadius?: number;
  outerRadius?: number;
  percent?: number;
  index?: number;
}

export interface LegendFormatterProps {
  value: string;
  entry: {
    color: string;
    payload: Record<string, unknown>;
  };
}

// Chart data types
export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: unknown;
}

export interface TimeSeriesDataPoint {
  period: string;
  value: number;
  [key: string]: unknown;
}

export interface StatusDataPoint {
  status: string;
  count: number;
  percentage: number;
  color: string;
}

export interface DepartmentDataPoint {
  departmentId: number;
  departmentName: string;
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  completedRequests: number;
  averageProcessingTime: number;
  completionRate: number;
}

export interface PerformanceMetricDataPoint {
  name: string;
  value: number;
  target: number;
  unit: string;
  trend?: {
    direction: 'up' | 'down' | 'flat';
    percentage: number;
  };
}

export interface TrendDataPoint {
  period: string;
  value: number;
  prediction?: number;
  upperBound?: number;
  lowerBound?: number;
  [key: string]: unknown;
}

// Chart component props
export interface ChartComponentProps {
  data: ChartDataPoint[];
  title?: string;
  height?: number;
  width?: string | number;
  [key: string]: unknown;
}

// Event handler types
export interface ChartEventHandlers {
  onTimeRangeChange?: (range: '7d' | '30d' | '90d' | '1y') => void;
  onMetricChange?: (metric: string) => void;
  onViewTypeChange?: (viewType: string) => void;
  onClick?: (data: ChartDataPoint) => void;
}

// Material-UI component props
export interface MUIComponentProps {
  size?: 'small' | 'medium' | 'large';
  color?:
    | 'primary'
    | 'secondary'
    | 'success'
    | 'warning'
    | 'error'
    | 'info'
    | 'default';
  variant?: 'text' | 'outlined' | 'contained';
  disabled?: boolean;
  [key: string]: unknown;
}
