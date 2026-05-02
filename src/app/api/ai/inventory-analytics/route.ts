import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { analyzeInventoryWithAI } from '@/lib/ai/inventory-analyzer'

// GET /api/ai/inventory-analytics - Get AI-powered inventory analytics
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🤖 Starting AI-powered inventory analysis...')

    // Fetch all inventory data
    const components = await prisma.component.findMany({
      select: {
        id: true,
        name: true,
        category: true,
        manufacturer: true,
        totalStock: true,
        availableStock: true,
        condition: true,
        storageLocation: true,
        cost: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        // Omit: specifications, description (large text fields)
        requests: {
          select: {
            id: true,
            quantity: true,
            status: true,
            createdAt: true,
            student: {
              select: {
                name: true,
                department: true,
              }
            }
          }
        },
        issuedItems: {
          where: {
            isReturned: false
          },
          select: {
            id: true,
            quantity: true,
            status: true,
            issuedAt: true,
            expectedReturnDate: true,
          }
        },
        stockMovements: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 10,
          select: {
            id: true,
            type: true,
            quantity: true,
            reason: true,
            createdAt: true,
          }
        }
      }
    })

    console.log(`📊 Analyzing ${components.length} components...`)

    // Perform AI analysis
    const aiAnalysis = await analyzeInventoryWithAI(components)

    console.log('✅ AI analysis complete')

    return NextResponse.json({
      success: true,
      analytics: aiAnalysis,
      timestamp: new Date().toISOString(),
    })

  } catch (error) {
    console.error('❌ AI inventory analytics error:', error)
    return NextResponse.json(
      { 
        error: 'AI analysis failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
