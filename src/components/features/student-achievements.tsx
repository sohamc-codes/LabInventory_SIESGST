'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Award, Trophy, Star, Zap, Target, TrendingUp, Medal } from 'lucide-react'
import { motion } from 'framer-motion'

interface Achievement {
  id: string
  title: string
  description: string
  icon: any
  earned: boolean
  progress?: number
  maxProgress?: number
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  earnedDate?: Date
}

export function StudentAchievements() {
  const achievements: Achievement[] = [
    {
      id: '1',
      title: 'First Request',
      description: 'Made your first component request',
      icon: Star,
      earned: true,
      rarity: 'common',
      earnedDate: new Date('2026-01-15'),
    },
    {
      id: '2',
      title: 'Perfect Return',
      description: 'Returned 10 components on time',
      icon: Trophy,
      earned: true,
      progress: 10,
      maxProgress: 10,
      rarity: 'rare',
      earnedDate: new Date('2026-01-20'),
    },
    {
      id: '3',
      title: 'Speed Demon',
      description: 'Complete a project in under 3 days',
      icon: Zap,
      earned: false,
      progress: 2,
      maxProgress: 3,
      rarity: 'epic',
    },
    {
      id: '4',
      title: 'Master Builder',
      description: 'Complete 5 advanced projects',
      icon: Target,
      earned: false,
      progress: 1,
      maxProgress: 5,
      rarity: 'legendary',
    },
    {
      id: '5',
      title: 'Team Player',
      description: 'Help 3 classmates with their projects',
      icon: TrendingUp,
      earned: false,
      progress: 0,
      maxProgress: 3,
      rarity: 'rare',
    },
    {
      id: '6',
      title: 'Early Bird',
      description: 'Return components 3 days early',
      icon: Medal,
      earned: true,
      rarity: 'common',
      earnedDate: new Date('2026-01-18'),
    },
  ]

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return 'from-yellow-400 to-orange-500'
      case 'epic':
        return 'from-purple-400 to-pink-500'
      case 'rare':
        return 'from-blue-400 to-cyan-500'
      default:
        return 'from-gray-400 to-gray-500'
    }
  }

  const getRarityBadge = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return 'bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-800 dark:from-yellow-900/20 dark:to-orange-900/20 dark:text-orange-200'
      case 'epic':
        return 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 dark:from-purple-900/20 dark:to-pink-900/20 dark:text-purple-200'
      case 'rare':
        return 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 dark:from-blue-900/20 dark:to-cyan-900/20 dark:text-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-zinc-900 dark:text-gray-200'
    }
  }

  const earnedCount = achievements.filter(a => a.earned).length
  const totalPoints = earnedCount * 100

  return (
    <Card className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold flex items-center">
              <Award className="h-5 w-5 mr-2 text-yellow-600" />
              Achievements
            </h3>
            <p className="text-sm text-gray-600 dark:text-zinc-300">
              Unlock badges by completing challenges
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <span className="text-2xl font-bold">{totalPoints}</span>
            </div>
            <p className="text-xs text-gray-500">Total Points</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-600 dark:text-zinc-300">Progress:</span>
          <span className="font-medium">{earnedCount}/{achievements.length} unlocked</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {achievements.map((achievement, index) => {
          const Icon = achievement.icon
          return (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className={`relative p-4 rounded-lg border-2 transition-all ${
                achievement.earned
                  ? 'border-yellow-300 dark:border-yellow-700 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10 hover:shadow-lg'
                  : 'border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/50 opacity-60'
              }`}
            >
              {achievement.earned && (
                <div className="absolute -top-2 -right-2">
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                    <Star className="h-3 w-3 text-white fill-white" />
                  </div>
                </div>
              )}

              <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getRarityColor(achievement.rarity)} flex items-center justify-center mb-3 mx-auto`}>
                <Icon className="h-6 w-6 text-white" />
              </div>

              <h4 className="font-semibold text-center text-sm mb-1">
                {achievement.title}
              </h4>
              <p className="text-xs text-gray-600 dark:text-zinc-300 text-center mb-2">
                {achievement.description}
              </p>

              <div className="flex justify-center">
                <Badge className={`${getRarityBadge(achievement.rarity)} text-xs`}>
                  {achievement.rarity}
                </Badge>
              </div>

              {!achievement.earned && achievement.progress !== undefined && achievement.maxProgress && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-zinc-800">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-500">Progress</span>
                    <span className="font-medium">{achievement.progress}/{achievement.maxProgress}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-zinc-800 rounded-full h-1.5">
                    <div
                      className="bg-blue-600 h-1.5 rounded-full transition-all"
                      style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {achievement.earned && achievement.earnedDate && (
                <div className="mt-3 pt-3 border-t border-yellow-200 dark:border-yellow-800">
                  <p className="text-xs text-center text-gray-500">
                    Earned {achievement.earnedDate.toLocaleDateString()}
                  </p>
                </div>
              )}
            </motion.div>
          )
        })}
      </div>

      <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 flex items-center">
              <Trophy className="h-4 w-4 mr-2" />
              Next Milestone
            </h4>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              Complete 2 more projects to unlock "Project Master" badge
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}
