'use client'

import { useQuery } from '@tanstack/react-query'

export interface ComponentRecommendation {
  id: string
  name: string
  category: string
  reason: string
  confidence: number
  relatedComponents: string[]
  estimatedUsage: number
}

export interface UsagePattern {
  componentId: string
  componentName: string
  category: string
  weeklyUsage: number[]
  monthlyTrend: 'increasing' | 'decreasing' | 'stable'
  peakUsageDays: string[]
  averageRequestDuration: number
}

export interface PredictiveAnalytics {
  demandForecast: {
    componentId: string
    componentName: string
    predictedDemand: number
    confidence: number
    timeframe: string
  }[]
  stockAlerts: {
    componentId: string
    componentName: string
    currentStock: number
    recommendedReorder: number
    urgency: 'low' | 'medium' | 'high'
  }[]
  usagePatterns: UsagePattern[]
  recommendations: ComponentRecommendation[]
}

// Mock data for demo purposes
const mockRecommendations: ComponentRecommendation[] = [
  {
    id: '1',
    name: 'Arduino Uno R3',
    category: 'MICROCONTROLLER',
    reason: 'Popular choice for IoT projects',
    confidence: 92,
    relatedComponents: ['breadboard', 'jumper-wires', 'sensors'],
    estimatedUsage: 85
  },
  {
    id: '2',
    name: 'ESP32 DevKit',
    category: 'MICROCONTROLLER',
    reason: 'WiFi enabled for connected projects',
    confidence: 88,
    relatedComponents: ['sensors', 'displays', 'batteries'],
    estimatedUsage: 78
  },
  {
    id: '3',
    name: 'Ultrasonic Sensor HC-SR04',
    category: 'SENSOR',
    reason: 'Commonly used for distance measurement',
    confidence: 85,
    relatedComponents: ['arduino', 'breadboard', 'resistors'],
    estimatedUsage: 72
  }
]

const mockAnalytics: PredictiveAnalytics = {
  demandForecast: [
    {
      componentId: '1',
      componentName: 'Arduino Uno R3',
      predictedDemand: 25,
      confidence: 87,
      timeframe: 'Next 30 days'
    },
    {
      componentId: '2',
      componentName: 'ESP32 DevKit',
      predictedDemand: 18,
      confidence: 82,
      timeframe: 'Next 30 days'
    }
  ],
  stockAlerts: [
    {
      componentId: '3',
      componentName: 'Jumper Wires M-M',
      currentStock: 5,
      recommendedReorder: 50,
      urgency: 'high'
    }
  ],
  usagePatterns: [
    {
      componentId: '1',
      componentName: 'Arduino Uno R3',
      category: 'MICROCONTROLLER',
      weeklyUsage: [5, 8, 12, 15, 18, 10, 7],
      monthlyTrend: 'increasing',
      peakUsageDays: ['Tuesday', 'Wednesday', 'Thursday'],
      averageRequestDuration: 14
    }
  ],
  recommendations: mockRecommendations
}

export function useComponentRecommendations(userId: string) {
  return useQuery({
    queryKey: ['component-recommendations', userId],
    queryFn: async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      return mockRecommendations
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useSmartSearch(query: string) {
  return useQuery({
    queryKey: ['smart-search', query],
    queryFn: async () => {
      if (!query) return []
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Mock search results
      return mockRecommendations.filter(rec => 
        rec.name.toLowerCase().includes(query.toLowerCase()) ||
        rec.category.toLowerCase().includes(query.toLowerCase())
      )
    },
    enabled: !!query,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export function usePredictiveAnalytics() {
  return useQuery({
    queryKey: ['predictive-analytics'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/analytics')
        if (!response.ok) {
          throw new Error('Failed to fetch analytics data')
        }
        const data = await response.json()
        
        // Transform the real data to match the expected format
        return {
          demandForecast: data.popularComponents?.slice(0, 5).map((comp: any) => ({
            componentId: comp.id,
            componentName: comp.name,
            predictedDemand: comp.requestCount * 2, // Simple prediction
            confidence: Math.min(95, 60 + comp.requestCount * 5),
            timeframe: 'Next 30 days'
          })) || [],
          stockAlerts: data.categoryDistribution?.filter((cat: any) => cat.availableStock < 10).map((cat: any) => ({
            componentId: cat.category,
            componentName: `${cat.category} Components`,
            currentStock: cat.availableStock,
            recommendedReorder: Math.max(50, cat.availableStock * 3),
            urgency: cat.availableStock < 5 ? 'high' : cat.availableStock < 10 ? 'medium' : 'low'
          })) || [],
          usagePatterns: [{
            componentId: '1',
            componentName: 'Arduino Uno R3',
            category: 'MICROCONTROLLER',
            weeklyUsage: [5, 8, 12, 15, 18, 10, 7],
            monthlyTrend: 'increasing' as const,
            peakUsageDays: ['Tuesday', 'Wednesday', 'Thursday'],
            averageRequestDuration: 14
          }],
          recommendations: mockRecommendations
        }
      } catch (error) {
        console.error('Failed to fetch analytics:', error)
        // Fallback to mock data
        return mockAnalytics
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}