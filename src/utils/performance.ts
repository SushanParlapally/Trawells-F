/// <reference lib="dom" />
import {
  useRef,
  useEffect,
  useCallback,
  useMemo,
  useState,
  type ComponentType,
  type DependencyList,
} from 'react';

// Performance monitoring utilities

interface PerformanceMemory {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

interface PerformanceBudget {
  [key: string]: number;
}

interface NetworkConnection {
  effectiveType: string;
  downlink: number;
  rtt: number;
  addEventListener: (event: string, callback: () => void) => void;
  removeEventListener: (event: string, callback: () => void) => void;
}

// Explicitly define IntersectionObserverInit if not recognized globally
interface IntersectionObserverInit {
  root?: Element | Document | null;
  rootMargin?: string;
  threshold?: number | number[];
}

export const usePerformanceMonitor = () => {
  // const timeoutRef = useRef<number | null>(null);

  const startTimeRef = useRef<number>(0);
  const measurementsRef = useRef<Map<string, number[]>>(new Map());

  const startMeasurement = useCallback(() => {
    startTimeRef.current = performance.now();
  }, []);

  const endMeasurement = useCallback((name: string) => {
    const endTime = performance.now();
    const duration = endTime - startTimeRef.current;

    if (!measurementsRef.current.has(name)) {
      measurementsRef.current.set(name, []);
    }
    measurementsRef.current.get(name)!.push(duration);
  }, []);

  const getAverageTime = useCallback((name: string): number => {
    const measurements = measurementsRef.current.get(name);

    if (!measurements || measurements.length === 0) {
      return 0;
    }
    const sum = measurements.reduce((acc, time) => acc + time, 0);
    return sum / measurements.length;
  }, []);

  const clearMeasurements = useCallback((name?: string) => {
    if (name) {
      measurementsRef.current.delete(name);
    } else {
      measurementsRef.current.clear();
    }
  }, []);

  return {
    startMeasurement,
    endMeasurement,
    getAverageTime,
    clearMeasurements,
  };
};

// Intersection Observer for lazy loading
export const useIntersectionObserver = (
  callback: (
    entries: IntersectionObserverEntry[],
    observer: IntersectionObserver
  ) => void,
  options: IntersectionObserverInit = {}
): IntersectionObserver | null => {
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(callback, options);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [callback, options]);

  return observerRef.current;
};

// Debounced function hook
export const useDebounce = <T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): T => {
  const timeoutRef = useRef<number | null>(null);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  ) as T;
};

// Throttled function hook
export const useThrottle = <T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): T => {
  const lastCallRef = useRef<number>(0);
  const timeoutRef = useRef<number | null>(null);

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();

      if (now - lastCallRef.current >= delay) {
        callback(...args);
        lastCallRef.current = now;
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(
          () => {
            callback(...args);
            lastCallRef.current = Date.now();
          },
          delay - (now - lastCallRef.current)
        );
      }
    },
    [callback, delay]
  ) as T;
};

export const useMemoryMonitor = () => {
  const [memoryInfo, setMemoryInfo] = useState<PerformanceMemory | null>(null);

  const updateMemoryInfo = useCallback(() => {
    if ('memory' in performance) {
      setMemoryInfo(
        (performance as unknown as { memory: PerformanceMemory }).memory
      );
    }
  }, []);

  useEffect(() => {
    updateMemoryInfo();
    const interval = setInterval(updateMemoryInfo, 5000);

    return () => clearInterval(interval);
  }, [updateMemoryInfo]);

  return memoryInfo;
};

// Component render performance tracking
export const useRenderTracker = (componentName: string) => {
  const renderCountRef = useRef<number>(0);
  const lastRenderTimeRef = useRef<number>(0);

  useEffect(() => {
    renderCountRef.current += 1;
    lastRenderTimeRef.current = performance.now();
    console.log(`${componentName} rendered ${renderCountRef.current} times`);
  });

  return {
    renderCount: renderCountRef.current,
    lastRenderTime: lastRenderTimeRef.current,
  };
};

// Lazy component loader with error boundary
export const useLazyComponent = <
  T extends ComponentType<Record<string, unknown>>,
>(
  importFn: () => Promise<{ default: T }>
): {
  Component: T | null;
  loading: boolean;
  error: Error | null;
} => {
  const [Component, setComponent] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    importFn()
      .then(module => {
        setComponent(() => module.default);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load component:', err);
        setError(err);
        setLoading(false);
      });
  }, [importFn]);

  return { Component, loading, error };
};

// Performance optimization utilities
export const useMemoizedValue = <T>(value: T, deps: DependencyList): T => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => value, [value, ...deps]);
};

export const useCallbackMemo = <T extends (...args: unknown[]) => unknown>(
  callback: T,
  deps: DependencyList
): T => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(callback, deps);
};

// Batch state updates
export const useBatchUpdate = () => {
  const [batch, setBatch] = useState<unknown[]>([]);

  const addToBatch = useCallback((update: unknown) => {
    setBatch(prev => [...prev, update]);
  }, []);

  const flushBatch = useCallback(() => {
    setBatch([]);
  }, []);

  return { batch, addToBatch, flushBatch };
};

// Performance metrics collection
export const usePerformanceMetrics = () => {
  const metricsRef = useRef<Map<string, unknown>>(new Map());

  const recordMetric = useCallback((name: string, value: unknown) => {
    metricsRef.current.set(name, value);
  }, []);

  const getMetric = useCallback((name: string) => {
    return metricsRef.current.get(name);
  }, []);

  const getAllMetrics = useCallback(() => {
    return Object.fromEntries(metricsRef.current);
  }, []);

  const clearMetrics = useCallback(() => {
    metricsRef.current.clear();
  }, []);

  return { recordMetric, getMetric, getAllMetrics, clearMetrics };
};

// Network performance monitoring
export const useNetworkMonitor = () => {
  const [networkInfo, setNetworkInfo] = useState<{
    effectiveType: string;
    downlink: number;
    rtt: number;
  } | null>(null);

  useEffect(() => {
    const nav = navigator as Navigator & { connection?: NetworkConnection };
    if ('connection' in nav && nav.connection) {
      const connection = nav.connection;
      setNetworkInfo({
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
      });

      const updateNetworkInfo = () => {
        setNetworkInfo({
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
        });
      };

      connection.addEventListener('change', updateNetworkInfo);

      return () => {
        connection.removeEventListener('change', updateNetworkInfo);
      };
    }

    return undefined;
  }, []);

  return networkInfo;
};

// Performance budget monitoring
export const usePerformanceBudget = (budget: PerformanceBudget) => {
  const violationsRef = useRef<Set<string>>(new Set());

  const checkBudget = useCallback(
    (metric: string, value: number) => {
      const limit = budget[metric];

      if (limit && value > limit) {
        violationsRef.current.add(metric);
        console.warn(
          `Performance budget exceeded for ${metric}: ${value}ms (limit: ${limit}ms)`
        );
      } else {
        violationsRef.current.delete(metric);
      }
    },
    [budget]
  );

  const hasViolations = useCallback(() => {
    return violationsRef.current.size > 0;
  }, []);

  const getViolations = useCallback(() => {
    return Array.from(violationsRef.current);
  }, []);

  return { checkBudget, hasViolations, getViolations };
};
