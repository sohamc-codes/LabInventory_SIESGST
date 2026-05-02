/**
 * Rate limiting utilities
 * Prevents abuse and DDoS attacks
 */

interface RateLimitConfig {
  interval: number // Time window in milliseconds
  uniqueTokenPerInterval: number // Max requests per interval
}

interface RateLimitStore {
  count: number
  resetTime: number
}

// In-memory store (use Redis in production for distributed systems)
const rateLimitStore = new Map<string, RateLimitStore>()

/**
 * Rate limiter using token bucket algorithm
 */
export class RateLimiter {
  private interval: number
  private uniqueTokenPerInterval: number

  constructor(config: RateLimitConfig) {
    this.interval = config.interval
    this.uniqueTokenPerInterval = config.uniqueTokenPerInterval
  }

  /**
   * Check if request should be rate limited
   * @param identifier - Unique identifier (IP address, user ID, etc.)
   * @returns Object with allowed status and remaining requests
   */
  check(identifier: string): {
    allowed: boolean
    remaining: number
    resetTime: number
  } {
    const now = Date.now()
    const record = rateLimitStore.get(identifier)

    // No record or expired - create new
    if (!record || now > record.resetTime) {
      const newRecord: RateLimitStore = {
        count: 1,
        resetTime: now + this.interval,
      }
      rateLimitStore.set(identifier, newRecord)

      return {
        allowed: true,
        remaining: this.uniqueTokenPerInterval - 1,
        resetTime: newRecord.resetTime,
      }
    }

    // Check if limit exceeded
    if (record.count >= this.uniqueTokenPerInterval) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: record.resetTime,
      }
    }

    // Increment count
    record.count++
    rateLimitStore.set(identifier, record)

    return {
      allowed: true,
      remaining: this.uniqueTokenPerInterval - record.count,
      resetTime: record.resetTime,
    }
  }

  /**
   * Reset rate limit for identifier
   */
  reset(identifier: string): void {
    rateLimitStore.delete(identifier)
  }

  /**
   * Clear all rate limits (useful for testing)
   */
  clearAll(): void {
    rateLimitStore.clear()
  }
}

/**
 * Predefined rate limiters for different use cases
 */
export const rateLimiters = {
  // Strict: 10 requests per minute
  strict: new RateLimiter({
    interval: 60 * 1000,
    uniqueTokenPerInterval: 10,
  }),

  // Standard: 30 requests per minute
  standard: new RateLimiter({
    interval: 60 * 1000,
    uniqueTokenPerInterval: 30,
  }),

  // Relaxed: 100 requests per minute
  relaxed: new RateLimiter({
    interval: 60 * 1000,
    uniqueTokenPerInterval: 100,
  }),

  // API: 1000 requests per hour
  api: new RateLimiter({
    interval: 60 * 60 * 1000,
    uniqueTokenPerInterval: 1000,
  }),

  // Auth: 5 attempts per 15 minutes
  auth: new RateLimiter({
    interval: 15 * 60 * 1000,
    uniqueTokenPerInterval: 5,
  }),
}

/**
 * Get client identifier from request
 */
export function getClientIdentifier(request: Request): string {
  // Try to get IP from various headers
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip')

  // Use first IP if multiple are present
  const ip = forwarded?.split(',')[0] || realIp || cfConnectingIp || 'unknown'

  return ip.trim()
}

/**
 * Rate limit middleware for API routes
 */
export async function withRateLimit(
  request: Request,
  limiter: RateLimiter = rateLimiters.standard
): Promise<Response | null> {
  const identifier = getClientIdentifier(request)
  const result = limiter.check(identifier)

  // Add rate limit headers
  const headers = {
    'X-RateLimit-Limit': limiter['uniqueTokenPerInterval'].toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
  }

  if (!result.allowed) {
    return new Response(
      JSON.stringify({
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
      }),
      {
        status: 429,
        headers: {
          ...headers,
          'Content-Type': 'application/json',
          'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString(),
        },
      }
    )
  }

  return null // Allow request to proceed
}

/**
 * Clean up expired rate limit records periodically
 */
export function startRateLimitCleanup(intervalMs: number = 60000): NodeJS.Timeout {
  return setInterval(() => {
    const now = Date.now()
    Array.from(rateLimitStore.entries()).forEach(([key, record]) => {
      if (now > record.resetTime) {
        rateLimitStore.delete(key)
      }
    })
  }, intervalMs)
}
