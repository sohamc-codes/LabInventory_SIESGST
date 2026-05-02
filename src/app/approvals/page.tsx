'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Search,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Package,
  Calendar,
  MessageSquare,
  Filter,
  PackageCheck,
  AlertTriangle,
} from 'lucide-react'
import { useRequests } from '@/lib/hooks/use-requests'
import { formatDate, formatDateTime } from '@/lib/utils'
import { toast } from 'sonner'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default function ApprovalsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [issuingId, setIssuingId] = useState<string | null>(null)
  const [issueNotes, setIssueNotes] = useState('')
  const [showIssueModal, setShowIssueModal] = useState(false)
  const [pendingIssueRequest, setPendingIssueRequest] = useState<any>(null)

  const { data, isLoading, refetch } = useRequests({
    status: 'PENDING',
    limit: 50,
  })

  const filteredRequests = data?.requests?.filter(request =>
    request.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.student.prn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.component.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const handleReject = (requestId: string) => {
    setSelectedRequest(requestId)
    setShowRejectModal(true)
  }

  const confirmReject = async () => {
    if (!selectedRequest || !rejectionReason.trim()) {
      alert('Please provide a reason for rejection')
      return
    }

    try {
      const response = await fetch(`/api/requests/${selectedRequest}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'REJECTED',
          rejectionReason: rejectionReason.trim(),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to reject request')
      }

      setShowRejectModal(false)
      setRejectionReason('')
      setSelectedRequest(null)
      refetch()
    } catch (error) {
      console.error('Error rejecting request:', error)
    }
  }

  const openIssueModal = (request: any) => {
    setPendingIssueRequest(request)
    setIssueNotes('')
    setShowIssueModal(true)
  }

  const confirmIssue = async () => {
    if (!pendingIssueRequest) return
    setIssuingId(pendingIssueRequest.id)
    setShowIssueModal(false)

    try {
      const res = await fetch(`/api/requests/${pendingIssueRequest.id}/issue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: issueNotes.trim() || undefined }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Failed to issue component')
        return
      }

      toast.success(`${pendingIssueRequest.component.name} issued successfully`)
      refetch()
    } catch {
      toast.error('Network error — please try again')
    } finally {
      setIssuingId(null)
      setPendingIssueRequest(null)
    }
  }

  const getPriorityLevel = (request: any) => {
    const daysSinceRequest = Math.floor(
      (new Date().getTime() - new Date(request.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    )
    
    if (daysSinceRequest >= 3) return 'high'
    if (daysSinceRequest >= 1) return 'medium'
    return 'low'
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen bg-background overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header title="Pending Approvals" subtitle="Loading..." />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading pending requests...</p>
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
          title="Pending Approvals"
          subtitle={`${filteredRequests.length} requests awaiting your approval`}
        />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Pending</p>
                      <p className="text-2xl font-bold text-orange-600">{filteredRequests.length}</p>
                    </div>
                    <Clock className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">High Priority</p>
                      <p className="text-2xl font-bold text-red-600">
                        {filteredRequests.filter(r => getPriorityLevel(r) === 'high').length}
                      </p>
                    </div>
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <Clock className="h-4 w-4 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Unique Students</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {new Set(filteredRequests.map(r => r.studentId)).size}
                      </p>
                    </div>
                    <User className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Components</p>
                      <p className="text-2xl font-bold text-green-600">
                        {new Set(filteredRequests.map(r => r.componentId)).size}
                      </p>
                    </div>
                    <Package className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Actions and Search */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by student name, PRN, or component..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Requests Table */}
            <Card>
              <CardHeader>
                <CardTitle>Pending Requests</CardTitle>
                <CardDescription>
                  Review and approve student component requests. Approved requests will be available for lab assistants to issue.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredRequests.length > 0 ? (
                  <div className="overflow-x-auto w-full">
                    <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Component</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead className="hidden md:table-cell">Purpose</TableHead>
                        <TableHead className="hidden lg:table-cell">Duration</TableHead>
                        <TableHead className="hidden lg:table-cell">Priority</TableHead>
                        <TableHead className="hidden lg:table-cell">Requested</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRequests.map((request) => {
                        const priority = getPriorityLevel(request)
                        return (
                          <TableRow key={request.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{request.student.name}</p>
                                <p className="text-sm text-gray-500 md:hidden">{request.student.prn}</p>
                                <p className="text-sm text-gray-500 hidden md:block">{request.student.prn}</p>
                                <p className="text-xs text-gray-400 hidden md:block">{request.student.department}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{request.component.name}</p>
                                <p className="text-sm text-gray-500">{request.component.category}</p>
                                <p className="text-xs text-gray-400">
                                  Available: {request.component.availableStock}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="font-medium">{request.quantity}</span>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <div className="max-w-xs">
                                <p className="text-sm line-clamp-2" title={request.purpose}>
                                  {request.purpose}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3 text-gray-400" />
                                <span className="text-sm">{request.expectedDuration} days</span>
                              </div>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              <Badge className={getPriorityColor(priority)}>
                                {priority.toUpperCase()}
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              <p className="text-sm">{formatDate(request.createdAt)}</p>
                              <p className="text-xs text-gray-500">
                                {formatDateTime(request.createdAt)}
                              </p>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => openIssueModal(request)}
                                  disabled={
                                    issuingId === request.id ||
                                    request.component.availableStock < request.quantity
                                  }
                                  className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                  {issuingId === request.id ? (
                                    <>
                                      <span className="animate-spin h-3 w-3 border border-white border-t-transparent rounded-full mr-1" />
                                      <span className="hidden sm:inline">Issuing...</span>
                                    </>
                                  ) : (
                                    <>
                                      <PackageCheck className="h-3 w-3 sm:mr-1" />
                                      <span className="hidden sm:inline">Issue</span>
                                    </>
                                  )}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleReject(request.id)}
                                  className="text-red-600 border-red-200 hover:bg-red-50"
                                >
                                  <XCircle className="h-3 w-3 sm:mr-1" />
                                  <span className="hidden sm:inline">Reject</span>
                                </Button>
                              </div>
                              {request.component.availableStock < request.quantity && (
                                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                  <AlertTriangle className="h-3 w-3" />
                                  <span className="hidden sm:inline">Insufficient stock</span>
                                </p>
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
                    <p className="text-gray-500">
                      {searchTerm
                        ? 'No requests match your search criteria'
                        : 'No pending requests at the moment'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-600" />
                Reject Request
              </CardTitle>
              <CardDescription>
                Please provide a reason for rejecting this request
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter reason for rejection..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none"
                rows={4}
                required
              />
              <div className="flex gap-2">
                <Button
                  onClick={confirmReject}
                  disabled={!rejectionReason.trim()}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject Request
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRejectModal(false)
                    setRejectionReason('')
                    setSelectedRequest(null)
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Issue Confirmation Modal */}
      {showIssueModal && pendingIssueRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PackageCheck className="h-5 w-5 text-blue-600" />
                Confirm Component Issue
              </CardTitle>
              <CardDescription>
                You are about to physically hand over this component
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Summary */}
              <div className="rounded-lg border border-border bg-muted/50 p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Component</span>
                  <span className="font-medium">{pendingIssueRequest.component.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Student</span>
                  <span className="font-medium">{pendingIssueRequest.student.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">PRN</span>
                  <span className="font-medium">{pendingIssueRequest.student.prn ?? '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Quantity</span>
                  <span className="font-medium">{pendingIssueRequest.quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-medium">{pendingIssueRequest.expectedDuration} days</span>
                </div>
              </div>

              {/* What will happen */}
              <div className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-3 space-y-1 text-xs text-blue-700 dark:text-blue-300">
                <p className="font-medium text-blue-800 dark:text-blue-200 mb-1">This will:</p>
                <p>✓ Approve and issue in one action</p>
                <p>✓ Decrement stock by {pendingIssueRequest.quantity}</p>
                <p>✓ Create return deadline</p>
                <p>✓ Notify the student</p>
              </div>

              {/* Optional notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Notes (optional)
                </label>
                <textarea
                  value={issueNotes}
                  onChange={(e) => setIssueNotes(e.target.value)}
                  placeholder="e.g. Handle with care, check connections..."
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-1">
                <Button
                  onClick={confirmIssue}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  <PackageCheck className="h-4 w-4 mr-2" />
                  Confirm Issue
                </Button>
                <Button
                  variant="outline"
                  onClick={() => { setShowIssueModal(false); setPendingIssueRequest(null) }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}