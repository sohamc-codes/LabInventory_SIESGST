import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/returns/notifications - Get return notifications for lab assistants
export async function GET(request: NextRequest) {
  try {
    // Skip auth check in development mode
    let session = null
    if (process.env.NODE_ENV !== 'development') {
      session = await auth()
      if (!session || session.user.role !== 'LAB_ASSISTANT') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    } else {
      // Demo user for development
      session = {
        user: {
          id: 'demo-lab-assistant-id',
          role: 'LAB_ASSISTANT',
          department: 'Computer Engineering'
        }
      }
    }

    const now = new Date()
    
    // Get issued components that are due for return or overdue
    const issuedComponents = await prisma.issuedComponent.findMany({
      where: {
        isReturned: false,
        OR: [
          // Items due within next 24 hours
          {
            expectedReturnDate: {
              lte: new Date(now.getTime() + 24 * 60 * 60 * 1000)
            }
          },
          // Overdue items
          {
            expectedReturnDate: {
              lt: now
            }
          }
        ]
      },
      select: {
        id: true,
        quantity: true,
        issuedAt: true,
        expectedReturnDate: true,
        student: {
          select: {
            name: true,
            prn: true
          }
        },
        component: {
          select: {
            name: true
          }
        },
        request: {
          select: {
            id: true
          }
        }
      },
      orderBy: {
        expectedReturnDate: 'asc'
      }
    })

    // Transform to notification format
    const notifications = issuedComponents.map(item => {
      const isOverdue = item.expectedReturnDate < now
      const hoursUntilDue = Math.floor((item.expectedReturnDate.getTime() - now.getTime()) / (1000 * 60 * 60))
      
      return {
        id: item.id,
        type: isOverdue ? 'RETURN_OVERDUE' : 'RETURN_SCHEDULED',
        studentName: item.student.name,
        componentName: item.component.name,
        quantity: item.quantity,
        returnDeadline: item.expectedReturnDate,
        scheduledAt: item.issuedAt,
        partId: item.id,
        isUrgent: isOverdue || hoursUntilDue <= 6
      }
    })

    return NextResponse.json({ notifications })
  } catch (error) {
    console.error('Error fetching return notifications:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}