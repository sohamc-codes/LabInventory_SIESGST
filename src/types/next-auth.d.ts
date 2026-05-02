import { UserRole } from '@/types/database'
import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      role: UserRole
      prn?: string | null
      department?: string | null
      isActive: boolean
    }
  }

  interface User {
    role: UserRole
    prn?: string | null
    department?: string | null
    isActive: boolean
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: UserRole
  }
}