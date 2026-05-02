import type { NextAuthConfig } from 'next-auth'
import MicrosoftEntraID from 'next-auth/providers/microsoft-entra-id'
import Credentials from 'next-auth/providers/credentials'
import type { UserRole } from '@/types/database'

// Edge-compatible auth configuration
// No Prisma imports or database queries allowed here
export const authConfig = {
  providers: [
    // Microsoft SSO for Students and HODs
    MicrosoftEntraID({
      clientId: process.env.MICROSOFT_CLIENT_ID!,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
      issuer: `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID}/v2.0`,
      authorization: {
        params: {
          scope: 'openid profile email User.Read',
        },
      },
    }),

    // Credentials for Lab Assistants
    // Note: The authorize function will be handled in the Node runtime (auth.ts)
    Credentials({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      // Placeholder - actual authorization happens in Node runtime
      async authorize() {
        return null
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, trigger }) {
      // Store user data in token on sign-in
      if (user) {
        token.id = user.id
        token.role = user.role
        token.department = user.department
        token.prn = user.prn
        token.isActive = user.isActive
      }

      // Store account provider info
      if (account) {
        token.provider = account.provider
      }

      return token
    },
    async session({ session, token }) {
      // Map token data to session
      if (session.user && token) {
        session.user.id = token.id as string
        session.user.role = token.role as UserRole
        session.user.department = token.department as string | null
        session.user.prn = token.prn as string | null
        session.user.isActive = token.isActive as boolean
      }
      return session
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnAuthPage = nextUrl.pathname.startsWith('/auth')
      
      if (isOnAuthPage) {
        return true // Always allow access to auth pages
      }

      return isLoggedIn // Require authentication for all other pages
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
  trustHost: true,
} satisfies NextAuthConfig

export default authConfig
