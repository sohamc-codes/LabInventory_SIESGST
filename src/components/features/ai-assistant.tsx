'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Bot, Send, Sparkles, X, Minimize2, Maximize2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Message {
  role: 'user' | 'assistant'
  content: string
  suggestions?: string[]
}

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm your LabInventory AI assistant. I can help you find components, check inventory, or answer questions. What can I help you with?",
      suggestions: ['Find a component', 'Check low stock', 'Create a request'],
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async (text: string) => {
    if (!text.trim()) return

    const userMessage: Message = { role: 'user', content: text }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          context: messages.map(m => ({ role: m.role, content: m.content })),
        }),
      })

      const data = await response.json()
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        suggestions: data.suggestions,
      }
      
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Failed to send message:', error)
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: "Sorry, I'm having trouble connecting. Please try again.",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              size="lg"
              onClick={() => setIsOpen(true)}
              className="h-14 w-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg hover:shadow-xl"
            >
              <Sparkles className="h-6 w-6" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Card className={`flex flex-col shadow-2xl ${isMinimized ? 'h-16 w-80' : 'h-[600px] w-96'}`}>
              {/* Header */}
              <div className="flex items-center justify-between border-b bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white">
                <div className="flex items-center space-x-2">
                  <Bot className="h-5 w-5" />
                  <span className="font-semibold">AI Assistant</span>
                  <div className="flex h-2 w-2 animate-pulse rounded-full bg-green-400" />
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="h-8 w-8 p-0 text-white hover:bg-white/20"
                  >
                    {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsOpen(false)}
                    className="h-8 w-8 p-0 text-white hover:bg-white/20"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {!isMinimized && (
                <>
                  {/* Messages */}
                  <div className="flex-1 space-y-4 overflow-y-auto p-4">
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
                            message.role === 'user'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-900 dark:bg-zinc-900 dark:text-zinc-100'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          {message.suggestions && message.suggestions.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {message.suggestions.map((suggestion, i) => (
                                <button
                                  key={i}
                                  onClick={() => sendMessage(suggestion)}
                                  className="rounded-full bg-white/20 px-3 py-1 text-xs hover:bg-white/30"
                                >
                                  {suggestion}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {loading && (
                      <div className="flex justify-start">
                        <div className="rounded-lg bg-gray-100 p-3 dark:bg-zinc-900">
                          <div className="flex space-x-2">
                            <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" />
                            <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '0.1s' }} />
                            <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '0.2s' }} />
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <div className="border-t p-4">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault()
                        sendMessage(input)
                      }}
                      className="flex space-x-2"
                    >
                      <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask me anything..."
                        disabled={loading}
                        className="flex-1"
                      />
                      <Button type="submit" size="sm" disabled={loading || !input.trim()}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                </>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
