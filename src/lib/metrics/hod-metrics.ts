/**
 * Pure metric computation functions for the HOD dashboard.
 *
 * These functions have NO Prisma dependency — they operate on plain data
 * objects, making them directly testable with fast-check property-based tests.
 *
 * All formulas are derived from the design document. No Math.random(),
 * no hardcoded numeric fallbacks.
 */

// ── Input types ───────────────────────────────────────────────────────────────

export interface RequestRecord {
  status: string
  createdAt: Date
  approvedAt: Date | null
}

export interface IssuedItemRecord {
  quantity: number
  cost: number | null   // Component.cost — may be null
}

export interface ComponentRecord {
  totalStock: number
  availableStock: number
}

// ── Metric 1: Department Efficiency ──────────────────────────────────────────
//
// Percentage of processed requests (status != PENDING) that were approved
// within 48 hours of creation.
//
// efficiency = (count where approvedAt - createdAt ≤ 48h)
//              ─────────────────────────────────────────── × 100
//              (total count of requests with status != PENDING)

const FORTY_EIGHT_HOURS_MS = 48 * 60 * 60 * 1000

export function computeDepartmentEfficiency(requests: RequestRecord[]): number {
  const processed = requests.filter((r) => r.status !== 'PENDING')
  if (processed.length === 0) return 0

  const approvedWithin48h = processed.filter(
    (r) =>
      r.approvedAt !== null &&
      r.approvedAt.getTime() - r.createdAt.getTime() <= FORTY_EIGHT_HOURS_MS
  )

  return Math.round((approvedWithin48h.length / processed.length) * 100)
}

// ── Metric 2: Low Stock Alerts ───────────────────────────────────────────────
//
// Count of components where available stock is critically low (≤ 2 units)
// or completely out of stock (0 units).
//
// count = COUNT where availableStock ≤ 2

export function computeLowStockAlerts(components: ComponentRecord[]): number {
  return components.filter((c) => c.availableStock <= 2).length
}

// ── Metric 3: High Priority Requests ─────────────────────────────────────────
//
// Count of PENDING requests created more than 48 hours ago.
//
// count = COUNT where status = 'PENDING' AND createdAt < now - 48h

export function computeHighPriorityRequests(
  requests: RequestRecord[],
  now: Date
): number {
  const cutoff = new Date(now.getTime() - FORTY_EIGHT_HOURS_MS)
  return requests.filter(
    (r) => r.status === 'PENDING' && r.createdAt < cutoff
  ).length
}

// ── Metric 4: Utilization Rate ────────────────────────────────────────────────
//
// Ratio of issued stock to total stock across all components in the org.
//
// used  = SUM(totalStock - availableStock)
// total = SUM(totalStock)
// rate  = (used / total) × 100   (returns 0 when total = 0)

export function computeUtilizationRate(components: ComponentRecord[]): number {
  const total = components.reduce((sum, c) => sum + c.totalStock, 0)
  if (total === 0) return 0

  const used = components.reduce(
    (sum, c) => sum + (c.totalStock - c.availableStock),
    0
  )

  return Math.round((used / total) * 100)
}
