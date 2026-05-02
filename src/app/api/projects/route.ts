import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

// GET /api/projects
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const projects = await prisma.project.findMany({
      where: {
        studentId: session.user.id,
        status: 'ACTIVE',
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        startDate: true,
        endDate: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { requests: true },
        },
      },
    })

    return NextResponse.json({ projects })
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/projects
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const data = createProjectSchema.parse(body)

    const project = await prisma.project.create({
      data: {
        name: data.name,
        description: data.description || null,
        studentId: session.user.id,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
      },
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        startDate: true,
        endDate: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { requests: true },
        },
      },
    })

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating project:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
