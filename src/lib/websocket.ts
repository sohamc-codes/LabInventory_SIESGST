'use client'

import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { getWebSocketUrl } from './env'

export interface WebSocketMessage {
  type: string
  payload: any
  timestamp: number
}

export function useWebSocket(url: string) {
  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null)
  const ws = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>()
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 3 // Reduced attempts
  const hasShownConnectionError = useRef(false)

  const connect = () => {
    try {
      // Only connect if WebSocket is supported and we're in the browser
      if (typeof window === 'undefined' || !window.WebSocket) {
        console.warn('WebSocket not supported in this environment')
        return
      }

      // Don't attempt connection if we've already failed multiple times
      if (reconnectAttempts.current >= maxReconnectAttempts) {
        return
      }

      ws.current = new WebSocket(url)

      ws.current.onopen = () => {
        setIsConnected(true)
        reconnectAttempts.current = 0
        hasShownConnectionError.current = false
        console.log('WebSocket connected')
      }

      ws.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          setLastMessage(message)
          
          // Handle different message types
          switch (message.type) {
            case 'NOTIFICATION':
              toast.info(message.payload.title, {
                description: message.payload.message,
              })
              break
            case 'REQUEST_UPDATE':
              toast.success('Request Updated', {
                description: `Request ${message.payload.id} status changed to ${message.payload.status}`,
              })
              break
            case 'INVENTORY_UPDATE':
              toast.info('Inventory Updated', {
                description: `${message.payload.componentName} stock updated`,
              })
              break
            case 'LOW_STOCK_ALERT':
              toast.warning('Low Stock Alert', {
                description: `${message.payload.componentName} is running low`,
              })
              break
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }

      ws.current.onclose = (event) => {
        setIsConnected(false)
        console.log('WebSocket disconnected', event.code, event.reason)
        
        // Only attempt to reconnect if it wasn't a normal closure and we haven't exceeded attempts
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++
          const delay = Math.min(Math.pow(2, reconnectAttempts.current) * 1000, 10000) // Cap at 10s
          
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`Reconnecting... Attempt ${reconnectAttempts.current}`)
            connect()
          }, delay)
        } else if (reconnectAttempts.current >= maxReconnectAttempts && !hasShownConnectionError.current) {
          hasShownConnectionError.current = true
          console.warn('WebSocket server unavailable - real-time features disabled')
          // Don't show error toast for WebSocket unavailability in development
          if (process.env.NODE_ENV === 'production') {
            toast.error('Real-time Connection Unavailable', {
              description: 'Some features may not work in real-time.',
            })
          }
        }
      }

      ws.current.onerror = (error) => {
        console.warn('WebSocket connection failed:', error)
        // Don't show error toast immediately, as this is expected when server isn't running
      }
    } catch (error) {
      console.warn('Failed to create WebSocket connection:', error)
    }
  }

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    if (ws.current) {
      ws.current.close(1000, 'Component unmounting') // Normal closure
    }
  }

  const sendMessage = (message: Omit<WebSocketMessage, 'timestamp'>) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        ...message,
        timestamp: Date.now(),
      }))
    } else {
      console.warn('WebSocket is not connected - message not sent')
    }
  }

  useEffect(() => {
    // Only connect in browser environment
    if (typeof window !== 'undefined') {
      connect()
    }
    return disconnect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url])

  return {
    isConnected,
    lastMessage,
    sendMessage,
    disconnect,
  }
}

export function useNotifications() {
  const wsUrl = getWebSocketUrl()
  return useWebSocket(wsUrl)
}