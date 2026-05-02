import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateRequestSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  rejectionReason: z.string().optional(),
})

// GET /api/requests/[id] - Get specific request
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const componentRequest = await prisma.componentRequest.findUnique({
      where: { id },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            prn: true,
            department: true,
          },
        },
        component: {
          select: {
            id: true,
            name: true,
            category: true,
            manufacturer: true,
            specifications: true,
            availableStock: true,
            storageLocation: true,
            imageUrl: true,
          },
        },
        issuedItem: true,
      },
    })

    if (!componentRequest) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      )
    }

    // Check permissions
    if (
      session.user.role === 'STUDENT' &&
      componentRequest.studentId !== session.user.id
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json(componentRequest)
  } catch (error) {
    console.error('Error fetching request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/requests/[id] - Update request (approve/reject)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()
    
    // Allow both HOD and LAB_ASSISTANT to approve/reject requests
    const ALLOWED_ROLES = ['HOD', 'LAB_ASSISTANT'] as const
    if (!session || !ALLOWED_ROLES.includes(session.user.role as typeof ALLOWED_ROLES[number])) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateRequestSchema.parse(body)

    // Get the current request
    const currentRequest = await prisma.componentRequest.findUnique({
      where: { id },
      include: {
        component: true,
        student: true,
      },
    })

    if (!currentRequest) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      )
    }

    if (currentRequest.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Request has already been processed' },
        { status: 400 }
      )
    }

    // If approving, check if sufficient quantity is available
    if (validatedData.status === 'APPROVED') {
      if (currentRequest.component.availableStock < currentRequest.quantity) {
        return NextResponse.json(
          { error: 'Insufficient quantity available' },
          { status: 400 }
        )
      }
    }

    const updatedRequest = await prisma.componentRequest.update({
      where: { id },
      data: {
        status: validatedData.status,
        approvedBy: session.user.id,
        approvedAt: new Date(),
        rejectionReason: validatedData.rejectionReason,
      },
      include: {
        student: {
          select: {
            name: true,
            email: true,
            prn: true,
          },
        },
        component: {
          select: {
            name: true,
            category: true,
          },
        },
      },
    })

    // Log the approval/rejection
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: validatedData.status === 'APPROVED' ? 'APPROVE_REQUEST' : 'REJECT_REQUEST',
        resource: 'COMPONENT_REQUEST',
        details: JSON.stringify({
          requestId: id,
          studentId: currentRequest.studentId,
          componentId: currentRequest.componentId,
          rejectionReason: validatedData.rejectionReason,
        }),
      },
    })

    // Create notification for student
    await prisma.notification.create({
      data: {
        userId: currentRequest.studentId,
        title: `Request ${validatedData.status}`,
        message: validatedData.status === 'APPROVED'
          ? `Your request for ${updatedRequest.component.name} has been approved`
          : `Your request for ${updatedRequest.component.name} has been rejected${validatedData.rejectionReason ? `: ${validatedData.rejectionReason}` : ''}`,
        type: validatedData.status === 'APPROVED' ? 'SUCCESS' : 'WARNING',
      },
    })

    return NextResponse.json(updatedRequest)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/requests/[id] - Cancel request (students only, pending requests only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const componentRequest = await prisma.componentRequest.findUnique({
      where: { id },
    })

    if (!componentRequest) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      )
    }

    // Check permissions
    if (
      session.user.role === 'STUDENT' &&
      componentRequest.studentId !== session.user.id
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (componentRequest.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Can only cancel pending requests' },
        { status: 400 }
      )
    }

    await prisma.componentRequest.delete({
      where: { id },
    })

    // Log the cancellation
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'CANCEL_REQUEST',
        resource: 'COMPONENT_REQUEST',
        details: JSON.stringify({
          requestId: id,
          componentId: componentRequest.componentId,
        }),
      },
    })

    return NextResponse.json({ message: 'Request cancelled successfully' })
  } catch (error) {
    console.error('Error cancelling request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}