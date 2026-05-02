import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { partId, studentId } = await request.json()

    if (!partId || !studentId) {
      return NextResponse.json(
        { error: 'Part ID and Student ID are required' },
        { status: 400 }
      )
    }

    // Calculate return deadline (24 hours from now)
    const returnDeadline = new Date(Date.now() + 24 * 60 * 60 * 1000)

    // Get the issued component with related data first
    const issuedComponent = await prisma.issuedComponent.findUnique({
      where: { id: partId },
      include: {
        component: true,
        student: true,
      }
    })

    if (!issuedComponent) {
      return NextResponse.json(
        { error: 'Issued component not found' },
        { status: 404 }
      )
    }

    // Update the issued component status (using any to bypass type issues temporarily)
    const updatedPart = await (prisma.issuedComponent as any).update({
      where: { id: partId },
      data: {
        status: 'RETURN_SCHEDULED',
        returnScheduledAt: new Date(),
        returnDeadline: returnDeadline,
      }
    })

    // Create notification for lab assistants
    await (prisma.notification as any).create({
      data: {
        type: 'RETURN_SCHEDULED',
        title: 'Component Return Scheduled',
        message: `${issuedComponent.student.name} has scheduled return of ${issuedComponent.component.name} (Qty: ${issuedComponent.quantity})`,
        data: JSON.stringify({
          partId: partId,
          studentId: studentId,
          studentName: issuedComponent.student.name,
          componentName: issuedComponent.component.name,
          quantity: issuedComponent.quantity,
          returnDeadline: returnDeadline.toISOString(),
        }),
        targetRole: 'LAB_ASSISTANT',
        isRead: false,
      }
    })

    // In a real app, send WebSocket notification here
    // await sendWebSocketNotification('LAB_ASSISTANT', notification)

    return NextResponse.json({
      success: true,
      message: 'Return scheduled successfully',
      returnDeadline: returnDeadline,
    })

  } catch (error) {
    console.error('Error scheduling return:', error)
    return NextResponse.json(
      { error: 'Failed to schedule return' },
      { status: 500 }
    )
  }
}