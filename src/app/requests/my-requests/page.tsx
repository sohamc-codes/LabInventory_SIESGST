'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  Calendar,
  Package,
  ArrowUpRight,
  FileText,
  User,
  Target,
} from 'lucide-react'
import { useRequests } from '@/lib/hooks/use-requests'
import { formatDate, getStatusColor } from '@/lib/utils'
import Link from 'next/link'

export default function MyRequestsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [page, setPage] = useState(1)
  const [refreshing, setRefreshing] = useState(false)

  const { data, isLoading, error, refetch } = useRequests({
    page,
    limit: 10,
    status: statusFilter === 'ALL' ? undefined : statusFilter,
  })

  const filteredRequests = data?.requests?.filter(request =>
    request.component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.purpose.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  // Enhanced statistics
  const stats = {
    total: data?.pagination.total || 0,
    pending: filteredRequests.filter(r => r.status === 'PENDING').length,
    approved: filteredRequests.filter(r => r.status === 'APPROVED').length,
    issued: filteredRequests.filter(r => r.status === 'ISSUED').length,
    rejected: filteredRequests.filter(r => r.status === 'REJECTED').length,
    overdue: filteredRequests.filter(r => r.status === 'OVERDUE').length,
    successRate: filteredRequests.length > 0 ? 
      Math.round(((filteredRequests.filter(r => ['APPROVED', 'ISSUED'].includes(r.status)).length / filteredRequests.length) * 100)) : 0,
    avgDuration: filteredRequests.length > 0 ? 
      Math.round(filteredRequests.reduce((sum, r) => sum + (r.expectedDuration || 0), 0) / filteredRequests.length) : 0
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await refetch()
    setRefreshing(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4" />
      case 'APPROVED':
        return <CheckCircle className="h-4 w-4" />
      case 'REJECTED':
        return <XCircle className="h-4 w-4" />
      case 'ISSUED':
        return <CheckCircle className="h-4 w-4" />
      case 'OVERDUE':
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusDescription = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Awaiting HOD approval'
      case 'APPROVED':
        return 'Ready for lab assistant to issue'
      case 'REJECTED':
        return 'Request was declined'
      case 'ISSUED':
        return 'Components have been issued'
      case 'OVERDUE':
        return 'Return date has passed'
      default:
        return 'Status unknown'
    }
  }

  const getPriorityColor = (expectedDuration: number) => {
    if (expectedDuration <= 7) return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200'
    if (expectedDuration <= 14) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200'
    return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200'
  }

  const handleNewRequest = () => {
    window.location.href = '/requests/new'
  }

  const handleViewRequest = (requestId: string) => {
    window.location.href = `/requests/${requestId}`
  }

  const handleCancelRequest = (requestId: string) => {
    if (confirm('Are you sure you want to cancel this request?')) {
      console.log('Cancelling request:', requestId)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen bg-background overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header title="My Requests" subtitle="Loading your requests..." />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-muted-foreground">Loading your request history...</p>
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
          title="My Requests"
          subtitle={`Track and manage your component requests • ${stats.total} total requests`}
          rightContent={
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
              <Link href="/requests/new">
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Request
                </Button>
              </Link>
            </div>
          }
        />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Enhanced Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="relative overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-zinc-400">Total Requests</p>
                      <p className="text-2xl font-bold">{stats.total}</p>
                      <p className="text-xs text-muted-foreground">All time</p>
                    </div>
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                      <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </CardContent>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
              </Card>

              <Card className="relative overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-zinc-400">Success Rate</p>
                      <p className="text-2xl font-bold text-green-600">{stats.successRate}%</p>
                      <p className="text-xs text-green-600">Approved + Issued</p>
                    </div>
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                      <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <div className="mt-2">
                    <Progress value={stats.successRate} className="h-2" />
                  </div>
                </CardContent>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-500"></div>
              </Card>

              <Card className="relative overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-zinc-400">Pending</p>
                      <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                      <p className="text-xs text-yellow-600">Awaiting approval</p>
                    </div>
                    <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
                      <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    </div>
                  </div>
                </CardContent>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 to-orange-500"></div>
              </Card>

              <Card className="relative overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-zinc-400">Avg Duration</p>
                      <p className="text-2xl font-bold text-purple-600">{stats.avgDuration}d</p>
                      <p className="text-xs text-purple-600">Expected usage</p>
                    </div>
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                </CardContent>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
              </Card>
            </div>

            {/* Status Overview Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                  <p className="text-xs text-gray-600 dark:text-zinc-400">Approved</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-2xl font-bold text-blue-600">{stats.issued}</p>
                  <p className="text-xs text-gray-600 dark:text-zinc-400">Issued</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <div className="w-8 h-8 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  </div>
                  <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                  <p className="text-xs text-gray-600 dark:text-zinc-400">Rejected</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <p className="text-2xl font-bold text-orange-600">{stats.overdue}</p>
                  <p className="text-xs text-gray-600 dark:text-zinc-400">Overdue</p>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Filters and Actions */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="flex-1 flex gap-4">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search by component or purpose..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md bg-card text-card-foreground appearance-none pr-10 bg-no-repeat bg-right"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                        backgroundPosition: 'right 0.5rem center',
                        backgroundSize: '1.5em 1.5em'
                      }}
                    >
                      <option value="ALL">All Status</option>
                      <option value="PENDING">Pending</option>
                      <option value="APPROVED">Approved</option>
                      <option value="REJECTED">Rejected</option>
                      <option value="ISSUED">Issued</option>
                      <option value="RETURNED">Returned</option>
                      <option value="OVERDUE">Overdue</option>
                    </select>
                  </div>
                  
                  <Button onClick={handleNewRequest} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    New Request
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Requests Display */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Your Requests</CardTitle>
                    <CardDescription>
                      All your component requests with detailed status and progress tracking
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="text-sm">
                    {filteredRequests.length} requests
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {filteredRequests.length > 0 ? (
                  <div className="space-y-4">
                    {filteredRequests.map((request) => (
                      <Card key={request.id} className="hover:shadow-md transition-all duration-200 border-l-4 border-l-blue-500">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-semibold text-lg">{request.component.name}</h3>
                                <Badge variant="outline" className={getStatusColor(request.status)}>
                                  <span className="flex items-center gap-1">
                                    {getStatusIcon(request.status)}
                                    {request.status}
                                  </span>
                                </Badge>
                                <Badge variant="outline" className={getPriorityColor(request.expectedDuration)}>
                                  {request.expectedDuration}d duration
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-zinc-400 mb-1">
                                {request.component.category} • Quantity: {request.quantity}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {getStatusDescription(request.status)}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewRequest(request.id)}
                              >
                                <Eye className="h-3 w-3 mr-2" />
                                View
                              </Button>
                              {request.status === 'PENDING' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleCancelRequest(request.id)}
                                  className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 dark:border-red-800 dark:hover:border-red-700"
                                >
                                  <Trash2 className="h-3 w-3 mr-2" />
                                  Cancel
                                </Button>
                              )}
                            </div>
                          </div>

                          <div className="bg-muted/50 rounded-lg p-4 mb-4">
                            <p className="text-sm">
                              <span className="font-medium text-gray-700 dark:text-zinc-300">Purpose:</span>
                              <span className="text-gray-600 dark:text-zinc-400 ml-2">{request.purpose}</span>
                            </p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <div>
                                <p className="text-muted-foreground">Requested</p>
                                <p className="font-medium">{formatDate(request.createdAt)}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-400" />
                              <div>
                                <p className="text-muted-foreground">Duration</p>
                                <p className="font-medium">{request.expectedDuration} days</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-gray-400" />
                              <div>
                                <p className="text-muted-foreground">Status Updated</p>
                                <p className="font-medium">{formatDate(request.updatedAt || request.createdAt)}</p>
                              </div>
                            </div>
                          </div>

                          {/* Progress indicator for different statuses */}
                          <div className="mt-4">
                            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                              <span>Request Progress</span>
                              <span>
                                {request.status === 'PENDING' && '25%'}
                                {request.status === 'APPROVED' && '50%'}
                                {request.status === 'ISSUED' && '75%'}
                                {request.status === 'RETURNED' && '100%'}
                                {request.status === 'REJECTED' && '0%'}
                                {request.status === 'OVERDUE' && '75%'}
                              </span>
                            </div>
                            <Progress 
                              value={
                                request.status === 'PENDING' ? 25 :
                                request.status === 'APPROVED' ? 50 :
                                request.status === 'ISSUED' ? 75 :
                                request.status === 'RETURNED' ? 100 :
                                request.status === 'REJECTED' ? 0 :
                                request.status === 'OVERDUE' ? 75 : 0
                              } 
                              className="h-2" 
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Clock className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">No requests found</h3>
                    <p className="text-muted-foreground mb-6">
                      {searchTerm || statusFilter !== 'ALL'
                        ? 'Try adjusting your search or filters'
                        : "You haven't made any requests yet"}
                    </p>
                    <Button onClick={handleNewRequest} className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Request
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pagination */}
            {data && data.pagination.pages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Showing {((page - 1) * 10) + 1} to {Math.min(page * 10, data.pagination.total)} of {data.pagination.total} requests
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page === data.pagination.pages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}