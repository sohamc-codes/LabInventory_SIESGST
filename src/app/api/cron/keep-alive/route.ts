/**
 * Keep-Alive Endpoint for Supabase Free Tier
 * 
 * This endpoint prevents Supabase from auto-pausing by making
 * a simple database query every few days.
 * 
 * Set up a cron job (like cron-job.org or EasyCron) to hit this
 * endpoint every 5 days to keep your database active.
 * 
 * URL: https://lab-inventory-siesgst.vercel.app/api/cron/keep-alive
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    // Verify the request is from your cron service
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || 'change-me-in-production'
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Simple database query to keep connection alive
    const userCount = await prisma.user.count()
    
    console.log('✅ Keep-alive ping successful', {
      timestamp: new Date().toISOString(),
      userCount,
    })

    return NextResponse.json({
      success: true,
      message: 'Database connection active',
      timestamp: new Date().toISOString(),
      userCount,
    })
  } catch (error) {
    console.error('❌ Keep-alive ping failed:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Database connection failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
