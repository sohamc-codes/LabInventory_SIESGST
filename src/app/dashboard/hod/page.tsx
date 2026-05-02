'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'
import {
  Users,
  ClipboardList,
  Package,
  AlertTriangle,
  TrendingUp,
  CheckCircle,
  XCircle,
  RefreshCw,
  Target,
  BarChart3,
  Bell,
  Eye,
  Shield,
  PackageCheck,
  Loader2,
} from 'lucide-react'
import { useApproveRequest, useBulkApproval } from '@/lib/hooks/use-hod-dashboard'
import { useRequests } from '@/lib/hooks/use-requests'
import { toast } from 'sonner'

// ── Types ─────────────────────────────────────────────────────────────────────

interface HodMetrics {
  departmentEfficiency: number
  lowStockAlerts: number
  highPriorityRequests: number
  utilizationRate: number
}

// ── Metric card ───────────────────────────────────────────────────────────────

function MetricCard({
  title,
  value,
  unit,
  description,
  icon: Icon,
  accentClass,
  showProgress,
  alert,
}: {
  title: string
  value: number
  unit?: string
  description: string
  icon: React.ElementType
  accentClass: string
  showProgress?: boolean
  alert?: boolean
}) {
  return (
    <Card className="relative overflow-hidden hover:border-border/80 transition-colors">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground">{title}</CardTitle>
        <div className="flex items-center gap-1">
          <Icon className="h-4 w-4 text-muted-foreground" />
          {alert && value > 0 && <Bell className="h-3 w-3 text-destructive" />}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">
          {value}{unit}
        </div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
        {showProgress && (
          <div className="mt-3">
            <Progress value={Math.min(value, 100)} />
          </div>
        )}
      </CardContent>
      <div className={`absolute bottom-0 left-0 w-full h-[2px] ${accentClass}`} />
    </Card>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function HODDashboard() {
  const { data: session } = useSession()
  const [metrics, setMetrics] = useState<HodMetrics | null>(null)
  const [metricsLoading, setMetricsLoading] = useState(true)
  const [metricsError, setMetricsError] = useState<string | null>(null)
  const [selectedRequests, setSelectedRequests] = useState<string[]>([])

  const { data: requestsData, isLoading: requestsLoading, refetch } = useRequests({
    status: 'PENDING',
    limit: 50,
  })
  const pendingApprovals = requestsData?.requests ?? []

  const approveRequestMutation = useApproveRequest()
  const bulkApprovalMutation = useBulkApproval()

  const fetchMetrics = async () => {
    setMetricsLoading(true)
    setMetricsError(null)
    try {
      const res = await fetch('/api/dashboard/hod')
      if (!res.ok) throw new Error('Failed to fetch metrics')
      const data = await res.json()
      setMetrics(data)
    } catch (err) {
      setMetricsError(err instanceof Error ? err.message : 'Failed to load metrics')
    } finally {
      setMetricsLoading(false)
    }
  }

  useEffect(() => {
    fetchMetrics()
  }, [])

  if (!session?.user) return null
  const currentUser = session.user

  const handleApprove = async (requestId: string) => {
    try {
      await approveRequestMutation.mutateAsync({ requestId, data: { status: 'APPROVED' } })
      refetch()
    } catch { /* handled by mutation */ }
  }

  const handleReject = async (requestId: string) => {
    const reason = prompt('Please provide a reason for rejection:')
    if (!reason) return
    try {
      await approveRequestMutation.mutateAsync({
        requestId,
        data: { status: 'REJECTED', rejectionReason: reason },
      })
      refetch()
    } catch { /* handled by mutation */ }
  }

  const handleBulkApprove = async () => {
    if (selectedRequests.length === 0) {
      toast.error('Please select requests to approve')
      return
    }
    try {
      await bulkApprovalMutation.mutateAsync(selectedRequests)
      setSelectedRequests([])
      refetch()
    } catch { /* handled by mutation */ }
  }

  const getPriorityColor = (days: number) => {
    if (days >= 3) return 'bg-destructive/10 text-destructive border-destructive/20'
    if (days >= 1) return 'bg-amber-500/10 text-amber-500 border-amber-500/20'
    return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
  }

  const getDaysSince = (date: string) =>
    Math.floor((Date.now() - new Date(date).getTime()) / 86_400_000)

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="HOD Dashboard"
          subtitle={`Welcome back, ${currentUser.name || 'HOD'}`}
          rightContent={
            <Button
              variant="outline"
              size="sm"
              onClick={fetchMetrics}
              disabled={metricsLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${metricsLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          }
        />

        <main className="flex-1 overflow-y-auto p-5">
          <div className="max-w-7xl mx-auto space-y-5">

            {/* ── Four real-time metric cards ─────────────────── */}
            {metricsError ? (
              <Card className="border-destructive/20 bg-destructive/5">
                <CardContent className="p-4 flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Failed to load metrics</p>
                    <p className="text-xs text-muted-foreground">{metricsError}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={fetchMetrics} className="ml-auto">
                    Retry
                  </Button>
                </CardContent>
              </Card>
            ) : metricsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <Card key={i} className="relative overflow-hidden">
                    <CardContent className="p-5 flex items-center justify-center h-28">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : metrics ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                  title="Department Efficiency"
                  value={metrics.departmentEfficiency}
                  unit="%"
                  description="Requests approved within 48 hours"
                  icon={Target}
                  accentClass="bg-gradient-to-r from-emerald-500 to-teal-500"
                  showProgress
                />
                <MetricCard
                  title="Low Stock Alerts"
                  value={metrics.lowStockAlerts}
                  description="Components with ≤2 units available"
                  icon={AlertTriangle}
                  accentClass="bg-gradient-to-r from-amber-500 to-orange-500"
                  alert
                />
                <MetricCard
                  title="High Priority Requests"
                  value={metrics.highPriorityRequests}
                  description="Pending requests older than 48 hours"
                  icon={Bell}
                  accentClass="bg-gradient-to-r from-orange-500 to-red-500"
                  alert
                />
                <MetricCard
                  title="Utilization Rate"
                  value={metrics.utilizationRate}
                  unit="%"
                  description="Components currently in active use"
                  icon={TrendingUp}
                  accentClass="bg-gradient-to-r from-blue-500 to-cyan-500"
                  showProgress
                />
              </div>
            ) : null}

            {/* ── Tabs ────────────────────────────────────────── */}
            <Tabs defaultValue="approvals" className="space-y-4">
              <TabsList>
                <TabsTrigger value="approvals">
                  Pending Approvals
                  {pendingApprovals.length > 0 && (
                    <Badge variant="destructive" className="ml-2 h-5 min-w-5 px-1 text-xs">
                      {pendingApprovals.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="overview">Overview</TabsTrigger>
              </TabsList>

              {/* ── Approvals tab ──────────────────────────────── */}
              <TabsContent value="approvals">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Shield className="h-4 w-4 text-primary" />
                          Pending Approvals
                        </CardTitle>
                        <CardDescription>
                          Review and approve student component requests
                        </CardDescription>
                      </div>
                      <Link href="/requests/all">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View All
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {requestsLoading ? (
                      <div className="flex items-center justify-center py-10 gap-2 text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span className="text-sm">Loading requests…</span>
                      </div>
                    ) : pendingApprovals.length === 0 ? (
                      <div className="text-center py-10">
                        <CheckCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                        <h3 className="text-sm font-medium text-foreground mb-1">All caught up!</h3>
                        <p className="text-xs text-muted-foreground">No pending approvals at the moment</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {pendingApprovals.map((request) => {
                          const days = getDaysSince(request.createdAt)
                          return (
                            <div
                              key={request.id}
                              className="p-4 rounded-lg border border-border bg-card hover:bg-accent/20 transition-colors"
                            >
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                                <div className="flex items-start gap-3 flex-1 min-w-0">
                                  <input
                                    type="checkbox"
                                    checked={selectedRequests.includes(request.id)}
                                    onChange={() =>
                                      setSelectedRequests((prev) =>
                                        prev.includes(request.id)
                                          ? prev.filter((id) => id !== request.id)
                                          : [...prev, request.id]
                                      )
                                    }
                                    className="mt-1 rounded border-border"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                      <span className="text-sm font-medium text-foreground">
                                        {request.student.name}
                                      </span>
                                      {request.student.prn && (
                                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                          {request.student.prn}
                                        </Badge>
                                      )}
                                      <Badge className={`text-[10px] px-1.5 py-0 ${getPriorityColor(days)}`}>
                                        {days >= 3 ? 'HIGH' : days >= 1 ? 'MEDIUM' : 'LOW'}
                                      </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground mb-1">
                                      <span className="font-medium text-foreground">{request.component.name}</span>
                                      {' '}· Qty: {request.quantity}
                                      {' '}· {request.expectedDuration} days
                                    </p>
                                    <p className="text-xs text-muted-foreground line-clamp-2 sm:line-clamp-1">
                                      {request.purpose}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 sm:shrink-0">
                                  <Button
                                    size="sm"
                                    onClick={() => handleApprove(request.id)}
                                    disabled={
                                      approveRequestMutation.isPending ||
                                      request.component.availableStock < request.quantity
                                    }
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white flex-1 sm:flex-none"
                                  >
                                    <CheckCircle className="h-3.5 w-3.5 sm:mr-1" />
                                    <span className="hidden sm:inline">Approve</span>
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleReject(request.id)}
                                    disabled={approveRequestMutation.isPending}
                                    className="flex-1 sm:flex-none"
                                  >
                                    <XCircle className="h-3.5 w-3.5 sm:mr-1" />
                                    <span className="hidden sm:inline">Reject</span>
                                  </Button>
                                </div>
                              </div>
                              {request.component.availableStock < request.quantity && (
                                <p className="text-xs text-destructive mt-2 flex items-center gap-1">
                                  <AlertTriangle className="h-3 w-3" />
                                  Insufficient stock ({request.component.availableStock} available)
                                </p>
                              )}
                            </div>
                          )
                        })}

                        {pendingApprovals.length > 0 && (
                          <div className="flex gap-2 pt-2">
                            <Button
                              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white"
                              onClick={handleBulkApprove}
                              disabled={selectedRequests.length === 0 || bulkApprovalMutation.isPending}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Bulk Approve Selected ({selectedRequests.length})
                            </Button>
                            <Link href="/requests/all" className="flex-1">
                              <Button variant="outline" className="w-full">
                                <Eye className="h-4 w-4 mr-2" />
                                View All Requests
                              </Button>
                            </Link>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ── Overview tab ───────────────────────────────── */}
              <TabsContent value="overview">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      title: 'Manage Inventory',
                      desc: 'View and manage all components',
                      href: '/inventory/manage',
                      icon: Package,
                    },
                    {
                      title: 'User Management',
                      desc: 'Manage student and staff roles',
                      href: '/users',
                      icon: Users,
                    },
                  ].map((item) => (
                    <Link key={item.href} href={item.href}>
                      <Card className="hover:border-primary/30 hover:bg-accent/20 transition-all cursor-pointer h-full">
                        <CardContent className="p-5 flex items-start gap-4">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <item.icon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{item.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}
