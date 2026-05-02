'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export interface HODStats {
  pendingApprovals: number
  totalStudents: number
  activeRequests: number
  overdueItems: number
  monthlyRequests: number
  approvalRate: number
  avgApprovalTime: number
  departmentEfficiency: number
  budgetUtilization: number
  trends: {
    approvals: number
    efficiency: number
    satisfaction: number
  }
}

export interface ActivityItem {
  type: string
  action: string
  student: string
  time: string
  component: string
  value?: number
  reason?: string
  impact: 'HIGH' | 'MEDIUM' | 'LOW'
}

export interface PendingApproval {
  id: string
  studentName: string
  prn: string
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  urgency: 'URGENT' | 'NORMAL' | 'LOW'
  component: string
  quantity: number
  estimatedCost: number
  duration: string
  supervisor: string
  purpose: string
  requestDate: string
}

export interface HODDashboardData {
  stats: HODStats
  recentActivity: ActivityItem[]
  pendingApprovals: PendingApproval[]
}

export function useHODDashboard() {
  return useQuery({
    queryKey: ['hod-dashboard'],
    queryFn: async (): Promise<HODDashboardData> => {
      const response = await fetch('/api/dashboard/hod')
      
      if (!response.ok) {
        throw new Error('Failed to fetch HOD dashboard data')
      }
      
      return response.json()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
  })
}

interface ApprovalData {
  status: 'APPROVED' | 'REJECTED'
  rejectionReason?: string
}

export function useApproveRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ requestId, data }: { requestId: string, data: ApprovalData }) => {
      const response = await fetch(`/api/requests/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update request')
      }

      return response.json()
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['hod-dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['requests'] })
      
      const action = variables.data.status === 'APPROVED' ? 'approved' : 'rejected'
      toast.success(`Request ${action} successfully`)
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useBulkApproval() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (requestIds: string[]) => {
      const promises = requestIds.map(id => 
        fetch(`/api/requests/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: 'APPROVED' }),
        })
      )

      const responses = await Promise.all(promises)
      
      // Check if all requests were successful
      const failedRequests = responses.filter(response => !response.ok)
      if (failedRequests.length > 0) {
        throw new Error(`Failed to approve ${failedRequests.length} requests`)
      }

      return responses.length
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['hod-dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['requests'] })
      toast.success(`Successfully approved ${count} requests`)
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}