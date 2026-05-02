import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// DELETE /api/special-requests/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Find the request
    const specialRequest = await prisma.specialPartRequest.findUnique({
      where: { id },
    })

    if (!specialRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    // Check ownership (students can only delete their own requests)
    if (session.user.role === 'STUDENT' && specialRequest.studentId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Only allow deletion of PENDING requests
    if (specialRequest.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Can only delete pending requests' },
        { status: 400 }
      )
    }

    // Delete the request
    await prisma.specialPartRequest.delete({
      where: { id },
    })

    // Log audit
    try {
      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'DELETE_SPECIAL_REQUEST',
          resource: 'SPECIAL_PART_REQUEST',
          details: JSON.stringify({
            requestId: id,
            partName: specialRequest.partName,
          }),
        },
      })
    } catch (error) {
      console.error('Audit log error:', error)
    }

    return NextResponse.json({ success: true, message: 'Request deleted successfully' })
  } catch (error) {
    console.error('Error deleting special request:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
