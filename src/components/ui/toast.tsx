/**
 * Toast notification system
 * Better user feedback for actions
 */

'use client'

import * as React from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface Toast {
  id: string
  title?: string
  description?: string
  action?: React.ReactNode
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

interface ToastContextValue {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

const ToastContext = React.createContext<ToastContextValue | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const addToast = React.useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(7)
    const newToast: Toast = { ...toast, id }
    
    setToasts((prev) => [...prev, newToast])

    // Auto remove after duration
    const duration = toast.duration || 5000
    setTimeout(() => {
      removeToast(id)
    }, duration)
  }, [removeToast])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

function ToastContainer({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: string) => void }) {
  return (
    <div className="fixed top-0 right-0 z-50 p-4 space-y-2 max-w-md w-full pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const variantStyles = {
    default: 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800',
    success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-900 dark:text-green-100',
    error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-900 dark:text-red-100',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-900 dark:text-yellow-100',
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100',
  }

  return (
    <div
      className={cn(
        'pointer-events-auto rounded-lg border p-4 shadow-lg transition-all animate-in slide-in-from-top-5',
        variantStyles[toast.variant || 'default']
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1">
          {toast.title && (
            <div className="font-semibold text-sm mb-1">{toast.title}</div>
          )}
          {toast.description && (
            <div className="text-sm opacity-90">{toast.description}</div>
          )}
          {toast.action && <div className="mt-2">{toast.action}</div>}
        </div>
        <button
          onClick={onClose}
          className="rounded-md p-1 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

// Export the toast context for use in components
