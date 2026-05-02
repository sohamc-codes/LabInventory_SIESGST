'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import {
  Package,
  ClipboardList,
  AlertTriangle,
  Calendar,
  CheckCircle,
  Clock,
  Award,
  Target,
  Activity,
  ArrowUpRight,
  Eye,
  RefreshCw,
  Zap,
  TrendingUp,
  Plus,
  Search,
  BarChart3,
  FileText,
} from 'lucide-react'

// Quick Actions Component
function QuickActionsSection() {
  const actions = [
    {
      title: 'New Request',
      description: 'Request components',
      icon: Plus,
      href: '/requests/new',
      gradient: 'from-blue-500 to-blue-600',
      hoverGradient: 'hover:from-blue-600 hover:to-blue-700',
      iconBg: 'bg-white/10',
      shadow: 'shadow-blue-500/20',
    },
    {
      title: 'My Requests',
      description: 'Track your requests',
      icon: ClipboardList,
      href: '/requests/my-requests',
      gradient: 'from-emerald-500 to-emerald-600',
      hoverGradient: 'hover:from-emerald-600 hover:to-emerald-700',
      iconBg: 'bg-white/10',
      shadow: 'shadow-emerald-500/20',
    },
    {
      title: 'Issued Items',
      description: 'View issued parts',
      icon: Package,
      href: '/parts-issued',
      gradient: 'from-orange-500 to-orange-600',
      hoverGradient: 'hover:from-orange-600 hover:to-orange-700',
      iconBg: 'bg-white/10',
      shadow: 'shadow-orange-500/20',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {actions.map((action) => (
        <Link key={action.title} href={action.href}>
          <div className={`relative rounded-xl p-5 bg-gradient-to-br ${action.gradient} ${action.hoverGradient} transition-all duration-300 cursor-pointer group shadow-lg ${action.shadow} hover:shadow-xl hover:scale-[1.02]`}>
            <div className="flex items-start justify-between mb-3">
              <div className={`w-12 h-12 rounded-lg ${action.iconBg} backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                <action.icon className="h-6 w-6 text-white" />
              </div>
              <ArrowUpRight className="h-5 w-5 text-white/60 group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300" />
            </div>
            <h3 className="text-base font-semibold text-white mb-1">{action.title}</h3>
            <p className="text-sm text-white/80">{action.description}</p>
            <div className="absolute inset-0 rounded-xl bg-white/0 group-hover:bg-white/5 transition-colors duration-300" />
          </div>
        </Link>
      ))}
    </div>
  )
}

export default function StudentDashboard() {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [stats, setStats] = useState({
    activeRequests: 0,
    approvedRequests: 0,
    itemsIssued: 0,
    overdueItems: 0,
    totalProjects: 0,
    completionRate: 0,
    avgReturnTime: 0,
    reputationScore: 0,
    trends: {
      requests: 0,
      approvals: 0,
      returns: 0,
    }
  })

  const [recentRequests, setRecentRequests] = useState<any[]>([])
  const [upcomingReturns, setUpcomingReturns] = useState<any[]>([])

  const fetchDashboardData = async () => {
    try {
      setError(null)
      const response = await fetch('/api/dashboard/student')
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Dashboard API error:', response.status, errorData)
        throw new Error(errorData.message || errorData.error || `Failed to fetch dashboard data (${response.status})`)
      }

      const data = await response.json()
      
      setStats(data.stats)
      setRecentRequests(data.recentRequests || [])
      setUpcomingReturns(data.upcomingReturns || [])
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
    } finally {
      setIsLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
    const interval = setInterval(fetchDashboardData, 30000)
    return () => clearInterval(interval)
  }, [])

  if (!session?.user) {
    return null
  }
  
  const currentUser = session.user

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchDashboardData()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      case 'PENDING':  return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
      case 'ISSUED':   return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      case 'REJECTED': return 'bg-red-500/10 text-red-400 border-red-500/20'
      default:         return 'bg-zinc-800/60 text-zinc-400 border-zinc-700/60'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':   return 'bg-red-500/10 text-red-400 border-red-500/20'
      case 'MEDIUM': return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
      case 'LOW':    return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      default:       return 'bg-zinc-800/60 text-zinc-400 border-zinc-700/60'
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'HIGH':   return 'bg-red-500/10 text-red-400 border-red-500/20'
      case 'MEDIUM': return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
      case 'LOW':    return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      case 'NONE':   return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      default:       return 'bg-zinc-800/60 text-zinc-400 border-zinc-700/60'
    }
  }

  const getRiskLabel = (risk: string) => {
    return risk === 'NONE' ? 'ON TRACK' : risk
  }

  if (isLoading) {
    return (
      <div className="flex h-screen bg-background overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header title="Student Dashboard" subtitle="Loading your dashboard..." />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-3">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-sm text-zinc-500">Preparing your dashboard...</p>
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header title="Student Dashboard" subtitle="Error loading dashboard" />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4 max-w-md">
              <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
                <AlertTriangle className="h-7 w-7 text-red-400" />
              </div>
              <h3 className="text-base font-semibold text-zinc-100">Failed to Load Dashboard</h3>
              <p className="text-sm text-zinc-500">{error}</p>
              <Button onClick={handleRefresh} disabled={refreshing} variant="outline">
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Retrying...' : 'Try Again'}
              </Button>
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
          title="Student Dashboard"
          subtitle={`Welcome back, ${currentUser.name}`}
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
        
        <main className="flex-1 overflow-y-auto p-5">
          <div className="max-w-7xl mx-auto space-y-5">
            {/* Quick Actions */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="h-5 w-5 text-amber-500" />
                <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
              </div>
              <QuickActionsSection />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="relative overflow-hidden hover:border-zinc-700/60 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs font-medium text-zinc-400">Active Requests</CardTitle>
                  <div className="flex items-center gap-1">
                    <ClipboardList className="h-4 w-4 text-zinc-600" />
                    {stats.trends.requests > 0 && <TrendingUp className="h-3 w-3 text-emerald-500" />}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-400">{stats.activeRequests}</div>
                  <p className="text-xs text-zinc-600 mt-1">Pending approval or processing</p>
                  {stats.trends.requests !== 0 && (
                    <span className={`text-xs font-medium mt-2 block ${stats.trends.requests > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {stats.trends.requests > 0 ? '+' : ''}{stats.trends.requests}% from last month
                    </span>
                  )}
                </CardContent>
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-blue-500 to-purple-500" />
              </Card>

              <Card className="relative overflow-hidden hover:border-zinc-700/60 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs font-medium text-zinc-400">Items Issued</CardTitle>
                  <Package className="h-4 w-4 text-zinc-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-emerald-400">{stats.itemsIssued}</div>
                  <p className="text-xs text-zinc-600 mt-1">Currently in your possession</p>
                  <div className="mt-3">
                    <Progress value={stats.itemsIssued > 0 ? Math.min((stats.itemsIssued / 20) * 100, 100) : 0} />
                    <span className="text-xs text-zinc-600 mt-1 block">
                      {stats.itemsIssued > 0 ? `${Math.round((stats.itemsIssued / 20) * 100)}% of capacity` : 'No items issued'}
                    </span>
                  </div>
                </CardContent>
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-emerald-500 to-blue-500" />
              </Card>
            </div>

            {/* Recent Activity Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Requests */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center">
                        <FileText className="h-5 w-5 mr-2 text-blue-500" />
                        Recent Requests
                        <Badge variant="secondary" className="ml-2">{recentRequests.length}</Badge>
                      </CardTitle>
                      <CardDescription>Your latest component requests with detailed status</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentRequests.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 flex items-center justify-center mx-auto mb-4">
                          <ClipboardList className="h-8 w-8 text-blue-500" />
                        </div>
                        <h3 className="font-semibold text-foreground mb-2">No requests yet</h3>
                        <p className="text-sm text-muted-foreground mb-4">Start by requesting components for your projects</p>
                        <Link href="/requests/new">
                          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                            <Plus className="h-4 w-4 mr-2" />
                            Create First Request
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {recentRequests.slice(0, 5).map((request) => (
                          <Link key={request.id} href={`/requests/my-requests`} className="block">
                            <div className="p-4 rounded-lg border border-gray-200 dark:border-zinc-800 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-md transition-all cursor-pointer bg-card text-card-foreground group">
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap mb-2">
                                    <h4 className="font-semibold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                      {request.component.name}
                                    </h4>
                                    <Badge className={`${getStatusColor(request.status)} text-xs`}>{request.status}</Badge>
                                    {request.priority === 'HIGH' && (
                                      <Badge className={`${getPriorityColor(request.priority)} text-xs`}>{request.priority}</Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2 sm:line-clamp-1">{request.purpose}</p>
                                  <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                                    <span className="flex items-center gap-1"><Package className="h-3 w-3" />Qty: {request.quantity}</span>
                                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(request.createdAt).toLocaleDateString()}</span>
                                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{request.expectedDuration} days</span>
                                  </div>
                                </div>
                                <ArrowUpRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex-shrink-0 self-end sm:self-start" />
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                  {recentRequests.length > 0 && (
                    <div className="mt-4">
                      <Link href="/requests/my-requests">
                        <Button variant="outline" className="w-full group">
                          View All Requests
                          <ArrowUpRight className="h-4 w-4 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Upcoming Returns */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center">
                        <Calendar className="h-5 w-5 mr-2 text-orange-500" />
                        Upcoming Returns
                        <Badge variant="secondary" className="ml-2">{upcomingReturns.length}</Badge>
                      </CardTitle>
                      <CardDescription>Items that need to be returned with risk assessment</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcomingReturns.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900/20 dark:to-blue-900/20 flex items-center justify-center mx-auto mb-4">
                          <CheckCircle className="h-8 w-8 text-green-500" />
                        </div>
                        <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">All clear!</h3>
                        <p className="text-sm text-green-700 dark:text-green-300 mb-1">No items need to be returned right now</p>
                        <p className="text-xs text-green-600 dark:text-green-400">Issued items will appear here when they need to be returned</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {upcomingReturns.slice(0, 5).map((item) => (
                          <div 
                            key={item.id} 
                            className={`p-4 rounded-lg border-2 transition-all ${
                              item.isOverdue 
                                ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/10' 
                                : item.risk === 'MEDIUM' 
                                ? 'border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/10' 
                                : item.risk === 'LOW' 
                                ? 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/10' 
                                : 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/10'
                            }`}
                          >
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap mb-2">
                                  <h4 className="font-semibold text-foreground">{item.component.name}</h4>
                                  <Badge className={`${getRiskColor(item.risk)} text-xs`}>{getRiskLabel(item.risk)}</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2 line-clamp-2 sm:line-clamp-1">{item.purpose}</p>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                                  <span className="flex items-center gap-1"><Package className="h-3 w-3" />Qty: {item.quantity}</span>
                                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />Issued: {new Date(item.issuedAt).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-3 border-t border-gray-200 dark:border-zinc-800">
                              <div className="flex items-center gap-2">
                                {item.isOverdue ? (
                                  <div className="flex items-center gap-1 text-red-600 dark:text-red-400 font-semibold">
                                    <AlertTriangle className="h-4 w-4" />
                                    <span className="text-sm">Overdue by {Math.abs(item.daysUntilDue)} days</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1 text-gray-700 dark:text-zinc-300">
                                    <Calendar className="h-4 w-4" />
                                    <span className="text-sm font-medium">Due in {item.daysUntilDue} {item.daysUntilDue === 1 ? 'day' : 'days'}</span>
                                  </div>
                                )}
                              </div>
                              <Link href="/parts-issued">
                                <Button variant="outline" size="sm" className="group w-full sm:w-auto">
                                  <Eye className="h-3 w-3 mr-1" />
                                  Details
                                </Button>
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {upcomingReturns.length > 0 && (
                    <div className="mt-4">
                      <Link href="/parts-issued">
                        <Button variant="outline" className="w-full group">
                          View All Items
                          <ArrowUpRight className="h-4 w-4 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Activity Summary */}
            {(stats.activeRequests > 0 || stats.itemsIssued > 0) && (
              <Card className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-gray-200 dark:border-zinc-800">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-blue-500" />
                    Activity Summary
                  </CardTitle>
                  <CardDescription>Your inventory management overview</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-card text-card-foreground rounded-lg border border-gray-200 dark:border-zinc-800">
                      <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                        {stats.activeRequests + stats.approvedRequests}
                      </div>
                      <p className="text-sm text-muted-foreground">Total Requests</p>
                      <p className="text-xs text-muted-foreground mt-1">All time</p>
                    </div>
                    <div className="text-center p-4 bg-card text-card-foreground rounded-lg border border-gray-200 dark:border-zinc-800">
                      <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                        {stats.avgReturnTime}
                      </div>
                      <p className="text-sm text-muted-foreground">Avg Return Time</p>
                      <p className="text-xs text-muted-foreground mt-1">Days</p>
                    </div>
                    <div className="text-center p-4 bg-card text-card-foreground rounded-lg border border-gray-200 dark:border-zinc-800">
                      <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                        {stats.totalProjects}
                      </div>
                      <p className="text-sm text-muted-foreground">Total Projects</p>
                      <p className="text-xs text-muted-foreground mt-1">Completed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
