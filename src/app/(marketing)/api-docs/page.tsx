import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Code, Key, Book, Zap } from 'lucide-react'

export default function APIDocsPage() {
  const endpoints = [
    {
      method: 'GET',
      path: '/api/components',
      description: 'List all components',
      auth: true,
    },
    {
      method: 'POST',
      path: '/api/components',
      description: 'Create a new component',
      auth: true,
    },
    {
      method: 'GET',
      path: '/api/requests',
      description: 'List all requests',
      auth: true,
    },
    {
      method: 'POST',
      path: '/api/requests',
      description: 'Create a new request',
      auth: true,
    },
    {
      method: 'GET',
      path: '/api/analytics',
      description: 'Get analytics data',
      auth: true,
    },
  ]

  return (
    <div className="py-24 px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold text-foreground">API Documentation</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Build powerful integrations with our RESTful API
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-6xl gap-8 lg:grid-cols-3">
          <Card className="p-6">
            <Key className="h-8 w-8 text-blue-600" />
            <h3 className="mt-4 text-lg font-semibold">Authentication</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Use API keys to authenticate your requests
            </p>
          </Card>

          <Card className="p-6">
            <Zap className="h-8 w-8 text-blue-600" />
            <h3 className="mt-4 text-lg font-semibold">Rate Limits</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              1000 requests per hour for Pro plans
            </p>
          </Card>

          <Card className="p-6">
            <Book className="h-8 w-8 text-blue-600" />
            <h3 className="mt-4 text-lg font-semibold">SDKs</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Official SDKs for JavaScript, Python, and more
            </p>
          </Card>
        </div>

        <div className="mx-auto mt-16 max-w-4xl">
          <h2 className="text-2xl font-bold text-foreground">Endpoints</h2>
          <div className="mt-8 space-y-4">
            {endpoints.map((endpoint, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Badge
                      variant={endpoint.method === 'GET' ? 'default' : 'secondary'}
                    >
                      {endpoint.method}
                    </Badge>
                    <code className="text-sm font-mono">{endpoint.path}</code>
                  </div>
                  {endpoint.auth && (
                    <Badge variant="outline">Auth Required</Badge>
                  )}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {endpoint.description}
                </p>
              </Card>
            ))}
          </div>
        </div>

        <div className="mx-auto mt-16 max-w-4xl">
          <Card className="p-8">
            <h3 className="text-xl font-bold">Example Request</h3>
            <pre className="mt-4 overflow-x-auto rounded-lg bg-gray-900 p-4 text-sm text-gray-100">
{`curl -X GET https://api.labinventory.com/v1/components \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}
            </pre>
          </Card>
        </div>
      </div>
    </div>
  )
}
