import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateComponentSchema = z.object({
  name: z.string().min(1).optional(),
  category: z.enum(['SENSOR', 'IC', 'MODULE', 'WIRE', 'TOOL', 'RESISTOR', 'CAPACITOR', 'TRANSISTOR', 'DIODE', 'MICROCONTROLLER', 'BREADBOARD', 'OTHER']).optional(),
  manufacturer: z.string().optional(),
  specifications: z.string().optional(),
  totalStock: z.number().min(0).optional(),
  condition: z.enum(['NEW', 'GOOD', 'WORN', 'DAMAGED', 'LOST']).optional(),
  cost: z.number().optional(),
  storageLocation: z.string().optional(),
  description: z.string().optional(),
})

// GET /api/components/[id] - Get specific component
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

    const component = await prisma.component.findUnique({
      where: { id },
      include: {
        requests: {
          include: {
            student: {
              select: {
                name: true,
                prn: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        stockMovements: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    })

    if (!component) {
      return NextResponse.json(
        { error: 'Component not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(component)
  } catch (error) {
    console.error('Error fetching component:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/components/[id] - Update component
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

    const body = await request.json()
    const validatedData = updateComponentSchema.parse(body)

    const existingComponent = await prisma.component.findUnique({
      where: { id },
    })

    if (!existingComponent) {
      return NextResponse.json(
        { error: 'Component not found' },
        { status: 404 }
      )
    }

    // If total quantity is updated, preserve active-issued quantity.
    let updateData: any = { ...validatedData }
    if (validatedData.totalStock !== undefined && validatedData.totalStock !== existingComponent.totalStock) {
      const activeIssued = existingComponent.totalStock - existingComponent.availableStock
      if (validatedData.totalStock < activeIssued) {
        return NextResponse.json(
          { error: `Total stock cannot be lower than currently issued quantity (${activeIssued})` },
          { status: 400 }
        )
      }
      updateData.availableStock = validatedData.totalStock - activeIssued
    }

    const updatedComponent = await prisma.component.update({
      where: { id },
      data: updateData,
    })

    // Log the update
    try {
      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'UPDATE_COMPONENT',
          resource: 'COMPONENT',
          details: JSON.stringify({
            componentId: id,
            changes: validatedData,
          }),
        },
      })
    } catch (auditError) {
      console.error('Error creating audit log:', auditError)
    }

    return NextResponse.json(updatedComponent)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating component:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/components/[id] - Delete component
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session || !['LAB_ASSISTANT', 'HOD', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const component = await prisma.component.findUnique({
      where: { id },
      include: {
        requests: {
          where: {
            status: {
              in: ['PENDING', 'APPROVED', 'ACTIVE'],
            },
          },
        },
      },
    })

    if (!component) {
      return NextResponse.json(
        { error: 'Component not found' },
        { status: 404 }
      )
    }

    // Check if component has active requests
    if (component.requests.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete component with active requests' },
        { status: 400 }
      )
    }

    // Soft delete by setting isActive to false
    await prisma.component.update({
      where: { id },
      data: { isActive: false },
    })

    // Log the deletion
    try {
      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'DELETE_COMPONENT',
          resource: 'COMPONENT',
          details: JSON.stringify({
            componentId: id,
            componentName: component.name,
          }),
        },
      })
    } catch (auditError) {
      console.error('Error creating audit log:', auditError)
    }

    return NextResponse.json({ message: 'Component deleted successfully' })
  } catch (error) {
    console.error('Error deleting component:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}