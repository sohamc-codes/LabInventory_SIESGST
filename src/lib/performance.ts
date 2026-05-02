/**
 * Performance monitoring utilities
 * Track and optimize application performance
 */

interface PerformanceMetric {
  name: string
  duration: number
  timestamp: string
  metadata?: Record<string, any>
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private timers: Map<string, number> = new Map()
  private maxMetrics = 500

  /**
   * Start timing an operation
   */
  startTimer(name: string) {
    this.timers.set(name, performance.now())
  }

  /**
   * End timing and record metric
   */
  endTimer(name: string, metadata?: Record<string, any>) {
    const startTime = this.timers.get(name)
    if (!startTime) {
      console.warn(`Timer "${name}" was not started`)
      return
    }

    const duration = performance.now() - startTime
    this.timers.delete(name)

    const metric: PerformanceMetric = {
      name,
      duration,
      timestamp: new Date().toISOString(),
      metadata,
    }

    this.metrics.push(metric)
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift()
    }

    // Log slow operations in development
    if (process.env.NODE_ENV === 'development' && duration > 1000) {
      console.warn(`⚠️ Slow operation: ${name} took ${duration.toFixed(2)}ms`)
    }

    return duration
  }

  /**
   * Measure a function execution time
   */
  async measure<T>(name: string, fn: () => Promise<T> | T, metadata?: Record<string, any>): Promise<T> {
    this.startTimer(name)
    try {
      const result = await fn()
      this.endTimer(name, metadata)
      return result
    } catch (error) {
      this.endTimer(name, { ...metadata, error: true })
      throw error
    }
  }

  /**
   * Get performance metrics
   */
  getMetrics(name?: string): PerformanceMetric[] {
    if (name) {
      return this.metrics.filter(m => m.name === name)
    }
    return [...this.metrics]
  }

  /**
   * Get average duration for a metric
   */
  getAverageDuration(name: string): number {
    const metrics = this.getMetrics(name)
    if (metrics.length === 0) return 0
    
    const total = metrics.reduce((sum, m) => sum + m.duration, 0)
    return total / metrics.length
  }

  /**
   * Get slowest operations
   */
  getSlowestOperations(limit: number = 10): PerformanceMetric[] {
    return [...this.metrics]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit)
  }

  /**
   * Clear all metrics
   */
  clearMetrics() {
    this.metrics = []
    this.timers.clear()
  }

  /**
   * Export metrics as JSON
   */
  exportMetrics(): string {
    return JSON.stringify({
      metrics: this.metrics,
      summary: {
        totalOperations: this.metrics.length,
        averageDuration: this.metrics.reduce((sum, m) => sum + m.duration, 0) / this.metrics.length || 0,
        slowestOperations: this.getSlowestOperations(5),
      },
    }, null, 2)
  }

  /**
   * Monitor Web Vitals
   */
  monitorWebVitals() {
    if (typeof window === 'undefined') return

    // Monitor Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1] as any
          
          this.metrics.push({
            name: 'LCP',
            duration: lastEntry.renderTime || lastEntry.loadTime,
            timestamp: new Date().toISOString(),
            metadata: { type: 'web-vital' },
          })
        })
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

        // Monitor First Input Delay (FID)
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach((entry: any) => {
            this.metrics.push({
              name: 'FID',
              duration: entry.processingStart - entry.startTime,
              timestamp: new Date().toISOString(),
              metadata: { type: 'web-vital' },
            })
          })
        })
        fidObserver.observe({ entryTypes: ['first-input'] })

        // Monitor Cumulative Layout Shift (CLS)
        let clsValue = 0
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value
            }
          })
          
          this.metrics.push({
            name: 'CLS',
            duration: clsValue,
            timestamp: new Date().toISOString(),
            metadata: { type: 'web-vital' },
          })
        })
        clsObserver.observe({ entryTypes: ['layout-shift'] })
      } catch (error) {
        console.warn('Failed to monitor Web Vitals:', error)
      }
    }
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor()

// Convenience exports
export const startTimer = (name: string) => performanceMonitor.startTimer(name)
export const endTimer = (name: string, metadata?: Record<string, any>) => performanceMonitor.endTimer(name, metadata)
export const measurePerformance = <T>(name: string, fn: () => Promise<T> | T, metadata?: Record<string, any>) => 
  performanceMonitor.measure(name, fn, metadata)
