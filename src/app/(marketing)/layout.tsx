import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100">
      {/* ── Header ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full border-b border-zinc-800/60 bg-zinc-950/90 backdrop-blur-md">
        <div className="container flex h-14 items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
              <span className="text-white text-xs font-bold">L</span>
            </div>
            <span className="text-base font-semibold text-zinc-100">LabInventory</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {[
              { label: 'Features', href: '/#features' },
              { label: 'Pricing',  href: '/#pricing' },
              { label: 'About',    href: '/about' },
              { label: 'Contact',  href: '/contact' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/auth/signin">Sign In</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/auth/signin">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="border-t border-zinc-800/60 bg-zinc-950">
        <div className="container px-6 py-10">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="h-7 w-7 rounded-lg bg-blue-600 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">L</span>
                </div>
                <span className="text-base font-semibold text-zinc-100">LabInventory</span>
              </div>
              <p className="text-sm text-zinc-500 leading-relaxed">
                Modern inventory management for educational institutions.
              </p>
            </div>

            {[
              {
                title: 'Product',
                links: [
                  { label: 'Features',      href: '/#features' },
                  { label: 'Pricing',       href: '/#pricing' },
                  { label: 'Documentation', href: '/docs' },
                ],
              },
              {
                title: 'Company',
                links: [
                  { label: 'About',   href: '/about' },
                  { label: 'Contact', href: '/contact' },
                  { label: 'Careers', href: '/careers' },
                ],
              },
              {
                title: 'Legal',
                links: [
                  { label: 'Privacy Policy',    href: '/privacy' },
                  { label: 'Terms of Service',  href: '/terms' },
                  { label: 'Security',          href: '/security' },
                ],
              },
            ].map((col) => (
              <div key={col.title}>
                <h3 className="text-sm font-semibold text-zinc-300 mb-3">{col.title}</h3>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-8 border-t border-zinc-800/60 pt-6 text-center text-xs text-zinc-600">
            © {new Date().getFullYear()} LabInventory. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
