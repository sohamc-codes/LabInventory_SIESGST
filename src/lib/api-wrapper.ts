/**
 * API wrapper with rate limiting, validation, and error handling
 * Use this for all API routes to ensure consistency
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { withRateLimit, RateLimiter, rateLimiters } from './rate-limit'
import { formatValidationErrors } from './validation'
import { logError, logWarn } from './logger'
import { auth } from './auth'

interface ApiHandlerOptions {
  rateLimit?: RateLimiter | false
  requireAuth?: boolean
  allowedRoles?: string[]
  validationSchema?: z.ZodSchema
}

type ApiHandler = (
  request: NextRequest,
  context: {
    params?: any
    session?: any
    validatedData?: any
  }
) => Promise<NextResponse>

/**
 * Wrap API handler with middleware
 */
export function createApiHandler(
  handler: ApiHandler,
  options: ApiHandlerOptions = {}
) {
  return async (request: NextRequest, context?: { params?: any }) => {
    try {
      // 1. Rate Limiting
      if (options.rateLimit !== false) {
        const limiter = options.rateLimit || rateLimiters.standard
        const rateLimitResponse = await withRateLimit(request, limiter)
        if (rateLimitResponse) {
          logWarn('Rate limit exceeded', {
            path: request.nextUrl.pathname,
            method: request.method,
          })
          return rateLimitResponse
        }
      }

      // 2. Authentication
      let session = null
      if (options.requireAuth) {
        session = await auth()
        if (!session) {
          return NextResponse.json(
            { error: 'Unauthorized', message: 'Authentication required' },
            { status: 401 }
          )
        }

        // 3. Authorization (Role Check)
        if (options.allowedRoles && options.allowedRoles.length > 0) {
          const userRole = session.user?.role
          if (!userRole || !options.allowedRoles.includes(userRole)) {
            logWarn('Unauthorized access attempt', {
              userId: session.user?.id,
              role: userRole,
              requiredRoles: options.allowedRoles,
              path: request.nextUrl.pathname,
            })
            return NextResponse.json(
              { error: 'Forbidden', message: 'Insufficient permissions' },
              { status: 403 }
            )
          }
        }
      }

      // 4. Input Validation
      let validatedData = null
      if (options.validationSchema) {
        try {
          const body = await request.json()
          validatedData = options.validationSchema.parse(body)
        } catch (error) {
          if (error instanceof z.ZodError) {
            return NextResponse.json(
              {
                error: 'Validation failed',
                message: 'Invalid input data',
                errors: formatValidationErrors(error),
              },
              { status: 400 }
            )
          }
          throw error
        }
      }

      // 5. Execute Handler
      return await handler(request, {
        params: context?.params,
        session,
        validatedData,
      })
    } catch (error) {
      // Error Handling
      logError('API handler error', error as Error, {
        path: request.nextUrl.pathname,
        method: request.method,
      })

      // Don't expose internal errors in production
      const isDevelopment = process.env.NODE_ENV === 'development'
      const errorMessage = isDevelopment
        ? (error as Error).message
        : 'An unexpected error occurred'

      return NextResponse.json(
        {
          error: 'Internal server error',
          message: errorMessage,
          ...(isDevelopment && { stack: (error as Error).stack }),
        },
        { status: 500 }
      )
    }
  }
}

/**
 * Success response helper
 */
export function successResponse<T>(data: T, status: number = 200): NextResponse {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status }
  )
}

/**
 * Error response helper
 */
export function errorResponse(
  message: string,
  status: number = 400,
  errors?: Record<string, string[]>
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: message,
      ...(errors && { errors }),
    },
    { status }
  )
}

/**
 * Paginated response helper
 */
export function paginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): NextResponse {
  return NextResponse.json({
    success: true,
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    },
  })
}

/**
 * Example usage:
 * 
 * export const GET = createApiHandler(
 *   async (request, { session }) => {
 *     const data = await fetchData()
 *     return successResponse(data)
 *   },
 *   {
 *     requireAuth: true,
 *     allowedRoles: ['ADMIN', 'HOD'],
 *     rateLimit: rateLimiters.relaxed,
 *   }
 * )
 * 
 * export const POST = createApiHandler(
 *   async (request, { validatedData }) => {
 *     const result = await createItem(validatedData)
 *     return successResponse(result, 201)
 *   },
 *   {
 *     requireAuth: true,
 *     validationSchema: itemSchema,
 *     rateLimit: rateLimiters.standard,
 *   }
 * )
 */
