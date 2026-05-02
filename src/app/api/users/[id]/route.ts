import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const VALID_ROLES = ['STUDENT', 'LAB_ASSISTANT', 'HOD', 'ADMIN'] as const
type ValidRole = typeof VALID_ROLES[number]

const patchSchema = z.object({
  role: z.enum(VALID_ROLES),
})

// GET /api/users/[id] — fetch a single user (LAB_ASSISTANT | HOD | ADMIN)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session || !['LAB_ASSISTANT', 'HOD', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, role: true, department: true, prn: true, isActive: true },
    })

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/users/[id] — update a user's role (HOD | ADMIN only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()

    if (!session || !['LAB_ASSISTANT', 'HOD', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Prevent self-demotion
    if (session.user.id === id) {
      return NextResponse.json(
        { error: 'You cannot change your own role' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const parsed = patchSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation error', details: parsed.error.errors },
        { status: 400 }
      )
    }

    const target = await prisma.user.findUnique({ where: { id } })
    if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const updated = await prisma.user.update({
      where: { id },
      data: { role: parsed.data.role },
      select: { id: true, name: true, email: true, role: true },
    })

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'UPDATE_USER_ROLE',
        resource: 'USER',
        details: JSON.stringify({
          targetUserId: id,
          previousRole: target.role,
          newRole: parsed.data.role,
        }),
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
