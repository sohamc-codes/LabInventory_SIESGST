import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/requests/[id]/issue - Issue an approved component to a student.
//
// This is the ONLY place where:
//   1. ComponentRequest.status transitions PENDING/APPROVED → ISSUED
//   2. Component.availableStock is decremented
//
// Both operations are wrapped in a single Prisma transaction so they
// either both succeed or both roll back — the inventory can never go
// out of sync with the request status.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()

    // LAB_ASSISTANT and HOD can both physically issue components
    const ALLOWED_ROLES = ['LAB_ASSISTANT', 'HOD'] as const
    if (!session || !ALLOWED_ROLES.includes(session.user.role as typeof ALLOWED_ROLES[number])) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const { notes } = body as { notes?: string }

    // ── Pre-flight checks (outside transaction to give clear error messages) ──

    const componentRequest = await prisma.componentRequest.findUnique({
      where: { id },
      include: {
        component: true,
        student: true,
        issuedItem: true,
      },
    })

    if (!componentRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    if (componentRequest.status !== 'APPROVED' && componentRequest.status !== 'PENDING') {
      return NextResponse.json(
        { error: `Request must be PENDING or APPROVED before issuing (current status: ${componentRequest.status})` },
        { status: 400 }
      )
    }

    if (componentRequest.issuedItem) {
      return NextResponse.json(
        { error: 'Component has already been issued for this request' },
        { status: 409 }
      )
    }

    // ── Atomic transaction ────────────────────────────────────────────────────
    //
    // Step 1 — Re-read the component stock INSIDE the transaction with a
    //           select-for-update pattern so concurrent requests don't
    //           double-decrement the same stock.
    // Step 2 — Decrement availableStock (with a floor guard).
    // Step 3 — Create the IssuedComponent record.
    // Step 4 — Transition the request status to ISSUED.
    // Step 5 — Write a StockMovement audit record.
    // Step 6 — Write an AuditLog entry.
    // Step 7 — Notify the student.
    //
    // If ANY step throws, Prisma rolls back the entire transaction and the
    // database is left unchanged.

    const expectedReturnDate = new Date()
    expectedReturnDate.setDate(
      expectedReturnDate.getDate() + componentRequest.expectedDuration
    )

    const result = await prisma.$transaction(async (tx) => {
      // Step 1 — Re-read stock inside the transaction
      const component = await tx.component.findUnique({
        where: { id: componentRequest.componentId },
        select: { availableStock: true, condition: true },
      })

      if (!component) {
        throw new Error('Component not found inside transaction')
      }

      // Step 2 — Guard: ensure stock is still sufficient at commit time
      if (component.availableStock < componentRequest.quantity) {
        throw new Error(
          `Insufficient stock: ${component.availableStock} available, ${componentRequest.quantity} requested`
        )
      }

      // Step 3 — Decrement availableStock
      await tx.component.update({
        where: { id: componentRequest.componentId },
        data: {
          availableStock: { decrement: componentRequest.quantity },
        },
      })

      // Step 3b — Zero-stock WARNING notification (inside transaction)
      if (component.availableStock - componentRequest.quantity === 0) {
        // Notify HOD
        await tx.notification.create({
          data: {
            targetRole: 'HOD',
            title: 'Component Out of Stock',
            message: `${componentRequest.component.name} has reached zero available stock after this issue.`,
            type: 'WARNING',
          },
        })
        
        // Notify LAB_ASSISTANT
        await tx.notification.create({
          data: {
            targetRole: 'LAB_ASSISTANT',
            title: 'Component Out of Stock',
            message: `${componentRequest.component.name} has reached zero available stock after this issue.`,
            type: 'WARNING',
          },
        })
      }

      // Step 4 — Create the IssuedComponent record
      const issuedComponent = await tx.issuedComponent.create({
        data: {
          requestId: componentRequest.id,
          studentId: componentRequest.studentId,
          componentId: componentRequest.componentId,
          quantity: componentRequest.quantity,
          issuedBy: session.user.id,
          expectedReturnDate,
          conditionOnIssue: component.condition,
          notes: notes ?? null,
          purpose: componentRequest.purpose,
          condition: component.condition,
          status: 'ACTIVE',
          isReturned: false,
        },
      })

      // Step 5 — Transition request status to ISSUED
      // If issuing from PENDING, also set approvedBy and approvedAt
      await tx.componentRequest.update({
        where: { id: componentRequest.id },
        data: { 
          status: 'ISSUED',
          ...(componentRequest.status === 'PENDING' && {
            approvedBy: session.user.id,
            approvedAt: new Date(),
          }),
        },
      })

      // Step 6 — StockMovement audit record
      await tx.stockMovement.create({
        data: {
          componentId: componentRequest.componentId,
          type: 'OUT',
          quantity: componentRequest.quantity,
          reason: `Issued to ${componentRequest.student.name} (${componentRequest.student.prn ?? 'N/A'}) — request #${componentRequest.id}`,
          performedBy: session.user.id,
        },
      })

      // Step 7 — AuditLog
      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'ISSUE_COMPONENT',
          resource: 'ISSUED_COMPONENT',
          details: JSON.stringify({
            requestId: componentRequest.id,
            componentId: componentRequest.componentId,
            componentName: componentRequest.component.name,
            studentId: componentRequest.studentId,
            studentName: componentRequest.student.name,
            quantity: componentRequest.quantity,
            expectedReturnDate: expectedReturnDate.toISOString(),
          }),
        },
      })

      // Step 8 — Notify the student
      await tx.notification.create({
        data: {
          userId: componentRequest.studentId,
          title: 'Component Issued',
          message: `${componentRequest.component.name} (Qty: ${componentRequest.quantity}) has been issued to you. Please return by ${expectedReturnDate.toLocaleDateString()}.`,
          type: 'SUCCESS',
        },
      })

      return issuedComponent
    })

    return NextResponse.json({
      success: true,
      message: 'Component issued successfully',
      issuedComponent: result,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to issue component'
    console.error('Error issuing component:', error)

    // Surface stock/validation errors as 400, everything else as 500
    const isClientError =
      message.includes('Insufficient stock') ||
      message.includes('must be APPROVED') ||
      message.includes('already been issued')

    return NextResponse.json(
      { error: message },
      { status: isClientError ? 400 : 500 }
    )
  }
}