'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Trophy, Medal, Award, TrendingUp, Crown, Star } from 'lucide-react'
import { motion } from 'framer-motion'

interface LeaderboardEntry {
  rank: number
  name: string
  points: number
  badges: number
  projects: number
  streak: number
  avatar?: string
  isCurrentUser?: boolean
}

export function StudentLeaderboard() {
  const leaderboard: LeaderboardEntry[] = [
    {
      rank: 1,
      name: 'Alex Chen',
      points: 2850,
      badges: 12,
      projects: 8,
      streak: 15,
    },
    {
      rank: 2,
      name: 'Sarah Johnson',
      points: 2640,
      badges: 10,
      projects: 7,
      streak: 12,
    },
    {
      rank: 3,
      name: 'You',
      points: 2420,
      badges: 9,
      projects: 6,
      streak: 10,
      isCurrentUser: true,
    },
    {
      rank: 4,
      name: 'Mike Rodriguez',
      points: 2180,
      badges: 8,
      projects: 5,
      streak: 8,
    },
    {
      rank: 5,
      name: 'Emily Davis',
      points: 1950,
      badges: 7,
      projects: 5,
      streak: 6,
    },
  ]

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 3:
        return <Award className="h-5 w-5 text-orange-600" />
      default:
        return <span className="text-sm font-bold text-gray-500">#{rank}</span>
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'from-yellow-400 to-orange-500'
      case 2:
        return 'from-gray-300 to-gray-400'
      case 3:
        return 'from-orange-400 to-red-500'
      default:
        return 'from-blue-400 to-purple-500'
    }
  }

  return (
    <Card className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold flex items-center">
              <Trophy className="h-5 w-5 mr-2 text-yellow-600" />
              Leaderboard
            </h3>
            <p className="text-sm text-gray-600 dark:text-zinc-300">
              Top performers this month
            </p>
          </div>
          <Badge className="bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-800 dark:from-yellow-900/20 dark:to-orange-900/20 dark:text-orange-200">
            <Star className="h-3 w-3 mr-1" />
            Top 5
          </Badge>
        </div>
      </div>

      <div className="space-y-3">
        {leaderboard.map((entry, index) => (
          <motion.div
            key={entry.rank}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative p-4 rounded-lg border-2 transition-all ${
              entry.isCurrentUser
                ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20 shadow-lg'
                : 'border-gray-200 dark:border-zinc-800 hover:shadow-md'
            }`}
          >
            {entry.rank <= 3 && (
              <div className={`absolute -top-2 -left-2 w-8 h-8 rounded-full bg-gradient-to-br ${getRankColor(entry.rank)} flex items-center justify-center shadow-lg`}>
                {getRankIcon(entry.rank)}
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {entry.rank > 3 && (
                  <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-900 flex items-center justify-center">
                    {getRankIcon(entry.rank)}
                  </div>
                )}
                {entry.rank <= 3 && <div className="w-8" />}
                
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                    {entry.name[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">
                        {entry.name}
                        {entry.isCurrentUser && (
                          <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">(You)</span>
                        )}
                      </h4>
                      {entry.streak > 0 && (
                        <Badge variant="outline" className="text-xs">
                          🔥 {entry.streak} day streak
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-zinc-300">
                      <span className="flex items-center">
                        <Trophy className="h-3 w-3 mr-1" />
                        {entry.points} pts
                      </span>
                      <span className="flex items-center">
                        <Award className="h-3 w-3 mr-1" />
                        {entry.badges} badges
                      </span>
                      <span className="flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {entry.projects} projects
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900 dark:text-zinc-100">
                  {entry.points}
                </div>
                <div className="text-xs text-gray-500">points</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-blue-900 dark:text-blue-100">
              Keep Climbing!
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              You're only 220 points away from 2nd place
            </p>
          </div>
          <TrendingUp className="h-8 w-8 text-blue-600" />
        </div>
      </div>
    </Card>
  )
}
