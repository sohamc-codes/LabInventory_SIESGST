'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export interface IssuedPart {
  id: string
  component: {
    name: string
    serialNumber?: string
    category: string
    manufacturer: string
    specifications: string
    cost: number
    storageLocation: string
    qrCode: string
  }
  quantity: number
  issuedAt: Date
  expectedReturnDate: Date
  actualReturnDate?: Date
  purpose: string
  status: 'ACTIVE' | 'RETURNED' | 'ISSUED' | 'OVERDUE' | 'DUE_SOON'
  condition: string
  issuedBy: string
  notes: string
  isReturned: boolean
  student?: {
    id: string
    name: string
    prn: string
    department: string
  }
}

interface IssuedPartsResponse {
  issuedParts: IssuedPart[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

interface IssuedPartsFilters {
  status?: string
  page?: number
  limit?: number
}

export function useIssuedParts(filters: IssuedPartsFilters = {}) {
  return useQuery({
    queryKey: ['issued-parts', filters],
    queryFn: async (): Promise<IssuedPartsResponse> => {
      const params = new URLSearchParams()
      
      if (filters.status) params.append('status', filters.status)
      if (filters.page) params.append('page', filters.page.toString())
      if (filters.limit) params.append('limit', filters.limit.toString())

      const response = await fetch(`/api/parts-issued?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch issued parts')
      }
      
      const data = await response.json()
      
      // Transform dates from strings to Date objects
      return {
        ...data,
        issuedParts: data.issuedParts.map((part: any) => ({
          ...part,
          issuedAt: new Date(part.issuedAt),
          expectedReturnDate: new Date(part.expectedReturnDate),
          actualReturnDate: part.actualReturnDate ? new Date(part.actualReturnDate) : undefined,
        }))
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export function useScheduleReturn() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ partId, returnDate }: { partId: string, returnDate: Date }) => {
      const response = await fetch('/api/returns/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ partId, returnDate }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to schedule return')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issued-parts'] })
      toast.success('Return scheduled successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}