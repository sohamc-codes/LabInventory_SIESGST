import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createComponentSchema = z.object({
  name: z.string().min(1, 'Component name is required'),
  category: z.enum(['SENSOR', 'IC', 'MODULE', 'WIRE', 'TOOL', 'RESISTOR', 'CAPACITOR', 'TRANSISTOR', 'DIODE', 'MICROCONTROLLER', 'BREADBOARD', 'OTHER']),
  manufacturer: z.string().optional(),
  specifications: z.string().optional(),
  totalStock: z.number().min(0, 'Quantity must be at least 0'),
  condition: z.enum(['NEW', 'GOOD', 'WORN', 'DAMAGED', 'LOST']).default('NEW'),
  purchaseDate: z.string().optional(),
  cost: z.number().optional(),
  storageLocation: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
})

// GET /api/components - List all components
export async function GET(request: NextRequest) {
  try {
    // Skip auth check in development mode
    if (process.env.NODE_ENV !== 'development') {
      const session = await auth()
      if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const orderBy = searchParams.get('orderBy') || 'name'
    const skip = (page - 1) * limit

    let orderByClause: any = { name: 'asc' }
    
    switch (orderBy) {
      case 'popularity':
        // Order by available stock (more available = more popular)
        orderByClause = { availableStock: 'desc' }
        break
      case 'recent':
        orderByClause = { createdAt: 'desc' }
        break
      case 'cost':
        orderByClause = { cost: 'asc' }
        break
      default:
        orderByClause = { name: 'asc' }
    }

    const where: any = {
      isActive: true,
    }

    if (category && category !== 'ALL') {
      where.category = category
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { manufacturer: { contains: search, mode: 'insensitive' } },
        { specifications: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [components, total] = await Promise.all([
      prisma.component.findMany({
        where,
        skip,
        take: limit,
        orderBy: orderByClause,
        select: {
          id: true,
          name: true,
          category: true,
          manufacturer: true,
          totalStock: true,
          availableStock: true,
          condition: true,
          storageLocation: true,
          purchaseDate: true,
          cost: true,
          imageUrl: true,
          serialNumber: true,
          qrCode: true,
          isActive: true,
          // Omit: specifications, description (large text, fetched on detail view)
        },
      }),
      prisma.component.count({ where }),
    ])

    return NextResponse.json({
      components,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching components:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/components - Create new component
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id || !['LAB_ASSISTANT', 'HOD', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    console.log('Creating component with data:', body)
    
    const validatedData = createComponentSchema.parse(body)

    // Get or create default organization
    let organization = await prisma.organization.findFirst()
    
    if (!organization) {
      console.log('No organization found, creating default...')
      organization = await prisma.organization.create({
        data: {
          name: 'SIES GST IoT Lab',
          slug: 'sies-gst-iot-lab',
          plan: 'PROFESSIONAL',
          status: 'ACTIVE',
        },
      })
    }

    console.log('Creating component with organizationId:', organization.id)

    const component = await prisma.component.create({
      data: {
        ...validatedData,
        organizationId: organization.id,
        serialNumber: null,
        qrCode: null,
        totalStock: validatedData.totalStock,
        availableStock: validatedData.totalStock,
        purchaseDate: validatedData.purchaseDate ? new Date(validatedData.purchaseDate) : null,
      },
    })

    console.log('Component created successfully:', component.id)

    // Log the creation
    try {
      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'CREATE_COMPONENT',
          resource: 'COMPONENT',
          details: JSON.stringify({ componentId: component.id }),
        },
      })
    } catch (auditError) {
      console.error('Error creating audit log:', auditError)
    }

    // Create stock movement record
    try {
      await prisma.stockMovement.create({
        data: {
          componentId: component.id,
          type: 'IN',
          quantity: validatedData.totalStock,
          reason: 'Initial stock',
          performedBy: session.user.id,
        },
      })
    } catch (stockError) {
      console.error('Error creating stock movement:', stockError)
    }

    return NextResponse.json(component, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.errors)
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating component:', error)
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}