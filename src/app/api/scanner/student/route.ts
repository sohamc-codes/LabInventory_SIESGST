import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/scanner/student - Look up student by PRN
export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Authorization check - Only LAB_ASSISTANT, HOD, ADMIN can scan
    const allowedRoles = ['LAB_ASSISTANT', 'HOD', 'ADMIN']
    if (!allowedRoles.includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Forbidden - Insufficient permissions' },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { prn } = body

    if (!prn || typeof prn !== 'string') {
      return NextResponse.json(
        { error: 'PRN is required' },
        { status: 400 }
      )
    }

    // Look up student by PRN
    const student = await prisma.user.findUnique({
      where: { prn: prn.trim() },
      select: {
        id: true,
        name: true,
        prn: true,
        email: true,
        department: true,
        year: true,
        role: true,
        isPrnVerified: true,
      },
    })

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found with this PRN' },
        { status: 404 }
      )
    }

    // Check if user is a student
    if (student.role !== 'STUDENT') {
      return NextResponse.json(
        { error: 'This PRN does not belong to a student' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      student: {
        id: student.id,
        name: student.name,
        prn: student.prn,
        email: student.email,
        department: student.department,
        year: student.year,
        isPrnVerified: student.isPrnVerified,
      },
    })
  } catch (error) {
    console.error('Scanner student lookup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
