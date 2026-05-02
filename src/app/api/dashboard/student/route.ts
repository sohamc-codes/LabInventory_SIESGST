import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/dashboard/student - Get student dashboard data
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Allow STUDENT role only
    if (session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Forbidden - Students only' }, { status: 403 })
    }

    const studentId = session.user.id
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

    // Get comprehensive statistics
    const [
      activeRequests,
      approvedRequests,
      itemsIssued,
      overdueItems,
      totalCompletedRequests,
      totalReturnedItems,
      onTimeReturns,
      allReturnedItems,
      currentMonthRequests,
      lastMonthRequests,
      currentMonthApprovals,
      lastMonthApprovals,
      recentRequests,
      upcomingReturns
    ] = await Promise.all([
      // Active requests (PENDING or APPROVED but not yet issued)
      prisma.componentRequest.count({
        where: {
          studentId,
          status: {
            in: ['PENDING', 'APPROVED']
          }
        }
      }),

      // Approved requests count
      prisma.componentRequest.count({
        where: {
          studentId,
          status: 'APPROVED'
        }
      }),

      // Items currently issued (not returned)
      prisma.issuedComponent.count({
        where: {
          studentId,
          isReturned: false
        }
      }),

      // Overdue items
      prisma.issuedComponent.count({
        where: {
          studentId,
          isReturned: false,
          expectedReturnDate: {
            lt: now
          }
        }
      }),

      // Total completed requests (issued)
      prisma.componentRequest.count({
        where: {
          studentId,
          status: 'ISSUED'
        }
      }),

      // Total returned items
      prisma.issuedComponent.count({
        where: {
          studentId,
          isReturned: true
        }
      }),

      // On-time returns (returned before or on expected date)
      prisma.issuedComponent.count({
        where: {
          studentId,
          isReturned: true,
          actualReturnDate: {
            lte: prisma.issuedComponent.fields.expectedReturnDate
          }
        }
      }),

      // All returned items for avg calculation
      prisma.issuedComponent.findMany({
        where: {
          studentId,
          isReturned: true,
          actualReturnDate: {
            not: null
          }
        },
        select: {
          issuedAt: true,
          actualReturnDate: true,
          expectedReturnDate: true
        }
      }),

      // Current month requests
      prisma.componentRequest.count({
        where: {
          studentId,
          createdAt: {
            gte: startOfMonth
          }
        }
      }),

      // Last month requests
      prisma.componentRequest.count({
        where: {
          studentId,
          createdAt: {
            gte: startOfLastMonth,
            lte: endOfLastMonth
          }
        }
      }),

      // Current month approvals
      prisma.componentRequest.count({
        where: {
          studentId,
          status: 'APPROVED',
          updatedAt: {
            gte: startOfMonth
          }
        }
      }),

      // Last month approvals
      prisma.componentRequest.count({
        where: {
          studentId,
          status: 'APPROVED',
          updatedAt: {
            gte: startOfLastMonth,
            lte: endOfLastMonth
          }
        }
      }),

      // Recent requests (last 10)
      prisma.componentRequest.findMany({
        where: {
          studentId
        },
        select: {
          id: true,
          quantity: true,
          purpose: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          expectedDuration: true,
          rejectionReason: true,
          component: {
            select: {
              id: true,
              name: true,
              category: true,
              manufacturer: true,
              imageUrl: true,
              cost: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 10
      }),

      // Upcoming returns (all issued items not returned)
      prisma.issuedComponent.findMany({
        where: {
          studentId,
          isReturned: false
        },
        select: {
          id: true,
          quantity: true,
          issuedAt: true,
          expectedReturnDate: true,
          issuedBy: true,
          notes: true,
          component: {
            select: {
              id: true,
              name: true,
              serialNumber: true,
              category: true,
              manufacturer: true,
              imageUrl: true,
              qrCode: true,
              // Omit: specifications (large text field)
            }
          },
          request: {
            select: {
              purpose: true
            }
          }
        },
        orderBy: {
          expectedReturnDate: 'asc'
        }
      })
    ])

    // Calculate metrics
    const totalProjects = totalCompletedRequests
    const completionRate = totalReturnedItems > 0 
      ? Math.round((onTimeReturns / totalReturnedItems) * 100) 
      : 0

    // Calculate average return time (in days)
    let avgReturnTime = 0
    if (allReturnedItems.length > 0) {
      const totalDays = allReturnedItems.reduce((sum, item) => {
        if (item.actualReturnDate && item.issuedAt) {
          const days = Math.ceil(
            (item.actualReturnDate.getTime() - item.issuedAt.getTime()) / (1000 * 60 * 60 * 24)
          )
          return sum + days
        }
        return sum
      }, 0)
      avgReturnTime = Math.round(totalDays / allReturnedItems.length)
    }

    // Calculate reputation score (0-5.0)
    // Based on: on-time return rate (60%), no overdue items (20%), completion rate (20%)
    let reputationScore = 0
    if (totalReturnedItems > 0) {
      const onTimeRate = (onTimeReturns / totalReturnedItems) * 0.6
      const noOverdueBonus = overdueItems === 0 ? 0.2 : 0
      const completionBonus = (completionRate / 100) * 0.2
      reputationScore = Math.min(5.0, (onTimeRate + noOverdueBonus + completionBonus) * 5)
      reputationScore = Math.round(reputationScore * 10) / 10 // Round to 1 decimal
    }

    // Calculate trends (month-over-month percentage change)
    const requestTrend = lastMonthRequests > 0 
      ? Math.round(((currentMonthRequests - lastMonthRequests) / lastMonthRequests) * 100)
      : 0
    
    const approvalTrend = lastMonthApprovals > 0
      ? Math.round(((currentMonthApprovals - lastMonthApprovals) / lastMonthApprovals) * 100)
      : 0

    // Calculate return trend (simplified - based on current vs last month returns)
    const currentMonthReturns = allReturnedItems.filter(
      item => item.actualReturnDate && item.actualReturnDate >= startOfMonth
    ).length
    const lastMonthReturnsCount = allReturnedItems.filter(
      item => item.actualReturnDate && 
              item.actualReturnDate >= startOfLastMonth && 
              item.actualReturnDate <= endOfLastMonth
    ).length
    const returnTrend = lastMonthReturnsCount > 0
      ? Math.round(((currentMonthReturns - lastMonthReturnsCount) / lastMonthReturnsCount) * 100)
      : 0

    // Format recent requests
    const formattedRecentRequests = recentRequests.map(request => ({
      id: request.id,
      component: {
        id: request.component.id,
        name: request.component.name,
        category: request.component.category,
        manufacturer: request.component.manufacturer || 'Unknown',
        imageUrl: request.component.imageUrl || null,
        cost: request.component.cost || 0
      },
      quantity: request.quantity,
      purpose: request.purpose,
      status: request.status,
      priority: determinePriority(request.createdAt),
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
      expectedDuration: request.expectedDuration,
      rejectionReason: request.rejectionReason || null
    }))

    // Format upcoming returns with risk assessment
    const formattedUpcomingReturns = upcomingReturns.map(item => {
      const daysUntilDue = Math.ceil(
        (item.expectedReturnDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      )
      const isOverdue = daysUntilDue < 0
      const risk = determineRisk(daysUntilDue, isOverdue)

      return {
        id: item.id,
        component: {
          id: item.component.id,
          name: item.component.name,
          serialNumber: item.component.serialNumber,
          category: item.component.category,
          manufacturer: item.component.manufacturer || 'Unknown',
          imageUrl: item.component.imageUrl || null,
          qrCode: item.component.qrCode || ''
        },
        quantity: item.quantity,
        issuedAt: item.issuedAt,
        expectedReturnDate: item.expectedReturnDate,
        purpose: item.request?.purpose || 'Not specified',
        daysUntilDue,
        isOverdue,
        risk,
        issuedBy: item.issuedBy || 'Lab Assistant',
        notes: item.notes || ''
      }
    })

    const stats = {
      activeRequests,
      approvedRequests,
      itemsIssued,
      overdueItems,
      totalProjects,
      completionRate,
      avgReturnTime,
      reputationScore,
      trends: {
        requests: requestTrend,
        approvals: approvalTrend,
        returns: returnTrend
      }
    }

    return NextResponse.json({
      stats,
      recentRequests: formattedRecentRequests,
      upcomingReturns: formattedUpcomingReturns
    })

  } catch (error) {
    console.error('Error fetching student dashboard data:', error)
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error')
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Helper functions
function determinePriority(createdAt: Date): 'HIGH' | 'MEDIUM' | 'LOW' {
  const hoursOld = (new Date().getTime() - createdAt.getTime()) / (1000 * 60 * 60)
  
  if (hoursOld > 48) return 'HIGH'
  if (hoursOld > 24) return 'MEDIUM'
  return 'LOW'
}

function determineRisk(daysUntilDue: number, isOverdue: boolean): 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' {
  if (isOverdue) return 'HIGH'
  if (daysUntilDue <= 2) return 'MEDIUM'
  if (daysUntilDue <= 7) return 'LOW'
  return 'NONE'
}
