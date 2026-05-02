'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Cpu, Play, BookOpen, Video, Code, Zap } from 'lucide-react'
import { motion } from 'framer-motion'

interface Simulation {
  id: string
  title: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  duration: string
  components: string[]
  type: 'circuit' | 'code' | 'simulation'
  thumbnail: string
}

export function StudentVirtualLab() {
  const simulations: Simulation[] = [
    {
      id: '1',
      title: 'LED Blink Circuit',
      description: 'Learn basic Arduino programming with LED control',
      difficulty: 'beginner',
      duration: '15 min',
      components: ['Arduino Uno', 'LED', 'Resistor'],
      type: 'circuit',
      thumbnail: '🔴',
    },
    {
      id: '2',
      title: 'Temperature Sensor',
      description: 'Read and display temperature data',
      difficulty: 'intermediate',
      duration: '30 min',
      components: ['DHT22', 'LCD Display'],
      type: 'simulation',
      thumbnail: '🌡️',
    },
    {
      id: '3',
      title: 'Motor Control',
      description: 'Control servo motors with PWM signals',
      difficulty: 'intermediate',
      duration: '25 min',
      components: ['Servo Motor', 'Potentiometer'],
      type: 'code',
      thumbnail: '⚙️',
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'circuit':
        return <Cpu className="h-4 w-4" />
      case 'code':
        return <Code className="h-4 w-4" />
      case 'simulation':
        return <Zap className="h-4 w-4" />
      default:
        return <Play className="h-4 w-4" />
    }
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold flex items-center">
              <Cpu className="h-5 w-5 mr-2 text-purple-600" />
              Virtual Lab
            </h3>
            <p className="text-sm text-gray-600 dark:text-zinc-300">
              Practice with interactive simulations
            </p>
          </div>
          <Button size="sm" variant="outline">
            <BookOpen className="h-4 w-4 mr-2" />
            View All
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {simulations.map((sim, index) => (
          <motion.div
            key={sim.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="group relative overflow-hidden rounded-lg border-2 border-purple-200 dark:border-purple-800 bg-white dark:bg-zinc-900 hover:shadow-xl transition-all cursor-pointer"
          >
            <div className="aspect-video bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-6xl">
              {sim.thumbnail}
            </div>
            
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={getDifficultyColor(sim.difficulty)}>
                  {sim.difficulty}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {getTypeIcon(sim.type)}
                  <span className="ml-1">{sim.type}</span>
                </Badge>
              </div>

              <h4 className="font-semibold mb-1">{sim.title}</h4>
              <p className="text-xs text-gray-600 dark:text-zinc-300 mb-3">
                {sim.description}
              </p>

              <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                <span>⏱️ {sim.duration}</span>
                <span>📦 {sim.components.length} parts</span>
              </div>

              <Button size="sm" className="w-full group-hover:bg-purple-600">
                <Play className="h-3 w-3 mr-1" />
                Start Simulation
              </Button>
            </div>

            <div className="absolute top-2 right-2">
              <div className="w-8 h-8 rounded-full bg-white dark:bg-zinc-900 shadow-lg flex items-center justify-center">
                <Video className="h-4 w-4 text-purple-600" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-purple-900 dark:text-purple-100">
              Practice Makes Perfect!
            </h4>
            <p className="text-sm text-purple-700 dark:text-purple-300">
              Complete simulations before requesting physical components
            </p>
          </div>
          <Zap className="h-8 w-8 text-purple-600" />
        </div>
      </div>
    </Card>
  )
}
