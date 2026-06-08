import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for bulk import
const studentSchema = z.object({
  email: z.string().email('Invalid email format'),
  prn: z.string().min(1, 'PRN is required'),
  department: z.string().optional(),
  year: z.string().optional(),
})

const bulkImportSchema = z.object({
  students: z.array(studentSchema).min(1, 'At least one student required'),
})

// POST /api/users/bulk-import - Bulk import student PRNs
export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Authorization check - Only OWNER, ADMIN, HOD, LAB_ASSISTANT
    const allowedRoles = ['OWNER', 'ADMIN', 'HOD', 'LAB_ASSISTANT']
    if (!allowedRoles.includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Forbidden - Insufficient permissions' },
        { status: 403 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = bulkImportSchema.parse(body)

    const results = {
      success: 0,
      failed: 0,
      errors: [] as Array<{ email: string; error: string }>,
    }

    // Process each student
    for (const student of validatedData.students) {
      try {
        // Check if user exists
        const existingUser = await prisma.user.findUnique({
          where: { email: student.email },
        })

        if (!existingUser) {
          results.failed++
          results.errors.push({
            email: student.email,
            error: 'User not found in database',
          })
          continue
        }

        // Check if PRN is already taken by another user
        if (student.prn) {
          const prnTaken = await prisma.user.findUnique({
            where: { prn: student.prn },
          })

          if (prnTaken && prnTaken.id !== existingUser.id) {
            results.failed++
            results.errors.push({
              email: student.email,
              error: `PRN ${student.prn} is already assigned to another user`,
            })
            continue
          }
        }

        // Update user with PRN and other details
        await prisma.user.update({
          where: { email: student.email },
          data: {
            prn: student.prn,
            department: student.department || existingUser.department,
            year: student.year || existingUser.year,
            isPrnVerified: true,
          },
        })

        results.success++
      } catch (error) {
        results.failed++
        results.errors.push({
          email: student.email,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'BULK_IMPORT_PRN',
        resource: 'USER_TABLE',
        details: JSON.stringify({
          totalRecords: validatedData.students.length,
          successCount: results.success,
          failedCount: results.failed,
          timestamp: new Date().toISOString(),
        }),
      },
    })

    return NextResponse.json({
      message: 'Bulk import completed',
      results,
    })
  } catch (error) {
    console.error('Bulk import error:', error)

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
