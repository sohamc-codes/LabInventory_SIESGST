'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Bell,
  X,
  AlertTriangle,
  Info,
  CheckCircle,
  Clock,
  Loader2,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

// ── Types ─────────────────────────────────────────────────────────────────────

interface DbNotification {
  id: string
  title: string
  message: string
  type: string   // INFO | WARNING | ERROR | SUCCESS | ...
  isRead: boolean
  createdAt: string
  targetRole: string | null
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function typeIcon(type: string) {
  switch (type) {
    case 'SUCCESS': return <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
    case 'WARNING': return <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
    case 'ERROR':   return <X className="h-4 w-4 text-destructive shrink-0" />
    default:        return <Info className="h-4 w-4 text-primary shrink-0" />
  }
}

function typeBadgeVariant(type: string): 'default' | 'warning' | 'destructive' | 'success' {
  switch (type) {
    case 'SUCCESS': return 'success'
    case 'WARNING': return 'warning'
    case 'ERROR':   return 'destructive'
    default:        return 'default'
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

export function NotificationCenter() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<DbNotification[]>([])
  const [loading, setLoading] = useState(false)
  const [markingAll, setMarkingAll] = useState(false)

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const fetchNotifications = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/notifications?limit=10')
      if (!res.ok) return
      const data = await res.json()
      setNotifications(data.notifications ?? [])
    } catch {
      // silently fail — notifications are non-critical
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch on open and poll every 60 s while open
  useEffect(() => {
    if (!open) return
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 60_000)
    return () => clearInterval(interval)
  }, [open, fetchNotifications])

  const markAsRead = async (id: string) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    )
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [id] }),
      })
    } catch { /* ignore */ }
  }

  const markAllAsRead = async () => {
    setMarkingAll(true)
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true }),
      })
    } catch { /* ignore */ } finally {
      setMarkingAll(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="relative h-8 w-8 sm:h-9 sm:w-9 p-0" aria-label="Notifications">
          <Bell className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 h-4 w-4 flex items-center justify-center p-0 text-[9px] sm:text-[10px]"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="w-[95vw] max-w-lg sm:w-full z-[100] p-4 sm:p-6">
        <DialogHeader className="pb-3 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2.5 text-lg font-semibold">
              <div className="p-2 rounded-lg bg-primary/10">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    {unreadCount} unread
                  </span>
                )}
              </div>
            </DialogTitle>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                disabled={markingAll}
                className="text-xs h-8 px-3 hover:bg-primary/10 hover:text-primary"
              >
                {markingAll ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
                    Marking...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1.5" />
                    Mark all read
                  </>
                )}
              </Button>
            )}
          </div>
        </DialogHeader>

        <ScrollArea className="h-[480px] -mx-1 px-1 mt-4">
          {loading && notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="relative">
                <div className="absolute inset-0 animate-ping">
                  <Bell className="h-8 w-8 text-primary/20" />
                </div>
                <Bell className="h-8 w-8 text-primary relative" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">Loading notifications</p>
                <p className="text-xs text-muted-foreground mt-1">Please wait...</p>
              </div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="p-4 rounded-full bg-muted/50">
                <Bell className="h-10 w-10 text-muted-foreground/50" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">All caught up!</p>
                <p className="text-xs text-muted-foreground mt-1">No notifications at the moment</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => markAsRead(n.id)}
                  className={cn(
                    'w-full text-left rounded-xl border p-4 transition-all duration-200',
                    'hover:shadow-md hover:scale-[1.01] active:scale-[0.99]',
                    n.isRead
                      ? 'border-border bg-card hover:bg-accent/30'
                      : 'border-primary/30 bg-primary/5 hover:bg-primary/10 shadow-sm'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      'p-2 rounded-lg shrink-0',
                      n.type === 'SUCCESS' && 'bg-emerald-500/10',
                      n.type === 'WARNING' && 'bg-amber-500/10',
                      n.type === 'ERROR' && 'bg-destructive/10',
                      n.type === 'INFO' && 'bg-primary/10'
                    )}>
                      {typeIcon(n.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn(
                          'text-sm font-semibold truncate',
                          n.isRead ? 'text-foreground/80' : 'text-foreground'
                        )}>
                          {n.title}
                        </span>
                        {!n.isRead && (
                          <span className="w-2 h-2 rounded-full bg-primary shrink-0 animate-pulse" />
                        )}
                      </div>
                      <p className={cn(
                        'text-sm leading-relaxed mb-2',
                        n.isRead ? 'text-muted-foreground' : 'text-foreground/70'
                      )}>
                        {n.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</span>
                        </div>
                        <Badge
                          variant={typeBadgeVariant(n.type)}
                          className="text-[10px] px-2 py-0.5 font-medium"
                        >
                          {n.type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
