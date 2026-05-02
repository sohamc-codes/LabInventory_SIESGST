/**
 * Production-ready logging service
 * Replaces console.log/error with structured logging
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug'

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  context?: Record<string, any>
  error?: Error
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'
  private logs: LogEntry[] = []
  private maxLogs = 1000

  private createEntry(level: LogLevel, message: string, context?: Record<string, any>, error?: Error): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error,
    }
  }

  private addLog(entry: LogEntry) {
    this.logs.push(entry)
    if (this.logs.length > this.maxLogs) {
      this.logs.shift()
    }
  }

  info(message: string, context?: Record<string, any>) {
    const entry = this.createEntry('info', message, context)
    this.addLog(entry)
    
    if (this.isDevelopment) {
      console.log(`[INFO] ${message}`, context || '')
    }
  }

  warn(message: string, context?: Record<string, any>) {
    const entry = this.createEntry('warn', message, context)
    this.addLog(entry)
    
    if (this.isDevelopment) {
      console.warn(`[WARN] ${message}`, context || '')
    }
  }

  error(message: string, error?: Error, context?: Record<string, any>) {
    const entry = this.createEntry('error', message, context, error)
    this.addLog(entry)
    
    // Always log errors, even in production
    console.error(`[ERROR] ${message}`, error || '', context || '')
    
    // In production, you could send to error tracking service
    if (!this.isDevelopment && typeof window !== 'undefined') {
      // Send to error tracking service (e.g., Sentry, LogRocket)
      this.sendToErrorTracking(entry)
    }
  }

  debug(message: string, context?: Record<string, any>) {
    if (!this.isDevelopment) return
    
    const entry = this.createEntry('debug', message, context)
    this.addLog(entry)
    console.log(`[DEBUG] ${message}`, context || '')
  }

  private sendToErrorTracking(entry: LogEntry) {
    // Placeholder for error tracking service integration
    // Example: Sentry.captureException(entry.error, { extra: entry.context })
  }

  getLogs(level?: LogLevel): LogEntry[] {
    if (level) {
      return this.logs.filter(log => log.level === level)
    }
    return [...this.logs]
  }

  clearLogs() {
    this.logs = []
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2)
  }
}

// Singleton instance
export const logger = new Logger()

// Convenience exports
export const logInfo = (message: string, context?: Record<string, any>) => logger.info(message, context)
export const logWarn = (message: string, context?: Record<string, any>) => logger.warn(message, context)
export const logError = (message: string, error?: Error, context?: Record<string, any>) => logger.error(message, error, context)
export const logDebug = (message: string, context?: Record<string, any>) => logger.debug(message, context)
