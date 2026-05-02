import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, FileText, BarChart3, TrendingUp, Package, Users } from 'lucide-react'
import Link from 'next/link'

export default async function ReportsPage() {
  const session = await auth()
  
  if (!session) {
    redirect('/auth/signin')
  }

  // Auth guard — LAB_ASSISTANT, HOD, and ADMIN only
  if (!['LAB_ASSISTANT', 'HOD', 'ADMIN'].includes(session.user.role)) {
    redirect('/dashboard/student')
  }

  const reports = [
    {
      title: 'Inventory Report',
      description: 'Complete list of all components with stock levels',
      icon: Package,
      type: 'components',
      formats: ['CSV', 'JSON', 'PDF'],
    },
    {
      title: 'Request History',
      description: 'All component requests with approval status',
      icon: FileText,
      type: 'requests',
      formats: ['CSV', 'JSON'],
    },
    {
      title: 'Issued Components',
      description: 'Components currently issued to users',
      icon: TrendingUp,
      type: 'issued',
      formats: ['CSV', 'JSON'],
    },
    {
      title: 'Usage Analytics',
      description: 'Component usage trends and patterns',
      icon: BarChart3,
      type: 'analytics',
      formats: ['PDF'],
    },
    {
      title: 'User Activity',
      description: 'User engagement and activity logs',
      icon: Users,
      type: 'users',
      formats: ['CSV', 'JSON'],
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Reports & Export</h1>
        <p className="mt-2 text-muted-foreground">
          Generate and download reports in various formats
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {reports.map((report) => (
          <Card key={report.type} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                <report.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-foreground">
              {report.title}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {report.description}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {report.formats.map((format) => (
                <Button
                  key={format}
                  size="sm"
                  variant="outline"
                  asChild
                >
                  <Link href={`/api/export?type=${report.type}&format=${format.toLowerCase()}`}>
                    <Download className="mr-2 h-4 w-4" />
                    {format}
                  </Link>
                </Button>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground">Custom Reports</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Need a custom report? Contact support or use our API to build your own.
        </p>
        <div className="mt-4 flex space-x-4">
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            API Documentation
          </Button>
          <Button variant="outline">Contact Support</Button>
        </div>
      </Card>
    </div>
  )
}
