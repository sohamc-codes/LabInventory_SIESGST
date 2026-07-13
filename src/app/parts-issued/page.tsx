import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import { PartsIssuedClient } from '@/components/parts-issued/parts-issued-client'

// Always fetch fresh data
export const dynamic = 'force-dynamic'

export default async function PartsIssuedPage() {
  const session = await auth()

  // Auth guard
  if (!session) {
    redirect('/auth/signin')
  }

  const isStudent = session.user.role === 'STUDENT'
  const isStaff = ['LAB_ASSISTANT', 'HOD', 'ADMIN'].includes(session.user.role)

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title={isStudent ? "My Issued Components" : "Return Components"}
          subtitle={isStudent ? "Track your borrowed components and upcoming returns" : "Process returns and track active component checkouts"}
        />
        <main className="flex-1 overflow-y-auto p-6">
          <PartsIssuedClient userRole={session.user.role} userPrn={session.user.prn} />
        </main>
      </div>
    </div>
  )
}
