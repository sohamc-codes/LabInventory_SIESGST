import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Zap, Shield, Bug } from 'lucide-react'

export default function ChangelogPage() {
  const releases = [
    {
      version: '3.0.0',
      date: 'January 26, 2026',
      type: 'major',
      changes: [
        { type: 'feature', text: 'Multi-tenant architecture with organization workspaces' },
        { type: 'feature', text: 'Professional marketing website and landing page' },
        { type: 'feature', text: 'Subscription management with 3 pricing tiers' },
        { type: 'feature', text: 'AI-powered chat assistant' },
        { type: 'feature', text: 'Advanced reporting and data export' },
        { type: 'feature', text: 'Integrations marketplace' },
        { type: 'improvement', text: 'Enhanced SEO and metadata' },
        { type: 'improvement', text: 'Improved mobile responsiveness' },
      ],
    },
    {
      version: '2.0.0',
      date: 'December 15, 2025',
      type: 'major',
      changes: [
        { type: 'feature', text: 'Return management system with automated reminders' },
        { type: 'feature', text: 'Real-time WebSocket notifications' },
        { type: 'feature', text: 'AI-powered component recommendations' },
        { type: 'feature', text: 'Advanced analytics dashboard' },
        { type: 'improvement', text: 'Upgraded to Next.js 15' },
        { type: 'fix', text: 'Fixed performance issues with large datasets' },
      ],
    },
    {
      version: '1.0.0',
      date: 'June 1, 2025',
      type: 'major',
      changes: [
        { type: 'feature', text: 'Initial release' },
        { type: 'feature', text: 'User authentication with Microsoft Azure AD' },
        { type: 'feature', text: 'Component inventory management' },
        { type: 'feature', text: 'Request and approval workflow' },
        { type: 'feature', text: 'QR code generation and scanning' },
      ],
    },
  ]

  return (
    <div className="py-24 px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground">Changelog</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Track all updates, improvements, and new features
          </p>
        </div>

        <div className="mt-16 space-y-12">
          {releases.map((release) => (
            <Card key={release.version} className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">
                    Version {release.version}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {release.date}
                  </p>
                </div>
                <Badge variant={release.type === 'major' ? 'default' : 'secondary'}>
                  {release.type}
                </Badge>
              </div>

              <div className="mt-6 space-y-3">
                {release.changes.map((change, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    {change.type === 'feature' && (
                      <Sparkles className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-500" />
                    )}
                    {change.type === 'improvement' && (
                      <Zap className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                    )}
                    {change.type === 'fix' && (
                      <Bug className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
                    )}
                    {change.type === 'security' && (
                      <Shield className="mt-0.5 h-5 w-5 flex-shrink-0 text-purple-500" />
                    )}
                    <p className="text-gray-700 dark:text-zinc-300">{change.text}</p>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
