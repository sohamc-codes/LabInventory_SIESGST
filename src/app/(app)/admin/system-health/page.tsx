'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import { 
  Activity, 
  Database, 
  Server, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  TrendingUp,
  RefreshCw,
  Download
} from 'lucide-react'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

interface HealthStatus {
  status: string
  timestamp: string
  services: {
    database: string
    api: string
  }
  performance: {
    responseTime: string
  }
  version: string
  environment: string
}

export default function SystemHealthPage() {
  const [health, setHealth] = useState<HealthStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastChecked, setLastChecked] = useState<Date>(new Date())

  const checkHealth = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/health')
      const data = await response.json()
      setHealth(data)
      setLastChecked(new Date())
    } catch (error) {
      console.error('Health check failed:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkHealth()
    const interval = setInterval(checkHealth, 30000) // Check every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'connected':
      case 'operational':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20'
      case 'degraded':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20'
      case 'unhealthy':
      case 'disconnected':
        return 'text-red-600 bg-red-100 dark:bg-red-900/20'
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-zinc-900'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'connected':
      case 'operational':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'degraded':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case 'unhealthy':
      case 'disconnected':
        return <AlertTriangle className="h-5 w-5 text-red-600" />
      default:
        return <Activity className="h-5 w-5 text-gray-600" />
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="System Health"
          subtitle="Monitor application status and performance"
          rightContent={
            <Button
              variant="outline"
              size="sm"
              onClick={checkHealth}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          }
        />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Overall Status */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      System Status
                    </CardTitle>
                    <CardDescription>
                      Last checked: {lastChecked.toLocaleTimeString()}
                    </CardDescription>
                  </div>
                  {health && (
                    <Badge className={getStatusColor(health.status)}>
                      {health.status.toUpperCase()}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {loading && !health ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : health ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(health.services.database)}
                        <h4 className="font-semibold">Database</h4>
                      </div>
                      <Badge className={getStatusColor(health.services.database)}>
                        {health.services.database}
                      </Badge>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(health.services.api)}
                        <h4 className="font-semibold">API</h4>
                      </div>
                      <Badge className={getStatusColor(health.services.api)}>
                        {health.services.api}
                      </Badge>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-5 w-5 text-blue-600" />
                        <h4 className="font-semibold">Response Time</h4>
                      </div>
                      <p className="text-2xl font-bold">{health.performance.responseTime}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Failed to load health status
                  </div>
                )}
              </CardContent>
            </Card>

            {/* System Information */}
            {health && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Server className="h-5 w-5" />
                      System Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Version:</span>
                      <span className="font-medium">{health.version}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Environment:</span>
                      <Badge variant="outline">{health.environment}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Uptime:</span>
                      <span className="font-medium">
                        {Math.floor((Date.now() - new Date(health.timestamp).getTime()) / 1000 / 60)} min
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Performance Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">API Response:</span>
                      <span className="font-medium">{health.performance.responseTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Database Status:</span>
                      <Badge className={getStatusColor(health.services.database)}>
                        {health.services.database}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Check:</span>
                      <span className="font-medium">{lastChecked.toLocaleTimeString()}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>System maintenance and monitoring tools</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Export Logs
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Database className="h-4 w-4 mr-2" />
                    Database Backup
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Activity className="h-4 w-4 mr-2" />
                    View Metrics
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
