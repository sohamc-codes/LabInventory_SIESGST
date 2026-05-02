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
  User,
  Package,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Send,
  Eye,
  RotateCcw,
  PackageCheck,
  AlertTriangle,
} from 'lucide-react'
import { useRequests } from '@/lib/hooks/use-requests'
import { formatDate, formatDateTime } from '@/lib/utils'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'

export default function AllRequestsPage() {
  const { data: session } = useSession()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('ALL')
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [issuingId, setIssuingId] = useState<string | null>(null)
  const [issueNotes, setIssueNotes] = useState('')
  const [showIssueModal, setShowIssueModal] = useState(false)
  const [pendingIssueRequest, setPendingIssueRequest] = useState<any>(null)

  const currentUser = session?.user || { role: 'GUEST' }
  const canIssue = currentUser.role === 'LAB_ASSISTANT' || currentUser.role === 'HOD'

  const { data, isLoading, refetch } = useRequests({ limit: 100 })

  const statusOptions = ['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'ISSUED', 'RETURNED']

  const filteredRequests = data?.requests?.filter(request => {
    const matchesSearch =
      request.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.student.prn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.component.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'ALL' || request.status === selectedStatus
    return matchesSearch && matchesStatus
  }) || []

  // ── Status helpers ──────────────────────────────────────────────────────────

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':  return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
      case 'APPROVED': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      case 'REJECTED': return 'bg-red-500/10 text-red-400 border-red-500/20'
      case 'ISSUED':   return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      case 'RETURNED': return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
      case 'OVERDUE':  return 'bg-red-500/10 text-red-400 border-red-500/20'
      default:         return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':  return <Clock className="h-3 w-3" />
      case 'APPROVED': return <CheckCircle className="h-3 w-3" />
      case 'REJECTED': return <XCircle className="h-3 w-3" />
      case 'ISSUED':   return <Send className="h-3 w-3" />
      case 'RETURNED': return <RotateCcw className="h-3 w-3" />
      default:         return <Clock className="h-3 w-3" />
    }
  }

  const getPriorityLevel = (request: any) => {
    const days = Math.floor(
      (Date.now() - new Date(request.createdAt).getTime()) / 86_400_000
    )
    if (request.status === 'PENDING' && days >= 3) return 'high'
    if (request.status === 'APPROVED' && days >= 2) return 'high'
    if (days >= 1) return 'medium'
    return 'low'
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':   return 'bg-red-500/10 text-red-400 border-red-500/20'
      case 'medium': return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
      case 'low':    return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      default:       return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
    }
  }

  // ── Issue action ────────────────────────────────────────────────────────────

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

  // ── Stats ───────────────────────────────────────────────────────────────────

  const requestsByStatus = filteredRequests.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // ── Loading state ───────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex h-screen bg-background overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header title="All Requests" subtitle="Loading..." />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto" />
              <p className="text-sm text-zinc-500">Loading requests...</p>
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
          title="All Requests"
          subtitle={`${filteredRequests.length} requests · ${currentUser.role === 'HOD' ? 'HOD View' : 'Lab Assistant View'}`}
        />

        <main className="flex-1 overflow-y-auto p-5">
          <div className="max-w-7xl mx-auto space-y-5">

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { label: 'Total',    value: filteredRequests.length,          color: 'text-zinc-300',   icon: Package },
                { label: 'Pending',  value: requestsByStatus.PENDING  || 0,   color: 'text-amber-400',  icon: Clock },
                { label: 'Approved', value: requestsByStatus.APPROVED || 0,   color: 'text-emerald-400',icon: CheckCircle },
                { label: 'Issued',   value: requestsByStatus.ISSUED   || 0,   color: 'text-blue-400',   icon: Send },
                { label: 'Rejected', value: requestsByStatus.REJECTED || 0,   color: 'text-red-400',    icon: XCircle },
                { label: 'Students', value: new Set(filteredRequests.map(r => r.studentId)).size, color: 'text-purple-400', icon: User },
              ].map(({ label, value, color, icon: Icon }) => (
                <Card key={label}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-zinc-500">{label}</p>
                        <p className={`text-xl font-bold ${color}`}>{value}</p>
                      </div>
                      <Icon className={`h-5 w-5 ${color} opacity-60`} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <Input
                      placeholder="Search by student name, PRN, or component..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {statusOptions.map((status) => (
                      <Button
                        key={status}
                        variant={selectedStatus === status ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedStatus(status)}
                        className="text-xs"
                      >
                        {status === 'ALL' ? 'All' : status}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Component Requests</CardTitle>
                <CardDescription>
                  {canIssue
                    ? 'Issue components for APPROVED requests. Use the "Issue" button to hand over the physical part.'
                    : 'All component requests for monitoring and tracking.'}
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
                        <TableHead>Qty</TableHead>
                        <TableHead className="hidden md:table-cell">Purpose</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="hidden lg:table-cell">Priority</TableHead>
                        <TableHead className="hidden lg:table-cell">Requested</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRequests.map((request) => {
                        const priority = getPriorityLevel(request)
                        const isBeingIssued = issuingId === request.id
                        const canIssueThis =
                          canIssue &&
                          request.status === 'APPROVED' &&
                          request.component.availableStock >= request.quantity

                        return (
                          <TableRow key={request.id} className="hover:bg-zinc-800/30">
                            <TableCell>
                              <div>
                                <p className="font-medium text-zinc-200">{request.student.name}</p>
                                <p className="text-xs text-zinc-500 md:hidden">{request.student.prn}</p>
                                <p className="text-xs text-zinc-600 hidden md:block">{request.student.prn}</p>
                                <p className="text-xs text-zinc-600 hidden md:block">{request.student.department}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium text-zinc-200">{request.component.name}</p>
                                <p className="text-xs text-zinc-500">{request.component.category}</p>
                                <p className="text-xs text-zinc-600">
                                  Stock: {request.component.availableStock}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="font-medium text-zinc-200">{request.quantity}</span>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <p className="text-sm text-zinc-400 line-clamp-2 max-w-[180px]" title={request.purpose}>
                                {request.purpose}
                              </p>
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(request.status)}>
                                <span className="flex items-center gap-1">
                                  {getStatusIcon(request.status)}
                                  <span className="hidden sm:inline">{request.status}</span>
                                </span>
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              <Badge className={getPriorityColor(priority)}>
                                {priority.toUpperCase()}
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              <p className="text-xs text-zinc-400">{formatDate(request.createdAt)}</p>
                              <p className="text-xs text-zinc-600">{formatDateTime(request.createdAt)}</p>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {/* Issue button — for Lab Assistants on PENDING or APPROVED requests */}
                                {canIssue && (request.status === 'PENDING' || request.status === 'APPROVED') && (
                                  <Button
                                    size="sm"
                                    onClick={() => openIssueModal(request)}
                                    disabled={isBeingIssued || !canIssue}
                                    className="bg-blue-600 hover:bg-blue-500 text-white text-xs"
                                  >
                                    {isBeingIssued ? (
                                      <span className="flex items-center gap-1">
                                        <span className="animate-spin h-3 w-3 border border-white border-t-transparent rounded-full" />
                                        <span className="hidden sm:inline">Issuing…</span>
                                      </span>
                                    ) : (
                                      <span className="flex items-center gap-1">
                                        <PackageCheck className="h-3 w-3" />
                                        <span className="hidden sm:inline">Issue</span>
                                      </span>
                                    )}
                                  </Button>
                                )}

                                {/* Insufficient stock warning */}
                                {canIssue &&
                                  (request.status === 'PENDING' || request.status === 'APPROVED') &&
                                  request.component.availableStock < request.quantity && (
                                    <span className="hidden md:flex items-center gap-1 text-xs text-red-400">
                                      <AlertTriangle className="h-3 w-3" />
                                      Low stock
                                    </span>
                                  )}

                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => { setSelectedRequest(request); setShowDetailModal(true) }}
                                >
                                  <Eye className="h-3 w-3 sm:mr-1" />
                                  <span className="hidden sm:inline">View</span>
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 text-zinc-700 mx-auto mb-3" />
                    <h3 className="text-sm font-medium text-zinc-300 mb-1">No requests found</h3>
                    <p className="text-xs text-zinc-600">
                      {searchTerm || selectedStatus !== 'ALL'
                        ? 'No requests match your current filters'
                        : 'No component requests have been made yet'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* ── Issue Confirmation Modal ──────────────────────────────────────────── */}
      {showIssueModal && pendingIssueRequest && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md border-zinc-700/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <PackageCheck className="h-5 w-5 text-blue-400" />
                Confirm Component Issue
              </CardTitle>
              <CardDescription>
                You are about to physically hand over this component. This action will:
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Summary */}
              <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Component</span>
                  <span className="font-medium text-zinc-200">{pendingIssueRequest.component.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Student</span>
                  <span className="font-medium text-zinc-200">{pendingIssueRequest.student.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">PRN</span>
                  <span className="font-medium text-zinc-200">{pendingIssueRequest.student.prn ?? '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Quantity</span>
                  <span className="font-medium text-zinc-200">{pendingIssueRequest.quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Duration</span>
                  <span className="font-medium text-zinc-200">{pendingIssueRequest.expectedDuration} days</span>
                </div>
              </div>

              {/* What will happen */}
              <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3 space-y-1 text-xs text-blue-300">
                <p className="font-medium text-blue-400 mb-1">This will atomically:</p>
                <p>✓ Set request status → <strong>ISSUED</strong></p>
                <p>✓ Decrement <strong>{pendingIssueRequest.component.name}</strong> stock by <strong>{pendingIssueRequest.quantity}</strong></p>
                <p>✓ Create an IssuedComponent record with return deadline</p>
                <p>✓ Notify the student</p>
              </div>

              {/* Optional notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400">
                  Notes (optional)
                </label>
                <textarea
                  value={issueNotes}
                  onChange={(e) => setIssueNotes(e.target.value)}
                  placeholder="e.g. Handle with care, check connections before use..."
                  className="w-full px-3 py-2 text-sm bg-zinc-900 border border-zinc-700/60 rounded-lg text-zinc-200 placeholder:text-zinc-600 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-1">
                <Button
                  onClick={confirmIssue}
                  className="flex-1 bg-blue-600 hover:bg-blue-500"
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

      {/* ── Request Detail Modal ──────────────────────────────────────────────── */}
      {showDetailModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto border-zinc-700/60">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Package className="h-5 w-5 text-blue-400" />
                  Request Details
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowDetailModal(false)}>
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Student</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {[
                    ['Name', selectedRequest.student.name],
                    ['PRN', selectedRequest.student.prn],
                    ['Department', selectedRequest.student.department],
                    ['Email', selectedRequest.student.email],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <p className="text-zinc-500 text-xs">{label}</p>
                      <p className="font-medium text-zinc-200">{value ?? '—'}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Component</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {[
                    ['Component', selectedRequest.component.name],
                    ['Category', selectedRequest.component.category],
                    ['Requested Qty', selectedRequest.quantity],
                    ['Available Stock', selectedRequest.component.availableStock],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <p className="text-zinc-500 text-xs">{label}</p>
                      <p className="font-medium text-zinc-200">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Request</h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-zinc-500 text-xs mb-1">Purpose</p>
                    <p className="p-3 bg-zinc-900/60 border border-zinc-800/60 rounded-lg text-zinc-300">
                      {selectedRequest.purpose}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-zinc-500 text-xs">Duration</p>
                      <p className="font-medium text-zinc-200">{selectedRequest.expectedDuration} days</p>
                    </div>
                    <div>
                      <p className="text-zinc-500 text-xs">Status</p>
                      <Badge className={getStatusColor(selectedRequest.status)}>
                        {selectedRequest.status}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-zinc-500 text-xs">Requested On</p>
                      <p className="font-medium text-zinc-200">{formatDateTime(selectedRequest.createdAt)}</p>
                    </div>
                    {selectedRequest.approvedAt && (
                      <div>
                        <p className="text-zinc-500 text-xs">Approved On</p>
                        <p className="font-medium text-zinc-200">{formatDateTime(selectedRequest.approvedAt)}</p>
                      </div>
                    )}
                  </div>
                  {selectedRequest.rejectionReason && (
                    <div>
                      <p className="text-zinc-500 text-xs mb-1">Rejection Reason</p>
                      <p className="p-3 bg-red-500/5 border border-red-500/20 rounded-lg text-red-300 text-xs">
                        {selectedRequest.rejectionReason}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Issue from detail modal too */}
              {canIssue && selectedRequest.status === 'APPROVED' && (
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-500"
                  onClick={() => {
                    setShowDetailModal(false)
                    openIssueModal(selectedRequest)
                  }}
                  disabled={selectedRequest.component.availableStock < selectedRequest.quantity}
                >
                  <PackageCheck className="h-4 w-4 mr-2" />
                  Issue This Component
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
