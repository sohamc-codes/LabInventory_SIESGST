'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, 
  Package, 
  Award, 
  BookOpen, 
  Users, 
  TrendingUp,
  Clock
} from 'lucide-react'
import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'

interface Activity {
  id: string
  type: 'achievement' | 'request' | 'return' | 'learning' | 'project' | 'collaboration'
  title: string
  description: string
  timestamp: Date
  icon: any
  color: string
}

export function StudentActivityFeed() {
  const activities: Activity[] = [
    {
      id: '1',
      type: 'achievement',
      title: 'New Achievement Unlocked!',
      description: 'Earned "Perfect Return" badge',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      icon: Award,
      color: 'text-yellow-600',
    },
    {
      id: '2',
      type: 'request',
      title: 'Request Approved',
      description: 'Arduino Uno request approved by Dr. Smith',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      icon: CheckCircle,
      color: 'text-green-600',
    },
    {
      id: '3',
      type: 'learning',
      title: 'Module Completed',
      description: 'Finished "Sensor Integration" course',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
      icon: BookOpen,
      color: 'text-blue-600',
    },
    {
      id: '4',
      type: 'return',
      title: 'Component Returned',
      description: 'Returned DHT22 sensor on time',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
      icon: Package,
      color: 'text-purple-600',
    },
    {
      id: '5',
      type: 'project',
      title: 'Project Progress',
      description: 'IoT Weather Station reached 75%',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      icon: TrendingUp,
      color: 'text-orange-600',
    },
    {
      id: '6',
      type: 'collaboration',
      title: 'Helped a Classmate',
      description: 'Assisted Sarah with circuit debugging',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      icon: Users,
      color: 'text-pink-600',
    },
  ]

  const getActivityBg = (type: string) => {
    switch (type) {
      case 'achievement':
        return 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800'
      case 'request':
        return 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800'
      case 'learning':
        return 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800'
      case 'return':
        return 'bg-purple-50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-800'
      case 'project':
        return 'bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-800'
      case 'collaboration':
        return 'bg-pink-50 dark:bg-pink-900/10 border-pink-200 dark:border-pink-800'
      default:
        return 'bg-gray-50 dark:bg-zinc-900 border-gray-200 dark:border-zinc-800'
    }
  }

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold flex items-center">
          <Clock className="h-5 w-5 mr-2 text-blue-600" />
          Recent Activity
        </h3>
        <p className="text-sm text-gray-600 dark:text-zinc-300">
          Your latest actions and achievements
        </p>
      </div>

      <div className="space-y-3">
        {activities.map((activity, index) => {
          const Icon = activity.icon
          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`p-4 rounded-lg border ${getActivityBg(activity.type)} transition-all hover:shadow-md`}
            >
              <div className="flex items-start space-x-3">
                <div className={`w-10 h-10 rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center flex-shrink-0 shadow-sm`}>
                  <Icon className={`h-5 w-5 ${activity.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm">{activity.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-zinc-300 mt-1">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                  </p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      <div className="mt-4 text-center">
        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
          View All Activity →
        </button>
      </div>
    </Card>
  )
}
