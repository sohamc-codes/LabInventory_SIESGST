import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { generateDemandForecasts, generateRestockRecommendations, calculateOptimalInventory } from '@/lib/ai/demand-forecaster'
import { z } from 'zod'

const forecastSchema = z.object({
  action: z.enum(['demand', 'restock', 'optimal']).default('demand'),
  timeframeDays: z.number().min(7).max(180).default(30),
  categories: z.array(z.string()).optional(),
  componentId: z.string().optional(),
})

// POST /api/ai/forecast - Generate AI-powered forecasts
export async function POST(request: NextRequest) {
  try {
    // Check authentication (HOD or Admin only for forecasts)
    if (process.env.NODE_ENV !== 'development') {
      const session = await auth()
      if (!session || !['HOD', 'ADMIN', 'LAB_ASSISTANT'].includes(session.user.role)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const body = await request.json()
    const validatedData = forecastSchema.parse(body)

    switch (validatedData.action) {
      case 'demand': {
        const result = await generateDemandForecasts(
          validatedData.timeframeDays,
          validatedData.categories
        )
        
        return NextResponse.json({
          success: true,
          ...result,
        })
      }

      case 'restock': {
        const recommendations = await generateRestockRecommendations()
        
        return NextResponse.json({
          success: true,
          recommendations,
        })
      }

      case 'optimal': {
        if (!validatedData.componentId) {
          return NextResponse.json(
            { error: 'Component ID required for optimal inventory calculation' },
            { status: 400 }
          )
        }
        
        const optimal = await calculateOptimalInventory(validatedData.componentId)
        
        return NextResponse.json({
          success: true,
          ...optimal,
        })
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('AI forecast error:', error)
    return NextResponse.json(
      { 
        error: 'AI forecast failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
