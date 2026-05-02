import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { 
  getPersonalizedRecommendations, 
  generateProjectSuggestions,
  findComplementaryComponents,
  validateRequestPurpose,
  getTrendingComponents
} from '@/lib/ai/smart-recommender'
import { z } from 'zod'

const recommendSchema = z.object({
  action: z.enum(['personalized', 'projects', 'complementary', 'validate', 'trending']).default('personalized'),
  studentId: z.string().optional(),
  projectType: z.string().optional(),
  selectedComponents: z.array(z.string()).optional(),
  componentId: z.string().optional(),
  componentName: z.string().optional(),
  purpose: z.string().optional(),
  limit: z.number().min(1).max(20).default(5),
  skillLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
})

// POST /api/ai/recommend - Get AI-powered recommendations
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    let session = null
    if (process.env.NODE_ENV !== 'development') {
      session = await auth()
      if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    } else {
      // Demo user for development
      session = {
        user: {
          id: 'demo-student-id',
          role: 'STUDENT',
        },
      }
    }

    const body = await request.json()
    const validatedData = recommendSchema.parse(body)

    switch (validatedData.action) {
      case 'personalized': {
        const studentId = validatedData.studentId || session.user.id
        
        const recommendations = await getPersonalizedRecommendations({
          studentId,
          projectType: validatedData.projectType,
          selectedComponents: validatedData.selectedComponents,
          limit: validatedData.limit,
        })
        
        return NextResponse.json({
          success: true,
          recommendations,
        })
      }

      case 'projects': {
        if (!validatedData.selectedComponents || validatedData.selectedComponents.length === 0) {
          return NextResponse.json(
            { error: 'Selected components required for project suggestions' },
            { status: 400 }
          )
        }
        
        const projects = await generateProjectSuggestions(
          validatedData.selectedComponents,
          validatedData.skillLevel
        )
        
        return NextResponse.json({
          success: true,
          projects,
        })
      }

      case 'complementary': {
        if (!validatedData.componentId) {
          return NextResponse.json(
            { error: 'Component ID required for complementary suggestions' },
            { status: 400 }
          )
        }
        
        const components = await findComplementaryComponents(
          validatedData.componentId,
          validatedData.limit
        )
        
        return NextResponse.json({
          success: true,
          components,
        })
      }

      case 'validate': {
        if (!validatedData.purpose || !validatedData.componentName) {
          return NextResponse.json(
            { error: 'Purpose and component name required for validation' },
            { status: 400 }
          )
        }
        
        const validation = await validateRequestPurpose(
          validatedData.purpose,
          validatedData.componentName
        )
        
        return NextResponse.json({
          success: true,
          ...validation,
        })
      }

      case 'trending': {
        const trending = await getTrendingComponents(validatedData.limit)
        
        return NextResponse.json({
          success: true,
          trending,
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

    console.error('AI recommendation error:', error)
    return NextResponse.json(
      { 
        error: 'AI recommendation failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
