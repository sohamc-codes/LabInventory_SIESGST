import { WebSocketServer } from 'ws'
import { createServer } from 'http'

export interface WebSocketMessage {
  type: string
  payload: any
  timestamp: number
}

class NotificationServer {
  private wss: WebSocketServer | null = null
  private server: any = null

  start(port: number = 3001) {
    if (this.server) {
      console.log('WebSocket server already running')
      return
    }

    this.server = createServer()
    this.wss = new WebSocketServer({ server: this.server })

    this.wss.on('connection', (ws) => {
      console.log('Client connected to WebSocket')

      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString())
          console.log('Received message:', message)
          
          // Echo message back to all clients (for testing)
          this.broadcast(message)
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      })

      ws.on('close', () => {
        console.log('Client disconnected from WebSocket')
      })

      // Send welcome message
      ws.send(JSON.stringify({
        type: 'WELCOME',
        payload: { message: 'Connected to IoT Parts Management WebSocket' },
        timestamp: Date.now()
      }))
    })

    this.server.listen(port, () => {
      console.log(`WebSocket server running on port ${port}`)
    })
  }

  broadcast(message: WebSocketMessage) {
    if (!this.wss) return

    const messageWithTimestamp = {
      ...message,
      timestamp: Date.now()
    }

    this.wss.clients.forEach((client) => {
      if (client.readyState === 1) { // WebSocket.OPEN
        client.send(JSON.stringify(messageWithTimestamp))
      }
    })
  }

  // Notification methods
  sendLowStockAlert(componentName: string, currentStock: number) {
    this.broadcast({
      type: 'LOW_STOCK_ALERT',
      payload: {
        title: 'Low Stock Alert',
        message: `${componentName} is running low (${currentStock} units remaining)`,
        componentName,
        currentStock
      },
      timestamp: Date.now()
    })
  }

  sendRequestUpdate(requestId: string, status: string, approver?: string) {
    this.broadcast({
      type: 'REQUEST_UPDATE',
      payload: {
        title: 'Request Updated',
        message: `Request ${requestId} status changed to ${status}`,
        requestId,
        status,
        approver
      },
      timestamp: Date.now()
    })
  }

  sendInventoryUpdate(componentName: string, action: string) {
    this.broadcast({
      type: 'INVENTORY_UPDATE',
      payload: {
        title: 'Inventory Updated',
        message: `${componentName} ${action}`,
        componentName,
        action
      },
      timestamp: Date.now()
    })
  }

  sendOverdueAlert(componentName: string, daysOverdue: number) {
    this.broadcast({
      type: 'OVERDUE_ALERT',
      payload: {
        title: 'Overdue Return',
        message: `${componentName} return is ${daysOverdue} days overdue`,
        componentName,
        daysOverdue
      },
      timestamp: Date.now()
    })
  }

  stop() {
    if (this.wss) {
      this.wss.close()
      this.wss = null
    }
    if (this.server) {
      this.server.close()
      this.server = null
    }
    console.log('WebSocket server stopped')
  }
}

export const notificationServer = new NotificationServer()

// Auto-start in development
if (process.env.NODE_ENV === 'development') {
  notificationServer.start(3001)
}