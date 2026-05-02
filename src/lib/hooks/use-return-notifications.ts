'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export interface ReturnNotification {
  id: string
  type: 'RETURN_SCHEDULED' | 'RETURN_OVERDUE'
  studentName: string
  componentName: string
  quantity: number
  returnDeadline: Date
  scheduledAt: Date
  partId: string
  isUrgent?: boolean
}

export function useReturnNotifications() {
  return useQuery({
    queryKey: ['return-notifications'],
    queryFn: async (): Promise<ReturnNotification[]> => {
      const response = await fetch('/api/returns/notifications')
      
      if (!response.ok) {
        throw new Error('Failed to fetch return notifications')
      }
      
      const data = await response.json()
      
      // Transform dates from strings to Date objects
      return data.notifications.map((notification: any) => ({
        ...notification,
        returnDeadline: new Date(notification.returnDeadline),
        scheduledAt: new Date(notification.scheduledAt)
      }))
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  })
}

export function useMarkAsReturned() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (partId: string) => {
      const response = await fetch('/api/returns/mark-returned', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ partId }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to mark as returned')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['return-notifications'] })
      queryClient.invalidateQueries({ queryKey: ['issued-components'] })
      toast.success('Component marked as returned successfully!')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}