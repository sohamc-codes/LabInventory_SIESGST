'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  Bell, 
  Package, 
  Clock, 
  User, 
  CheckCircle, 
  X,
  Calendar,
  AlertTriangle
} from 'lucide-react'
import { formatDateTime } from '@/lib/utils'
import { useReturnNotifications, useMarkAsReturned } from '@/lib/hooks/use-return-notifications'

interface ReturnNotification {
  id: string
  type: 'RETURN_SCHEDULED' | 'RETURN_OVERDUE'
  studentName: string
  componentName: string
  quantity: number
  returnDeadline: Date
  scheduledAt: Date
  partId: string
  isUrgent?: boolean
}

interface ReturnNotificationProps {
  userRole: string
  userId: string
}

export function ReturnNotificationCenter({ userRole, userId }: ReturnNotificationProps) {
  const [showNotifications, setShowNotifications] = useState(false)
  const [selectedNotification, setSelectedNotification] = useState<ReturnNotification | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  const { data: notifications = [], isLoading, error } = useReturnNotifications()
  const markAsReturnedMutation = useMarkAsReturned()

  const handleMarkAsReturned = async (partId: string) => {
    try {
      await markAsReturnedMutation.mutateAsync(partId)
      setShowDetailModal(false)
    } catch (error) {
      console.error('Error marking as returned:', error)
    }
  }

  const getNotificationIcon = (type: string, isUrgent: boolean) => {
    if (type === 'RETURN_OVERDUE') {
      return <AlertTriangle className="h-5 w-5 text-red-500" />
    }
    return isUrgent ? 
      <Clock className="h-5 w-5 text-orange-500" /> : 
      <Package className="h-5 w-5 text-blue-500" />
  }

  const getTimeRemaining = (deadline: Date) => {
    const now = new Date()
    const diff = deadline.getTime() - now.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (diff < 0) {
      const overdue = Math.abs(hours)
      return { text: `${overdue}h overdue`, color: 'text-red-600 dark:text-red-400', isOverdue: true }
    } else if (hours < 6) {
      return { text: `${hours}h ${minutes}m left`, color: 'text-orange-600 dark:text-orange-400', isOverdue: false }
    } else {
      return { text: `${hours}h left`, color: 'text-green-600 dark:text-green-400', isOverdue: false }
    }
  }

  if (userRole !== 'LAB_ASSISTANT') {
    return null
  }

  const unreadCount = notifications.length
  const urgentCount = notifications.filter(n => n.isUrgent || n.type === 'RETURN_OVERDUE').length

  return (
    <>
      {/* Notification Bell */}
      <div className="relative">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowNotifications(!showNotifications)}
          className={`relative ${urgentCount > 0 ? 'border-red-300 bg-red-50' : ''}`}
        >
          <Bell className={`h-4 w-4 ${urgentCount > 0 ? 'text-red-600' : ''}`} />
          {unreadCount > 0 && (
            <Badge 
              className={`absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs ${
                urgentCount > 0 ? 'bg-red-500' : 'bg-blue-500'
              }`}
            >
              {unreadCount}
            </Badge>
          )}
        </Button>

        {/* Notification Dropdown */}
        {showNotifications && (
          <div className="absolute right-0 top-12 w-96 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
            <div className="p-4 border-b border-gray-200 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Return Notifications</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNotifications(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              {urgentCount > 0 && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  {urgentCount} urgent return{urgentCount > 1 ? 's' : ''} pending
                </p>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-gray-500 dark:text-zinc-400">
                  <Package className="h-8 w-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                  <p>No pending returns</p>
                </div>
              ) : (
                notifications.map((notification) => {
                  const timeInfo = getTimeRemaining(notification.returnDeadline)
                  return (
                    <div
                      key={notification.id}
                      className={`p-4 border-b border-gray-100 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                        notification.type === 'RETURN_OVERDUE' ? 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800' : ''
                      }`}
                      onClick={() => {
                        setSelectedNotification(notification)
                        setShowDetailModal(true)
                        setShowNotifications(false)
                      }}
                    >
                      <div className="flex items-start gap-3">
                        {getNotificationIcon(notification.type, notification.isUrgent || false)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                              {notification.componentName}
                            </p>
                            <Badge variant="outline" className="text-xs">
                              Qty: {notification.quantity}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-zinc-300 mb-2">
                            Student: {notification.studentName}
                          </p>
                          <div className="flex items-center justify-between">
                            <p className={`text-xs font-medium ${timeInfo.color}`}>
                              {timeInfo.text}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-zinc-400">
                              {formatDateTime(notification.scheduledAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900">
                <p className="text-xs text-gray-600 dark:text-zinc-400 text-center">
                  Click on any notification to process the return
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Detailed Notification Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="w-[95vw] max-w-2xl sm:w-full p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              Process Component Return
            </DialogTitle>
            <DialogDescription>
              Review and confirm the component return details
            </DialogDescription>
          </DialogHeader>

          {selectedNotification && (
            <div className="space-y-6 mt-4">
              {/* Alert for overdue items */}
              {selectedNotification.type === 'RETURN_OVERDUE' && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                    <p className="font-medium text-red-800 dark:text-red-300">Overdue Return</p>
                  </div>
                  <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                    This component return is overdue. Please process immediately.
                  </p>
                </div>
              )}

              {/* Component Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Component Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-zinc-400">Component</p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{selectedNotification.componentName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-zinc-400">Quantity</p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{selectedNotification.quantity}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-zinc-400">Student</p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{selectedNotification.studentName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-zinc-400">Return Deadline</p>
                      <p className={`font-semibold ${getTimeRemaining(selectedNotification.returnDeadline).color}`}>
                        {formatDateTime(selectedNotification.returnDeadline)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Return Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Return Scheduled</p>
                        <p className="text-xs text-gray-500 dark:text-zinc-400">{formatDateTime(selectedNotification.scheduledAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-zinc-400">Awaiting Physical Return</p>
                        <p className="text-xs text-gray-400 dark:text-zinc-500">Pending lab assistant confirmation</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => handleMarkAsReturned(selectedNotification.partId)}
                  disabled={markAsReturnedMutation.isPending}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {markAsReturnedMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark as Returned
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowDetailModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

// Floating notification for mobile
export function MobileReturnNotification({ notification, onDismiss, onAction }: {
  notification: ReturnNotification
  onDismiss: () => void
  onAction: () => void
}) {
  const timeInfo = getTimeRemaining(notification.returnDeadline)

  return (
    <div className="fixed top-4 right-4 left-4 md:left-auto md:w-96 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg shadow-xl z-50 animate-slide-down">
      <div className={`p-4 ${notification.type === 'RETURN_OVERDUE' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'} rounded-t-lg`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {notification.type === 'RETURN_OVERDUE' ? (
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            ) : (
              <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            )}
            <p className="font-semibold text-gray-900 dark:text-gray-100">Component Return</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onDismiss}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="p-4">
        <p className="font-medium text-gray-900 dark:text-gray-100 mb-1">{notification.componentName}</p>
        <p className="text-sm text-gray-600 dark:text-zinc-300 mb-2">Student: {notification.studentName}</p>
        <p className={`text-sm font-medium ${timeInfo.color} mb-3`}>
          {timeInfo.text}
        </p>
        
        <div className="flex gap-2">
          <Button size="sm" onClick={onAction} className="flex-1">
            Process Return
          </Button>
          <Button size="sm" variant="outline" onClick={onDismiss}>
            Later
          </Button>
        </div>
      </div>
    </div>
  )
}

function getTimeRemaining(deadline: Date) {
  const now = new Date()
  const diff = deadline.getTime() - now.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  
  if (diff < 0) {
    const overdue = Math.abs(hours)
    return { text: `${overdue}h overdue`, color: 'text-red-600 dark:text-red-400', isOverdue: true }
  } else if (hours < 6) {
    return { text: `${hours}h ${minutes}m left`, color: 'text-orange-600 dark:text-orange-400', isOverdue: false }
  } else {
    return { text: `${hours}h left`, color: 'text-green-600 dark:text-green-400', isOverdue: false }
  }
}