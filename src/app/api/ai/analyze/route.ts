import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { analyzeComponent, checkCompatibility, generateComponentDescription, suggestCategory } from '@/lib/ai/parts-analyzer'
import { z } from 'zod'

const analyzeSchema = z.object({
  name: z.string().min(1, 'Component name is required'),
  description: z.string().optional(),
  category: z.string().optional(),
  action: z.enum(['analyze', 'compatibility', 'description', 'category']).default('analyze'),
  components: z.array(z.object({
    name: z.string(),
    specifications: z.string().optional(),
  })).optional(),
})

// POST /api/ai/analyze - Analyze components with AI
export async function POST(request: NextRequest) {
  try {
    // Check authentication (allow in development mode)
    if (process.env.NODE_ENV !== 'development') {
      const session = await auth()
      if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const body = await request.json()
    const validatedData = analyzeSchema.parse(body)

    switch (validatedData.action) {
      case 'analyze': {
        const analysis = await analyzeComponent({
          name: validatedData.name,
          description: validatedData.description,
          category: validatedData.category,
        })
        
        return NextResponse.json({
          success: true,
          analysis,
        })
      }

      case 'compatibility': {
        if (!validatedData.components || validatedData.components.length < 2) {
          return NextResponse.json(
            { error: 'At least 2 components required for compatibility check' },
            { status: 400 }
          )
        }
        
        const compatibility = await checkCompatibility(validatedData.components)
        
        return NextResponse.json({
          success: true,
          compatibility,
        })
      }

      case 'description': {
        const description = await generateComponentDescription(validatedData.name)
        
        return NextResponse.json({
          success: true,
          description,
        })
      }

      case 'category': {
        const categoryResult = await suggestCategory(
          validatedData.name,
          validatedData.description
        )
        
        return NextResponse.json({
          success: true,
          ...categoryResult,
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

    console.error('AI analysis error:', error)
    return NextResponse.json(
      { 
        error: 'AI analysis failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
