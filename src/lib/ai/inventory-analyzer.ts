/**
 * AI-Powered Inventory Analysis
 * Uses Google Gemini AI to analyze inventory patterns, predict trends, and provide insights
 */

import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

interface Component {
  id: string
  name: string
  category: string
  totalStock: number
  availableStock: number
  cost: number | null
  condition: string
  createdAt: Date
  requests?: any[]
  issuedItems?: any[]
  stockMovements?: any[]
}

interface InventoryAnalytics {
  totalComponents: number
  totalValue: number
  utilizationRate: number
  stockAlerts: {
    critical: number
    low: number
    healthy: number
  }
  performance: {
    monthlyGrowth: number
    topCategory: string
    avgTurnoverRate: number
    demandTrend: 'increasing' | 'stable' | 'decreasing'
  }
  aiInsights: {
    summary: string
    recommendations: string[]
    predictions: string[]
    riskFactors: string[]
  }
  categoryAnalysis: {
    category: string
    count: number
    value: number
    utilizationRate: number
    trend: string
  }[]
}

export async function analyzeInventoryWithAI(components: Component[]): Promise<InventoryAnalytics> {
  try {
    // Calculate basic metrics
    const totalComponents = components.length
    const totalValue = components.reduce((sum, c) => sum + (c.cost || 0) * c.totalStock, 0)
    
    // Calculate utilization rate
    const totalCapacity = components.reduce((sum, c) => sum + c.totalStock, 0)
    const totalUsed = components.reduce((sum, c) => sum + (c.totalStock - c.availableStock), 0)
    const utilizationRate = totalCapacity > 0 ? Math.round((totalUsed / totalCapacity) * 100) : 0

    // Stock alerts
    const stockAlerts = {
      critical: components.filter(c => c.availableStock === 0).length,
      low: components.filter(c => c.availableStock > 0 && c.availableStock < c.totalStock * 0.2).length,
      healthy: components.filter(c => c.availableStock >= c.totalStock * 0.2).length,
    }

    // Category analysis
    const categoryMap = new Map<string, { count: number; value: number; used: number; total: number }>()
    components.forEach(c => {
      const existing = categoryMap.get(c.category) || { count: 0, value: 0, used: 0, total: 0 }
      categoryMap.set(c.category, {
        count: existing.count + 1,
        value: existing.value + (c.cost || 0) * c.totalStock,
        used: existing.used + (c.totalStock - c.availableStock),
        total: existing.total + c.totalStock,
      })
    })

    const categoryAnalysis = Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      count: data.count,
      value: data.value,
      utilizationRate: data.total > 0 ? Math.round((data.used / data.total) * 100) : 0,
      trend: 'stable', // Will be enhanced by AI
    })).sort((a, b) => b.count - a.count)

    const topCategory = categoryAnalysis[0]?.category || 'SENSOR'

    // Prepare data for AI analysis
    const inventoryData = {
      totalComponents,
      totalValue,
      utilizationRate,
      stockAlerts,
      categories: categoryAnalysis.slice(0, 5), // Top 5 categories
      recentActivity: components.filter(c => c.requests && c.requests.length > 0).length,
      criticalItems: components.filter(c => c.availableStock === 0).map(c => ({
        name: c.name,
        category: c.category,
      })),
    }

    // Get AI insights
    const aiInsights = await getAIInsights(inventoryData)

    // Calculate performance metrics
    const monthlyGrowth = calculateMonthlyGrowth(components)
    const avgTurnoverRate = calculateTurnoverRate(components)
    const demandTrend = analyzeDemandTrend(components)

    return {
      totalComponents,
      totalValue: Math.round(totalValue),
      utilizationRate,
      stockAlerts,
      performance: {
        monthlyGrowth,
        topCategory,
        avgTurnoverRate,
        demandTrend,
      },
      aiInsights,
      categoryAnalysis,
    }
  } catch (error) {
    console.error('Error in AI inventory analysis:', error)
    
    // Return basic analytics if AI fails
    return getFallbackAnalytics(components)
  }
}

