import Link from 'next/link'
import { ArrowRight, Package, ClipboardList, BarChart3, Shield, Zap, QrCode } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-6 py-28 sm:py-36 lg:px-8">
        {/* Subtle grid background */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:48px_48px]" />
        {/* Glow */}
        <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 w-[600px] h-[300px] bg-blue-600/10 blur-[100px] rounded-full" />

        <div className="relative mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/20 bg-blue-500/10 text-blue-400 text-xs font-medium mb-6">
              <Zap className="h-3 w-3" />
              SIES GST IoT Lab Management
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-zinc-100 sm:text-5xl lg:text-6xl">
              IoT Inventory<br />
              <span className="text-blue-400">Management System</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-zinc-400 max-w-xl mx-auto">
              Streamline component tracking with real-time notifications, automated workflows,
              and comprehensive analytics — built for educational institutions.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/auth/signin">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/auth/signin">View Demo</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section className="py-20 px-6 lg:px-8 border-t border-zinc-800/60">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center mb-14">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-100 sm:text-3xl">
              Complete Inventory Management
            </h2>
            <p className="mt-3 text-zinc-500">
              Everything you need to manage your lab components efficiently
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Package,
                color: 'text-blue-400',
                bg: 'bg-blue-500/10',
                title: 'Component Tracking',
                description: 'Track all components with detailed information, availability status, and QR codes.',
              },
              {
                icon: ClipboardList,
                color: 'text-emerald-400',
                bg: 'bg-emerald-500/10',
                title: 'Request Management',
                description: 'Streamlined multi-step approval workflow for component requests.',
              },
              {
                icon: BarChart3,
                color: 'text-purple-400',
                bg: 'bg-purple-500/10',
                title: 'Analytics Dashboard',
                description: 'Comprehensive insights into usage patterns and inventory levels.',
              },
              {
                icon: Shield,
                color: 'text-amber-400',
                bg: 'bg-amber-500/10',
                title: 'Role-based Access',
                description: 'Secure access control for students, lab assistants, and administrators.',
              },
              {
                icon: QrCode,
                color: 'text-sky-400',
                bg: 'bg-sky-500/10',
                title: 'QR Code Scanning',
                description: 'Instant component lookup and issue tracking via QR codes.',
              },
              {
                icon: Zap,
                color: 'text-rose-400',
                bg: 'bg-rose-500/10',
                title: 'Real-time Notifications',
                description: 'Instant alerts for approvals, returns, and inventory updates.',
              },
            ].map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="py-16 px-6 lg:px-8 border-t border-zinc-800/60">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-100 sm:text-3xl">
            Ready to get started?
          </h2>
          <p className="mt-3 text-zinc-500">
            Sign in to access the inventory management system
          </p>
          <div className="mt-8">
            <Button size="lg" asChild>
              <Link href="/auth/signin">
                Sign In <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

function FeatureCard({
  icon: Icon,
  color,
  bg,
  title,
  description,
}: {
  icon: React.ElementType
  color: string
  bg: string
  title: string
  description: string
}) {
  return (
    <Card className="p-5 hover:border-zinc-700/60 transition-colors">
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${bg} mb-4`}>
        <Icon className={`h-5 w-5 ${color}`} />
      </div>
      <h3 className="text-sm font-semibold text-zinc-200 mb-1.5">{title}</h3>
      <p className="text-sm text-zinc-500 leading-relaxed">{description}</p>
    </Card>
  )
}
