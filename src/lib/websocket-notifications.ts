// WebSocket service for real-time notifications
// Note: This is a simplified implementation without socket.io dependency
// In production, you would use socket.io or similar WebSocket library

export interface NotificationData {
  id: string
  type: 'RETURN_SCHEDULED' | 'RETURN_OVERDUE' | 'RETURN_CONFIRMED' | 'COMPONENT_ISSUED'
  title: string
  message: string
  data: any
  targetRole?: string
  userId?: string
  createdAt: Date
}

export class WebSocketNotificationService {
  private static instance: WebSocketNotificationService
  private connectedUsers: Map<string, { socketId: string, role: string, userId: string }> = new Map()
  private notifications: NotificationData[] = []

  private constructor() {}

  static getInstance(): WebSocketNotificationService {
    if (!WebSocketNotificationService.instance) {
      WebSocketNotificationService.instance = new WebSocketNotificationService()
    }
    return WebSocketNotificationService.instance
  }

  // Initialize WebSocket server (simplified implementation)
  initialize() {
    console.log('WebSocket notification service initialized (simplified mode)')
  }

  // Send notification to all users with a specific role
  sendToRole(role: string, event: string, data: any) {
    console.log(`Sent ${event} to role: ${role}`, data)
    // In a real implementation, this would send via WebSocket
    this.notifications.push({
      id: `${Date.now()}`,
      type: data.type || 'COMPONENT_ISSUED',
      title: data.title || 'Notification',
      message: data.message || '',
      data: data.data || {},
      targetRole: role,
      createdAt: new Date()
    })
  }

  // Send notification to a specific user
  sendToUser(userId: string, event: string, data: any) {
    console.log(`Sent ${event} to user: ${userId}`, data)
    // In a real implementation, this would send via WebSocket
    this.notifications.push({
      id: `${Date.now()}`,
      type: data.type || 'COMPONENT_ISSUED',
      title: data.title || 'Notification',
      message: data.message || '',
      data: data.data || {},
      userId: userId,
      createdAt: new Date()
    })
  }

  // Send notification to all connected clients
  broadcast(event: string, data: any) {
    console.log(`Broadcasted ${event} to all clients`, data)
    // In a real implementation, this would broadcast via WebSocket
  }

  // Get connected users count by role
  getConnectedUsersByRole(role: string): number {
    let count = 0
    this.connectedUsers.forEach(user => {
      if (user.role === role) count++
    })
    return count
  }

  // Send return notification specifically
  async sendReturnNotification(notification: NotificationData) {
    if (notification.targetRole) {
      this.sendToRole(notification.targetRole, 'return_notification', notification)
    } else if (notification.userId) {
      this.sendToUser(notification.userId, 'return_notification', notification)
    }
  }

  // Send overdue notification
  async sendOverdueNotification(notification: NotificationData) {
    if (notification.targetRole) {
      this.sendToRole(notification.targetRole, 'overdue_notification', notification)
    } else if (notification.userId) {
      this.sendToUser(notification.userId, 'overdue_notification', notification)
    }
  }

  // Get notifications for a user/role (for demo purposes)
  getNotifications(userId?: string, role?: string): NotificationData[] {
    return this.notifications.filter(n => 
      (userId && n.userId === userId) || 
      (role && n.targetRole === role)
    )
  }
}

// Client-side WebSocket hook for React components (simplified)
export function useWebSocketNotifications(userId: string, role: string) {
  if (typeof window === 'undefined') return null

  const service = WebSocketNotificationService.getInstance()

  // Return simplified interface for component use
  return {
    // Schedule return (for students)
    scheduleReturn: (partId: string) => {
      console.log('Schedule return requested:', { partId, studentId: userId })
      // In real implementation, this would emit via WebSocket
    },

    // Confirm return (for lab assistants)
    confirmReturn: (partId: string, condition?: string) => {
      console.log('Confirm return requested:', { partId, labAssistantId: userId, condition })
      // In real implementation, this would emit via WebSocket
    },

    // Listen for notifications (simplified)
    onReturnNotification: (callback: (notification: NotificationData) => void) => {
      // In real implementation, this would listen to WebSocket events
      console.log('Listening for return notifications')
    },

    onOverdueNotification: (callback: (notification: NotificationData) => void) => {
      // In real implementation, this would listen to WebSocket events
      console.log('Listening for overdue notifications')
    },

    onReturnConfirmed: (callback: (data: any) => void) => {
      // In real implementation, this would listen to WebSocket events
      console.log('Listening for return confirmations')
    },

    // Get current notifications
    getNotifications: () => service.getNotifications(userId, role),

    // Cleanup
    disconnect: () => {
      console.log('WebSocket disconnected')
    }
  }
}

export default WebSocketNotificationService