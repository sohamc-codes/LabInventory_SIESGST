'use client'

import { SessionProvider } from 'next-auth/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'sonner'
import { ThemeProvider } from '@/components/theme-provider'
import { SidebarProvider } from '@/contexts/sidebar-context'
import { useState, createContext, useContext, ReactNode } from 'react'
import { useNotifications } from '@/lib/websocket'

// WebSocket Context
const WebSocketContext = createContext<ReturnType<typeof useNotifications> | null>(null)

export function useWebSocketContext() {
  const context = useContext(WebSocketContext)
  if (!context) {
    throw new Error('useWebSocketContext must be used within WebSocketProvider')
  }
  return context
}

function WebSocketProvider({ children }: { children: ReactNode }) {
  const websocket = useNotifications()
  
  return (
    <WebSocketContext.Provider value={websocket}>
      {children}
    </WebSocketContext.Provider>
  )
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
            retry: (failureCount, error: any) => {
              // Don't retry on 4xx errors
              if (error?.status >= 400 && error?.status < 500) {
                return false
              }
              return failureCount < 3
            },
          },
          mutations: {
            retry: false,
          },
        },
      })
  )

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      storageKey="iot-parts-theme"
    >
      <SessionProvider>
        <QueryClientProvider client={queryClient}>
          <SidebarProvider>
            <WebSocketProvider>
              {children}
              <Toaster
                position="top-right"
                expand={true}
                richColors
                closeButton
                toastOptions={{
                  duration: 4000,
                }}
              />
              <ReactQueryDevtools initialIsOpen={false} />
            </WebSocketProvider>
          </SidebarProvider>
        </QueryClientProvider>
      </SessionProvider>
    </ThemeProvider>
  )
}