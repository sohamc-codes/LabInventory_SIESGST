import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import { BulkImportClient } from '@/components/users/bulk-import-client'

export const dynamic = 'force-dynamic'

export default async function BulkImportPage() {
  const session = await auth()

  // Auth guard - Only OWNER, ADMIN, HOD, LAB_ASSISTANT
  if (!session || !['OWNER', 'ADMIN', 'HOD', 'LAB_ASSISTANT'].includes(session.user.role)) {
    redirect('/unauthorized')
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="Import Student PRNs"
          subtitle="Bulk upload student data from CSV file"
        />
        <main className="flex-1 overflow-y-auto p-5">
          <div className="max-w-4xl mx-auto">
            <BulkImportClient />
          </div>
        </main>
      </div>
    </div>
  )
}
