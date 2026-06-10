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
      // Clear all local storage and session storage
      localStorage.clear()
      sessionStorage.clear()
      
      if (session) {
        // If using NextAuth session, sign out properly
        await signOut({ 
          callbackUrl: '/auth/signin',
          redirect: false 
        })
      }
      
      // Force redirect to login page
      router.push('/auth/signin')
      
      // Optional: Show a message
      // You could add a toast notification here if you have a toast system
    } catch (error) {
      console.error('Error during sign out:', error)
      // Force redirect even if there's an error
      router.push('/auth/signin')
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="flex items-center gap-1 sm:gap-2 md:gap-3 px-1.5 sm:px-2 md:px-3 py-1.5 sm:py-2 h-auto hover:bg-accent"
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center shrink-0">
            {currentUser.image ? (
              <img
                src={currentUser.image}
                alt={currentUser.name || 'User'}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full"
              />
            ) : (
              <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400" />
            )}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-sm font-medium text-foreground">
              {currentUser.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {currentUser.email}
            </p>
          </div>
          <ChevronDown className="hidden sm:block h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      
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