'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

interface Component {
  id: string
  name: string
  category: string
  manufacturer?: string
  specifications?: string
  totalStock: number
  availableStock: number
  condition: string
  cost?: number
  storageLocation?: string
  imageUrl?: string
  serialNumber?: string | null
  qrCode?: string | null
  createdAt: string
  updatedAt: string
}

interface ComponentsResponse {
  components: Component[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

interface ComponentFilters {
  category?: string
  search?: string
  page?: number
  limit?: number
}

export function useComponents(filters: ComponentFilters = {}) {
  return useQuery({
    queryKey: ['components', filters],
    queryFn: async (): Promise<ComponentsResponse> => {
      const params = new URLSearchParams()
      
      if (filters.category) params.append('category', filters.category)
      if (filters.search) params.append('search', filters.search)
      if (filters.page) params.append('page', filters.page.toString())
      if (filters.limit) params.append('limit', filters.limit.toString())

      const response = await fetch(`/api/components?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch components')
      }
      
      return response.json()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useComponent(id: string) {
  return useQuery({
    queryKey: ['component', id],
    queryFn: async (): Promise<Component> => {
      const response = await fetch(`/api/components/${id}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch component')
      }
      
      return response.json()
    },
    enabled: !!id,
  })
}

interface CreateComponentData {
  name: string
  category: string
  manufacturer?: string
  specifications?: string
  totalStock: number
  condition?: string
  purchaseDate?: string
  cost?: number
  storageLocation?: string
  description?: string
  imageUrl?: string
}

export function useCreateComponent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateComponentData): Promise<Component> => {
      const response = await fetch('/api/components', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create component')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['components'] })
      toast.success('Component created successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

interface UpdateComponentData {
  name?: string
  category?: string
  manufacturer?: string
  specifications?: string
  totalStock?: number
  condition?: string
  cost?: number
  storageLocation?: string
  description?: string
}

export function useUpdateComponent(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: UpdateComponentData): Promise<Component> => {
      const response = await fetch(`/api/components/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update component')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['components'] })
      queryClient.invalidateQueries({ queryKey: ['component', id] })
      toast.success('Component updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useDeleteComponent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await fetch(`/api/components/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete component')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['components'] })
      toast.success('Component deleted successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}