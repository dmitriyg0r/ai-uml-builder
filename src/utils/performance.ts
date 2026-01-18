/**
 * Performance monitoring utilities for the AI UML Builder
 */

export class PerformanceMonitor {
  private static marks = new Map<string, number>();
  private static observers = new Set<PerformanceObserver>();

  /**
   * Mark a performance event
   */
  static mark(name: string): void {
    this.marks.set(name, performance.now());
  }

  /**
   * Measure the duration between two marks
   */
  static measure(startMark: string, endMark: string, measureName: string): number {
    const startTime = this.marks.get(startMark);
    const endTime = this.marks.get(endMark);

    if (startTime === undefined || endTime === undefined) {
      console.warn(`Missing marks for measurement: ${startMark} -> ${endMark}`);
      return 0;
    }

    const duration = endTime - startTime;
    console.debug(`${measureName}: ${duration.toFixed(2)}ms`);
    return duration;
  }

  /**
   * Measure execution time of a function
   */
  static async measureFunction<T>(
    fn: () => T | Promise<T>,
    measureName: string
  ): Promise<{ result: T; duration: number }> {
    const startMark = `${measureName}_start`;
    const endMark = `${measureName}_end`;

    this.mark(startMark);
    const result = await Promise.resolve(fn());
    this.mark(endMark);

    const duration = this.measure(startMark, endMark, measureName);
    return { result, duration };
  }

  /**
   * Get current memory usage (if available)
   */
  static getMemoryInfo(): { used: number; total: number; jsHeapSizeLimit: number } | null {
    if ('memory' in performance && performance.memory) {
      const mem = performance.memory as any;
      return {
        used: mem.usedJSHeapSize,
        total: mem.totalJSHeapSize,
        jsHeapSizeLimit: mem.jsHeapSizeLimit,
      };
    }
    return null;
  }

  /**
   * Cleanup resources
   */
  static destroy(): void {
    this.marks.clear();
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }
}

/**
 * Hook for measuring component render performance
 */
export const withRenderTiming = <T extends Record<string, unknown>>(
  Component: React.ComponentType<T>,
  componentName: string
): React.ComponentType<T> => {
  return function TimedComponent(props: T) {
    PerformanceMonitor.mark(`${componentName}_render_start`);
    
    const element = React.createElement(Component, props);
    
    PerformanceMonitor.mark(`${componentName}_render_end`);
    PerformanceMonitor.measure(
      `${componentName}_render_start`,
      `${componentName}_render_end`,
      `${componentName} render`
    );
    
    return element;
  };
};

/**
 * Debounce function with performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  return function debounced(...args: Parameters<T>): void {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      func.apply(this, args);
      timeoutId = null;
    }, wait);
  };
}

/**
 * Throttle function with performance optimization
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function throttled(...args: Parameters<T>): void {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}