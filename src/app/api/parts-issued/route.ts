import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const issueSchema = z.object({
  prn: z.string().min(1),
  componentId: z.string().min(1),
  quantityIssued: z.number().int().min(1).default(1),
})

// GET /api/parts-issued - Get active issued parts, optionally by student PRN
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const prn = searchParams.get('prn')

    const where: any = { status: 'ACTIVE' }
    
    if (prn) {
      // ✅ SECURITY FIX: Students can only query their own PRN
      if (session.user.role === 'STUDENT') {
        // Fetch current user's PRN to validate
        const currentUser = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { prn: true }
        })
        
        // Reject if student tries to query someone else's PRN
        if (currentUser?.prn !== prn) {
          return NextResponse.json(
            { error: 'Forbidden - You can only view your own issued components' },
            { status: 403 }
          )
        }
      }
      // ✅ Staff members can query any PRN
      where.student = { prn }
    } else {
      // ✅ SECURITY FIX: If no PRN provided and user is STUDENT, auto-filter to their own data
      if (session.user.role === 'STUDENT') {
        where.studentId = session.user.id
      }
    }

    const issuedParts = await prisma.issuedComponent.findMany({
      where,
      select: {
        id: true,
        quantity: true,
        status: true,
        issuedAt: true,
        expectedReturnDate: true,
        returnedAt: true,
        isReturned: true,
        conditionOnIssue: true,
        conditionOnReturn: true,
        student: { 
          select: { 
            id: true, 
            name: true, 
            prn: true,
            email: true,
            department: true,
          } 
        },
        component: { 
          select: { 
            id: true, 
            name: true, 
            category: true,
            availableStock: true,
            totalStock: true,
            condition: true,
          } 
        },
      },
      orderBy: { issuedAt: 'desc' },
    })

    return NextResponse.json({ issuedParts })
  } catch (error) {
    console.error('Error fetching issued parts:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/parts-issued - Issue component by PRN and quantity
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id || !['LAB_ASSISTANT', 'HOD', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { prn, componentId, quantityIssued } = issueSchema.parse(body)

    const student = await prisma.user.findFirst({
      where: { prn, role: 'STUDENT' },
      select: { id: true, name: true, prn: true },
    })
    if (!student) {
      return NextResponse.json({ error: 'Student not found for PRN' }, { status: 404 })
    }

    const result = await prisma.$transaction(async (tx) => {
      const component = await tx.component.findUnique({
        where: { id: componentId },
        select: { id: true, name: true, availableStock: true, totalStock: true, condition: true },
      })

      if (!component) {
        throw new Error('Component not found')
      }
      if (component.availableStock < quantityIssued) {
        throw new Error('Insufficient available stock')
      }

      const issued = await tx.issuedComponent.create({
        data: {
          studentId: student.id,
          componentId,
          quantity: quantityIssued,
          issuedBy: session.user.id,
          conditionOnIssue: component.condition,
          status: 'ACTIVE',
          isReturned: false,
          expectedReturnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      })

      await tx.component.update({
        where: { id: componentId },
        data: { availableStock: { decrement: quantityIssued } },
      })

      return issued
    })

    return NextResponse.json({ success: true, issued: result }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to issue component' },
      { status: 400 }
    )
  }
}