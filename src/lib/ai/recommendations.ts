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
  restockRecommendations: {
    componentId: string
    componentName: string
    currentStock: number
    recommendedStock: number
    urgency: 'low' | 'medium' | 'high'
    reasoning: string
  }[]
  usagePatterns: UsagePattern[]
}

// Simulate AI-powered recommendations
export function useComponentRecommendations(userId: string, projectType?: string) {
  return useQuery({
    queryKey: ['recommendations', userId, projectType],
    queryFn: async (): Promise<ComponentRecommendation[]> => {
      // In a real implementation, this would call an AI service
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API delay
      
      const mockRecommendations: ComponentRecommendation[] = [
        {
          id: '1',
          name: 'Arduino Uno R3',
          category: 'MICROCONTROLLER',
          reason: 'Frequently used in IoT projects similar to your previous requests',
          confidence: 0.92,
          relatedComponents: ['Breadboard 830', 'Jumper Wires', 'LED 5mm'],
          estimatedUsage: 14,
        },
        {
          id: '2',
          name: 'Ultrasonic Sensor HC-SR04',
          category: 'SENSOR',
          reason: 'Commonly paired with Arduino for distance measurement projects',
          confidence: 0.87,
          relatedComponents: ['Arduino Uno R3', 'Servo Motor SG90'],
          estimatedUsage: 7,
        },
        {
          id: '3',
          name: 'ESP32 DevKit V1',
          category: 'MICROCONTROLLER',
          reason: 'Trending component for WiFi-enabled IoT projects',
          confidence: 0.78,
          relatedComponents: ['OLED Display 0.96"', 'Temperature Sensor'],
          estimatedUsage: 21,
        },
      ]
      
      return mockRecommendations
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function usePredictiveAnalytics() {
  return useQuery({
    queryKey: ['predictive-analytics'],
    queryFn: async (): Promise<PredictiveAnalytics> => {
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const mockAnalytics: PredictiveAnalytics = {
        demandForecast: [
          {
            componentId: '1',
            componentName: 'Arduino Uno R3',
            predictedDemand: 25,
            confidence: 0.89,
            timeframe: 'next 30 days',
          },
          {
            componentId: '2',
            componentName: 'Raspberry Pi 4',
            predictedDemand: 15,
            confidence: 0.76,
            timeframe: 'next 30 days',
          },
        ],
        restockRecommendations: [
          {
            componentId: '3',
            componentName: 'Jumper Wires M-M',
            currentStock: 5,
            recommendedStock: 50,
            urgency: 'high',
            reasoning: 'High usage frequency and low current stock',
          },
          {
            componentId: '4',
            componentName: 'LED 5mm Red',
            currentStock: 12,
            recommendedStock: 100,
            urgency: 'medium',
            reasoning: 'Seasonal increase in electronics projects expected',
          },
        ],
        usagePatterns: [
          {
            componentId: '1',
            componentName: 'Arduino Uno R3',
            category: 'MICROCONTROLLER',
            weeklyUsage: [3, 5, 8, 12, 15, 18, 22],
            monthlyTrend: 'increasing',
            peakUsageDays: ['Tuesday', 'Thursday'],
            averageRequestDuration: 14,
          },
        ],
      }
      
      return mockAnalytics
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useSmartSearch(query: string) {
  return useQuery({
    queryKey: ['smart-search', query],
    queryFn: async () => {
      if (!query || query.length < 2) return { results: [] }
      
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=10`)
      if (!response.ok) {
        throw new Error('Search failed')
      }
      
      const data = await response.json()
      return data.results || []
    },
    enabled: query.length >= 2,
    staleTime: 30 * 1000, // 30 seconds
  })
}

export function generateProjectSuggestions(components: string[]): string[] {
  const projectSuggestions = [
    'Smart Home Automation System',
    'IoT Weather Station',
    'Automated Plant Watering System',
    'Security Camera with Motion Detection',
    'Smart Parking System',
    'Environmental Monitoring Device',
    'Bluetooth-Controlled Robot',
    'Smart Doorbell with Camera',
    'Temperature and Humidity Monitor',
    'Smart Lighting System',
  ]
  
  // In a real implementation, this would use AI to match components to projects
  return projectSuggestions.slice(0, 3)
}