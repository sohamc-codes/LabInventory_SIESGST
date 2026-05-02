import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/search - Smart search for components
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!query || query.length < 2) {
      return NextResponse.json({ results: [] })
    }

    // Build search conditions
    const where: any = {
      isActive: true,
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { manufacturer: { contains: query, mode: 'insensitive' } },
        { specifications: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ]
    }

    if (category && category !== 'ALL') {
      where.category = category
    }

    // Search components
    const components = await prisma.component.findMany({
      where,
      take: limit,
      select: {
        id: true,
        name: true,
        category: true,
        manufacturer: true,
        availableStock: true,
        totalStock: true,
        condition: true,
        imageUrl: true,
        storageLocation: true,
        // Omit: specifications, description (large text fields, not needed for search results)
      },
      orderBy: [
        // Prioritize exact name matches
        { name: 'asc' },
        // Then by availability
        { availableStock: 'desc' }
      ]
    })

    // Calculate relevance scores (simple implementation)
    const results = components.map((component: any) => {
      let relevanceScore = 0
      const queryLower = query.toLowerCase()
      const nameLower = component.name.toLowerCase()
      
      // Exact match gets highest score
      if (nameLower === queryLower) {
        relevanceScore = 1.0
      }
      // Starts with query gets high score
      else if (nameLower.startsWith(queryLower)) {
        relevanceScore = 0.9
      }
      // Contains query gets medium score
      else if (nameLower.includes(queryLower)) {
        relevanceScore = 0.7
      }
      // Manufacturer match gets lower score
      else if (component.manufacturer?.toLowerCase().includes(queryLower)) {
        relevanceScore = 0.5
      }
      // Default score
      else {
        relevanceScore = 0.3
      }

      // Boost score if component is available
      if (component.availableStock > 0) {
        relevanceScore += 0.1
      }

      // Determine match reason
      let matchReason = 'General match'
      if (nameLower.includes(queryLower)) {
        matchReason = 'Name match'
      } else if (component.manufacturer?.toLowerCase().includes(queryLower)) {
        matchReason = 'Manufacturer match'
      }

      // Generate suggested use based on category
      let suggestedUse = 'General electronics project'
      switch (component.category) {
        case 'MICROCONTROLLER':
          suggestedUse = 'Perfect for IoT and embedded projects'
          break
        case 'SENSOR':
          suggestedUse = 'Ideal for data collection and monitoring'
          break
        case 'DISPLAY':
          suggestedUse = 'Great for user interface and data visualization'
          break
        case 'MODULE':
          suggestedUse = 'Useful for extending functionality'
          break
        case 'IC':
          suggestedUse = 'Essential for circuit design and logic'
          break
        default:
          suggestedUse = `Commonly used in ${component.category.toLowerCase()} applications`
      }

      return {
        id: component.id,
        name: component.name,
        category: component.category,
        manufacturer: component.manufacturer,
        availableStock: component.availableStock,
        totalStock: component.totalStock,
        imageUrl: component.imageUrl,
        storageLocation: component.storageLocation,
        relevanceScore: Math.round(relevanceScore * 100) / 100,
        matchReason,
        suggestedUse,
      }
    })

    // Sort by relevance score
    results.sort((a: any, b: any) => b.relevanceScore - a.relevanceScore)

    // Get user's recent requests for personalized suggestions
    const recentRequests = await prisma.componentRequest.findMany({
      where: {
        studentId: session.user.id,
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      },
      select: {
        id: true,
        componentId: true,
        component: {
          select: {
            category: true
          }
        }
      },
      take: 10
    })

    // Extract frequently used categories
    const categoryFrequency = recentRequests.reduce((acc: any, req: any) => {
      const category = req.component.category
      acc[category] = (acc[category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const frequentCategories = Object.entries(categoryFrequency)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 3)
      .map(([category]) => category)

    return NextResponse.json({
      results,
      suggestions: {
        frequentCategories,
        totalResults: results.length,
        hasMore: results.length === limit
      },
      query,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error performing search:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}