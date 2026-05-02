import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PrismaClient } from '@prisma/client'
import { formatDistanceToNow } from 'date-fns'

const prisma = new PrismaClient()

export default async function ActivityPage() {
  const session = await auth()
  if (!session) redirect('/auth/signin')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  })

  const activities = await prisma.auditLog.findMany({
    where: {
      user: { organizationId: user?.organizationId || '' },
    },
    include: {
      user: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Activity Feed</h1>
        <p className="mt-2 text-muted-foreground">
          Recent activity across your organization
        </p>
      </div>

      <Card className="divide-y">
        {activities.map((activity) => (
          <div key={activity.id} className="p-4 hover:bg-gray-50 dark:hover:bg-zinc-800">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                  {activity.user.name?.[0] || activity.user.email[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-medium">{activity.user.name || activity.user.email}</p>
                  <p className="text-sm text-muted-foreground">
                    {activity.action} {activity.resource}
                  </p>
                  {activity.details && (
                    <p className="mt-1 text-xs text-gray-500">{activity.details}</p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <Badge variant="outline">{activity.action}</Badge>
                <p className="mt-1 text-xs text-gray-500">
                  {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>
          </div>
        ))}
      </Card>
    </div>
  )
}
