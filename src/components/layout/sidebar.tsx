'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { cn } from '@/lib/utils'
import { useSidebar } from '@/contexts/sidebar-context'
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  Users,
  BarChart3,
  PanelLeftClose,
  PanelLeft,
  ShieldCheck,
  PackageCheck,
  Plus,
  FolderKanban,
  Sparkles,
  ChevronRight,
  X,
} from 'lucide-react'

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { isCollapsed, toggleSidebar, isMobileOpen, setIsMobileOpen } = useSidebar()

  if (!session?.user) return null

  const currentUser = session.user

  const getNavigationItems = () => {
    const baseItems = [
      {
        title: 'Dashboard',
        href: `/dashboard/${currentUser.role?.toLowerCase().replace('_', '-')}`,
        icon: LayoutDashboard,
      },
    ]

    switch (currentUser.role) {
      case 'STUDENT':
        return [
          ...baseItems,
          { title: 'My Projects',     href: '/projects',              icon: FolderKanban },
          { title: 'Requests',         href: '/requests/my-requests',  icon: ClipboardList },
          { title: 'New Request',      href: '/requests/new',          icon: Plus },
          { title: 'Special Requests', href: '/requests/special-list', icon: Sparkles },
        ]

      case 'LAB_ASSISTANT':
        return [
          ...baseItems,
          { title: 'Pending Approvals', href: '/approvals',         icon: ShieldCheck },
          { title: 'Inventory',        href: '/inventory/manage',  icon: Package },
          { title: 'Issue Components', href: '/issue-components',  icon: PackageCheck },
          { title: 'Parts Issued',     href: '/parts-issued',      icon: PackageCheck },
          { title: 'All Requests',     href: '/requests/all',      icon: ClipboardList },
        ]

      case 'HOD':
        return [
          ...baseItems,
          { title: 'Pending Approvals', href: '/approvals',         icon: ShieldCheck },
          { title: 'Inventory',         href: '/inventory/manage',  icon: Package },
          { title: 'All Requests',      href: '/requests/all',      icon: ClipboardList },
          { title: 'User Management',   href: '/users',             icon: Users },
          { title: 'Reports',           href: '/reports',           icon: BarChart3 },
        ]

      case 'ADMIN':
        return [
          ...baseItems,
          { title: 'Inventory',        href: '/inventory/manage',  icon: Package },
          { title: 'Issue Components', href: '/issue-components',  icon: PackageCheck },
          { title: 'Parts Issued',     href: '/parts-issued',      icon: PackageCheck },
          { title: 'All Requests',     href: '/requests/all',      icon: ClipboardList },
          { title: 'User Management',  href: '/users',             icon: Users },
          { title: 'Reports',          href: '/reports',           icon: BarChart3 },
        ]

      default:
        return baseItems
    }
  }

  const navigationItems = getNavigationItems()

  const handleLinkClick = () => {
    // Close mobile sidebar when a link is clicked
    if (isMobileOpen) {
      setIsMobileOpen(false)
    }
  }

  const sidebarContent = (isMobile = false) => (
    <>
      {/* ── Logo / Brand ─────────────────────────────────── */}
      <div className="flex items-center h-14 px-3 border-b border-border shrink-0">
        {!isCollapsed || isMobile ? (
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <img
                src="/sies_logo_footer-D-Lnp3GI.png"
                alt="SIES"
                className="w-6 h-6 object-contain"
              />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate leading-tight">SIES GST</p>
              <p className="text-[10px] text-muted-foreground truncate leading-tight">IoT Lab</p>
            </div>
            {/* Close button for mobile */}
            {isMobile && (
              <button
                onClick={() => setIsMobileOpen(false)}
                className="ml-auto p-1.5 rounded-lg hover:bg-accent"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        ) : (
          <div className="mx-auto w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <img
              src="/sies_logo_footer-D-Lnp3GI.png"
              alt="SIES"
              className="w-5 h-5 object-contain"
            />
          </div>
        )}
      </div>

      {/* ── Navigation ───────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          const showCollapsed = isCollapsed && !isMobile
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleLinkClick}
              title={showCollapsed ? item.title : undefined}
              className={cn(
                'group relative flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                showCollapsed && 'justify-center px-0'
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-primary" />
              )}

              <item.icon
                className={cn(
                  'flex-shrink-0 transition-colors',
                  showCollapsed ? 'h-5 w-5' : 'h-4 w-4',
                  isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-accent-foreground'
                )}
              />

              {(!showCollapsed) && (
                <>
                  <span className="flex-1 truncate">{item.title}</span>
                  {isActive && (
                    <ChevronRight className="h-3 w-3 text-primary/60 flex-shrink-0" />
                  )}
                </>
              )}

              {showCollapsed && (
                <div className="pointer-events-none absolute left-full ml-3 z-50 whitespace-nowrap rounded-md bg-popover border border-border px-2.5 py-1.5 text-xs font-medium text-popover-foreground shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                  {item.title}
                </div>
              )}
            </Link>
          )
        })}
      </nav>

      {/* ── Collapse toggle (desktop only) ───────────────────────────────── */}
      {!isMobile && (
        <div className="shrink-0 border-t border-border p-2">
          <button
            onClick={toggleSidebar}
            className={cn(
              'flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-150',
              isCollapsed && 'justify-center px-0'
            )}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <PanelLeft className="h-4 w-4" />
            ) : (
              <>
                <PanelLeftClose className="h-4 w-4 flex-shrink-0" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      )}
    </>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden md:flex relative flex-col h-full border-r border-border bg-card transition-all duration-300 ease-in-out',
          isCollapsed ? 'w-[60px]' : 'w-[220px]',
          className
        )}
      >
        {sidebarContent(false)}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar - Always Expanded */}
      <aside
        className={cn(
          'fixed top-0 left-0 bottom-0 z-50 flex flex-col h-full border-r border-border bg-card transition-transform duration-300 ease-in-out md:hidden w-[280px]',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full',
          className
        )}
      >
        {sidebarContent(true)}
      </aside>
    </>
  )
}
