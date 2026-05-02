import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_request: NextRequest) {
  try {
    const session = await auth()
    if (!session || !['LAB_ASSISTANT', 'HOD', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    // Fetch all metrics in parallel
    const [todayIssued, pendingRequests, overdueItems, lowStockItems, recentTransactions] = await Promise.all([
      // Today Issued: Count of components issued today
      prisma.issuedComponent.count({
        where: {
          issuedAt: {
            gte: todayStart,
          },
        },
      }),

      // Pending Requests: Count of PENDING status requests
      prisma.componentRequest.count({
        where: {
          status: 'PENDING',
        },
      }),

      // Overdue Returns: Full array of ISSUED components past their expected return date
      prisma.issuedComponent.findMany({
        where: {
          status: 'ACTIVE',
          expectedReturnDate: {
            lt: now,
          },
        },
        select: {
          id: true,
          quantity: true,
          issuedAt: true,
          expectedReturnDate: true,
          component: {
            select: {
              name: true,
              category: true,
            },
          },
          student: {
            select: {
              name: true,
              prn: true,
            },
          },
        },
        orderBy: {
          expectedReturnDate: 'asc',
        },
        take: 10,
      }),

      // Low Stock Alerts: Full array of components with available stock <= 2
      prisma.component.findMany({
        where: {
          isActive: true,
          availableStock: {
            lte: 2,
          },
        },
        select: {
          id: true,
          name: true,
          category: true,
          availableStock: true,
          totalStock: true,
        },
        orderBy: {
          availableStock: 'asc',
        },
        take: 10,
      }),

      // Recent Transactions: Today's issued components with relations
      prisma.issuedComponent.findMany({
        where: {
          issuedAt: {
            gte: todayStart,
          },
        },
        select: {
          id: true,
          quantity: true,
          issuedAt: true,
          status: true,
          component: {
            select: {
              name: true,
              category: true,
            },
          },
          student: {
            select: {
              name: true,
              prn: true,
            },
          },
        },
        orderBy: {
          issuedAt: 'desc',
        },
        take: 10,
      }),
    ])

    return NextResponse.json({
      todayIssued,
      pendingRequests,
      overdueReturns: overdueItems.length,
      lowStockItems: lowStockItems.length,
      overdueItemsArray: overdueItems,
      lowStockItemsArray: lowStockItems,
      recentTransactions,
    })
  } catch (error) {
    console.error('Error fetching lab assistant dashboard metrics:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
