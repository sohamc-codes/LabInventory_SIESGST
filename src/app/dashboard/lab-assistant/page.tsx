'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import { FeatureErrorBoundary } from '@/components/error-boundaries/feature-error-boundary'
import Link from 'next/link'
import {
  Package,
  QrCode,
  ArrowUpDown,
  AlertTriangle,
  Scan,
  CheckCircle,
  Clock,
  Users,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Activity,
  Target,
  Zap,
  Award,
  Eye,
  Plus,
  BarChart3,
} from 'lucide-react'

export default function LabAssistantDashboard() {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Enhanced stats with trends and performance metrics
  const [stats, setStats] = useState({
    todayIssued: 0,
    pendingRequests: 0,
    overdueReturns: 0,
    lowStockItems: 0,
  })

  // Enhanced transaction data with more details
  const [todayTransactions, setTodayTransactions] = useState<any[]>([])

  // Enhanced overdue returns with risk assessment
  const [overdueReturns, setOverdueReturns] = useState<any[]>([])

  // Enhanced low stock alerts with supplier info
  const [lowStockAlerts, setLowStockAlerts] = useState<any[]>([])

  // Simulate loading and data refresh
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  // Fetch real dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/dashboard/lab-assistant')
        if (response.ok) {
          const data = await response.json()
          setStats({
            todayIssued: data.todayIssued,
            pendingRequests: data.pendingRequests,
            overdueReturns: data.overdueReturns,
            lowStockItems: data.lowStockItems,
          })
          setTodayTransactions(data.recentTransactions || [])
          setOverdueReturns(data.overdueItemsArray || [])
          setLowStockAlerts(data.lowStockItemsArray || [])
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      }
    }

    fetchDashboardData()
    // Refresh every 60 seconds
    const interval = setInterval(fetchDashboardData, 60000)
    return () => clearInterval(interval)
  }, [])

  // Redirect to signin if no session
  if (!session?.user) {
    return null
  }
  
  const currentUser = session.user

  const handleRefresh = async () => {
    setRefreshing(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setRefreshing(false)
  }

  const getOverdueDays = (expectedReturnDate: string | Date) => {
    const now = new Date()
    const returnDate = new Date(expectedReturnDate)
    const diffTime = now.getTime() - returnDate.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getOverdueRiskLevel = (days: number) => {
    if (days >= 7) return { level: 'HIGH', color: 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800' }
    if (days >= 3) return { level: 'MEDIUM', color: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800' }
    return { level: 'LOW', color: 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200 border-orange-200 dark:border-orange-800' }
  }

  const getStockStatusColor = (available: number) => {
    if (available === 0) return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800'
    if (available === 1) return 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200 border-orange-200 dark:border-orange-800'
    return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800'
  }

  const getTransactionColor = (type: string) => {
    return type === 'ISSUE' 
      ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800'
      : 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800'
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
      case 'MEDIUM':
        return 'bg-yellow-50 dark:bg-yellow-900/10 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800'
      case 'LOW':
        return 'bg-green-50 dark:bg-green-900/10 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800'
      default:
        return 'bg-muted text-gray-700 dark:text-zinc-300 border-gray-200 dark:border-zinc-800'
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'HIGH':
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800'
      case 'MEDIUM':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800'
      case 'LOW':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800'
      default:
        return 'bg-gray-100 dark:bg-zinc-900 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-zinc-800'
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen bg-background overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header title="Lab Assistant Dashboard" subtitle="Loading your management console..." />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-muted-foreground">Preparing your lab management dashboard...</p>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="Lab Assistant Dashboard"
          subtitle={`Inventory Management - ${currentUser.name}`}
          rightContent={
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          }
        />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Enhanced Stats Cards with Trends */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Today Issued</CardTitle>
                  <ArrowUpDown className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{stats.todayIssued}</div>
                  <p className="text-xs text-muted-foreground">
                    Components issued today
                  </p>
                </CardContent>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
              </Card>

              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                  <Clock className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{stats.pendingRequests}</div>
                  <p className="text-xs text-muted-foreground">
                    Awaiting action
                  </p>
                </CardContent>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-amber-500"></div>
              </Card>

              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Overdue Returns</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{stats.overdueReturns}</div>
                  <p className="text-xs text-muted-foreground">
                    Past return deadline
                  </p>
                </CardContent>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-pink-500"></div>
              </Card>

              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Inventory Alerts</CardTitle>
                  <Package className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{stats.lowStockItems}</div>
                  <p className="text-xs text-muted-foreground">
                    Low stock components
                  </p>
                </CardContent>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 to-orange-500"></div>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Enhanced Today's Transactions */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center">
                        Today's Transactions
                        <Badge variant="secondary" className="ml-2">
                          {todayTransactions.length}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        Recent issue and return activities with detailed tracking
                      </CardDescription>
                    </div>
                    <Activity className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {todayTransactions.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center mx-auto mb-4">
                          <Activity className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                        </div>
                        <h3 className="font-semibold text-foreground mb-2">No transactions today</h3>
                        <p className="text-sm text-muted-foreground mb-1">
                          No components have been issued or returned today
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Transactions will appear here as they occur
                        </p>
                      </div>
                    ) : (
                      todayTransactions.map((transaction) => (
                        <div
                          key={transaction.id}
                          className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between p-3 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0 w-full sm:w-auto">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                              <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground">
                                {transaction.component.name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {transaction.student.name} • {transaction.student.prn}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0 w-full sm:w-auto justify-between sm:justify-end">
                            <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                              Qty: {transaction.quantity}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(transaction.issuedAt).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  {todayTransactions.length > 0 && (
                    <div className="mt-4">
                      <Button variant="outline" className="w-full" asChild>
                        <Link href="/requests/all">
                          View All Transactions
                          <ArrowUpRight className="h-4 w-4 ml-2" />
                        </Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Enhanced Overdue Returns */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center">
                        Overdue Returns
                        <Badge variant="destructive" className="ml-2">{overdueReturns.length} overdue</Badge>
                      </CardTitle>
                      <CardDescription>
                        Items that should have been returned with risk assessment
                      </CardDescription>
                    </div>
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {overdueReturns.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/20 dark:to-blue-900/20 flex items-center justify-center mx-auto mb-4">
                          <CheckCircle className="h-8 w-8 text-green-500" />
                        </div>
                        <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">All items returned on time!</h3>
                        <p className="text-sm text-green-700 dark:text-green-300 mb-1">
                          No overdue returns at the moment
                        </p>
                        <p className="text-xs text-green-600 dark:text-green-400">
                          Great job managing the inventory
                        </p>
                      </div>
                    ) : (
                      overdueReturns.map((item) => {
                        const overdueDays = getOverdueDays(item.expectedReturnDate)
                        const riskLevel = getOverdueRiskLevel(overdueDays)
                        return (
                          <div
                            key={item.id}
                            className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between p-3 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0 w-full sm:w-auto">
                              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-foreground">
                                  {item.component.name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {item.student.name} • {item.student.prn}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-start sm:justify-end">
                              <Badge variant="outline" className={riskLevel.color}>
                                {overdueDays} day{overdueDays !== 1 ? 's' : ''} overdue
                              </Badge>
                              <Badge variant="outline" className="bg-gray-50 dark:bg-gray-900/20 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800">
                                Qty: {item.quantity}
                              </Badge>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                  {overdueReturns.length > 0 && (
                    <div className="mt-4">
                      <Button variant="outline" className="w-full" asChild>
                        <Link href="/parts-issued">
                          View All Issued Parts
                          <ArrowUpRight className="h-4 w-4 ml-2" />
                        </Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Low Stock Alerts */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      Inventory Alerts
                      <Badge variant="warning" className="ml-2">{lowStockAlerts.length} items</Badge>
                    </CardTitle>
                    <CardDescription>
                      Components that need restocking with current stock levels
                    </CardDescription>
                  </div>
                  <Package className="h-5 w-5 text-yellow-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {lowStockAlerts.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/20 dark:to-blue-900/20 flex items-center justify-center mx-auto mb-4">
                        <Package className="h-8 w-8 text-green-500" />
                      </div>
                      <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">All stock levels healthy!</h3>
                      <p className="text-sm text-green-700 dark:text-green-300 mb-1">
                        No components need restocking at the moment
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-400">
                        Stock alerts will appear here when inventory runs low
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {lowStockAlerts.map((component) => (
                        <div
                          key={component.id}
                          className="p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1 min-w-0 pr-2">
                              <p className="font-medium text-foreground mb-1">
                                {component.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {component.category}
                              </p>
                            </div>
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                              <Package className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">Available</span>
                              <Badge variant="outline" className={getStockStatusColor(component.availableStock)}>
                                {component.availableStock} / {component.totalStock}
                              </Badge>
                            </div>
                            <Progress 
                              value={(component.availableStock / component.totalStock) * 100} 
                              className="h-2"
                            />
                            {component.availableStock === 0 && (
                              <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                                Out of stock
                              </p>
                            )}
                            {component.availableStock === 1 && (
                              <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                                Critical: Only 1 left
                              </p>
                            )}
                            {component.availableStock === 2 && (
                              <p className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">
                                Low stock: 2 remaining
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {lowStockAlerts.length > 0 && (
                  <div className="mt-4">
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/inventory/manage">
                        Manage Inventory
                        <ArrowUpRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
