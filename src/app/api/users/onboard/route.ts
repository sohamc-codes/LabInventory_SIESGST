import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for onboarding
const onboardSchema = z.object({
  prn: z
    .string()
    .regex(/^[A-Za-z0-9]{8}$/, 'PRN must be exactly 8 alphanumeric characters'),
  department: z.string().min(1, 'Department is required'),
  year: z.string().min(1, 'Year is required'),
})

// POST /api/users/onboard - Student self-service onboarding
export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only students can onboard themselves
    if (session.user.role !== 'STUDENT') {
      return NextResponse.json(
        { error: 'Only students can use self-service onboarding' },
        { status: 403 }
      )
    }

    // Check if user already has a PRN
    if (session.user.prn) {
      return NextResponse.json(
        { error: 'You have already completed onboarding' },
        { status: 400 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = onboardSchema.parse(body)

    // Check if PRN is already taken by another user
    const existingUser = await prisma.user.findUnique({
      where: { prn: validatedData.prn },
    })

    if (existingUser && existingUser.id !== session.user.id) {
      return NextResponse.json(
        { error: 'This PRN is already registered to another user' },
        { status: 409 }
      )
    }

    // Update user with PRN and other details
    // Set isPrnVerified to FALSE for self-service onboarding
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        prn: validatedData.prn,
        department: validatedData.department,
        year: validatedData.year,
        isPrnVerified: false, // Requires verification by lab staff
        onboardedAt: new Date(),
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'SELF_ONBOARD',
        resource: 'USER_PROFILE',
        details: JSON.stringify({
          prn: validatedData.prn,
          department: validatedData.department,
          year: validatedData.year,
          isPrnVerified: false,
          timestamp: new Date().toISOString(),
        }),
      },
    })

    return NextResponse.json({
      message: 'Onboarding completed successfully',
      user: {
        id: updatedUser.id,
        prn: updatedUser.prn,
        department: updatedUser.department,
        year: updatedUser.year,
        isPrnVerified: updatedUser.isPrnVerified,
      },
    })
  } catch (error) {
    console.error('Onboarding error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation error',
          details: error.errors,
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
