'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home, Mail } from 'lucide-react'
import { logError } from '@/lib/logger'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

/**
 * Dashboard-level error boundary
 * Provides a full-page error fallback for critical errors
 */
export class DashboardErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logError('Dashboard critical error', error, {
      componentStack: errorInfo.componentStack,
      level: 'critical',
    })
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
          <div className="max-w-md w-full space-y-8 text-center">
            {/* Error Icon */}
            <div className="flex justify-center">
              <div className="w-24 h-24 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                <AlertTriangle className="h-12 w-12 text-red-600 dark:text-red-400" />
              </div>
            </div>

            {/* Error Message */}
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-zinc-100">
                Oops! Something went wrong
              </h1>
              <p className="text-gray-600 dark:text-zinc-300">
                We encountered an unexpected error. Don't worry, our team has been notified.
              </p>
            </div>

            {/* Development Error Details */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-800 text-left">
                <p className="text-sm font-semibold text-red-900 dark:text-red-100 mb-2">
                  Development Error Details:
                </p>
                <p className="text-xs font-mono text-red-800 dark:text-red-200 break-all">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <RefreshCw className="h-5 w-5 mr-2" />
                Reload Page
              </button>
              <button
                onClick={() => (window.location.href = '/')}
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-zinc-700 text-base font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <Home className="h-5 w-5 mr-2" />
                Go Home
              </button>
            </div>

            {/* Support Link */}
            <div className="pt-4 border-t border-gray-200 dark:border-zinc-800">
              <p className="text-sm text-gray-500 dark:text-zinc-400">
                Need help?{' '}
                <a
                  href="mailto:support@example.com"
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 inline-flex items-center"
                >
                  <Mail className="h-4 w-4 mr-1" />
                  Contact Support
                </a>
              </p>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
