import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, CreditCard, Calendar } from 'lucide-react'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function BillingPage() {
  const session = await auth()
  if (!session) redirect('/auth/signin')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { 
      organization: {
        include: {
          users: true,
          components: true,
        }
      }
    },
  })

  if (!user?.organization) {
    return <div>No organization found</div>
  }

  const org = user.organization
  const isTrialing = org.trialEndsAt && new Date(org.trialEndsAt) > new Date()
  const daysLeft = isTrialing
    ? Math.ceil((new Date(org.trialEndsAt!).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Billing & Subscription</h1>
        <p className="mt-2 text-muted-foreground">
          Manage your subscription and billing information
        </p>
      </div>

      {isTrialing && (
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                Trial Active - {daysLeft} days remaining
              </h3>
              <p className="mt-1 text-sm text-blue-700 dark:text-blue-200">
                Upgrade now to continue using all features after your trial ends
              </p>
            </div>
            <Button>Upgrade Now</Button>
          </div>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Current Plan</p>
              <h3 className="mt-1 text-2xl font-bold text-foreground">
                {org.plan}
              </h3>
            </div>
            <Badge variant={org.status === 'ACTIVE' ? 'default' : 'destructive'}>
              {org.status}
            </Badge>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex items-center text-sm">
              <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
              <span>{org.maxUsers} users</span>
            </div>
            <div className="flex items-center text-sm">
              <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
              <span>{org.maxComponents} components</span>
            </div>
          </div>
          <Button className="mt-6 w-full" variant="outline">
            Change Plan
          </Button>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <CreditCard className="mr-3 h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-muted-foreground">Payment Method</p>
              <p className="mt-1 font-medium">•••• •••• •••• 4242</p>
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <Calendar className="mr-3 h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-muted-foreground">Next Billing Date</p>
              <p className="mt-1 font-medium">
                {org.trialEndsAt ? new Date(org.trialEndsAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
          <Button className="mt-6 w-full" variant="outline">
            Update Payment Method
          </Button>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground">Usage This Month</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-sm text-muted-foreground">Users</p>
            <p className="mt-1 text-2xl font-bold">
              {user.organization.users.length} / {org.maxUsers}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Components</p>
            <p className="mt-1 text-2xl font-bold">
              {user.organization.components.length} / {org.maxComponents}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">API Calls</p>
            <p className="mt-1 text-2xl font-bold">12,450</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground">Billing History</h3>
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <p className="font-medium">Professional Plan</p>
              <p className="text-sm text-gray-600">Dec 1, 2025</p>
            </div>
            <div className="text-right">
              <p className="font-medium">$99.00</p>
              <Badge variant="outline">Paid</Badge>
            </div>
          </div>
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <p className="font-medium">Professional Plan</p>
              <p className="text-sm text-gray-600">Nov 1, 2025</p>
            </div>
            <div className="text-right">
              <p className="font-medium">$99.00</p>
              <Badge variant="outline">Paid</Badge>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
