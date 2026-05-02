import { useState, useEffect } from 'react'
import { useDebounce } from 'use-debounce'

interface Component {
  id: string
  name: string
  category: string
  manufacturer: string
  model: string
  specifications: string
  imageUrl?: string
  purchaseDate: Date
  cost: number
  storageLocation: string
  qrCode: string
  availableStock: number
  totalStock: number
  condition: string
  description?: string
}

interface SearchResult {
  components: Component[]
  total: number
}

export function useComponentSearch(query: string) {
  const [debouncedQuery] = useDebounce(query, 300)
  const [data, setData] = useState<SearchResult>({ components: [], total: 0 })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setData({ components: [], total: 0 })
      return
    }

    const searchComponents = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/search/components?q=${encodeURIComponent(debouncedQuery)}&limit=20`)
        
        if (!response.ok) {
          throw new Error('Failed to search components')
        }

        const result = await response.json()
        setData(result)
      } catch (err) {
        console.error('Component search error:', err)
        setError(err instanceof Error ? err.message : 'Search failed')
        setData({ components: [], total: 0 })
      } finally {
        setIsLoading(false)
      }
    }

    searchComponents()
  }, [debouncedQuery])

  return { data, isLoading, error }
}

export function useComponentRecommendations() {
  const [data, setData] = useState<Component[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRecommendations = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Get popular/available components as recommendations
        const response = await fetch('/api/components?limit=10&orderBy=popularity')
        
        if (!response.ok) {
          throw new Error('Failed to fetch recommendations')
        }

        const result = await response.json()
        setData(result.components || [])
      } catch (err) {
        console.error('Recommendations error:', err)
        setError(err instanceof Error ? err.message : 'Failed to load recommendations')
        setData([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchRecommendations()
  }, []) // Remove userId dependency

  return { data, isLoading, error }
}