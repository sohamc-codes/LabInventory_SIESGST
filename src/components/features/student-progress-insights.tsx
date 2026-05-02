'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, Target, Zap, Award, Clock } from 'lucide-react'
import { motion } from 'framer-motion'

interface Insight {
  id: string
  type: 'achievement' | 'improvement' | 'warning' | 'tip'
  title: string
  description: string
  action?: string
  icon: any
  color: string
}

export function StudentProgressInsights() {
  const insights: Insight[] = [
    {
      id: '1',
      type: 'achievement',
      title: 'Excellent Progress!',
      description: 'You completed 3 modules this week - 50% above average',
      icon: Award,
      color: 'text-green-600',
    },
    {
      id: '2',
      type: 'improvement',
      title: 'Learning Streak',
      description: 'Keep it up! 5 days in a row of active learning',
      action: 'Continue streak',
      icon: Zap,
      color: 'text-yellow-600',
    },
    {
      id: '3',
      type: 'warning',
      title: 'Return Reminder',
      description: 'You have 2 components due in the next 3 days',
      action: 'View items',
      icon: Clock,
      color: 'text-orange-600',
    },
    {
      id: '4',
      type: 'tip',
      title: 'Skill Recommendation',
      description: 'Based on your projects, consider learning MQTT protocol',
      action: 'Start learning',
      icon: Target,
      color: 'text-blue-600',
    },
  ]

  const getInsightBg = (type: string) => {
    switch (type) {
      case 'achievement':
        return 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800'
      case 'improvement':
        return 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800'
      case 'warning':
        return 'bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-800'
      case 'tip':
        return 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800'
      default:
        return 'bg-gray-50 dark:bg-zinc-900 border-gray-200 dark:border-zinc-800'
    }
  }

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-purple-600" />
          Progress Insights
        </h3>
        <p className="text-sm text-gray-600 dark:text-zinc-300">
          AI-powered analysis of your learning journey
        </p>
      </div>

      <div className="space-y-3">
        {insights.map((insight, index) => {
          const Icon = insight.icon
          return (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-lg border ${getInsightBg(insight.type)}`}
            >
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Icon className={`h-5 w-5 ${insight.color}`} />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm mb-1">{insight.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-zinc-300">
                    {insight.description}
                  </p>
                  {insight.action && (
                    <button className="text-sm font-medium text-blue-600 hover:text-blue-700 mt-2">
                      {insight.action} →
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-purple-900 dark:text-purple-100">
              Weekly Summary
            </h4>
            <p className="text-sm text-purple-700 dark:text-purple-300">
              You're performing 35% better than last week!
            </p>
          </div>
          <TrendingUp className="h-8 w-8 text-purple-600" />
        </div>
      </div>
    </Card>
  )
}
