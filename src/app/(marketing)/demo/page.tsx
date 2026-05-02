import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Play, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function DemoPage() {
  return (
    <div className="py-24 px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            See LabInventory in Action
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Watch how LabInventory transforms lab management with intelligent automation
          </p>
        </div>

        {/* Video Demo */}
        <div className="mx-auto mt-16 max-w-4xl">
          <Card className="overflow-hidden">
            <div className="relative aspect-video bg-gradient-to-br from-blue-600 to-purple-600">
              <div className="absolute inset-0 flex items-center justify-center">
                <Button size="lg" className="h-20 w-20 rounded-full">
                  <Play className="h-8 w-8" />
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Features Showcase */}
        <div className="mx-auto mt-16 max-w-5xl">
          <h2 className="text-2xl font-bold text-foreground">
            What You'll See
          </h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <FeatureItem
              title="Quick Setup"
              description="Create your organization and start managing inventory in under 5 minutes"
            />
            <FeatureItem
              title="Smart Search"
              description="Find components instantly with AI-powered search and recommendations"
            />
            <FeatureItem
              title="Automated Workflows"
              description="Request, approve, and issue components with automated notifications"
            />
            <FeatureItem
              title="Real-time Analytics"
              description="Track usage, predict demand, and optimize your inventory"
            />
            <FeatureItem
              title="QR Code Scanning"
              description="Scan components with your phone for instant tracking"
            />
            <FeatureItem
              title="Team Collaboration"
              description="Invite team members and manage permissions effortlessly"
            />
          </div>
        </div>

        {/* CTA */}
        <div className="mx-auto mt-16 max-w-2xl text-center">
          <h2 className="text-2xl font-bold text-foreground">
            Ready to try it yourself?
          </h2>
          <p className="mt-4 text-muted-foreground">
            Start your free 14-day trial. No credit card required.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/auth/signup">Start Free Trial</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/contact">Schedule Demo</Link>
            </Button>
          </div>
        </div>

        {/* Interactive Demo */}
        <div className="mx-auto mt-16 max-w-5xl">
          <Card className="p-8">
            <h3 className="text-xl font-bold text-foreground">
              Try Interactive Demo
            </h3>
            <p className="mt-2 text-muted-foreground">
              Explore the platform with sample data. No signup required.
            </p>
            <Button className="mt-4" asChild>
              <Link href="/demo/interactive">Launch Interactive Demo</Link>
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}

function FeatureItem({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex items-start space-x-3">
      <CheckCircle className="mt-1 h-5 w-5 flex-shrink-0 text-green-500" />
      <div>
        <h3 className="font-semibold text-foreground">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}
