import { NextRequest, NextResponse } from 'next/server'
import { unstable_cache } from 'next/cache'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  computeDepartmentEfficiency,
  computeLowStockAlerts,
  computeHighPriorityRequests,
  computeUtilizationRate,
  type RequestRecord,
  type ComponentRecord,
} from '@/lib/metrics/hod-metrics'

// ── Cached data-fetch (5-minute TTL) ─────────────────────────────────────────

const getHodMetrics = unstable_cache(
  async (department: string | null) => {
    const now = new Date()

    // Fetch requests for the HOD's department (or all if no department set)
    const requestWhere = department
      ? { student: { department } }
      : {}

    const [rawRequests, rawComponents] = await Promise.all([
      // Requests — only fields needed for metrics
      prisma.componentRequest.findMany({
        where: requestWhere,
        select: {
          status: true,
          createdAt: true,
          approvedAt: true,
        },
      }),

      // All components in the org for utilization rate and low stock alerts
      prisma.component.findMany({
        where: { isActive: true },
        select: { totalStock: true, availableStock: true },
      }),
    ])

    // Shape into pure-function input types
    const requests: RequestRecord[] = rawRequests.map((r) => ({
      status: r.status,
      createdAt: r.createdAt,
      approvedAt: r.approvedAt,
    }))

    const components: ComponentRecord[] = rawComponents.map((c) => ({
      totalStock: c.totalStock,
      availableStock: c.availableStock,
    }))

    return {
      departmentEfficiency: computeDepartmentEfficiency(requests),
      lowStockAlerts: computeLowStockAlerts(components),
      highPriorityRequests: computeHighPriorityRequests(requests, now),
      utilizationRate: computeUtilizationRate(components),
    }
  },
  ['hod-metrics'],
  { revalidate: 300 } // 5 minutes
)

// ── Route handler ─────────────────────────────────────────────────────────────

export async function GET(_request: NextRequest) {
  try {
    const session = await auth()
    if (!session || !['HOD', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const metrics = await getHodMetrics(session.user.department ?? null)
    return NextResponse.json(metrics)
  } catch (error) {
    console.error('Error fetching HOD metrics:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
