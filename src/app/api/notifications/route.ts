import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/notifications
// Returns the 10 most recent notifications for the authenticated user,
// including role-targeted notifications (e.g. targetRole = 'HOD').
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50)

    // Build the where clause to include both user-specific and role-targeted notifications
    const whereClause: any = {
      OR: [
        { userId: session.user.id },
      ],
    }

    // Add role-targeted notifications if user has a role
    if (session.user.role) {
      whereClause.OR.push({ targetRole: session.user.role })
    }

    const notifications = await prisma.notification.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        title: true,
        message: true,
        type: true,
        isRead: true,
        createdAt: true,
        targetRole: true,
      },
    })

    const unreadCount = notifications.filter((n) => !n.isRead).length

    return NextResponse.json({ notifications, unreadCount })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      notifications: [],
      unreadCount: 0 
    }, { status: 500 })
  }
}

// PATCH /api/notifications
// Body: { ids?: string[], markAll?: boolean }
// Sets isRead=true for the specified notification IDs belonging to the caller,
// or for all unread notifications if markAll=true.
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const { ids, markAll } = body as { ids?: string[]; markAll?: boolean }

    if (markAll) {
      await prisma.notification.updateMany({
        where: {
          OR: [
            { userId: session.user.id },
            { targetRole: session.user.role },
          ],
          isRead: false,
        },
        data: { isRead: true },
      })
    } else if (Array.isArray(ids) && ids.length > 0) {
      await prisma.notification.updateMany({
        where: {
          id: { in: ids },
          OR: [
            { userId: session.user.id },
            { targetRole: session.user.role },
          ],
        },
        data: { isRead: true },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating notifications:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
