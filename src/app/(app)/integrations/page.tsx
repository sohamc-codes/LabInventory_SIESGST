import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Zap, CheckCircle, ExternalLink } from 'lucide-react'

export default function IntegrationsPage() {
  const integrations = [
    {
      name: 'Slack',
      description: 'Get notifications in your Slack workspace',
      icon: '💬',
      status: 'available',
      category: 'Communication',
    },
    {
      name: 'Microsoft Teams',
      description: 'Sync with Teams for collaboration',
      icon: '👥',
      status: 'available',
      category: 'Communication',
    },
    {
      name: 'Zapier',
      description: 'Connect with 5000+ apps',
      icon: '⚡',
      status: 'available',
      category: 'Automation',
    },
    {
      name: 'Google Sheets',
      description: 'Export data to spreadsheets',
      icon: '📊',
      status: 'available',
      category: 'Data',
    },
    {
      name: 'Webhooks',
      description: 'Custom integrations via webhooks',
      icon: '🔗',
      status: 'available',
      category: 'Developer',
    },
    {
      name: 'REST API',
      description: 'Full API access for custom apps',
      icon: '🔌',
      status: 'available',
      category: 'Developer',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Integrations</h1>
        <p className="mt-2 text-muted-foreground">
          Connect LabInventory with your favorite tools
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {integrations.map((integration) => (
          <Card key={integration.name} className="p-6">
            <div className="flex items-start justify-between">
              <div className="text-4xl">{integration.icon}</div>
              <Badge variant="outline">{integration.category}</Badge>
            </div>
            <h3 className="mt-4 text-lg font-semibold">{integration.name}</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {integration.description}
            </p>
            <Button className="mt-4 w-full" variant="outline">
              <Zap className="mr-2 h-4 w-4" />
              Connect
            </Button>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold">Need a custom integration?</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Our API makes it easy to build custom integrations. Check out our documentation.
        </p>
        <Button className="mt-4" variant="outline">
          <ExternalLink className="mr-2 h-4 w-4" />
          View API Docs
        </Button>
      </Card>
    </div>
  )
}
