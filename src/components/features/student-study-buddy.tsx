'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, MessageSquare, Video, Calendar, Plus } from 'lucide-react'
import { motion } from 'framer-motion'

interface StudyBuddy {
  id: string
  name: string
  avatar: string
  status: 'online' | 'offline' | 'busy'
  currentProject: string
  skills: string[]
  matchScore: number
}

export function StudentStudyBuddy() {
  const [buddies] = useState<StudyBuddy[]>([
    {
      id: '1',
      name: 'Alex Chen',
      avatar: 'AC',
      status: 'online',
      currentProject: 'Smart Home System',
      skills: ['Arduino', 'IoT', 'Sensors'],
      matchScore: 95,
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      avatar: 'SJ',
      status: 'online',
      currentProject: 'Weather Station',
      skills: ['Python', 'Data Analysis', 'APIs'],
      matchScore: 88,
    },
    {
      id: '3',
      name: 'Mike Rodriguez',
      avatar: 'MR',
      status: 'busy',
      currentProject: 'Robot Arm',
      skills: ['Robotics', 'Motors', '3D Printing'],
      matchScore: 82,
    },
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500'
      case 'busy':
        return 'bg-yellow-500'
      default:
        return 'bg-gray-400'
    }
  }

  return (
    <Card className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold flex items-center">
              <Users className="h-5 w-5 mr-2 text-purple-600" />
              Study Buddies
            </h3>
            <p className="text-sm text-gray-600 dark:text-zinc-300">
              Connect with classmates on similar projects
            </p>
          </div>
          <Button size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Find More
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {buddies.map((buddy, index) => (
          <motion.div
            key={buddy.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 border rounded-lg hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-bold">
                    {buddy.avatar}
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 ${getStatusColor(buddy.status)}`} />
                </div>
                <div>
                  <h4 className="font-semibold">{buddy.name}</h4>
                  <p className="text-xs text-gray-600 dark:text-zinc-300">
                    {buddy.currentProject}
                  </p>
                </div>
              </div>
              <Badge className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 dark:from-purple-900/20 dark:to-pink-900/20 dark:text-purple-200">
                {buddy.matchScore}% match
              </Badge>
            </div>

            <div className="flex flex-wrap gap-1 mb-3">
              {buddy.skills.map((skill) => (
                <Badge key={skill} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>

            <div className="flex space-x-2">
              <Button size="sm" variant="outline" className="flex-1">
                <MessageSquare className="h-3 w-3 mr-1" />
                Chat
              </Button>
              <Button size="sm" variant="outline" className="flex-1">
                <Video className="h-3 w-3 mr-1" />
                Call
              </Button>
              <Button size="sm" variant="outline">
                <Calendar className="h-3 w-3" />
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-purple-900 dark:text-purple-100">
              Study Group Session
            </h4>
            <p className="text-sm text-purple-700 dark:text-purple-300">
              Join the IoT Workshop - Today at 3 PM
            </p>
          </div>
          <Button size="sm">Join</Button>
        </div>
      </div>
    </Card>
  )
}
