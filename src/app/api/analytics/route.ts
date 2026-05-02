import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/analytics - Get analytics data
export async function GET(request: NextRequest) {
  try {
    // Skip auth check in development mode
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
          id: 'demo-user-id',
          role: 'HOD',
          department: 'Computer Engineering'
        }
      }
    }

    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe') || '30d' // 7d, 30d, 90d, 1y

    // Calculate date range
    const now = new Date()
    let startDate: Date
    
    switch (timeframe) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      default: // 30d
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    // Get basic statistics
    const [
      totalComponents,
      totalRequests,
      pendingRequests,
      approvedRequests,
      rejectedRequests,
      issuedItems,
      overdueItems,
      lowStockComponents,
    ] = await Promise.all([
      prisma.component.count({ where: { isActive: true } }),
      prisma.componentRequest.count({
        where: { createdAt: { gte: startDate } }
      }),
      prisma.componentRequest.count({
        where: { status: 'PENDING' }
      }),
      prisma.componentRequest.count({
        where: { 
          status: 'APPROVED',
          createdAt: { gte: startDate }
        }
      }),
      prisma.componentRequest.count({
        where: { 
          status: 'REJECTED',
          createdAt: { gte: startDate }
        }
      }),
      prisma.issuedComponent.count({
        where: { 
          issuedAt: { gte: startDate },
          isReturned: false
        }
      }),
      prisma.issuedComponent.count({
        where: {
          isReturned: false,
          expectedReturnDate: { lt: now }
        }
      }),
      prisma.component.count({
        where: {
          isActive: true,
          availableStock: { lte: 5 } // Consider low stock as <= 5
        }
      }),
    ])

    // Get request trends (daily for the timeframe)
    const requestTrends = await prisma.componentRequest.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: { gte: startDate }
      },
      _count: {
        id: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    // Get most requested components
    const mostRequestedComponents = await prisma.componentRequest.groupBy({
      by: ['componentId'],
      where: {
        createdAt: { gte: startDate }
      },
      _count: {
        id: true
      },
      _sum: {
        quantity: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 10
    })

    // Get component details for most requested
    const componentIds = mostRequestedComponents.map(item => item.componentId)
    const componentDetails = await prisma.component.findMany({
      where: {
        id: { in: componentIds }
      },
      select: {
        id: true,
        name: true,
        category: true,
        availableStock: true,
        totalStock: true,
        condition: true,
        // Omit: specifications, description (large text fields)
      }
    })

    // Combine component data with request counts
    const popularComponents = mostRequestedComponents.map((item: any) => {
      const component = componentDetails.find((c: any) => c.id === item.componentId)
      return {
        ...component,
        requestCount: item._count.id,
        totalRequested: item._sum.quantity || 0
      }
    })

    // Get category distribution
    const categoryDistribution = await prisma.component.groupBy({
      by: ['category'],
      where: { isActive: true },
      _count: {
        id: true
      },
      _sum: {
        totalStock: true,
        availableStock: true
      }
    })

    // Get user activity (for HOD/Admin)
    let userActivity: any[] = []
    if (['HOD', 'ADMIN'].includes(session.user.role)) {
      const rawUserActivity = await prisma.componentRequest.groupBy({
        by: ['studentId'],
        where: {
          createdAt: { gte: startDate }
        },
        _count: {
          id: true
        },
        orderBy: {
          _count: {
            id: 'desc'
          }
        },
        take: 10
      })

      // Get student details
      const studentIds = rawUserActivity.map((item: any) => item.studentId)
      const studentDetails = await prisma.user.findMany({
        where: {
          id: { in: studentIds }
        },
        select: {
          id: true,
          name: true,
          email: true,
          prn: true,
          department: true,
          role: true,
          isActive: true,
          // Omit: image, settings (not needed for analytics)
        }
      })

      userActivity = rawUserActivity.map((item: any) => {
        const student = studentDetails.find((s: any) => s.id === item.studentId)
        return {
          ...student,
          requestCount: item._count.id
        }
      })
    }

    const analytics = {
      overview: {
        totalComponents,
        totalRequests,
        pendingRequests,
        approvedRequests,
        rejectedRequests,
        issuedItems,
        overdueItems,
        lowStockComponents,
        approvalRate: totalRequests > 0 ? Math.round((approvedRequests / totalRequests) * 100) : 0
      },
      trends: {
        requests: requestTrends.map((item: any) => ({
          date: item.createdAt.toISOString().split('T')[0],
          count: item._count.id
        }))
      },
      popularComponents,
      categoryDistribution: categoryDistribution.map((item: any) => ({
        category: item.category,
        componentCount: item._count.id,
        totalStock: item._sum.totalStock || 0,
        availableStock: item._sum.availableStock || 0
      })),
      userActivity: session.user.role === 'STUDENT' ? [] : userActivity,
      timeframe,
      generatedAt: new Date().toISOString()
    }

    return NextResponse.json(analytics)
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}