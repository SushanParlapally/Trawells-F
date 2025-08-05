import React, { useEffect, useState } from 'react';
import { Box, Typography, Chip, Paper } from '@mui/material';
import { useMemoryMonitor } from '../../utils/performance';

interface PerformanceMemory {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

interface PerformanceMetrics {
  memoryUsage: {
    used: number;
    total: number;
    limit: number;
  } | null;
  renderTime: number;
  componentCount: number;
}

interface PerformanceMonitorProps {
  enabled?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  enabled = import.meta.env.DEV,
  position = 'bottom-right',
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    memoryUsage: null,
    renderTime: 0,
    componentCount: 0,
  });

  useMemoryMonitor();

  useEffect(() => {
    if (!enabled) return;

    const updateMetrics = () => {
      const memory = (performance as { memory?: PerformanceMemory }).memory;
      if (memory) {
        setMetrics(prev => ({
          ...prev,
          memoryUsage: {
            used: Math.round(memory.usedJSHeapSize / 1048576),
            total: Math.round(memory.totalJSHeapSize / 1048576),
            limit: Math.round(memory.jsHeapSizeLimit / 1048576),
          },
        }));
      }
    };

    const interval = setInterval(updateMetrics, 2000);
    updateMetrics();

    return () => clearInterval(interval);
  }, [enabled]);

  if (!enabled) return null;

  const getPositionStyles = () => {
    const baseStyles = {
      position: 'fixed' as const,
      zIndex: 9999,
      padding: 1,
      minWidth: 200,
    };

    switch (position) {
      case 'top-left':
        return { ...baseStyles, top: 16, left: 16 };
      case 'top-right':
        return { ...baseStyles, top: 16, right: 16 };
      case 'bottom-left':
        return { ...baseStyles, bottom: 16, left: 16 };
      case 'bottom-right':
      default:
        return { ...baseStyles, bottom: 16, right: 16 };
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        ...getPositionStyles(),
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        fontSize: '0.75rem',
        fontFamily: 'monospace',
      }}
    >
      <Box sx={{ p: 1 }}>
        <Typography variant='caption' sx={{ display: 'block', mb: 1 }}>
          Performance Monitor
        </Typography>
        {metrics.memoryUsage && (
          <Box sx={{ mb: 1 }}>
            <Typography variant='caption' sx={{ display: 'block' }}>
              Memory: {metrics.memoryUsage.used}MB / {metrics.memoryUsage.total}
              MB
            </Typography>
            <Typography variant='caption' sx={{ display: 'block' }}>
              Limit: {metrics.memoryUsage.limit}MB
            </Typography>
          </Box>
        )}
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          <Chip
            label={`Render: ${metrics.renderTime}ms`}
            size='small'
            sx={{ fontSize: '0.6rem', height: 16 }}
          />
          <Chip
            label={`Components: ${metrics.componentCount}`}
            size='small'
            sx={{ fontSize: '0.6rem', height: 16 }}
          />
        </Box>
      </Box>
    </Paper>
  );
};

export default PerformanceMonitor;
