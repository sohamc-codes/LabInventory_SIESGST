import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createSpecialRequestSchema = z.object({
  partName: z.string().min(1),
  description: z.string().min(1),
  quantity: z.number().min(1).max(100),
  estimatedPrice: z.number().optional().nullable(),
  websiteUrl: z.string().optional().nullable(),
  imageUrls: z.array(z.string()).optional().nullable(),
  purpose: z.string().min(10),
  projectId: z.string().optional().nullable(),
})

// GET /api/special-requests
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    let where: any = {}

    // Filter by role
    if (session.user.role === 'STUDENT') {
      where.studentId = session.user.id
    }

    if (status) {
      where.status = status
    }

    const [requests, total] = await Promise.all([
      prisma.specialPartRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          partName: true,
          description: true,
          quantity: true,
          estimatedPrice: true,
          websiteUrl: true,
          imageUrls: true,
          purpose: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          studentId: true,
          projectId: true,
        },
      }),
      prisma.specialPartRequest.count({ where }),
    ])

    return NextResponse.json({
      requests,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching special requests:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/special-requests
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    console.log('Received request body:', body)
    
    const data = createSpecialRequestSchema.parse(body)
    console.log('Validated data:', data)

    // Create special request
    const specialRequest = await prisma.specialPartRequest.create({
      data: {
        studentId: session.user.id,
        partName: data.partName,
        description: data.description,
        quantity: data.quantity,
        estimatedPrice: data.estimatedPrice,
        websiteUrl: data.websiteUrl || null,
        imageUrls: data.imageUrls ? JSON.stringify(data.imageUrls) : null,
        purpose: data.purpose,
        projectId: data.projectId || null,
      },
    })

    console.log('Created special request:', specialRequest.id)

    // Log audit
    try {
      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'CREATE_SPECIAL_REQUEST',
          resource: 'SPECIAL_PART_REQUEST',
          details: JSON.stringify({
            requestId: specialRequest.id,
            partName: data.partName,
            quantity: data.quantity,
          }),
        },
      })
    } catch (error) {
      console.error('Audit log error:', error)
    }

    return NextResponse.json(specialRequest, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.errors)
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating special request:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    )
  }
}
