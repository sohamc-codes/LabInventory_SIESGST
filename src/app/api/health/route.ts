import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * Health check endpoint for monitoring
 * GET /api/health
 */
export async function GET() {
  const startTime = Date.now()
  
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`
    
    const responseTime = Date.now() - startTime
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        api: 'operational',
      },
      performance: {
        responseTime: `${responseTime}ms`,
      },
      version: process.env.npm_package_version || '3.0.0',
      environment: process.env.NODE_ENV,
    })
  } catch (error) {
    const responseTime = Date.now() - startTime
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'disconnected',
        api: 'degraded',
      },
      performance: {
        responseTime: `${responseTime}ms`,
      },
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 503 })
  }
}
