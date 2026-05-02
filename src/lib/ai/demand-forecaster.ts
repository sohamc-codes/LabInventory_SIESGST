import { generateJSON, generateText } from './gemini'
import { prisma } from '@/lib/prisma'

export interface DemandForecast {
  componentId: string
  componentName: string
  category: string
  predictedDemand: number
  confidence: number
  timeframe: string
  reasoning: string
  trend: 'INCREASING' | 'DECREASING' | 'STABLE'
}

export interface RestockRecommendation {
  componentId: string
  componentName: string
  currentStock: number
  recommendedStock: number
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  reasoning: string
  estimatedCost?: number
  daysUntilStockout?: number
}

export interface ForecastInsight {
  type: 'TREND' | 'ANOMALY' | 'OPPORTUNITY' | 'WARNING'
  title: string
  description: string
  actionable: boolean
  suggestedAction?: string
}

/**
 * Generate demand forecasts using AI and historical data
 */
export async function generateDemandForecasts(
  timeframeDays: number = 30,
  categories?: string[]
): Promise<{
  forecasts: DemandForecast[]
  insights: ForecastInsight[]
}> {
  try {
    // Get historical request data (last 6 months)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const historicalRequests = await prisma.componentRequest.findMany({
      where: {
        createdAt: { gte: sixMonthsAgo },
        ...(categories && categories.length > 0 ? {
          component: { category: { in: categories } }
        } : {}),
      },
      include: {
        component: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
      },
    })

    // Aggregate by component
    const componentStats = new Map<string, {
      id: string
      name: string
      category: string
      requests: Array<{ date: Date; quantity: number }>
    }>()

    historicalRequests.forEach(req => {
      const key = req.component.id
      const existing = componentStats.get(key)
      
      if (existing) {
        existing.requests.push({
          date: req.createdAt,
          quantity: req.quantity,
        })
      } else {
        componentStats.set(key, {
          id: req.component.id,
          name: req.component.name,
          category: req.component.category,
          requests: [{
            date: req.createdAt,
            quantity: req.quantity,
          }],
        })
      }
    })

    // Prepare data for AI analysis
    const historicalData = Array.from(componentStats.values())
      .map(comp => {
        const totalRequests = comp.requests.length
        const totalRequested = comp.requests.reduce((sum, r) => sum + r.quantity, 0)
        const avgQuantity = totalRequested / totalRequests
        
        // Calculate monthly trend
        const recentMonth = comp.requests.filter(r => {
          const monthAgo = new Date()
          monthAgo.setMonth(monthAgo.getMonth() - 1)
          return r.date >= monthAgo
        }).length
        
        const previousMonth = comp.requests.filter(r => {
          const twoMonthsAgo = new Date()
          twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2)
          const oneMonthAgo = new Date()
          oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
          return r.date >= twoMonthsAgo && r.date < oneMonthAgo
        }).length
        
        return {
          id: comp.id,
          name: comp.name,
          category: comp.category,
          totalRequests,
          avgQuantity,
          recentMonth,
          previousMonth,
        }
      })
      .sort((a, b) => b.totalRequests - a.totalRequests)
      .slice(0, 20) // Top 20 components

    if (historicalData.length === 0) {
      return { forecasts: [], insights: [] }
    }

    const prompt = `You are an AI forecasting expert for an IoT/Electronics lab inventory system. Analyze this historical data and predict demand for the next ${timeframeDays} days.

Historical Data (last 6 months):
${historicalData.map(c => 
  `${c.name} (${c.category}): ${c.totalRequests} requests, avg ${c.avgQuantity.toFixed(1)} qty/request, recent: ${c.recentMonth} requests, previous: ${c.previousMonth} requests`
).join('\n')}

Consider:
1. Historical trends (increasing/decreasing/stable)
2. Seasonal patterns (academic calendar, project seasons)
3. Component lifecycle (new vs mature technology)
4. Complementary component relationships

Respond with JSON:
{
  "forecasts": [{
    "componentId": "id",
    "componentName": "name",
    "category": "CATEGORY",
    "predictedDemand": number_of_requests,
    "confidence": 0.0-1.0,
    "timeframe": "${timeframeDays} days",
    "reasoning": "brief explanation",
    "trend": "INCREASING|DECREASING|STABLE"
  }],
  "insights": [{
    "type": "TREND|ANOMALY|OPPORTUNITY|WARNING",
    "title": "Insight title",
    "description": "Detailed description",
    "actionable": true/false,
    "suggestedAction": "what to do (if actionable)"
  }]
}`

    const result = await generateJSON<{
      forecasts: DemandForecast[]
      insights: ForecastInsight[]
    }>(prompt, undefined, {
      useCache: true,
      maxRetries: 2,
    })

    return result
  } catch (error) {
    console.error('Demand forecasting failed:', error)
    return { forecasts: [], insights: [] }
  }
}

/**
 * Generate intelligent restock recommendations
 */
