// Environment configuration utilities
export const isServer = typeof window === 'undefined'
export const isClient = typeof window !== 'undefined'

export const getBaseUrl = () => {
  if (isServer) {
    return process.env.NEXTAUTH_URL || 'http://localhost:3000'
  }
  return window.location.origin
}

export const getWebSocketUrl = () => {
  if (process.env.NODE_ENV === 'development') {
    return 'ws://localhost:3001'
  }
  
  if (isServer) {
    return 'ws://localhost:3001' // Fallback for server-side
  }
  
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${protocol}//${window.location.host}/ws`
}