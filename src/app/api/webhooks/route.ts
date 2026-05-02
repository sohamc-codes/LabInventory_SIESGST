import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const secret = searchParams.get('secret')

    // Verify webhook secret
    if (secret !== process.env.WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
    }

    const payload = await request.json()
    const { event, data } = payload

    switch (event) {
      case 'component.low_stock':
        await handleLowStock(data)
        break

      case 'request.approved':
        await handleRequestApproved(data)
        break

      case 'return.overdue':
        await handleReturnOverdue(data)
        break

      case 'user.invited':
        await handleUserInvited(data)
        break

      default:
        console.log(`Unhandled webhook event: ${event}`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 })
  }
}

async function handleLowStock(data: any) {
  // Send notification to admins
  await prisma.notification.create({
    data: {
      title: 'Low Stock Alert',
      message: `${data.componentName} is running low (${data.quantity} remaining)`,
      type: 'WARNING',
      targetRole: 'ADMIN',
    },
  })
}

async function handleRequestApproved(data: any) {
  // Notify student
  await prisma.notification.create({
    data: {
      userId: data.studentId,
      title: 'Request Approved',
      message: `Your request for ${data.componentName} has been approved`,
      type: 'SUCCESS',
    },
  })
}

async function handleReturnOverdue(data: any) {
  // Notify student and admin
  await prisma.notification.createMany({
    data: [
      {
        userId: data.studentId,
        title: 'Return Overdue',
        message: `${data.componentName} is overdue for return`,
        type: 'ERROR',
      },
      {
        title: 'Overdue Item',
        message: `${data.studentName} has an overdue item: ${data.componentName}`,
        type: 'WARNING',
        targetRole: 'LAB_ASSISTANT',
      },
    ],
  })
}

async function handleUserInvited(data: any) {
  // Send invitation email (implement with your email service)
  console.log(`Sending invitation to ${data.email}`)
}
