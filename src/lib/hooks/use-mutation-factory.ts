'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

interface UpdateRequestData {
  status: 'APPROVED' | 'REJECTED'
  rejectionReason?: string
}

export function useUpdateRequestMutation(requestId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: UpdateRequestData) => {
      if (!requestId) {
        throw new Error('Request ID is required')
      }

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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['requests'] })
      queryClient.invalidateQueries({ queryKey: ['request', requestId] })
      toast.success(`Request ${data.status.toLowerCase()} successfully`)
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}