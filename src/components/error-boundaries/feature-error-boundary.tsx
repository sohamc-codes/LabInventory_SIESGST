'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { logError } from '@/lib/logger'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  featureName?: string
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

/**
 * Feature-level error boundary
 * Catches errors in specific features without breaking the entire app
 */
export class FeatureErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to our logging service
    logError(
      `Feature error in ${this.props.featureName || 'unknown feature'}`,
      error,
      {
        componentStack: errorInfo.componentStack,
        featureName: this.props.featureName,
      }
    )

    this.setState({
      error,
      errorInfo,
    })
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <CardTitle className="text-red-900 dark:text-red-100">
                Something went wrong
              </CardTitle>
            </div>
            <CardDescription className="text-red-700 dark:text-red-300">
              {this.props.featureName
                ? `There was an error loading ${this.props.featureName}`
                : 'This feature encountered an error'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="p-4 bg-red-100 dark:bg-red-900/20 rounded-lg">
                <p className="text-sm font-mono text-red-900 dark:text-red-100">
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm text-red-700 dark:text-red-300">
                      Stack trace
                    </summary>
                    <pre className="mt-2 text-xs overflow-auto max-h-40">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={this.handleReset} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button
                onClick={() => (window.location.href = '/')}
                variant="ghost"
                size="sm"
              >
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Button>
            </div>
          </CardContent>
        </Card>
      )
    }

    return this.props.children
  }
}
