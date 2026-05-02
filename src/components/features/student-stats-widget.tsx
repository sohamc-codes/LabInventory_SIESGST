'use client'

import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { TrendingUp, TrendingDown, Target, Zap } from 'lucide-react'
import { motion } from 'framer-motion'

interface Stat {
  label: string
  value: number
  max: number
  trend: number
  unit?: string
}

export function StudentStatsWidget() {
  const stats: Stat[] = [
    { label: 'Weekly Activity', value: 85, max: 100, trend: 12, unit: '%' },
    { label: 'Learning Progress', value: 65, max: 100, trend: 8, unit: '%' },
    { label: 'On-Time Returns', value: 95, max: 100, trend: 5, unit: '%' },
    { label: 'Project Completion', value: 75, max: 100, trend: -3, unit: '%' },
  ]

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold flex items-center">
          <Target className="h-5 w-5 mr-2 text-blue-600" />
          Your Stats
        </h3>
        <p className="text-sm text-gray-600 dark:text-zinc-300">
          Performance metrics this week
        </p>
      </div>

      <div className="space-y-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">{stat.label}</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold">
                  {stat.value}{stat.unit}
                </span>
                <div className={`flex items-center text-xs ${stat.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.trend >= 0 ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {Math.abs(stat.trend)}%
                </div>
              </div>
            </div>
            <Progress value={stat.value} className="h-2" />
          </motion.div>
        ))}
      </div>

      <div className="mt-6 p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
        <div className="flex items-center">
          <Zap className="h-5 w-5 text-green-600 mr-2" />
          <div>
            <p className="text-sm font-semibold text-green-900 dark:text-green-100">
              Great Performance!
            </p>
            <p className="text-xs text-green-700 dark:text-green-300">
              You're in the top 15% of students
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}
