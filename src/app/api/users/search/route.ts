import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/users/search?q=<prn_or_name>
// Auth: LAB_ASSISTANT | HOD
// Returns students matching the query with their active issued items
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    const ALLOWED_ROLES = ['LAB_ASSISTANT', 'HOD', 'ADMIN'] as const
    if (!session || !ALLOWED_ROLES.includes(session.user.role as typeof ALLOWED_ROLES[number])) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')?.trim()

    if (!q || q.length < 1) {
      return NextResponse.json({ users: [] })
    }

    const users = await prisma.user.findMany({
      where: {
        role: 'STUDENT',
        isActive: true,
        OR: [
          { name: { contains: q } },
          { prn:  { contains: q } },
          { email: { contains: q } },
        ],
      },
      select: {
        id: true,
        name: true,
        prn: true,
        email: true,
        department: true,
        issuedItems: {
          where: { status: 'ACTIVE' },
          select: {
            id: true,
            quantity: true,
            issuedAt: true,
            expectedReturnDate: true,
            component: {
              select: { id: true, name: true, category: true },
            },
          },
          orderBy: { issuedAt: 'desc' },
        },
      },
      take: 10,
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Error searching users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