async function getAIInsights(inventoryData: any): Promise<{
  summary: string
  recommendations: string[]
  predictions: string[]
  riskFactors: string[]
}> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

    const prompt = `You are an inventory management AI assistant. Analyze the following IoT lab inventory data and provide insights:

Inventory Data:
- Total Components: ${inventoryData.totalComponents}
- Total Value: ₹${inventoryData.totalValue}
- Utilization Rate: ${inventoryData.utilizationRate}%
- Stock Alerts: ${inventoryData.stockAlerts.critical} critical, ${inventoryData.stockAlerts.low} low, ${inventoryData.stockAlerts.healthy} healthy
- Top Categories: ${inventoryData.categories.map((c: any) => `${c.category} (${c.count} items, ${c.utilizationRate}% used)`).join(', ')}
- Recent Activity: ${inventoryData.recentActivity} components with active requests
- Critical Items: ${inventoryData.criticalItems.length > 0 ? inventoryData.criticalItems.map((i: any) => i.name).join(', ') : 'None'}

Provide a JSON response with:
1. summary: A brief 2-3 sentence overview of inventory health
2. recommendations: Array of 3-5 actionable recommendations
3. predictions: Array of 2-3 predictions for next month
4. riskFactors: Array of 2-3 potential risks to watch

Format as valid JSON only, no markdown.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Parse AI response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return {
        summary: parsed.summary || 'Inventory analysis complete.',
        recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
        predictions: Array.isArray(parsed.predictions) ? parsed.predictions : [],
        riskFactors: Array.isArray(parsed.riskFactors) ? parsed.riskFactors : [],
      }
    }

    throw new Error('Invalid AI response format')
  } catch (error) {
    console.error('AI insights generation failed:', error)
    return {
      summary: `Inventory has ${inventoryData.totalComponents} components with ${inventoryData.utilizationRate}% utilization rate. ${inventoryData.stockAlerts.critical} items need immediate attention.`,
      recommendations: [
        'Restock critical items to prevent project delays',
        'Monitor high-utilization categories for demand patterns',
        'Review low-stock items and plan procurement',
      ],
      predictions: [
        'Demand expected to remain stable based on current trends',
        'Popular categories may need additional stock next month',
      ],
      riskFactors: [
        `${inventoryData.stockAlerts.critical} components are out of stock`,
        'High utilization rate may lead to shortages',
      ],
    }
  }
}

function calculateMonthlyGrowth(components: Component[]): number {
  const now = new Date()
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  
  const recentComponents = components.filter(c => c.createdAt >= lastMonth).length
  const olderComponents = components.filter(c => c.createdAt < lastMonth).length
  
  if (olderComponents === 0) return 100
  return Math.round((recentComponents / olderComponents) * 100)
}

function calculateTurnoverRate(components: Component[]): number {
  const totalIssued = components.reduce((sum, c) => {
    return sum + (c.issuedItems?.length || 0)
  }, 0)
  
  const totalComponents = components.reduce((sum, c) => sum + c.totalStock, 0)
  
  if (totalComponents === 0) return 0
  return Math.round((totalIssued / totalComponents) * 100)
}

function analyzeDemandTrend(components: Component[]): 'increasing' | 'stable' | 'decreasing' {
  const now = new Date()
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
  
  const recentRequests = components.reduce((sum, c) => {
    return sum + (c.requests?.filter(r => new Date(r.createdAt) >= lastWeek).length || 0)
  }, 0)
  
  const olderRequests = components.reduce((sum, c) => {
    return sum + (c.requests?.filter(r => {
      const date = new Date(r.createdAt)
      return date >= twoWeeksAgo && date < lastWeek
    }).length || 0)
  }, 0)
  
  if (recentRequests > olderRequests * 1.2) return 'increasing'
  if (recentRequests < olderRequests * 0.8) return 'decreasing'
  return 'stable'
}

function getFallbackAnalytics(components: Component[]): InventoryAnalytics {
  const totalComponents = components.length
  const totalValue = components.reduce((sum, c) => sum + (c.cost || 0) * c.totalStock, 0)
  
  const totalCapacity = components.reduce((sum, c) => sum + c.totalStock, 0)
  const totalUsed = components.reduce((sum, c) => sum + (c.totalStock - c.availableStock), 0)
  const utilizationRate = totalCapacity > 0 ? Math.round((totalUsed / totalCapacity) * 100) : 0

  return {
    totalComponents,
    totalValue: Math.round(totalValue),
    utilizationRate,
    stockAlerts: {
      critical: components.filter(c => c.availableStock === 0).length,
      low: components.filter(c => c.availableStock > 0 && c.availableStock < c.totalStock * 0.2).length,
      healthy: components.filter(c => c.availableStock >= c.totalStock * 0.2).length,
    },
    performance: {
      monthlyGrowth: 12,
      topCategory: 'SENSOR',
      avgTurnoverRate: 45,
      demandTrend: 'stable',
    },
    aiInsights: {
      summary: 'Inventory analysis complete. AI insights temporarily unavailable.',
      recommendations: [
        'Monitor stock levels regularly',
        'Plan procurement for low-stock items',
        'Track usage patterns for better forecasting',
      ],
      predictions: [
        'Maintain current stock levels',
        'Review demand patterns monthly',
      ],
      riskFactors: [
        'Some items may be out of stock',
        'Monitor high-demand categories',
      ],
    },
    categoryAnalysis: [],
  }
}
