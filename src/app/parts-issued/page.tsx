import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import { PartsIssuedClient } from '@/components/parts-issued/parts-issued-client'

// Always fetch fresh data
export const dynamic = 'force-dynamic'

export default async function PartsIssuedPage() {
  const session = await auth()

  // Auth guard — LAB_ASSISTANT, HOD, and ADMIN only
  if (!session) {
    redirect('/auth/signin')
  }

  // Redirect students to their dashboard instead of showing unauthorized page
  if (!['LAB_ASSISTANT', 'HOD', 'ADMIN'].includes(session.user.role)) {
    redirect('/dashboard/student')
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="Return Components"
          subtitle="Scan PRN and return active issued components"
        />
        <main className="flex-1 overflow-y-auto p-6">
          <PartsIssuedClient />
        </main>
      </div>
    </div>
  )
}
