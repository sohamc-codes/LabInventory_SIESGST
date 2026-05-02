'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar as CalendarIcon, Clock, AlertCircle, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'

interface CalendarEvent {
  id: string
  title: string
  type: 'deadline' | 'return' | 'class' | 'workshop' | 'exam'
  date: Date
  time?: string
  priority: 'high' | 'medium' | 'low'
  completed?: boolean
}

export function StudentCalendar() {
  const events: CalendarEvent[] = [
    {
      id: '1',
      title: 'Return Arduino Uno',
      type: 'return',
      date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      time: '5:00 PM',
      priority: 'high',
    },
    {
      id: '2',
      title: 'IoT Project Deadline',
      type: 'deadline',
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      time: '11:59 PM',
      priority: 'high',
    },
    {
      id: '3',
      title: 'Arduino Workshop',
      type: 'workshop',
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      time: '2:00 PM',
      priority: 'medium',
    },
    {
      id: '4',
      title: 'Embedded Systems Class',
      type: 'class',
      date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      time: '10:00 AM',
      priority: 'medium',
    },
    {
      id: '5',
      title: 'Midterm Exam',
      type: 'exam',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      time: '9:00 AM',
      priority: 'high',
    },
  ]

  const getEventColor = (type: string) => {
    switch (type) {
      case 'deadline':
        return 'from-red-500 to-orange-500'
      case 'return':
        return 'from-purple-500 to-pink-500'
      case 'class':
        return 'from-blue-500 to-cyan-500'
      case 'workshop':
        return 'from-green-500 to-emerald-500'
      case 'exam':
        return 'from-yellow-500 to-orange-500'
      default:
        return 'from-gray-500 to-slate-500'
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200'
      default:
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200'
    }
  }

  const formatDate = (date: Date) => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow'
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }

  const sortedEvents = events.sort((a, b) => a.date.getTime() - b.date.getTime())

  return (
    <Card className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2 text-blue-600" />
              Upcoming Events
            </h3>
            <p className="text-sm text-gray-600 dark:text-zinc-300">
              Your schedule for the next week
            </p>
          </div>
          <Button size="sm" variant="outline">
            View All
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {sortedEvents.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="relative p-4 border rounded-lg hover:shadow-md transition-all"
          >
            <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-lg bg-gradient-to-b ${getEventColor(event.type)}`} />
            
            <div className="pl-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{event.title}</h4>
                    {event.priority === 'high' && (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-zinc-300">
                    <span className="flex items-center">
                      <CalendarIcon className="h-3 w-3 mr-1" />
                      {formatDate(event.date)}
                    </span>
                    {event.time && (
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {event.time}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge className={getPriorityBadge(event.priority)}>
                    {event.priority}
                  </Badge>
                  <Badge variant="outline" className="text-xs capitalize">
                    {event.type}
                  </Badge>
                </div>
              </div>

              {event.completed && (
                <div className="flex items-center text-sm text-green-600 dark:text-green-400 mt-2">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Completed
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-blue-900 dark:text-blue-100">
              Busy Week Ahead!
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              You have {events.length} events scheduled
            </p>
          </div>
          <Button size="sm" variant="outline">
            Add Event
          </Button>
        </div>
      </div>
    </Card>
  )
}
