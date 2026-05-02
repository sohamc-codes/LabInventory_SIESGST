import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createCheckoutSession } from '@/lib/stripe'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { plan } = await request.json()

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { organization: true },
    })

    if (!user?.organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      )
    }

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const checkoutSession = await createCheckoutSession({
      organizationId: user.organization.id,
      plan,
      successUrl: `${baseUrl}/settings/billing?success=true`,
      cancelUrl: `${baseUrl}/settings/billing?canceled=true`,
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
