import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { name, email, organizationName, organizationSlug, plan = 'STARTER' } = await request.json()

    // Validate input
    if (!name || !email || !organizationName || !organizationSlug) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Check if organization slug is taken
    const existingOrg = await prisma.organization.findUnique({
      where: { slug: organizationSlug },
    })

    if (existingOrg) {
      return NextResponse.json(
        { message: 'Organization URL is already taken' },
        { status: 400 }
      )
    }

    // Set plan limits
    const planLimits = {
      STARTER: { maxUsers: 50, maxComponents: 500 },
      PROFESSIONAL: { maxUsers: 500, maxComponents: 5000 },
      ENTERPRISE: { maxUsers: 999999, maxComponents: 999999 },
    }

    const limits = planLimits[plan as keyof typeof planLimits] || planLimits.STARTER

    // Create organization and user
    const organization = await prisma.organization.create({
      data: {
        name: organizationName,
        slug: organizationSlug,
        plan: plan.toUpperCase(),
        maxUsers: limits.maxUsers,
        maxComponents: limits.maxComponents,
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days trial
        users: {
          create: {
            name,
            email,
            role: 'OWNER',
            isActive: true,
            onboardedAt: new Date(),
          },
        },
      },
      include: {
        users: true,
      },
    })

    return NextResponse.json(
      {
        message: 'Account created successfully',
        organization: {
          id: organization.id,
          name: organization.name,
          slug: organization.slug,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
