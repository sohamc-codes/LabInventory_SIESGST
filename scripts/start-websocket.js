#!/usr/bin/env node

const { WebSocketServer } = require('ws')
const http = require('http')

console.log('Starting WebSocket server for IoT Parts Management...')

const server = http.createServer()
const wss = new WebSocketServer({ server })

// Store connected clients
const clients = new Set()

wss.on('connection', (ws) => {
  console.log('Client connected to WebSocket')
  clients.add(ws)

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString())
      console.log('Received message:', message)
      
      // Broadcast to all clients
      broadcast(message)
    } catch (error) {
      console.error('Error parsing WebSocket message:', error)
    }
  })

  ws.on('close', () => {
    console.log('Client disconnected from WebSocket')
    clients.delete(ws)
  })

  // Send welcome message
  ws.send(JSON.stringify({
    type: 'WELCOME',
    payload: { message: 'Connected to IoT Parts Management WebSocket' },
    timestamp: Date.now()
  }))
})

function broadcast(message) {
  const messageWithTimestamp = {
    ...message,
    timestamp: Date.now()
  }

  clients.forEach((client) => {
    if (client.readyState === 1) { // WebSocket.OPEN
      client.send(JSON.stringify(messageWithTimestamp))
    }
  })
}

// Notification helper functions
function sendLowStockAlert(componentName, currentStock) {
  broadcast({
    type: 'LOW_STOCK_ALERT',
    payload: {
      title: 'Low Stock Alert',
      message: `${componentName} is running low (${currentStock} units remaining)`,
      componentName,
      currentStock
    }
  })
}

function sendRequestUpdate(requestId, status, approver) {
  broadcast({
    type: 'REQUEST_UPDATE',
    payload: {
      title: 'Request Updated',
      message: `Request ${requestId} status changed to ${status}`,
      requestId,
      status,
      approver
    }
  })
}

// Demo notifications (for testing)
setInterval(() => {
  const demoNotifications = [
    () => sendLowStockAlert('Arduino Uno R3', Math.floor(Math.random() * 10) + 1),
    () => sendRequestUpdate(`REQ${Math.floor(Math.random() * 1000)}`, 'APPROVED', 'Dr. Smith'),
    () => broadcast({
      type: 'INVENTORY_UPDATE',
      payload: {
        title: 'Inventory Updated',
        message: 'New components added to inventory',
        componentName: 'ESP32 DevKit V1',
        action: 'added'
      }
    })
  ]
  
  // Send a random demo notification every 30 seconds
  const randomNotification = demoNotifications[Math.floor(Math.random() * demoNotifications.length)]
  randomNotification()
}, 30000)

const PORT = process.env.WS_PORT || 3001

server.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`)
  console.log('Demo notifications will be sent every 30 seconds')
})

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down WebSocket server...')
  wss.close(() => {
    server.close(() => {
      console.log('WebSocket server stopped')
      process.exit(0)
    })
  })
})