'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { BookOpen, CheckCircle, Lock, Play, Award, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'

interface LearningModule {
  id: string
  title: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  progress: number
  completed: boolean
  locked: boolean
  components: string[]
  estimatedTime: string
}

export function StudentLearningPath() {
  const modules: LearningModule[] = [
    {
      id: '1',
      title: 'Getting Started with Arduino',
      description: 'Learn the basics of Arduino programming and circuits',
      difficulty: 'beginner',
      progress: 100,
      completed: true,
      locked: false,
      components: ['Arduino Uno', 'LED', 'Resistor'],
      estimatedTime: '2 hours',
    },
    {
      id: '2',
      title: 'Sensor Integration',
      description: 'Work with various sensors and data collection',
      difficulty: 'beginner',
      progress: 65,
      completed: false,
      locked: false,
      components: ['DHT22', 'Ultrasonic Sensor', 'LDR'],
      estimatedTime: '3 hours',
    },
    {
      id: '3',
      title: 'IoT Communication',
      description: 'Connect your projects to the internet',
      difficulty: 'intermediate',
      progress: 0,
      completed: false,
      locked: false,
      components: ['ESP8266', 'WiFi Module'],
      estimatedTime: '4 hours',
    },
    {
      id: '4',
      title: 'Advanced Robotics',
      description: 'Build autonomous robots with AI',
      difficulty: 'advanced',
      progress: 0,
      completed: false,
      locked: true,
      components: ['Raspberry Pi', 'Motor Driver', 'Camera Module'],
      estimatedTime: '6 hours',
    },
  ]

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200'
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200'
      case 'advanced':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-zinc-900 dark:text-gray-200'
    }
  }

  const completedCount = modules.filter(m => m.completed).length
  const overallProgress = (completedCount / modules.length) * 100

  return (
    <Card className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold flex items-center">
              <BookOpen className="h-5 w-5 mr-2 text-purple-600" />
              Learning Path
            </h3>
            <p className="text-sm text-gray-600 dark:text-zinc-300">
              Master IoT development step by step
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              <span className="text-2xl font-bold">{completedCount}/{modules.length}</span>
            </div>
            <p className="text-xs text-gray-500">Modules Completed</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-zinc-300">Overall Progress</span>
            <span className="font-medium">{Math.round(overallProgress)}%</span>
          </div>
          <Progress value={overallProgress} className="h-3" />
        </div>
      </div>

      <div className="space-y-3">
        {modules.map((module, index) => (
          <motion.div
            key={module.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 border rounded-lg transition-all ${
              module.locked
                ? 'opacity-50 bg-gray-50 dark:bg-zinc-900/50'
                : 'hover:shadow-md bg-white dark:bg-zinc-900'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {module.completed ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : module.locked ? (
                    <Lock className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Play className="h-5 w-5 text-blue-500" />
                  )}
                  <h4 className="font-semibold">{module.title}</h4>
                  <Badge className={getDifficultyColor(module.difficulty)}>
                    {module.difficulty}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 dark:text-zinc-300 mb-2">
                  {module.description}
                </p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>⏱️ {module.estimatedTime}</span>
                  <span>📦 {module.components.length} components</span>
                </div>
              </div>
            </div>

            {!module.locked && !module.completed && (
              <div className="space-y-2">
                <Progress value={module.progress} className="h-2" />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{module.progress}% complete</span>
                  <Button size="sm" variant="outline">
                    {module.progress > 0 ? 'Continue' : 'Start'}
                  </Button>
                </div>
              </div>
            )}

            {module.completed && (
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-sm text-green-600 dark:text-green-400 font-medium flex items-center">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Completed
                </span>
                <Button size="sm" variant="ghost">
                  Review
                </Button>
              </div>
            )}

            {module.locked && (
              <div className="pt-2 border-t">
                <p className="text-xs text-gray-500">
                  🔒 Complete previous modules to unlock
                </p>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-purple-900 dark:text-purple-100">
              Keep Learning!
            </h4>
            <p className="text-sm text-purple-700 dark:text-purple-300">
              Complete modules to earn badges and unlock advanced content
            </p>
          </div>
          <TrendingUp className="h-8 w-8 text-purple-600" />
        </div>
      </div>
    </Card>
  )
}
