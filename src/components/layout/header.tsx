'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { SmartSearch, SmartSearchTrigger } from '@/components/features/smart-search'
import { NotificationCenter } from '@/components/features/notification-center'
import { UserProfileDropdown } from '@/components/layout/user-profile-dropdown'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { useSidebar } from '@/contexts/sidebar-context'
import { Menu } from 'lucide-react'

interface HeaderProps {
  title?: string
  subtitle?: string
  rightContent?: React.ReactNode
}

export function Header({ title, subtitle, rightContent }: HeaderProps) {
  const { data: session } = useSession()
  const [searchOpen, setSearchOpen] = useState(false)
  const { toggleMobileSidebar } = useSidebar()

  if (!session?.user) return null

  const currentUser = session.user

  const handleSelectComponent = (componentId: string) => {
    console.log('Selected component:', componentId)
  }

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between h-14 sm:h-16 px-3 sm:px-4 md:px-6 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shrink-0">
      {/* Left — hamburger menu (mobile) + page title */}
      <div className="flex items-center gap-2 sm:gap-3 md:gap-4 min-w-0 flex-1 overflow-hidden">
        {/* Hamburger Menu for Mobile */}
        <button
          onClick={toggleMobileSidebar}
          className="md:hidden p-1.5 sm:p-2 rounded-lg hover:bg-accent transition-colors shrink-0"
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>

        {title && (
          <div className="flex flex-col min-w-0 flex-1">
            <h1 className="text-sm sm:text-base md:text-lg font-semibold text-foreground tracking-tight truncate">{title}</h1>
            {subtitle && (
              <p className="hidden sm:block text-xs md:text-sm text-muted-foreground truncate">{subtitle}</p>
            )}
          </div>
        )}
      </div>

      {/* Right — actions */}
      <div className="flex items-center gap-0.5 sm:gap-1 md:gap-2 shrink-0">
        {/* Search - hide on very small screens */}
        <div className="hidden xs:block">
          <SmartSearchTrigger onClick={() => setSearchOpen(true)} />
        </div>

        <SmartSearch
          open={searchOpen}
          onOpenChange={setSearchOpen}
          onSelectComponent={handleSelectComponent}
          userId={currentUser.id}
        />

        {/* Right content - hide on mobile if present */}
        {rightContent && (
          <div className="hidden lg:block">
            {rightContent}
          </div>
        )}

        {/* Divider - hide on mobile */}
        <div className="hidden sm:block h-8 w-px bg-border mx-1" />

        {/* Theme toggle - hide on very small screens */}
        <div className="hidden sm:block">
          <ThemeToggle />
        </div>

        <NotificationCenter />

        <UserProfileDropdown />
      </div>
    </header>
  )
}
