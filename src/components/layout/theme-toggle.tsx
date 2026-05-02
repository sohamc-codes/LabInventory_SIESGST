'use client'

import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch — only render after mount
  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 w-8 sm:h-9 sm:w-9 p-0"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Sun className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
      ) : (
        <Moon className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
      )}
    </Button>
  )
}
