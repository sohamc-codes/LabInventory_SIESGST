import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Users, Mail, Shield } from 'lucide-react'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function OrganizationSettingsPage() {
  const session = await auth()
  if (!session) redirect('/auth/signin')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      organization: {
        include: {
          users: true,
        },
      },
    },
  })

  if (!user?.organization) {
    return <div>No organization found</div>
  }

  const org = user.organization

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Organization Settings</h1>
        <p className="mt-2 text-muted-foreground">
          Manage your organization details and team members
        </p>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground">Organization Details</h3>
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
              Organization Name
            </label>
            <Input defaultValue={org.name} className="mt-1" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
              Organization URL
            </label>
            <div className="mt-1 flex items-center">
              <span className="text-sm text-gray-500">labinventory.com/</span>
              <Input defaultValue={org.slug} className="ml-1" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
              Billing Email
            </label>
            <Input type="email" defaultValue={org.billingEmail || ''} className="mt-1" />
          </div>
          <Button>Save Changes</Button>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Team Members</h3>
          <Button>
            <Mail className="mr-2 h-4 w-4" />
            Invite Member
          </Button>
        </div>
        <div className="mt-4 space-y-3">
          {org.users.map((member) => (
            <div key={member.id} className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white">
                  {member.name?.[0] || member.email[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-medium">{member.name || member.email}</p>
                  <p className="text-sm text-gray-600">{member.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge>{member.role}</Badge>
                {member.role !== 'OWNER' && (
                  <Button variant="ghost" size="sm">
                    Remove
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center">
          <Shield className="mr-3 h-5 w-5 text-gray-400" />
          <div>
            <h3 className="text-lg font-semibold text-foreground">Security</h3>
            <p className="text-sm text-muted-foreground">
              Configure security settings for your organization
            </p>
          </div>
        </div>
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Two-Factor Authentication</p>
              <p className="text-sm text-gray-600">Require 2FA for all team members</p>
            </div>
            <Button variant="outline">Enable</Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">SSO Integration</p>
              <p className="text-sm text-gray-600">Microsoft Azure AD, Google Workspace</p>
            </div>
            <Button variant="outline">Configure</Button>
          </div>
        </div>
      </Card>

      <Card className="border-red-200 bg-red-50 dark:bg-red-900/20 p-6">
        <h3 className="text-lg font-semibold text-red-900 dark:text-red-100">Danger Zone</h3>
        <p className="mt-2 text-sm text-red-700 dark:text-red-200">
          Permanently delete this organization and all associated data
        </p>
        <Button variant="destructive" className="mt-4">
          Delete Organization
        </Button>
      </Card>
    </div>
  )
}
