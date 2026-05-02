import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BookOpen, Video, FileText, Code, Zap, Award } from 'lucide-react'

export default function StudentLearningPage() {
  const categories = [
    {
      title: 'Getting Started',
      icon: BookOpen,
      color: 'from-blue-500 to-cyan-500',
      courses: [
        { name: 'Arduino Basics', duration: '2h', level: 'Beginner', completed: true },
        { name: 'Circuit Fundamentals', duration: '1.5h', level: 'Beginner', completed: true },
        { name: 'Component Safety', duration: '30min', level: 'Beginner', completed: false },
      ],
    },
    {
      title: 'Sensors & Actuators',
      icon: Zap,
      color: 'from-purple-500 to-pink-500',
      courses: [
        { name: 'Temperature Sensors', duration: '1h', level: 'Intermediate', completed: false },
        { name: 'Motor Control', duration: '2h', level: 'Intermediate', completed: false },
        { name: 'Display Modules', duration: '1.5h', level: 'Beginner', completed: false },
      ],
    },
    {
      title: 'IoT & Connectivity',
      icon: Code,
      color: 'from-green-500 to-emerald-500',
      courses: [
        { name: 'WiFi Basics', duration: '2h', level: 'Intermediate', completed: false },
        { name: 'MQTT Protocol', duration: '1.5h', level: 'Advanced', completed: false },
        { name: 'Cloud Integration', duration: '3h', level: 'Advanced', completed: false },
      ],
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Learning Hub</h1>
        <p className="mt-2 text-muted-foreground">
          Master IoT development with our comprehensive courses
        </p>
      </div>

      {/* Progress Overview */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Your Learning Journey</h3>
            <p className="text-sm text-muted-foreground">
              2 courses completed • 8 in progress
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">2</div>
              <div className="text-xs text-gray-500">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">8</div>
              <div className="text-xs text-gray-500">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">5</div>
              <div className="text-xs text-gray-500">Badges</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Course Categories */}
      {categories.map((category) => {
        const Icon = category.icon
        return (
          <Card key={category.title} className="p-6">
            <div className="flex items-center mb-4">
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${category.color} flex items-center justify-center mr-4`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">{category.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {category.courses.length} courses available
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {category.courses.map((course) => (
                <div
                  key={course.name}
                  className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-all"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-lg ${course.completed ? 'bg-green-100 dark:bg-green-900/20' : 'bg-gray-100 dark:bg-zinc-900'} flex items-center justify-center`}>
                      {course.completed ? (
                        <Award className="h-5 w-5 text-green-600" />
                      ) : (
                        <Video className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold">{course.name}</h4>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <span>{course.duration}</span>
                        <span>•</span>
                        <Badge variant="outline" className="text-xs">
                          {course.level}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant={course.completed ? 'outline' : 'default'}>
                    {course.completed ? 'Review' : 'Start'}
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        )
      })}
    </div>
  )
}
