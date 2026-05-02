'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import {
  ArrowLeft,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  DollarSign,
  Link as LinkIcon,
  Image as ImageIcon,
  Sparkles,
  Trash2,
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export default function SpecialRequestsListPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [selectedStatus, setSelectedStatus] = useState('ALL')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['special-requests', selectedStatus],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (selectedStatus !== 'ALL') {
        params.append('status', selectedStatus)
      }
      const response = await fetch(`/api/special-requests?${params}`)
      if (!response.ok) throw new Error('Failed to fetch special requests')
      return response.json()
    },
  })

  const deleteRequestMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/special-requests/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete request')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['special-requests'] })
      alert('Request deleted successfully')
      setDeletingId(null)
    },
    onError: (error: Error) => {
      alert(`Failed to delete request: ${error.message}`)
      setDeletingId(null)
    },
  })

  const handleDelete = (id: string, partName: string) => {
    if (confirm(`Are you sure you want to delete the request for "${partName}"?\n\nThis action cannot be undone.`)) {
      setDeletingId(id)
      deleteRequestMutation.mutate(id)
    }
  }

  const requests = data?.requests || []

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200', icon: Clock },
      UNDER_REVIEW: { label: 'Under Review', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200', icon: Eye },
      APPROVED: { label: 'Approved', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200', icon: CheckCircle },
      REJECTED: { label: 'Rejected', color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200', icon: XCircle },
      ORDERED: { label: 'Ordered', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-200', icon: Package },
      RECEIVED: { label: 'Received', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200', icon: CheckCircle },
    }
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING
  }

  const statuses = ['ALL', 'PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'ORDERED', 'RECEIVED']

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="My Special Requests"
          subtitle="Track your special component requests"
          rightContent={
            <Button variant="outline" onClick={() => router.push('/requests/special')}>
              <Sparkles className="h-4 w-4 mr-2" />
              New Special Request
            </Button>
          }
        />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-2">
                  {statuses.map((status) => (
                    <Button
                      key={status}
                      variant={selectedStatus === status ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedStatus(status)}
                    >
                      {status.replace('_', ' ')}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Requests List */}
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading requests...</p>
              </div>
            ) : requests.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                {requests.map((request: any) => {
                  const statusInfo = getStatusBadge(request.status)
                  const StatusIcon = statusInfo.icon
                  const imageUrls = request.imageUrls ? JSON.parse(request.imageUrls) : []

                  return (
                    <Card key={request.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-semibold">{request.partName}</h3>
                              <Badge className={statusInfo.color}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {statusInfo.label}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              {request.description}
                            </p>
                          </div>
                          
                          {/* Delete Button - Only for PENDING requests */}
                          {request.status === 'PENDING' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(request.id, request.partName)}
                              disabled={deletingId === request.id}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-800"
                            >
                              {deletingId === request.id ? (
                                <>
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600 mr-2"></div>
                                  Deleting...
                                </>
                              ) : (
                                <>
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </>
                              )}
                            </Button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="text-xs text-muted-foreground">Quantity</p>
                              <p className="font-medium">{request.quantity}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="text-xs text-muted-foreground">Submitted</p>
                              <p className="font-medium">
                                {new Date(request.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          {request.reviewedAt && (
                            <div className="flex items-center gap-2">
                              <Eye className="h-4 w-4 text-gray-400" />
                              <div>
                                <p className="text-xs text-muted-foreground">Reviewed</p>
                                <p className="font-medium">
                                  {new Date(request.reviewedAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Purpose */}
                        <div className="mb-4 p-3 bg-muted rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">Purpose</p>
                          <p className="text-sm">{request.purpose}</p>
                        </div>

                        {/* Website Link */}
                        {request.websiteUrl && (
                          <div className="mb-4">
                            <a
                              href={request.websiteUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              <LinkIcon className="h-4 w-4" />
                              View Product Link
                            </a>
                          </div>
                        )}

                        {/* Images */}
                        {imageUrls.length > 0 && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                              <ImageIcon className="h-3 w-3" />
                              Product Images
                            </p>
                            <div className="flex gap-2 overflow-x-auto">
                              {imageUrls.map((url: string, index: number) => (
                                <img
                                  key={index}
                                  src={url}
                                  alt={`Product ${index + 1}`}
                                  className="h-20 w-20 object-cover rounded border border-gray-200 dark:border-zinc-800"
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Rejection Reason */}
                        {request.status === 'REJECTED' && request.rejectionReason && (
                          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <p className="text-xs text-red-600 dark:text-red-400 mb-1 font-medium">
                              Rejection Reason
                            </p>
                            <p className="text-sm text-red-700 dark:text-red-300">
                              {request.rejectionReason}
                            </p>
                          </div>
                        )}

                        {/* Admin Notes */}
                        {request.notes && (
                          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                            <p className="text-xs text-blue-600 dark:text-blue-400 mb-1 font-medium">
                              Admin Notes
                            </p>
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                              {request.notes}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    No special requests found
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {selectedStatus === 'ALL'
                      ? "You haven't submitted any special requests yet"
                      : `No requests with status: ${selectedStatus.replace('_', ' ')}`}
                  </p>
                  <Button onClick={() => router.push('/requests/special')}>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Create Special Request
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
