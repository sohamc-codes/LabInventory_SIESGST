'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

interface ComponentRequest {
  id: string
  studentId: string
  componentId: string
  quantity: number
  purpose: string
  expectedDuration: number
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ISSUED' | 'RETURNED' | 'OVERDUE' | 'CLOSED'
  approvedBy?: string
  approvedAt?: string
  rejectionReason?: string
  createdAt: string
  updatedAt: string
  student: {
    id: string
    name: string
    email: string
    prn?: string
    department?: string
  }
  component: {
    id: string
    name: string
    category: string
    manufacturer?: string
    specifications?: string
    availableStock: number
    storageLocation?: string
    imageUrl?: string
    condition?: string
  }
  issuedItem?: {
    id: string
    issuedAt: string
    expectedReturnDate: string
    actualReturnDate?: string
    isReturned: boolean
  }
}

interface RequestsResponse {
  requests: ComponentRequest[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

interface RequestFilters {
  status?: string
  page?: number
  limit?: number
}

export function useRequests(filters: RequestFilters = {}) {
  return useQuery({
    queryKey: ['requests', filters],
    queryFn: async (): Promise<RequestsResponse> => {
      const params = new URLSearchParams()
      
      if (filters.status) params.append('status', filters.status)
      if (filters.page) params.append('page', filters.page.toString())
      if (filters.limit) params.append('limit', filters.limit.toString())

      const response = await fetch(`/api/requests?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch requests')
      }
      
      return response.json()
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export function useRequest(id: string) {
  return useQuery({
    queryKey: ['request', id],
    queryFn: async (): Promise<ComponentRequest> => {
      const response = await fetch(`/api/requests/${id}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch request')
      }
      
      return response.json()
    },
    enabled: !!id,
  })
}

interface CreateRequestData {
  componentId: string
  quantity: number
  purpose: string
  expectedDuration: number // In months: 6, 12, 18, or 24
  projectId?: string
  startDate?: string
  endDate?: string
}

export function useCreateRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateRequestData): Promise<ComponentRequest> => {
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create request')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] })
      queryClient.invalidateQueries({ queryKey: ['components'] })
      toast.success('Request submitted successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

interface UpdateRequestData {
  status: 'APPROVED' | 'REJECTED'
  rejectionReason?: string
}

export function useUpdateRequest(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: UpdateRequestData): Promise<ComponentRequest> => {
      if (!id) {
        throw new Error('Request ID is required')
      }

      const response = await fetch(`/api/requests/${id}`, {
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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['requests'] })
      queryClient.invalidateQueries({ queryKey: ['request', id] })
      toast.success(`Request ${data.status.toLowerCase()} successfully`)
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useCancelRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await fetch(`/api/requests/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to cancel request')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] })
      toast.success('Request cancelled successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}