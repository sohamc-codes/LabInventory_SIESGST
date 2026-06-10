import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/users/[id]/verify - Verify a student's PRN
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authentication check
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Authorization check - Only LAB_ASSISTANT, HOD, ADMIN, OWNER can verify
    const allowedRoles = ['LAB_ASSISTANT', 'HOD', 'ADMIN', 'OWNER']
    if (!allowedRoles.includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Forbidden - Insufficient permissions' },
        { status: 403 }
      )
    }

   const { id: userId } = await params

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        prn: true,
        department: true,
        year: true,
        role: true,
        isPrnVerified: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user is a student
    if (user.role !== 'STUDENT') {
      return NextResponse.json(
        { error: 'Only students can be verified' },
        { status: 400 }
      )
    }

    // Check if user has a PRN
    if (!user.prn) {
      return NextResponse.json(
        { error: 'User has not completed onboarding (no PRN)' },
        { status: 400 }
      )
    }

    // Check if already verified
    if (user.isPrnVerified) {
      return NextResponse.json(
        { error: 'User is already verified' },
        { status: 400 }
      )
    }

    // Update user to verified status
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        isPrnVerified: true,
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'VERIFY_STUDENT_PRN',
        resource: 'USER_PROFILE',
        details: JSON.stringify({
          verifiedUserId: userId,
          verifiedUserPrn: user.prn,
          verifiedUserName: user.name,
          verifiedBy: session.user.name,
          verifiedByRole: session.user.role,
          timestamp: new Date().toISOString(),
        }),
      },
    })

    return NextResponse.json({
      message: 'Student verified successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        prn: updatedUser.prn,
        isPrnVerified: updatedUser.isPrnVerified,
      },
    })
  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
