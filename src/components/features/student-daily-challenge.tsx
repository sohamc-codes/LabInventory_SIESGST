'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Zap, Trophy, Clock, Star, Gift } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Challenge {
  id: string
  title: string
  description: string
  reward: number
  progress: number
  total: number
  timeLeft: string
  difficulty: 'easy' | 'medium' | 'hard'
  completed: boolean
}

export function StudentDailyChallenge() {
  const [challenges] = useState<Challenge[]>([
    {
      id: '1',
      title: 'Early Bird',
      description: 'Complete a learning module before 10 AM',
      reward: 50,
      progress: 0,
      total: 1,
      timeLeft: '3h 24m',
      difficulty: 'easy',
      completed: false,
    },
    {
      id: '2',
      title: 'Component Explorer',
      description: 'Browse and favorite 5 new components',
      reward: 75,
      progress: 3,
      total: 5,
      timeLeft: '8h 15m',
      difficulty: 'medium',
      completed: false,
    },
    {
      id: '3',
      title: 'Perfect Timing',
      description: 'Return a component 3 days early',
      reward: 100,
      progress: 0,
      total: 1,
      timeLeft: '23h 59m',
      difficulty: 'hard',
      completed: false,
    },
  ])

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200'
      case 'hard':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-zinc-900 dark:text-gray-200'
    }
  }

  const totalRewards = challenges.reduce((sum, c) => sum + c.reward, 0)
  const earnedRewards = challenges.filter(c => c.completed).reduce((sum, c) => sum + c.reward, 0)

  return (
    <Card className="p-6 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-orange-900/20">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold flex items-center">
              <Zap className="h-5 w-5 mr-2 text-yellow-600" />
              Daily Challenges
            </h3>
            <p className="text-sm text-gray-600 dark:text-zinc-300">
              Complete challenges to earn bonus points
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <span className="text-2xl font-bold">{earnedRewards}/{totalRewards}</span>
            </div>
            <p className="text-xs text-gray-500">Points Today</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm mb-2">
          <Clock className="h-4 w-4 text-orange-600" />
          <span className="font-medium">Resets in 23h 59m</span>
        </div>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {challenges.map((challenge, index) => (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-lg border-2 transition-all ${
                challenge.completed
                  ? 'border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-900/20'
                  : 'border-purple-200 bg-white dark:border-purple-800 dark:bg-zinc-900'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{challenge.title}</h4>
                    <Badge className={getDifficultyColor(challenge.difficulty)}>
                      {challenge.difficulty}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-zinc-300 mb-2">
                    {challenge.description}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center">
                      <Gift className="h-3 w-3 mr-1" />
                      {challenge.reward} points
                    </span>
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {challenge.timeLeft}
                    </span>
                  </div>
                </div>
              </div>

              {!challenge.completed && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-zinc-300">Progress</span>
                    <span className="font-medium">{challenge.progress}/{challenge.total}</span>
                  </div>
                  <Progress value={(challenge.progress / challenge.total) * 100} className="h-2" />
                </div>
              )}

              {challenge.completed && (
                <div className="flex items-center justify-between pt-2 border-t border-green-200 dark:border-green-800">
                  <span className="text-sm text-green-600 dark:text-green-400 font-medium flex items-center">
                    <Star className="h-4 w-4 mr-1 fill-current" />
                    Completed!
                  </span>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200">
                    +{challenge.reward} pts
                  </Badge>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 flex items-center">
              <Trophy className="h-4 w-4 mr-2" />
              Streak Bonus
            </h4>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              Complete all challenges for 7 days: +500 bonus points!
            </p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">3/7</div>
            <div className="text-xs text-yellow-700">days</div>
          </div>
        </div>
      </div>
    </Card>
  )
}
