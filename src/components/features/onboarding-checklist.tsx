'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, Circle, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ChecklistItem {
  id: string
  title: string
  description: string
  completed: boolean
  action?: string
  href?: string
}

export function OnboardingChecklist() {
  const [isOpen, setIsOpen] = useState(true)
  const [items, setItems] = useState<ChecklistItem[]>([
    {
      id: '1',
      title: 'Complete your profile',
      description: 'Add your name and organization details',
      completed: false,
      action: 'Complete',
      href: '/settings/profile',
    },
    {
      id: '2',
      title: 'Invite team members',
      description: 'Collaborate with your team',
      completed: false,
      action: 'Invite',
      href: '/settings/organization',
    },
    {
      id: '3',
      title: 'Add your first component',
      description: 'Start building your inventory',
      completed: false,
      action: 'Add Component',
      href: '/inventory/manage',
    },
    {
      id: '4',
      title: 'Create a request',
      description: 'Test the request workflow',
      completed: false,
      action: 'Create Request',
      href: '/requests/new',
    },
    {
      id: '5',
      title: 'Explore integrations',
      description: 'Connect with your favorite tools',
      completed: false,
      action: 'View Integrations',
      href: '/integrations',
    },
  ])

  const completedCount = items.filter(item => item.completed).length
  const progress = (completedCount / items.length) * 100

  const toggleItem = (id: string) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    ))
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
      >
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Getting Started</h3>
              <p className="text-sm text-gray-600 dark:text-zinc-300">
                {completedCount} of {items.length} completed
              </p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <Progress value={progress} className="mt-4" />

          <div className="mt-6 space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-start space-x-3 rounded-lg border p-3 hover:bg-gray-50 dark:hover:bg-zinc-800"
              >
                <button
                  onClick={() => toggleItem(item.id)}
                  className="mt-0.5"
                >
                  {item.completed ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400" />
                  )}
                </button>
                <div className="flex-1">
                  <h4 className={`font-medium ${item.completed ? 'line-through text-gray-500' : ''}`}>
                    {item.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-zinc-300">
                    {item.description}
                  </p>
                </div>
                {!item.completed && item.action && (
                  <Button size="sm" variant="outline" asChild>
                    <a href={item.href}>{item.action}</a>
                  </Button>
                )}
              </div>
            ))}
          </div>

          {completedCount === items.length && (
            <div className="mt-4 rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
              <p className="text-sm font-medium text-green-900 dark:text-green-100">
                🎉 Congratulations! You've completed the onboarding checklist.
              </p>
            </div>
          )}
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}
