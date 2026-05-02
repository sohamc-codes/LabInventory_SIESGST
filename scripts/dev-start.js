#!/usr/bin/env node

const { spawn } = require('child_process')
const path = require('path')

console.log('🚀 Starting IoT Parts Management System in Development Mode...')
console.log('📦 This will start both the Next.js app and WebSocket server')

// Start Next.js development server
const nextProcess = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true,
  cwd: process.cwd()
})

// Start WebSocket server
const wsProcess = spawn('node', ['scripts/start-websocket.js'], {
  stdio: 'inherit',
  shell: true,
  cwd: process.cwd()
})

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down development servers...')
  
  nextProcess.kill('SIGINT')
  wsProcess.kill('SIGINT')
  
  setTimeout(() => {
    process.exit(0)
  }, 1000)
})

process.on('SIGTERM', () => {
  nextProcess.kill('SIGTERM')
  wsProcess.kill('SIGTERM')
  process.exit(0)
})

nextProcess.on('exit', (code) => {
  if (code !== 0) {
    console.error(`Next.js process exited with code ${code}`)
  }
})

wsProcess.on('exit', (code) => {
  if (code !== 0) {
    console.error(`WebSocket process exited with code ${code}`)
  }
})

console.log('✅ Development servers started!')
console.log('🌐 Next.js app: http://localhost:3000')
console.log('🔌 WebSocket server: ws://localhost:3001')
console.log('📱 Press Ctrl+C to stop both servers')