'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface SidebarContextType {
  isCollapsed: boolean
  setIsCollapsed: (collapsed: boolean) => void
  toggleSidebar: () => void
  isMobileOpen: boolean
  setIsMobileOpen: (open: boolean) => void
  toggleMobileSidebar: () => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsedState] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  // Load sidebar state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('sidebar-collapsed')
    if (savedState !== null) {
      setIsCollapsedState(JSON.parse(savedState))
    }
  }, [])

  // Save sidebar state to localStorage whenever it changes
  const setIsCollapsed = (collapsed: boolean) => {
    setIsCollapsedState(collapsed)
    localStorage.setItem('sidebar-collapsed', JSON.stringify(collapsed))
  }

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen)
  }

  return (
    <SidebarContext.Provider value={{ 
      isCollapsed, 
      setIsCollapsed, 
      toggleSidebar,
      isMobileOpen,
      setIsMobileOpen,
      toggleMobileSidebar
    }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }
  return context
}