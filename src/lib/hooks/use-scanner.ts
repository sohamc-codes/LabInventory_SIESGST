import { useState } from 'react'

interface ScannedComponent {
  id: string
  name: string
  serialNumber: string
  category: string
  condition: string
  availableStock: number
  totalStock: number
  storageLocation: string
  manufacturer: string
  lastScanned: string
  issuedTo?: string
}

interface ScannedStudent {
  id: string
  name: string
  prn: string
  email: string
  department: string
  year: string
  activeIssues: number
  lastActivity: string
}

export function useScanner() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const scanComponent = async (qrCode: string): Promise<ScannedComponent | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/scanner/component', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrCode })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Component not found')
      }

      const { component } = await response.json()
      return component
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to scan component'
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const scanStudent = async (prn: string): Promise<ScannedStudent | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/scanner/student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prn })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Student not found')
      }

      const { student } = await response.json()
      return student
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to scan student'
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  return {
    scanComponent,
    scanStudent,
    isLoading,
    error,
    clearError: () => setError(null)
  }
}