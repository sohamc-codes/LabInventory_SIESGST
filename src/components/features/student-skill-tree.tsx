'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Lock, Circle } from 'lucide-react'
import { motion } from 'framer-motion'

interface Skill {
  id: string
  name: string
  level: number
  maxLevel: number
  unlocked: boolean
  prerequisites: string[]
}

export function StudentSkillTree() {
  const skills: Skill[] = [
    { id: '1', name: 'Arduino Basics', level: 5, maxLevel: 5, unlocked: true, prerequisites: [] },
    { id: '2', name: 'Circuit Design', level: 4, maxLevel: 5, unlocked: true, prerequisites: ['1'] },
    { id: '3', name: 'Sensor Integration', level: 3, maxLevel: 5, unlocked: true, prerequisites: ['1'] },
    { id: '4', name: 'IoT Protocols', level: 0, maxLevel: 5, unlocked: true, prerequisites: ['2', '3'] },
    { id: '5', name: 'Advanced Robotics', level: 0, maxLevel: 5, unlocked: false, prerequisites: ['4'] },
  ]

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold">Skill Tree</h3>
        <p className="text-sm text-gray-600 dark:text-zinc-300">
          Level up your IoT skills
        </p>
      </div>

      <div className="space-y-4">
        {skills.map((skill, index) => (
          <motion.div
            key={skill.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-lg border-2 ${
              skill.unlocked
                ? 'border-blue-200 dark:border-blue-800'
                : 'border-gray-200 dark:border-zinc-800 opacity-50'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                {skill.level === skill.maxLevel ? (
                  <CheckCircle className="h-6 w-6 text-green-500" />
                ) : skill.unlocked ? (
                  <Circle className="h-6 w-6 text-blue-500" />
                ) : (
                  <Lock className="h-6 w-6 text-gray-400" />
                )}
                <div>
                  <h4 className="font-semibold">{skill.name}</h4>
                  <p className="text-xs text-gray-500">
                    Level {skill.level}/{skill.maxLevel}
                  </p>
                </div>
              </div>
              {skill.level === skill.maxLevel && (
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200">
                  Mastered
                </Badge>
              )}
            </div>

            <div className="flex space-x-1">
              {[...Array(skill.maxLevel)].map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 h-2 rounded ${
                    i < skill.level
                      ? 'bg-blue-600'
                      : 'bg-gray-200 dark:bg-zinc-800'
                  }`}
                />
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  )
}
