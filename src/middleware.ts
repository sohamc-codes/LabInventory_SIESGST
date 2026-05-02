import NextAuth from 'next-auth'
import authConfig from '@/lib/auth.config'
import { NextResponse } from 'next/server'

// Use Edge-compatible auth config for middleware
const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  // Public routes that don't require authentication
  const publicRoutes = [
    '/auth/signin',
    '/auth/signup', 
    '/auth/error',
    '/auth/callback',
    '/_next',
    '/favicon.ico',
    '/public'
  ]

  // Check if current path is public
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  // Allow public routes
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Protected routes - require authentication
  const protectedRoutes = [
    '/dashboard',
    '/inventory',
    '/requests',
    '/parts-issued',
    '/approvals',
    '/scanner',
    '/issue-components',
    '/analytics',
    '/users'
  ]

  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  // Redirect to signin if trying to access protected route without session
  if (isProtectedRoute && !session) {
    const signInUrl = new URL('/auth/signin', req.url)
    signInUrl.searchParams.set('callbackUrl', pathname)
    signInUrl.searchParams.set('message', 'Please sign in to continue')
    return NextResponse.redirect(signInUrl)
  }

  // Redirect root to appropriate dashboard if authenticated
  if (pathname === '/' && session) {
    const userRole = session.user?.role?.toLowerCase().replace('_', '-') || 'student'
    return NextResponse.redirect(new URL(`/dashboard/${userRole}`, req.url))
  }

  // Redirect root to signin if not authenticated
  if (pathname === '/' && !session) {
    return NextResponse.redirect(new URL('/auth/signin', req.url))
  }

  // Role-based route protection
  if (session) {
    const userRole = session.user?.role

    // LAB_ASSISTANT, HOD, and ADMIN routes
    if (pathname.startsWith('/approvals') && !['LAB_ASSISTANT', 'HOD', 'ADMIN'].includes(userRole as string)) {
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }

    if (pathname.startsWith('/scanner') && !['LAB_ASSISTANT', 'HOD', 'ADMIN'].includes(userRole as string)) {
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }

    if (pathname.startsWith('/inventory/manage') && !['LAB_ASSISTANT', 'HOD', 'ADMIN'].includes(userRole as string)) {
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }

    if (pathname.startsWith('/issue-components') && !['LAB_ASSISTANT', 'HOD', 'ADMIN'].includes(userRole as string)) {
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }

    if (pathname.startsWith('/users') && !['LAB_ASSISTANT', 'HOD', 'ADMIN'].includes(userRole as string)) {
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }

    if (pathname.startsWith('/reports') && !['LAB_ASSISTANT', 'HOD', 'ADMIN'].includes(userRole as string)) {
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }

    if (pathname.startsWith('/parts-issued') && !['LAB_ASSISTANT', 'HOD', 'ADMIN'].includes(userRole as string)) {
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }

    // Student-only routes
    if (pathname.startsWith('/requests/my-requests') && userRole !== 'STUDENT') {
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }

    if (pathname.startsWith('/requests/new') && userRole !== 'STUDENT') {
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }
  }

  // API route protection
  if (pathname.startsWith('/api/')) {
    // Allow auth routes
    if (pathname.startsWith('/api/auth/')) {
      return NextResponse.next()
    }

    // Require authentication for all other API routes
    if (!session) {
      return NextResponse.json({ 
        error: 'Unauthorized', 
        message: 'Please sign in to access this resource' 
      }, { status: 401 })
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)',
  ],
}