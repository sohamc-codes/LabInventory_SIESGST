'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GraduationCap, MessageSquare, Calendar, Star, Award } from 'lucide-react'
import { motion } from 'framer-motion'

interface Mentor {
  id: string
  name: string
  title: string
  expertise: string[]
  rating: number
  sessions: number
  availability: 'available' | 'busy' | 'offline'
  nextSlot?: string
}

export function StudentMentorConnect() {
  const mentors: Mentor[] = [
    {
      id: '1',
      name: 'Dr. Sarah Chen',
      title: 'IoT Specialist',
      expertise: ['Arduino', 'ESP32', 'Sensors'],
      rating: 4.9,
      sessions: 156,
      availability: 'available',
      nextSlot: 'Today 2:00 PM',
    },
    {
      id: '2',
      name: 'Prof. Mike Johnson',
      title: 'Robotics Expert',
      expertise: ['Motors', 'Control Systems', 'AI'],
      rating: 4.8,
      sessions: 203,
      availability: 'busy',
      nextSlot: 'Tomorrow 10:00 AM',
    },
    {
      id: '3',
      name: 'Alex Rodriguez',
      title: 'Senior Student',
      expertise: ['Circuit Design', 'PCB', '3D Printing'],
      rating: 4.7,
      sessions: 89,
      availability: 'available',
      nextSlot: 'Today 4:30 PM',
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
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
              <GraduationCap className="h-5 w-5 mr-2 text-blue-600" />
              Connect with Mentors
            </h3>
            <p className="text-sm text-gray-600 dark:text-zinc-300">
              Get expert guidance for your projects
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {mentors.map((mentor, index) => (
          <motion.div
            key={mentor.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 border rounded-lg hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                    {mentor.name[0]}
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 ${getStatusColor(mentor.availability)}`} />
                </div>
                <div>
                  <h4 className="font-semibold">{mentor.name}</h4>
                  <p className="text-xs text-gray-600 dark:text-zinc-300">
                    {mentor.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center text-xs text-yellow-600">
                      <Star className="h-3 w-3 mr-1 fill-current" />
                      {mentor.rating}
                    </div>
                    <span className="text-xs text-gray-500">
                      {mentor.sessions} sessions
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-1 mb-3">
              {mentor.expertise.map((skill) => (
                <Badge key={skill} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>

            {mentor.nextSlot && (
              <div className="flex items-center text-xs text-gray-600 dark:text-zinc-300 mb-3">
                <Calendar className="h-3 w-3 mr-1" />
                Next available: {mentor.nextSlot}
              </div>
            )}

            <div className="flex space-x-2">
              <Button size="sm" variant="outline" className="flex-1">
                <MessageSquare className="h-3 w-3 mr-1" />
                Message
              </Button>
              <Button size="sm" className="flex-1">
                <Calendar className="h-3 w-3 mr-1" />
                Book Session
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 flex items-center">
              <Award className="h-4 w-4 mr-2" />
              Become a Mentor
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Help others and earn recognition
            </p>
          </div>
          <Button size="sm" variant="outline">
            Apply
          </Button>
        </div>
      </div>
    </Card>
  )
}
