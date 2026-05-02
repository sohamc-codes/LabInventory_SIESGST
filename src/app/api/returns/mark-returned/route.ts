import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { partId } = await request.json()

    if (!partId) {
      return NextResponse.json(
        { error: 'Part ID is required' },
        { status: 400 }
      )
    }

    // Get the issued component details
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

    if (issuedComponent.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Component is not active' },
        { status: 400 }
      )
    }

    // Get a lab assistant for audit purposes (or use system)
    const labAssistant = await prisma.user.findFirst({
      where: { role: 'LAB_ASSISTANT' }
    })

    const returnedById = labAssistant?.id || 'system'

    // Update the issued component status
    const updatedPart = await prisma.issuedComponent.update({
      where: { id: partId },
      data: {
        status: 'RETURNED',
        returnedAt: new Date(),
        returnedBy: returnedById,
        returnCondition: 'GOOD',
        isReturned: true,
        actualReturnDate: new Date(),
        returnedQuantity: issuedComponent.quantity,
        conditionOnReturn: 'GOOD',
      }
    })

    // Update component inventory (add back to available stock)
    await prisma.component.update({
      where: { id: issuedComponent.componentId },
      data: {
        availableStock: {
          increment: issuedComponent.quantity
        }
      }
    })

    // Create audit log if we have a lab assistant
    if (labAssistant) {
      await prisma.auditLog.create({
        data: {
          userId: labAssistant.id,
          action: 'COMPONENT_RETURNED',
          resource: 'ISSUED_COMPONENT',
          details: JSON.stringify({
            componentId: issuedComponent.componentId,
            componentName: issuedComponent.component.name,
            quantity: issuedComponent.quantity,
            studentId: issuedComponent.studentId,
            studentName: issuedComponent.student.name,
            returnCondition: 'GOOD',
            returnedAt: new Date().toISOString(),
          })
        }
      })
    }

    // Create notification for student
    await prisma.notification.create({
      data: {
        type: 'RETURN_CONFIRMED',
        title: 'Component Return Confirmed',
        message: `Your ${issuedComponent.component.name} has been successfully returned and processed.`,
        data: JSON.stringify({
          partId: partId,
          componentName: issuedComponent.component.name,
          quantity: issuedComponent.quantity,
          returnedAt: new Date().toISOString(),
          returnCondition: 'GOOD',
        }),
        userId: issuedComponent.studentId,
        isRead: false,
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Component marked as returned successfully',
      updatedPart,
    })

  } catch (error) {
    console.error('Error marking component as returned:', error)
    return NextResponse.json(
      { error: 'Failed to mark component as returned' },
      { status: 500 }
    )
  }
}