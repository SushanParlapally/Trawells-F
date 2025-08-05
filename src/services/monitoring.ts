import React from 'react';

/**
 * Application monitoring and analytics service
 * Client-side monitoring only - backend doesn't have monitoring endpoints
 * Captures errors, performance metrics, and user actions for local logging
 */

export interface ErrorInfo {
  message: string;
  stack?: string;
  componentStack?: string;
  url?: string;
  userAgent?: string;
  timestamp: string;
  userId?: string;
  sessionId?: string;
  buildVersion?: string;
  environment?: string;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: string;
  url: string;
  userId?: string;
  sessionId?: string;
}

export interface UserAction {
  action: string;
  element?: string;
  url: string;
  timestamp: string;
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, unknown>;
}

class MonitoringService {
  private errorQueue: ErrorInfo[] = [];
  private metricsQueue: PerformanceMetric[] = [];
  private actionsQueue: UserAction[] = [];
  private userId?: string;
  private sessionId: string;
  private buildVersion: string;
  private environment: string;
  private flushInterval: number;
  private maxQueueSize: number;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.buildVersion = import.meta.env['VITE_APP_VERSION'] || '1.0.0';
    this.environment = import.meta.env.MODE || 'development';
    this.flushInterval = 30000; // 30 seconds
    this.maxQueueSize = 100;

    this.startPerformanceMonitoring();
    this.setupFlushInterval();
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private startPerformanceMonitoring(): void {
    // Monitor page load performance
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType(
          'navigation'
        )[0] as PerformanceNavigationTiming;
        if (navigation) {
          this.captureMetric(
            'page_load_time',
            navigation.loadEventEnd - navigation.loadEventStart
          );
          this.captureMetric(
            'dom_content_loaded',
            navigation.domContentLoadedEventEnd -
              navigation.domContentLoadedEventStart
          );
        }
      }, 0);
    });

    // Monitor Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver(list => {
        const entries = list.getEntries();
        if (entries.length > 0) {
          const lastEntry = entries[entries.length - 1];
          if (lastEntry) {
            this.captureMetric('largest_contentful_paint', lastEntry.startTime);
          }
        }
      });
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    }

    // Monitor long tasks
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver(list => {
        list.getEntries().forEach(entry => {
          this.captureMetric('long_task_duration', entry.duration);
        });
      });
      observer.observe({ entryTypes: ['longtask'] });
    }

    // Monitor memory usage
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (
          performance as Performance & {
            memory: {
              usedJSHeapSize: number;
              totalJSHeapSize: number;
              jsHeapSizeLimit: number;
            };
          }
        ).memory;
        this.captureMetric('memory_used', memory.usedJSHeapSize);
        this.captureMetric('memory_limit', memory.jsHeapSizeLimit);
      }, 30000);
    }
  }

  private setupFlushInterval(): void {
    setInterval(() => {
      this.flushQueues();
    }, this.flushInterval);
  }

  public setUserId(userId: string): void {
    this.userId = userId;
  }

  public captureError(error: Partial<ErrorInfo>): void {
    const errorInfo: ErrorInfo = {
      message: error.message || 'Unknown error',
      stack: error.stack,
      componentStack: error.componentStack,
      url: error.url || window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      userId: this.userId,
      sessionId: this.sessionId,
      buildVersion: this.buildVersion,
      environment: this.environment,
    };

    this.errorQueue.push(errorInfo);

    if (this.errorQueue.length >= this.maxQueueSize) {
      this.flushQueues();
    }
  }

  public captureMetric(name: string, value: number): void {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userId: this.userId,
      sessionId: this.sessionId,
    };

    this.metricsQueue.push(metric);

    if (this.metricsQueue.length >= this.maxQueueSize) {
      this.flushQueues();
    }
  }

  public captureUserAction(
    action: string,
    element?: string,
    metadata?: Record<string, unknown>
  ): void {
    const userAction: UserAction = {
      action,
      element,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      userId: this.userId,
      sessionId: this.sessionId,
      metadata,
    };

    this.actionsQueue.push(userAction);

    if (this.actionsQueue.length >= this.maxQueueSize) {
      this.flushQueues();
    }
  }

  private async flushQueues(): Promise<void> {
    if (
      this.errorQueue.length === 0 &&
      this.metricsQueue.length === 0 &&
      this.actionsQueue.length === 0
    ) {
      return;
    }

    const payload = {
      errors: [...this.errorQueue],
      metrics: [...this.metricsQueue],
      actions: [...this.actionsQueue],
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
    };

    // Clear queues
    this.errorQueue = [];
    this.metricsQueue = [];
    this.actionsQueue = [];

    // Log to console since backend doesn't have monitoring endpoints
    await this.logMonitoringData(payload);
  }

  private async logMonitoringData(payload: unknown): Promise<void> {
    // Backend doesn't have monitoring endpoints, so we just log to console
    // In production, you could integrate with external monitoring services
    if (this.environment === 'development') {
      console.log('Monitoring data:', payload);
    } else {
      // In production, you could send to external monitoring service
      // For now, just log errors to console
      const data = payload as {
        errors?: ErrorInfo[];
        metrics?: PerformanceMetric[];
        actions?: UserAction[];
        sessionId?: string;
        timestamp?: string;
      };
      if (data.errors && data.errors.length > 0) {
        console.error('Application errors:', data.errors);
      }
    }
  }

  public measureFunction<T>(name: string, fn: () => T): T {
    const startTime = performance.now();
    const result = fn();
    const endTime = performance.now();

    this.captureMetric(`function_${name}`, endTime - startTime);

    return result;
  }

  public async measureAsyncFunction<T>(
    name: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const startTime = performance.now();

    try {
      const result = await fn();
      const endTime = performance.now();

      this.captureMetric(`async_function_${name}`, endTime - startTime);

      return result;
    } catch (error) {
      const endTime = performance.now();
      this.captureMetric(`async_function_${name}_error`, endTime - startTime);
      throw error;
    }
  }

  public startTimer(name: string): () => void {
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      this.captureMetric(name, endTime - startTime);
    };
  }
}

// Create singleton instance
export const monitoringService = new MonitoringService();

// Error boundary integration
export const captureComponentError = (error: Error, errorInfo: unknown) => {
  monitoringService.captureError({
    message: error.message,
    stack: error.stack,
    componentStack: (errorInfo as { componentStack?: string })?.componentStack,
  });
};

// React hook for performance monitoring
export const usePerformanceMonitoring = (componentName: string) => {
  React.useEffect(() => {
    const timer = monitoringService.startTimer(
      `component_render_${componentName}`
    );

    return () => {
      timer();
    };
  });
};
