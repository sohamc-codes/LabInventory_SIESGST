import NextAuth from 'next-auth'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@/types/database'
import bcrypt from 'bcryptjs'
import authConfig from './auth.config'
import Credentials from 'next-auth/providers/credentials'
import MicrosoftEntraID from 'next-auth/providers/microsoft-entra-id'

// Node-compatible auth with Prisma
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  
  // Override providers with Node-compatible versions that can use Prisma
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

    // Credentials for Lab Assistants with Prisma database access
    Credentials({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required')
        }

        // Find user in database
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user) {
          throw new Error('Invalid email or password')
        }

        // Check if user has a password (Lab Assistant with credentials)
        if (!user.password) {
          throw new Error('This account uses Microsoft SSO. Please sign in with Microsoft.')
        }

        // Verify password using bcrypt
        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isPasswordValid) {
          throw new Error('Invalid email or password')
        }

        // Return user object
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role as UserRole,
          department: user.department,
          prn: user.prn,
          isActive: user.isActive,
        }
      },
    }),
  ],

  callbacks: {
    ...authConfig.callbacks,
    
    // Override signIn callback to handle Microsoft SSO user creation
    async signIn({ user, account, profile }) {
      // Handle Microsoft SSO sign-in
      if (account?.provider === 'microsoft-entra-id') {
        const email = user.email || profile?.email

        if (!email) {
          return false
        }

        // Check if user exists in database
        const existingUser = await prisma.user.findUnique({
          where: { email },
        })

        if (!existingUser) {
          // Auto-create user for Microsoft SSO (Students/HODs)
          await prisma.user.create({
            data: {
              email,
              name: user.name || profile?.name || email.split('@')[0],
              image: user.image || profile?.picture,
              emailVerified: new Date(),
              role: 'STUDENT', // Default role, can be changed by admin
            },
          })
        }
      }

      return true
    },

    // Override JWT callback to fetch user data from database for Microsoft SSO
    async jwt({ token, user, account, trigger }) {
      // Store user data in token on sign-in
      if (user) {
        token.id = user.id
        token.role = user.role
        token.department = user.department
        token.prn = user.prn
        token.isActive = user.isActive
      }

      // For Microsoft SSO, fetch user from database to get latest role/data
      if (account?.provider === 'microsoft-entra-id' && token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
        })

        if (dbUser) {
          token.id = dbUser.id
          token.role = dbUser.role
          token.department = dbUser.department
          token.prn = dbUser.prn
          token.isActive = dbUser.isActive
        }
      }

      // Store account provider info
      if (account) {
        token.provider = account.provider
      }

      return token
    },
  },

  session: {
    strategy: 'jwt',
  },
})