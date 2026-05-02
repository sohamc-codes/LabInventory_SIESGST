import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import { UsersClient } from '@/components/users/users-client'

// Always fetch fresh user data — roles can change
export const dynamic = 'force-dynamic'

export default async function UsersPage() {
  const session = await auth()

  // Auth guard — LAB_ASSISTANT, HOD, and ADMIN only
  if (!session || !['LAB_ASSISTANT', 'HOD', 'ADMIN'].includes(session.user.role)) {
    redirect('/unauthorized')
  }

  // Pre-fetch all users with only the fields the UI needs
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      department: true,
      prn: true,
      isActive: true,
      createdAt: true,
    },
    orderBy: [{ role: 'asc' }, { name: 'asc' }],
  })

  // Convert Date to string for client component
  const usersWithStringDates = users.map(user => ({
    ...user,
    createdAt: user.createdAt.toISOString(),
  }))

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="User Management"
          subtitle={`${usersWithStringDates.length} users in the system`}
        />
        <main className="flex-1 overflow-y-auto p-5">
          <div className="max-w-6xl mx-auto">
            <UsersClient users={usersWithStringDates} currentUserId={session.user.id} />
          </div>
        </main>
      </div>
    </div>
  )
}