export async function generateRestockRecommendations(): Promise<RestockRecommendation[]> {
  try {
    // Get all components with current stock levels
    const components = await prisma.component.findMany({
      select: {
        id: true,
        name: true,
        category: true,
        availableStock: true,
        totalStock: true,
        cost: true,
      },
    })

    // Get recent request patterns (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentRequests = await prisma.componentRequest.findMany({
      where: {
        createdAt: { gte: thirtyDaysAgo },
      },
      select: {
        componentId: true,
        quantity: true,
      },
    })

    // Calculate usage rates
    const usageRates = new Map<string, number>()
    recentRequests.forEach(req => {
      const current = usageRates.get(req.componentId) || 0
      usageRates.set(req.componentId, current + req.quantity)
    })

    // Prepare data for AI analysis
    const stockData = components
      .map(comp => {
        const monthlyUsage = usageRates.get(comp.id) || 0
        const stockRatio = comp.totalStock > 0 
          ? comp.availableStock / comp.totalStock 
          : 0
        const daysUntilStockout = monthlyUsage > 0
          ? Math.floor((comp.availableStock / monthlyUsage) * 30)
          : 999
        
        return {
          id: comp.id,
          name: comp.name,
          category: comp.category,
          currentStock: comp.availableStock,
          totalCapacity: comp.totalStock,
          stockRatio,
          monthlyUsage,
          daysUntilStockout,
          cost: comp.cost || 0,
        }
      })
      .filter(c => c.stockRatio < 0.5 || c.daysUntilStockout < 60) // Focus on low stock items
      .sort((a, b) => a.daysUntilStockout - b.daysUntilStockout)
      .slice(0, 15)

    if (stockData.length === 0) {
      return []
    }

    const prompt = `You are an inventory optimization AI for an IoT/Electronics lab. Analyze this stock data and provide restock recommendations.

Current Stock Status:
${stockData.map(c => 
  `${c.name} (${c.category}): ${c.currentStock}/${c.totalCapacity} units (${(c.stockRatio * 100).toFixed(0)}%), monthly usage: ${c.monthlyUsage}, days until stockout: ${c.daysUntilStockout}, cost: ₹${c.cost}`
).join('\n')}

For each component that needs restocking, provide:
1. Recommended reorder quantity (consider usage rate, lead time, storage capacity)
2. Urgency level (CRITICAL: <7 days, HIGH: 7-14 days, MEDIUM: 14-30 days, LOW: >30 days)
3. Reasoning for the recommendation
4. Estimated days until stockout

Respond with JSON array:
[{
  "componentId": "id",
  "componentName": "name",
  "currentStock": number,
  "recommendedStock": number,
  "urgency": "CRITICAL|HIGH|MEDIUM|LOW",
  "reasoning": "why this quantity and urgency",
  "estimatedCost": number,
  "daysUntilStockout": number
}]`

    const recommendations = await generateJSON<RestockRecommendation[]>(prompt)
    return recommendations
  } catch (error) {
    console.error('Restock recommendations failed:', error)
    return []
  }
}

/**
 * Calculate optimal inventory levels using AI
 */
export async function calculateOptimalInventory(
  componentId: string
): Promise<{
  optimalStock: number
  reorderPoint: number
  safetyStock: number
  reasoning: string
}> {
  try {
    const component = await prisma.component.findUnique({
      where: { id: componentId },
      select: {
        name: true,
        category: true,
        availableStock: true,
        totalStock: true,
      },
    })

    if (!component) {
      throw new Error('Component not found')
    }

    // Get usage history
    const threeMonthsAgo = new Date()
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)

    const requests = await prisma.componentRequest.findMany({
      where: {
        componentId,
        createdAt: { gte: threeMonthsAgo },
      },
      select: {
        quantity: true,
        createdAt: true,
      },
    })

    const totalUsage = requests.reduce((sum, r) => sum + r.quantity, 0)
    const avgMonthlyUsage = totalUsage / 3

    const prompt = `Calculate optimal inventory levels for this component:

Component: ${component.name} (${component.category})
Current Stock: ${component.availableStock}
Total Capacity: ${component.totalStock}
Average Monthly Usage: ${avgMonthlyUsage.toFixed(1)} units
Number of Requests (3 months): ${requests.length}

Calculate:
1. Optimal stock level (balance between availability and storage)
2. Reorder point (when to trigger restock)
3. Safety stock (buffer for demand variability)

Consider:
- Lead time for procurement (assume 7-14 days)
- Demand variability
- Storage constraints
- Cost of stockout vs holding cost

Respond with JSON:
{
  "optimalStock": number,
  "reorderPoint": number,
  "safetyStock": number,
  "reasoning": "explanation of calculations"
}`

    const result = await generateJSON<{
      optimalStock: number
      reorderPoint: number
      safetyStock: number
      reasoning: string
    }>(prompt)

    return result
  } catch (error) {
    console.error('Optimal inventory calculation failed:', error)
    return {
      optimalStock: 0,
      reorderPoint: 0,
      safetyStock: 0,
      reasoning: 'Calculation failed',
    }
  }
}
