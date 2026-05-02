'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Lightbulb, X, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Tip {
  id: string
  title: string
  content: string
  category: 'productivity' | 'safety' | 'best-practice' | 'feature'
}

export function StudentTips() {
  const [currentTip, setCurrentTip] = useState(0)
  const [dismissed, setDismissed] = useState(false)

  const tips: Tip[] = [
    {
      id: '1',
      title: 'Return on Time',
      content: 'Always return components before the due date to maintain a good reputation score and avoid penalties.',
      category: 'best-practice',
    },
    {
      id: '2',
      title: 'Use Smart Search',
      content: 'Press ⌘K (Ctrl+K on Windows) to quickly search for components, requests, or navigate anywhere in the app.',
      category: 'feature',
    },
    {
      id: '3',
      title: 'Safety First',
      content: 'Always check component specifications before use. Incorrect voltage or current can damage components.',
      category: 'safety',
    },
    {
      id: '4',
      title: 'Plan Ahead',
      content: 'Request components at least 2-3 days before you need them to allow time for approval and issuance.',
      category: 'productivity',
    },
    {
      id: '5',
      title: 'AI Recommendations',
      content: 'Check the AI recommendations section for component suggestions based on your project history.',
      category: 'feature',
    },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tips.length)
    }, 10000) // Change tip every 10 seconds

    return () => clearInterval(interval)
  }, [tips.length])

  if (dismissed) return null

  const tip = tips[currentTip]

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'safety':
        return 'from-red-500 to-orange-500'
      case 'productivity':
        return 'from-blue-500 to-cyan-500'
      case 'best-practice':
        return 'from-green-500 to-emerald-500'
      case 'feature':
        return 'from-purple-500 to-pink-500'
      default:
        return 'from-gray-500 to-slate-500'
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
      >
        <Card className="relative overflow-hidden">
          <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${getCategoryColor(tip.category)}`} />
          
          <div className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getCategoryColor(tip.category)} flex items-center justify-center flex-shrink-0`}>
                  <Lightbulb className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm mb-1">💡 Tip: {tip.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-zinc-300">
                    {tip.content}
                  </p>
                  <div className="flex items-center mt-3 space-x-2">
                    <div className="flex space-x-1">
                      {tips.map((_, index) => (
                        <div
                          key={index}
                          className={`w-1.5 h-1.5 rounded-full transition-all ${
                            index === currentTip
                              ? 'bg-blue-600 w-4'
                              : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setCurrentTip((prev) => (prev + 1) % tips.length)}
                      className="h-6 px-2 text-xs"
                    >
                      Next Tip
                      <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setDismissed(true)}
                className="h-6 w-6 p-0 flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}
