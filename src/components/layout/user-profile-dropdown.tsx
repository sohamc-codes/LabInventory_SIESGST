'use client'

import { useSession, signOut } from 'next-auth/react'
import { User, LogOut, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useRouter } from 'next/navigation'

export function UserProfileDropdown() {
  const { data: session } = useSession()
  const router = useRouter()

  const currentUser = session?.user || {
    name: 'Guest User',
    email: 'guest@example.com',
    id: 'guest-user-id',
    image: null
  }

  const handleSignOut = async () => {
    try {
      localStorage.clear()
      sessionStorage.clear()
      if (session) {
        await signOut({ callbackUrl: '/auth/signin', redirect: false })
      }
      router.push('/auth/signin')
    } catch (error) {
      console.error('Error during sign out:', error)
      router.push('/auth/signin')
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-1 sm:gap-2 md:gap-3 px-1.5 sm:px-2 md:px-3 py-1.5 sm:py-2 h-auto hover:bg-white/10"
        >
          {/* Avatar — always visible on dark navbar */}
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white/15 rounded-full flex items-center justify-center shrink-0">
            {currentUser.image ? (
              <img
                src={currentUser.image}
                alt={currentUser.name || 'User'}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full"
              />
            ) : (
              <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
            )}
          </div>

          {/* Name + email — force white so they're readable on the dark navbar */}
          <div className="hidden md:block text-left">
            <p className="text-sm font-medium text-white">
              {currentUser.name}
            </p>
            <p className="text-xs text-white/70">
              {currentUser.email}
            </p>
          </div>

          <ChevronDown className="hidden sm:block h-3.5 w-3.5 sm:h-4 sm:w-4 text-white/70" />
        </Button>
      </DropdownMenuTrigger>

      {/* Dropdown inherits shadcn theme tokens — fine as-is */}
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{currentUser.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {currentUser.email}
            </p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleSignOut}
          className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}